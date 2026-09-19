import {sitePath} from './site-path';
export function VisitTabs({active}:{active:'explore'|'visit'}){
 return <nav className="visit-tabs" aria-label="地圖與到訪頁面切換"><a href={sitePath('/explore/')} aria-current={active==='explore'?'page':undefined}>九里互動地圖</a><a href={sitePath('/visit/')} aria-current={active==='visit'?'page':undefined}>到訪導航與交通</a></nav>;
}
