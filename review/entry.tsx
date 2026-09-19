import React, {useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import Home from '../app/page';
import About from '../app/about/page';
import Stories from '../app/stories/page';
import Explore from '../app/explore/page';
import Visit from '../app/visit/page';
import Story from '../app/stories/[slug]/page';
const pages:Record<string,React.ComponentType>={'/':Home,'/about/':About,'/stories/':Stories,'/explore/':Explore,'/visit/':Visit};
function Review(){
 const [path,setPath]=useState('/');const [article,setArticle]=useState<React.ReactNode>(null);
 useEffect(()=>{let ignore=false;if(path.startsWith('/stories/')&&path!=='/stories/')Story({params:Promise.resolve({slug:path.split('/')[2]})}).then(node=>{if(!ignore)setArticle(node)});return()=>{ignore=true}},[path]);
 useEffect(()=>{
  const navigate=(route:string)=>{if(route===path)return;setArticle(null);setPath(route);window.scrollTo({top:0,behavior:'instant'});parent.postMessage({type:'rinan-route',path:route},'*');};
  const click=(event:MouseEvent)=>{const a=(event.target as Element).closest('a');if(!a||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;let href=a.getAttribute('href')||'';if(href.startsWith('/rinan-commons'))href=href.slice('/rinan-commons'.length)||'/';if(href in pages||/^\/stories\/[^/]+\/$/.test(href)){event.preventDefault();navigate(href);}else if(href.startsWith('/')){event.preventDefault();window.open('https://jimmy10107.github.io/rinan-commons'+href,'_blank','noopener');}};
  const message=(event:MessageEvent)=>{if(event.source===parent&&event.data?.type==='rinan-go')navigate(event.data.path)};
  document.addEventListener('click',click);window.addEventListener('message',message);
  return()=>{document.removeEventListener('click',click);window.removeEventListener('message',message)};
 },[path]);
 useEffect(()=>{if(!document.querySelector('#content'))return;requestAnimationFrame(()=>{const content=document.querySelector<HTMLElement>('#content');if(content){content.tabIndex=-1;content.focus({preventScroll:true})}})},[path,article]);
 const Page=pages[path];return Page?<Page key={path}/>:article||<p style={{padding:40}}>載入筆記…</p>;
}
createRoot(document.getElementById('app')!).render(<Review/>);
