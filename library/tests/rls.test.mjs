// 權限測試：在內嵌 Postgres（PGlite）裡模擬 Supabase 的角色與 auth.uid()，
// 跑真正的 migration，再分別以「未登入、陌生人、會員 A、會員 B、職員、館長」身分讀寫。
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const MIG = new URL("../supabase/migrations/", import.meta.url);

// Supabase 平台本身提供的部分：角色、auth schema、預設寬鬆權限（用來確認 migration 有把它關掉）
const SUPABASE_SHIM = `
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
  create schema auth; grant usage on schema auth to anon, authenticated;
  create table auth.users (id uuid primary key, email text unique);
  create function auth.jwt() returns jsonb language sql stable as
    $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(auth.jwt() ->> 'sub', '')::uuid $$;
  grant execute on function auth.jwt(), auth.uid() to anon, authenticated;
`;

const U = {
  director: { id: "00000000-0000-4000-8000-000000000001", email: "director@example.com" },
  staff:    { id: "00000000-0000-4000-8000-000000000002", email: "staff@example.com" },
  alice:    { id: "00000000-0000-4000-8000-000000000003", email: "alice@example.com" },
  bob:      { id: "00000000-0000-4000-8000-000000000004", email: "bob@example.com" },
  stranger: { id: "00000000-0000-4000-8000-000000000005", email: "stranger@example.com" },
};

async function setup() {
  const db = new PGlite();
  await db.exec(SUPABASE_SHIM);
  for (const f of readdirSync(MIG).filter((f) => f.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(new URL(f, MIG), "utf8"));
  }
  for (const u of Object.values(U)) await db.query("insert into auth.users values ($1, $2)", [u.id, u.email]);
  // 第一位館長由部署者在 SQL 編輯器手動指定（與部署說明相同）
  await db.exec(`insert into public.staff (user_id, email, role) values ('${U.director.id}', '${U.director.email}', 'director')`);
  return db;
}

// 以某個身分執行；結束後回到 postgres 超級使用者
async function as(db, who, sql, params = []) {
  await db.exec("reset role");
  if (who === "anon") {
    await db.query("select set_config('request.jwt.claims', '', false)");
    await db.exec("set role anon");
  } else {
    const u = U[who];
    await db.query("select set_config('request.jwt.claims', $1, false)", [JSON.stringify({ sub: u.id, email: u.email, role: "authenticated" })]);
    await db.exec("set role authenticated");
  }
  try { return (await db.query(sql, params)).rows; }
  finally { await db.exec("reset role"); }
}
const fails = async (p, re) => { await assert.rejects(p, re); };

