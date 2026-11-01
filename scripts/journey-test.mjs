import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

// Exercise scroll/keyboard/reduced-motion behaviour without adding a browser dependency.
const events = {};
const frames = [];
const media = {matches:true, addEventListener:(_,fn)=>media.change=fn};
function element(key) {
  return {
    dataset:{chapter:key}, attrs:{}, inert:false,
    toggleAttribute(name,on){if(on)this.attrs[name]='';else delete this.attrs[name];},
    setAttribute(name,value){this.attrs[name]=value;},
    removeAttribute(name){delete this.attrs[name];},
    focus(){this.focused=true;},
  };
}
const chapters = ['request','call','outcome'].map(element);
const links = chapters.map(c=>Object.assign(element(),{
  hash:`#relay-${c.dataset.chapter}`,
  addEventListener(_,fn){this.click=fn;},
}));
const root = {
  dataset:{}, offsetHeight:3060,
  classList:{toggle(_,value){root.enhanced=value;}},
  querySelectorAll:s=>s==='[data-chapter]'?chapters:links,
  getBoundingClientRect:()=>({top:600-context.scrollY}),
};
const context = vm.createContext({
  document:{querySelector:()=>root}, matchMedia:()=>media,
  innerHeight:900, scrollY:0, location:{hash:''},
  history:{replaceState:(_,__,hash)=>context.location.hash=hash},
  scrollTo:({top})=>{context.scrollY=top;},
  addEventListener:(event,fn)=>events[event]=fn,
  requestAnimationFrame:fn=>{frames.push(fn);return frames.length;},
});
vm.runInContext(await readFile(new URL('../assets/journey.js',import.meta.url),'utf8'),context);
const scroll = y => {context.scrollY=y;events.scroll();while(frames.length)frames.shift()();};
const visible = () => chapters.filter(c=>c.attrs['aria-hidden']==='false').map(c=>c.dataset.chapter);
assert.equal(root.enhanced,true);
assert.deepEqual(visible(),['request']);
scroll(600+2160*.5);
assert.deepEqual(visible(),['call']);
assert.equal(root.dataset.stage,'call');
scroll(600+2160*.99);
assert.deepEqual(visible(),['outcome']);
scroll(600+2160*.1);
assert.deepEqual(visible(),['request']);
let prevented=false;
links[2].click({detail:0,preventDefault(){prevented=true;}});
assert.equal(prevented,true);
assert.equal(context.location.hash,'#relay-outcome');
assert.equal(context.scrollY,2400);
assert.equal(chapters[2].focused,true);
scroll(context.scrollY);
assert.deepEqual(visible(),['outcome']);
assert.equal(links[2].attrs['aria-current'],'step');
media.matches=false;media.change();
assert.equal(root.enhanced,false);
assert.ok(chapters.every(c=>!c.inert && c.attrs['aria-hidden']===undefined));
prevented=false;links[0].click({preventDefault(){prevented=true;}});
assert.equal(prevented,false,'Reduced motion keeps native anchors');
media.matches=true;media.change();
assert.deepEqual(visible(),['outcome']);
assert.ok(!events.wheel && !events.touchmove,'No scroll hijacking');
console.log('PASS: forward/reverse scrolling, exactly one accessible active screen, keyboard chapter links, deep-link location, reduced-motion/native-anchor fallback, live preference changes, no wheel/touch interception.');
