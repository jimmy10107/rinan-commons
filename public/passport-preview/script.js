const chapterLinks = [...document.querySelectorAll(".chapter-index a[data-section]")];
const observedSections = [...document.querySelectorAll("[data-observe-section]")];

function markCurrentChapter(id) {
  chapterLinks.forEach((link) => {
    const isCurrent = link.dataset.section === id;
    if (isCurrent) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) markCurrentChapter(visible.target.id);
    },
    { rootMargin: "-24% 0px -55% 0px", threshold: [0.08, 0.2, 0.45] }
  );
  observedSections.forEach((section) => observer.observe(section));
} else if (observedSections[0]) {
  markCurrentChapter(observedSections[0].id);
}

chapterLinks.forEach((link) => {
  link.addEventListener("click", () => markCurrentChapter(link.dataset.section));
});

document.querySelectorAll(".rules-page details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    const page = detail.closest(".rules-page");
    page?.querySelectorAll("details").forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});
