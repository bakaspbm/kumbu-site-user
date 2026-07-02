import { THEME_STORAGE_KEY } from "@/lib/theme";

const INLINE_HEAD_SCRIPT = `
(function(){try{if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(regs){for(var i=0;i<regs.length;i++)regs[i].unregister();});}}catch(e){}})();
(function(){try{var m=localStorage.getItem('${THEME_STORAGE_KEY}')||'light';if(!m||m==='system'){m='light';try{localStorage.setItem('${THEME_STORAGE_KEY}','light');}catch(e){}}var dark=m==='dark';document.documentElement.classList.toggle('dark',dark);}catch(e){}})();
(function(){try{var k="__kumbuFetchGuardInstalled";if(typeof window==="undefined"||window[k])return;window[k]=1;var n=window.fetch.bind(window);var d=[0,300,600];window.fetch=function(i,o){return new Promise(function(res,rej){var a=0;function run(){var w=d[a]||0;setTimeout(function(){n(i,o).then(res).catch(function(e){a++;if(a<d.length)run();else rej(e);});},w);}run();});};}catch(e){}})();
`.trim();

export function ThemeScript() {
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: INLINE_HEAD_SCRIPT }}
    />
  );
}