test("借書系統權限", async (t) => {
  const db = await setup();

  await t.test("館長指派職員；職員不能自己升級", async () => {
    await as(db, "director", "select public.set_staff_role($1, 'staff')", [U.staff.email]);
    assert.equal((await as(db, "staff", "select public.whoami() ->> 'role' as r"))[0].r, "staff");
    await fails(as(db, "staff", "select public.set_staff_role($1, 'director')", [U.staff.email]), /只有館長/);
    await fails(as(db, "staff", "insert into public.staff (user_id, email, role) values ($1, $2, 'director')", [U.staff.id, U.staff.email]), /permission denied/);
  });

  let cardA, cardB;
  await t.test("職員發證，證號自動依序編列", async () => {
    cardA = (await as(db, "staff", "select public.create_member('王小明', $1, '0912345678', '') as c", [U.alice.email]))[0].c;
    cardB = (await as(db, "staff", "select public.create_member('李小華', $1, '0987654321', '') as c", [U.bob.email]))[0].c;
    assert.match(cardA, /^RN\d{2}-0001$/);
    assert.match(cardB, /^RN\d{2}-0002$/);
    await fails(as(db, "staff", "select public.create_member('重複', $1)", [U.alice.email]), /已經辦過/);
  });

  await t.test("會員或陌生人不能發證、借書、還書、新增館藏", async () => {
    for (const who of ["alice", "stranger"]) {
      await fails(as(db, who, "select public.create_member('x')"), /沒有權限/);
      await fails(as(db, who, "select public.borrow_books($1, array['RNB-0001'])", [cardA]), /沒有權限/);
      await fails(as(db, who, "select public.return_book('RNB-0001')"), /沒有權限/);
      await fails(as(db, who, "select public.add_book('x')"), /沒有權限/);
      await fails(as(db, who, "insert into public.loans (book_code, card_no, due_at) values ('RNB-0001', $1, now())", [cardA]), /permission denied/);
      await fails(as(db, who, "update public.members set name = 'x'"), /permission denied/);
    }
  });

  await t.test("會員用自己的 email 登入後自動認領借書證", async () => {
    assert.equal((await as(db, "alice", "select public.claim_membership() as c"))[0].c, cardA);
    assert.equal((await as(db, "bob", "select public.claim_membership() as c"))[0].c, cardB);
    assert.equal((await as(db, "stranger", "select public.claim_membership() as c"))[0].c, null);
    assert.equal((await as(db, "alice", "select public.whoami() ->> 'role' as r"))[0].r, "member");
    assert.equal((await as(db, "stranger", "select public.whoami() ->> 'role' as r"))[0].r, "none");
  });

  await t.test("借書：檢查本數上限、借出中的書不能再借", async () => {
    const r = (await as(db, "staff", "select public.borrow_books($1, array['RNB-0001','RNB-0002']) as r", [cardA]))[0].r;
    assert.equal(r.count, 2);
    await as(db, "staff", "select public.borrow_books($1, array['RNB-0003'])", [cardB]);
    await fails(as(db, "staff", "select public.borrow_books($1, array['RNB-0001'])", [cardB]), /借出中/);
    await fails(as(db, "staff", "select public.borrow_books($1, array['RNB-0004','RNB-0005'])", [cardA]), /最多借 3 本/);
  });

  await t.test("會員只讀得到自己的會員資料與借閱紀錄", async () => {
    const mA = await as(db, "alice", "select card_no from public.members");
    assert.deepEqual(mA.map((r) => r.card_no), [cardA]);
    const lA = await as(db, "alice", "select distinct card_no from public.loans");
    assert.deepEqual(lA.map((r) => r.card_no), [cardA]);
    const lB = await as(db, "bob", "select book_code from public.loans");
    assert.deepEqual(lB.map((r) => r.book_code), ["RNB-0003"]);
    // 直接指定別人的證號也讀不到
    assert.equal((await as(db, "alice", "select * from public.loans where card_no = $1", [cardB])).length, 0);
    assert.equal((await as(db, "alice", "select card_no from public.members where card_no = $1", [cardB])).length, 0);
  });

  await t.test("電話原文不能直接讀；職員讀取會留紀錄；會員只能讀自己的", async () => {
    await fails(as(db, "staff", "select phone from public.members"), /permission denied/);
    await fails(as(db, "alice", "select phone from public.members"), /permission denied/);
    const masked = (await as(db, "staff", "select phone_masked from public.members where card_no = $1", [cardA]))[0].phone_masked;
    assert.equal(masked, "0912***678");
    assert.equal((await as(db, "staff", "select public.reveal_phone($1) as p", [cardA]))[0].p, "0912345678");
    assert.equal((await as(db, "alice", "select public.reveal_phone($1) as p", [cardA]))[0].p, "0912345678");
    await fails(as(db, "alice", "select public.reveal_phone($1)", [cardB]), /沒有權限/);
  });

  await t.test("陌生人（已登入但不是會員）讀不到任何個資", async () => {
    assert.equal((await as(db, "stranger", "select card_no, name from public.members")).length, 0);
    assert.equal((await as(db, "stranger", "select * from public.loans")).length, 0);
    assert.equal((await as(db, "stranger", "select * from public.audit_log")).length, 0);
    assert.equal((await as(db, "stranger", "select * from public.staff")).length, 0);
  });

  await t.test("未登入的人連書目都讀不到", async () => {
    for (const tbl of ["books", "members", "loans", "audit_log", "staff", "settings"]) {
      await fails(as(db, "anon", `select * from public.${tbl}`), /permission denied/);
    }
    await fails(as(db, "anon", "select public.whoami()"), /permission denied/);
  });

  await t.test("稽核紀錄只有館長看得到，而且不能直接寫入", async () => {
    assert.equal((await as(db, "staff", "select * from public.audit_log")).length, 0);
    assert.equal((await as(db, "alice", "select * from public.audit_log")).length, 0);
    const actions = (await as(db, "director", "select action from public.audit_log")).map((r) => r.action);
    for (const a of ["staff.set_role", "member.create", "member.claim", "loan.borrow", "member.reveal_phone"]) assert.ok(actions.includes(a), a);
    await fails(as(db, "staff", "select public.log('fake', 'x')"), /permission denied/);
    await fails(as(db, "staff", "insert into public.audit_log (action) values ('fake')"), /permission denied/);
    await fails(as(db, "director", "delete from public.audit_log"), /permission denied/);
  });

  await t.test("還書後會員看到歸還時間；只有職員能還書", async () => {
    await as(db, "staff", "select public.return_book('RNB-0001')");
    const row = (await as(db, "alice", "select returned_at from public.loans where book_code = 'RNB-0001'"))[0];
    assert.ok(row.returned_at);
    await fails(as(db, "staff", "select public.return_book('RNB-0001')"), /沒有借出紀錄/);
  });

  await t.test("規則只有館長能改；職員名單只有館長看得到全部", async () => {
    await fails(as(db, "staff", "select public.update_settings('x', 7, 2)"), /只有館長/);
    await as(db, "director", "select public.update_settings('日南書架', 21, 5)");
    assert.equal((await as(db, "alice", "select loan_days from public.settings"))[0].loan_days, 21);
    assert.equal((await as(db, "staff", "select * from public.staff")).length, 1);
    assert.equal((await as(db, "director", "select * from public.staff")).length, 2);
    await fails(as(db, "director", "select public.set_staff_role($1, 'none')", [U.director.email]), /不能移除自己/);
  });

  await t.test("停用的借書證：會員失去會員身分，也不能再借書", async () => {
    await as(db, "staff", "select public.update_member($1, '李小華', $2, '0987654321', '', false)", [cardB, U.bob.email]);
    assert.equal((await as(db, "bob", "select public.whoami() ->> 'role' as r"))[0].r, "none");
    await fails(as(db, "staff", "select public.borrow_books($1, array['RNB-0009'])", [cardB]), /已停用/);
  });

  await t.test("首批館藏 116 本，新書館藏碼從 RNB-0117 起編", async () => {
    assert.equal((await as(db, "alice", "select count(*)::int as n from public.books"))[0].n, 116);
    assert.equal((await as(db, "staff", "select public.add_book('新書測試') as c"))[0].c, "RNB-0117");
  });

  await db.close();
});
