import { sitePath } from './site-path';
export function ResponsivePhoto({src,alt,width=1200,height=800,priority=false,sizes='(max-width: 760px) calc(100vw - 44px), 50vw'}:{src:string;alt:string;width?:number;height?:number;priority?:boolean;sizes?:string}){
 const approved=src==='/images/rinan-station.jpg'||src==='/images/rinan-station-front.jpg';
 const name=src.split('/').pop()?.replace('.jpg','');
 return <picture>{approved&&<source type="image/webp" srcSet={[480,800,1200].map(w=>`${sitePath(`/images/optimized/${name}-${w}.webp`)} ${w}w`).join(', ')} sizes={sizes}/>}<img src={sitePath(src)} alt={alt} width={width} height={height} loading={priority?'eager':'lazy'} decoding="async" fetchPriority={priority?'high':'auto'} /></picture>;
}
