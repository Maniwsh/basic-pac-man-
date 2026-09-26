(() => {
  const TILE=32, MAP=[
    '#####################','#S....#.....#.......#','#.##..#.###.#.###.#..#','#.....#...#...#...#..#','###.#####.#.###.##..##','#...#.....#.....#....#','#.#.#.#########.#.##.#','#.#...#...#...#...#..E#','#.###.#.#.#.#.#####..#','#.....#.#...#.#......#','###.###.#####.#.######','#...#.....#...#......#','#.#####.#.#.#####.##.#','#.......#...........#','#####################'
  ];
  const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),overlay=document.querySelector('#overlay');
  const W=MAP[0].length,H=MAP.length;canvas.width=W*TILE;canvas.height=H*TILE;
  let walls=[],shards=[],player,guards=[],exit,gameState='menu',score=0,pulse=0,started=0,elapsed=0,last=0,sound=false,keys={},particles=[];
  const scoreEl=document.querySelector('#score'),timeEl=document.querySelector('#time'),chargeEl=document.querySelector('#charge'),hint=document.querySelector('#pulse-hint'),status=document.querySelector('#status');
  function setup(){walls=[];shards=[];let start={x:1,y:1};exit={x:19,y:7};for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=MAP[y][x];if(c==='#')walls.push({x,y});else if(c==='.')shards.push({x,y,phase:Math.random()*6});else if(c==='S')start={x,y}}player={x:start.x,y:start.y,dx:0,dy:0,step:0,invul:0};guards=[{x:18,y:1,home:[18,1],color:'#ff4f9a',timer:0,mode:'hunt'},{x:17,y:13,home:[17,13],color:'#a682ff',timer:0,mode:'hunt'},{x:3,y:11,home:[3,11],color:'#ffb454',timer:0,mode:'hunt'}];score=0;pulse=0;updateUI()}
  function wall(x,y){return x<0||y<0||x>=W||y>=H||MAP[y][x]==='#'}
  function updateUI(){scoreEl.innerHTML=`${String(score).padStart(2,'0')} <small>/ ${String(shards.length+score).padStart(2,'0')}</small>`;chargeEl.style.width=`${pulse}%`;hint.textContent=pulse>=100?'SPACE · PULSE READY':'Collect shards to charge'}
  function draw(){ctx.fillStyle='#070b15';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#101a2a';ctx.lineWidth=1;for(let x=0;x<W;x++)for(let y=0;y<H;y++){ctx.strokeRect(x*TILE,y*TILE,TILE,TILE)}
    for(const w of walls){ctx.fillStyle='#14243a';ctx.fillRect(w.x*TILE+1,w.y*TILE+1,TILE-2,TILE-2);ctx.strokeStyle='#284862';ctx.strokeRect(w.x*TILE+4,w.y*TILE+4,TILE-8,TILE-8);ctx.fillStyle='#51f5df';ctx.fillRect(w.x*TILE+5,w.y*TILE+5,3,3)}
    const t=performance.now()/240;for(const p of shards){const r=2+Math.sin(t+p.phase)*.8;ctx.fillStyle='#51f5df';ctx.shadowColor='#51f5df';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(p.x*TILE+16,p.y*TILE+16,r,0,7);ctx.fill();ctx.shadowBlur=0}
    ctx.save();ctx.translate(exit.x*TILE+16,exit.y*TILE+16);ctx.rotate(t*.14);ctx.strokeStyle=shards.length?'#31445a':'#51f5df';ctx.lineWidth=2;ctx.strokeRect(-9,-9,18,18);ctx.rotate(-t*.28);ctx.strokeRect(-5,-5,10,10);ctx.restore();
    for(const g of guards)drawGuard(g);if(player)drawPlayer();for(const p of particles){ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3)}ctx.globalAlpha=1;
  }
  function drawPlayer(){const x=player.x*TILE+16,y=player.y*TILE+16;ctx.save();ctx.shadowColor='#51f5df';ctx.shadowBlur=player.invul>0?24:13;ctx.fillStyle='#cafff7';ctx.beginPath();ctx.arc(x,y,9+Math.sin(performance.now()/100)*.5,0,7);ctx.fill();ctx.fillStyle='#51f5df';ctx.beginPath();ctx.arc(x+player.dx*3,y+player.dy*3,4,0,7);ctx.fill();ctx.restore()}
  function drawGuard(g){const x=g.x*TILE+16,y=g.y*TILE+16;ctx.save();ctx.shadowColor=g.color;ctx.shadowBlur=12;ctx.fillStyle=g.mode==='stunned'?'#6c8099':g.color;ctx.beginPath();ctx.arc(x,y,9,Math.PI,0);ctx.lineTo(x+9,y+8);ctx.lineTo(x+4,y+5);ctx.lineTo(x,y+9);ctx.lineTo(x-4,y+5);ctx.lineTo(x-9,y+8);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-3,y-1,2,0,7);ctx.arc(x+3,y-1,2,0,7);ctx.fill();ctx.restore()}
  function moveGuardRandomly(g){
    const directions=[[1,0],[-1,0],[0,1],[0,-1]];
    const openDirections=[];
    for(const direction of directions){
      const nextX=g.x+direction[0];
      const nextY=g.y+direction[1];
      if(!wall(nextX,nextY))openDirections.push(direction);
    }
    if(openDirections.length===0)return;
    const choice=Math.floor(Math.random()*openDirections.length);
    g.x+=openDirections[choice][0];
    g.y+=openDirections[choice][1];
  }
  function tick(dt){if(gameState!=='playing')return;elapsed+=dt;if(player.invul>0)player.invul-=dt;player.step-=dt;let dx=0,dy=0;if(keys.ArrowLeft||keys.a)dx=-1;else if(keys.ArrowRight||keys.d)dx=1;else if(keys.ArrowUp||keys.w)dy=-1;else if(keys.ArrowDown||keys.s)dy=1;
    if(player.step<=0&&(dx||dy)&&!wall(player.x+dx,player.y+dy)){player.x+=dx;player.y+=dy;player.dx=dx;player.dy=dy;player.step=.105;const i=shards.findIndex(s=>s.x===player.x&&s.y===player.y);if(i>=0){const s=shards.splice(i,1)[0];score++;pulse=Math.min(100,pulse+13);burst(s.x*TILE+16,s.y*TILE+16,'#51f5df',8);updateUI();if(shards.length===0){status.textContent='EXIT OPEN · GET TO THE GATE';status.classList.add('good')}}if(player.x===exit.x&&player.y===exit.y&&shards.length===0){finish(true)}}
    guards.forEach(g=>{g.timer-=dt;if(g.mode==='stunned'){if(g.timer<=0){g.mode='hunt';g.x=g.home[0];g.y=g.home[1]}return}if(g.timer<=0){g.timer=.5;moveGuardRandomly(g)}if(g.x===player.x&&g.y===player.y&&player.invul<=0){if(pulse>=100)activatePulse();else finish(false)}});particles.forEach(p=>{p.x+=p.dx*dt*45;p.y+=p.dy*dt*45;p.life-=dt*1.5});particles=particles.filter(p=>p.life>0);timeEl.textContent=fmt(elapsed);}
  function burst(x,y,color,n){for(let i=0;i<n;i++){let a=Math.random()*Math.PI*2;particles.push({x,y,dx:Math.cos(a),dy:Math.sin(a),life:.8,color})}}
  function activatePulse(){pulse=0;player.invul=.8;guards.forEach(g=>{g.mode='stunned';g.timer=3.4;g.x=g.home[0];g.y=g.home[1];burst(g.x*TILE+16,g.y*TILE+16,g.color,12)});status.textContent='PULSE RELEASED · SENTINELS SCRAMBLED';status.classList.add('good');updateUI()}
  function fmt(s){let n=Math.floor(s);return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`}
  function finish(win){gameState=win?'won':'lost';overlay.classList.remove('hidden');overlay.querySelector('.eyebrow').textContent=win?'SECTOR CLEARED':'SIGNAL LOST';overlay.querySelector('h2').textContent=win?'Grid secured.':'You were intercepted.';overlay.querySelector('.card>p:not(.eyebrow)').textContent=`${score} shards recovered in ${fmt(elapsed)}. ${win?'Nice run. Ready for another?':'The grid remembers. Try a different route.'}`;document.querySelector('#start').innerHTML='RUN AGAIN <span>↗</span>'}
  function begin(){setup();elapsed=0;gameState='playing';started=performance.now();last=started;overlay.classList.add('hidden');status.textContent='SENTINELS ONLINE';status.classList.remove('good')}
  function frame(now){const dt=Math.min(.05,(now-last)/1000||0);last=now;tick(dt);draw();requestAnimationFrame(frame)}
  document.querySelector('#start').onclick=begin;document.querySelector('#sound').onclick=e=>{sound=!sound;e.currentTarget.textContent=`SOUND: ${sound?'ON':'OFF'}`};
  document.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();keys[e.key]=true;if(e.key===' '&&gameState==='playing'&&pulse>=100)activatePulse();if(e.key.toLowerCase()==='p'&&gameState==='playing'){gameState='paused';overlay.classList.remove('hidden');overlay.querySelector('.eyebrow').textContent='RUN PAUSED';overlay.querySelector('h2').textContent='Catch your breath.';overlay.querySelector('.card>p:not(.eyebrow)').textContent='The sentinels are frozen. Resume when ready.';document.querySelector('#start').innerHTML='RESUME RUN <span>↗</span>';document.querySelector('#start').onclick=()=>{gameState='playing';last=performance.now();overlay.classList.add('hidden');document.querySelector('#start').onclick=begin}}});document.addEventListener('keyup',e=>keys[e.key]=false);
  setup();requestAnimationFrame(frame);
})();
