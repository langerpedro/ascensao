(()=>{'use strict';
const modal=document.getElementById('asc3dModal'),canvas=document.getElementById('asc3dCanvas'),ctx=canvas.getContext('2d');
const open=document.getElementById('asc3dOpen'),close=document.getElementById('asc3dClose');
let female=false,playing=true,angle=-.30,reactUntil=0,frame=0,last=0,drag=false,px=0;
function sync(){try{const s=JSON.parse(localStorage.getItem('ascensao-v1')||'{}');female=['cacadora','exploradora'].includes(s.class)}catch{} document.getElementById('asc3dMale').classList.toggle('active',!female);document.getElementById('asc3dFemale').classList.toggle('active',female)}
open.onclick=()=>{sync();modal.classList.add('open');document.body.style.overflow='hidden';resize();requestAnimationFrame(loop)};
function dismiss(){modal.classList.remove('open');document.body.style.overflow=''}close.onclick=dismiss;
modal.addEventListener('click',e=>{if(e.target===modal)dismiss()});
document.getElementById('asc3dMale').onclick=()=>{female=false;syncButtons()};document.getElementById('asc3dFemale').onclick=()=>{female=true;syncButtons()};
function syncButtons(){document.getElementById('asc3dMale').classList.toggle('active',!female);document.getElementById('asc3dFemale').classList.toggle('active',female)}
document.getElementById('asc3dReact').onclick=()=>{reactUntil=performance.now()+1100};document.getElementById('asc3dPause').onclick=e=>{playing=!playing;e.target.textContent=playing?'⏸ Pausar':'▶ Animar'};
canvas.addEventListener('pointerdown',e=>{drag=true;px=e.clientX;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(drag){angle+=(e.clientX-px)*.012;px=e.clientX}});canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointercancel',()=>drag=false);
function resize(){const d=Math.min(devicePixelRatio||1,2),w=canvas.clientWidth,h=canvas.clientHeight;canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0)}
const add=(a,b)=>a.map((v,i)=>v+b[i]),rotX=(p,a)=>[p[0],p[1]*Math.cos(a)-p[2]*Math.sin(a),p[1]*Math.sin(a)+p[2]*Math.cos(a)],rotY=(p,a)=>[p[0]*Math.cos(a)+p[2]*Math.sin(a),p[1],-p[0]*Math.sin(a)+p[2]*Math.cos(a)];
let polys=[];
function poly(v,c){polys.push({v,c,depth:v.reduce((n,p)=>n+p[2],0)/v.length})}
function box(center,size,color,rx=0,ry=0){const [x,y,z]=size.map(n=>n/2),corners=[[-x,-y,-z],[x,-y,-z],[x,y,-z],[-x,y,-z],[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]].map(p=>add(rotY(rotX(p,rx),ry),center));const faces=[[0,1,2,3],[4,5,6,7],[0,4,7,3],[1,5,6,2],[3,2,6,7],[0,1,5,4]];faces.forEach((ids,i)=>poly(ids.map(id=>corners[id]),shade(color,[.55,.92,.67,.83,1,.5][i])))}
function shade(hex,m){let a=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));return '#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v*m))).toString(16).padStart(2,'0')).join('')}
function limb(a,b,r,color,n=8){const axis=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],len=Math.hypot(...axis),up=axis.map(v=>v/len),cross=[up[1],-up[0],0],cl=Math.hypot(...cross)||1,u=cross.map(v=>v/cl),v=[up[1]*u[2]-up[2]*u[1],up[2]*u[0]-up[0]*u[2],up[0]*u[1]-up[1]*u[0]];let rings=[a,b].map(pt=>Array.from({length:n},(_,i)=>add(pt,u.map((val,j)=>val*Math.cos(i*2*Math.PI/n)*r+v[j]*Math.sin(i*2*Math.PI/n)*r))));for(let i=0;i<n;i++)poly([rings[0][i],rings[0][(i+1)%n],rings[1][(i+1)%n],rings[1][i]],shade(color,.62+.35*Math.abs(Math.cos(i*2*Math.PI/n))))}
function scene(t){polys=[];let breath=playing?Math.sin(t*1.8)*.025:0,turn=playing?Math.sin(t*.75)*.12:0,blink=playing&&Math.sin(t*2.6)>.993;const hit=performance.now()<reactUntil?Math.sin((reactUntil-performance.now())*.014)*.32:0;
const armor=female?'#302336':'#263846',trim=female?'#f02e9f':'#16dbe5',skin=female?'#c89080':'#ae795c',hair=female?'#e7d4bd':'#191b20';
box([0,1.15,0],[.62,.45,.31],armor);box([0,1.68,0],[female?.72:.93,.92+breath,.40],armor);box([0,1.68,.23],[female?.63:.82,.63,.06],shade(armor,1.5));
box([0,1.25,.25],[.34,.08,.09],trim);box([0,1.96,.25],[.40,.06,.07],trim);
limb([0,2.12,0],[0,2.29,0],.13,skin);const headCenter=[Math.sin(turn+hit)*.045,2.54,Math.cos(turn)*.045];box(headCenter,[.45,.52,.39],skin,0,turn+hit);box(add(headCenter,[0,.25,-.025]),[.48,.16,.40],hair,0,turn+hit);
// facial geometry follows head rotation; no duplicate faces
for(const x of [-.12,.12]){let eye=add(headCenter,rotY([x,.035,.206],turn+hit));box(eye,[.075,blink?.009:.028,.025],'#10121c',0,turn+hit)}
if(female){for(let i=0;i<5;i++){const x=-.23+i*.11;limb([x,2.76,-.06],[x+(i-2)*.022,2.13,-.1],.042,hair,5)}}else{box(add(headCenter,[0,-.16,.15]),[.35,.13,.15],'#252023',0,turn+hit)}
for(let side of [-1,1]){const sway=playing?Math.sin(t*1.8+side)*.07:0,armX=side*(female?.51:.60),elbow=[side*(.61+sway+hit*.35),1.54,.03],hand=[side*(.62+sway+hit*.6),1.12,.11];limb([armX,2.02,0],elbow,female?.13:.16,skin);limb(elbow,hand,.12,armor);box([armX,2.05,.06],[.20,.15,.22],trim);const hip=[side*.22,1.05,0],knee=[side*.23,.58,.08],foot=[side*.24,.09,.22];limb(hip,knee,.19,armor);limb(knee,foot,.14,shade(armor,1.2));box([side*.24,.075,.31],[.29,.15,.50],'#131b25')}
}
function project(p,w,h){let q=rotY(p,angle),depth=5.8-q[2],scale=Math.min(w/3.6,h/3.7)*5/depth;return [w/2+q[0]*scale,h*.91-q[1]*scale,q[2]]}
function loop(ms){if(!modal.classList.contains('open'))return;let dt=Math.min(.05,(ms-last)/1000||0);last=ms;if(playing)frame+=dt;const w=canvas.clientWidth,h=canvas.clientHeight;ctx.clearRect(0,0,w,h);const grd=ctx.createRadialGradient(w/2,h*.42,15,w/2,h*.52,h*.75);grd.addColorStop(0,female?'#3a193c':'#12384b');grd.addColorStop(1,'#050913');ctx.fillStyle=grd;ctx.fillRect(0,0,w,h);
ctx.strokeStyle='#18d8ed30';for(let i=0;i<12;i++){ctx.beginPath();ctx.moveTo(w/2,h*.9);ctx.lineTo(i*w/11,h);ctx.stroke()}
scene(frame);polys=polys.map(p=>({...p,pts:p.v.map(v=>project(v,w,h))}));polys.sort((a,b)=>a.pts.reduce((n,v)=>n+v[2],0)/a.pts.length-b.pts.reduce((n,v)=>n+v[2],0)/b.pts.length);for(const p of polys){ctx.beginPath();p.pts.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]));ctx.closePath();ctx.fillStyle=p.c;ctx.fill();ctx.strokeStyle='#ffffff0c';ctx.lineWidth=.6;ctx.stroke()}
ctx.font='600 12px system-ui';ctx.fillStyle='#77eaf3';ctx.fillText(female?'OPERADORA // PROTÓTIPO 3D':'DRAKHAST // PROTÓTIPO 3D',14,23);requestAnimationFrame(loop)}
window.addEventListener('resize',()=>{if(modal.classList.contains('open'))resize()});
})();