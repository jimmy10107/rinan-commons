"""Build lightweight, bitmap-free SVG frames from the original editable SVGs.
Original downloads stay unchanged. Cull subpixel duplicate organs on a display grid,
simplify each silhouette independently, and group fills without rasterizing.
Requires Shapely. This is a display LOD, not new botanical evidence.
"""
from pathlib import Path
import xml.etree.ElementTree as ET,re,json,math
from collections import defaultdict
from shapely.geometry import Polygon
from xml.sax.saxutils import escape
root=Path('public/plants');out=root/'frames';out.mkdir(exist_ok=True)
def ring(coords):return 'M'+' '.join(f'{x:.0f},{y:.0f}' for x,y in coords)+'Z'
report=[]
for source in sorted((root/'svg').glob('*.svg')):
 tree=ET.parse(source).getroot();dense=len(tree)>1800;cells={};items=[]
 for e in tree:
  if not e.tag.endswith('path'):continue
  nums=[float(n) for n in re.findall(r'-?\d+(?:\.\d+)?',e.get('d',''))];coords=list(zip(nums[::2],nums[1::2]))
  if len(coords)<3:continue
  poly=Polygon(coords)
  if not poly.is_valid:poly=poly.buffer(0)
  if poly.is_empty:continue
  organ=e.get('data-organ','');color=e.get('fill','#486339');rgb=[int(color[i:i+2],16) for i in (1,3,5)];color='#'+''.join(f'{min(255,round(v/16)*16):02x}' for v in rgb)
  entry=(organ,color,poly)
  if dense and organ not in ['bark','stem','petiole']:
   c=poly.centroid;key=(organ,math.floor(c.x/12),math.floor(c.y/12))
   if key not in cells or poly.area>cells[key][2].area:cells[key]=entry
  else:items.append(entry)
 items.extend(cells.values());groups=defaultdict(list)
 for organ,color,poly in items:
  geom=poly.simplify(1.2,preserve_topology=True);shapes=[geom] if geom.geom_type=='Polygon' else list(geom.geoms)
  for shape in shapes:
   if shape.geom_type!='Polygon':continue
   groups[(organ,color)].append(ring(shape.exterior.coords));groups[(organ,color)].extend(ring(h.coords) for h in shape.interiors if Polygon(h).area>4)
 paths=[f'<path fill="{color}" d="'+''.join(ds)+'"/>' for (organ,color),ds in groups.items()]
 title=tree.find('{http://www.w3.org/2000/svg}title').text
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1040"><title>{escape(title)}</title>'+''.join(paths)+'</svg>'
 target=out/source.name;target.write_text(svg);report.append({'file':target.name,'bytes':target.stat().st_size,'sourceBytes':source.stat().st_size});print(target.name,target.stat().st_size,flush=True)
Path('docs/lifecycle-frame-budget.json').write_text(json.dumps(report,indent=2)+'\n')
