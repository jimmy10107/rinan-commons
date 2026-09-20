'use client';
import {useEffect} from 'react';
import paths from './preload.json';
import {sitePath} from '../site-path';
import {allowBackgroundModels,modelBytes} from './model-cache';
export default function PlantPreloader(){
 useEffect(()=>{
  if(location.pathname.includes('/plants')||!allowBackgroundModels())return;
  let dead=false,timer:ReturnType<typeof setTimeout>,controller:AbortController|null=null,index=0;
  // Wait until page content has loaded, then warm one small model at a time.
  const schedule=()=>{clearTimeout(timer);if(!dead&&!document.hidden&&allowBackgroundModels())timer=setTimeout(run,5000);};
  async function run(){
   if(dead||document.hidden||!allowBackgroundModels()||index>=paths.length)return;
   controller=new AbortController();
   try{await modelBytes(sitePath('/plants/'+paths[index]),controller.signal);index++;}catch{if(!controller.signal.aborted)index++;}
   schedule();
  }
  const visibility=()=>{if(document.hidden){clearTimeout(timer);controller?.abort();}else schedule();};
  const input=()=>{clearTimeout(timer);controller?.abort();schedule();};
  document.addEventListener('visibilitychange',visibility);window.addEventListener('pointerdown',input,{passive:true});window.addEventListener('scroll',input,{passive:true});window.addEventListener('keydown',input);window.addEventListener('online',schedule);window.addEventListener('offline',input);
  if(document.readyState==='complete')schedule();else window.addEventListener('load',schedule,{once:true});
  return()=>{dead=true;clearTimeout(timer);controller?.abort();window.removeEventListener('load',schedule);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pointerdown',input);window.removeEventListener('scroll',input);window.removeEventListener('keydown',input);window.removeEventListener('online',schedule);window.removeEventListener('offline',input);};
 },[]);return null;
}
