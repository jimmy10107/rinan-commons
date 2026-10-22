import { sitePath } from './site-path';
export function ResponsivePhoto({src,alt,width=1200,height=800,priority=false,sizes='(max-width: 760px) calc(100vw - 44px), 50vw'}:{src:string;alt:string;width?:number;height?:number;priority?:boolean;sizes?:string}){
 const legacy=src==='/images/rinan-station.jpg'||src==='/images/rinan-station-front.jpg';
 const commons=/^\/images\/(commons-exterior|commons-interior)-1200\.webp$/.exec(src)?.[1];
 const name=src.split('/').pop()?.replace('.jpg','');
 const srcSet=commons ? [480,800,1200].map(w=>`${sitePath(`/images/${commons}-${w}.webp`)} ${w}w`).join(', ') : legacy ? [480,800,1200].map(w=>`${sitePath(`/images/optimized/${name}-${w}.webp`)} ${w}w`).join(', ') : undefined;
 return <picture>{srcSet&&<source type="image/webp" srcSet={srcSet} sizes={sizes}/>}<img src={sitePath(src)} alt={alt} width={width} height={height} loading={priority?'eager':'lazy'} decoding="async" fetchPriority={priority?'high':'auto'} /></picture>;
}
