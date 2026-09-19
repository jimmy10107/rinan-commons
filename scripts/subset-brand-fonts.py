"""One-time brand font preparation. Args: local @fontsource package directory.
Requires fonttools[brotli]; not a production dependency. Keep OFL beside fonts.
Re-run after adding content to include new glyphs; system fallback covers others.
"""
import sys
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
import re,tempfile
from fontTools.merge import Merger
root=Path(__file__).resolve().parents[1]
packages=Path(sys.argv[1])
text=''.join(p.read_text() for p in (root/'app').rglob('*.tsx'))+(root/'app/generated/content.json').read_text()+''.join(chr(i) for i in range(32,127))

for family,weight,label in [('noto-sans-tc',400,'RinanSans-Regular'),('noto-sans-tc',500,'RinanSans-Medium'),('noto-serif-tc',400,'RinanSerif-Regular')]:
 src=packages/family/'files'/f'{family}-chinese-traditional-{weight}-normal.woff2'
 opts=subset.Options();opts.flavor='woff2';opts.desubroutinize=True
 font=subset.load_font(src,opts)
 sub=subset.Subsetter(options=opts);sub.populate(text=text);sub.subset(font)
 out=root/'public/fonts'/f'{label}.woff2';subset.save_font(font,out,opts)
 (root/'public/fonts'/f'{family}-OFL.txt').write_text((packages/family/'LICENSE').read_text())
 print(out.name,out.stat().st_size)

 # The language aggregate excludes rare local words and some punctuation.
 # Supplement only missing characters from Google's disjoint unicode subsets.
 wanted=set(map(ord,text)); covered=set(TTFont(out).getBestCmap()); missing=wanted-covered
 for shard in sorted((packages/family/'files').glob(f'{family}-*-{weight}-normal.woff2')):
  if not re.search(r'-[0-9]+-'+str(weight)+r'-normal',shard.name):continue
  available=set(TTFont(shard,lazy=True).getBestCmap()); selected=missing&available
  if not selected:continue
  extra=subset.load_font(shard,opts); sub=subset.Subsetter(options=opts);sub.populate(unicodes=selected);sub.subset(extra)
  extra_name=f"{label}-extra-{shard.name.split('-')[-3]}.woff2"
  subset.save_font(extra,root/'public/fonts'/extra_name,opts)
  missing-=selected
 print(label,'rare-word/punctuation coverage',all(ord(x) not in missing for x in '傱，・！？'))

 # Merge complementary subsets into one request per style.
 extras=list((root/'public/fonts').glob(f'{label}-extra-*.woff2'))
 with tempfile.TemporaryDirectory() as tmp:
  sources=[]
  for i,file in enumerate([out,*extras]):
   f=TTFont(file);f.flavor=None;t=Path(tmp)/f'{i}.ttf';f.save(t);sources.append(str(t))
  merged=Merger().merge(sources);merged.flavor='woff2';merged.save(out)
 for file in extras:file.unlink()
 print('Combined',out.name,out.stat().st_size)
