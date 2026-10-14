(() => {
'use strict';
const KEY='vyro_life_v1';
const defaults=()=>({profile:{name:'',age:'',goal:'Feel healthier and more consistent',units:'Metric',theme:'midnight',onboarded:false},routine:[],water:0,waterGoal:8,sleepHours:0,sleepQuality:'Good',mood:'Good',energy:3,weight:'',steps:0,stepGoal:8000,workouts:[],workoutGoal:3,meals:[],caloriesGoal:2000,proteinGoal:100,notes:'',history:{},achievements:{},membership:{plan:'free',status:'inactive'},focus:{duration:25,remaining:1500,sessions:[],label:'Deep work'},journal:[],createdAt:new Date().toISOString()});
let state=load(),page='home',obStep=0,obDraft={},toastTimer,focusInterval=null;
state.focus=Object.assign({duration:25,remaining:1500,sessions:[],label:'Deep work'},state.focus||{});if(!Array.isArray(state.focus.sessions))state.focus.sessions=[];if(!Array.isArray(state.journal))state.journal=[];state.focus.remaining=Math.max(0,Number(state.focus.remaining)||0);state.focus.duration=Math.max(5,Math.min(90,Number(state.focus.duration)||25));state.focus.running=false;
function load(){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');return s&&typeof s==='object'?Object.assign(defaults(),s,{profile:Object.assign(defaults().profile,s.profile||{})}):defaults()}catch(e){return defaults()}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){notify('Could not save: browser storage may be full.')}}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function dayData(){const k=today();state.history[k] ||= {routine:[],water:0,workouts:[],meals:[],sleepHours:0,mood:'',steps:0};return state.history[k]}
function notify(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2600)}
function iconFor(page){return ({routine:'◷',health:'♡',fitness:'✳',nutrition:'◉',insights:'⌁',settings:'⚙'})[page]||'◈'}
function header(title,desc,action=''){return `<div class="section-top"><div><div class="eyebrow">YOUR PERSONAL SPACE</div><h1 class="section-title">${title}</h1><p class="sub">${desc}</p></div>${action}</div>`}
function card(title,body,extra=''){return `<section class="card ${extra}"><div class="cardhead"><div class="cardtitle">${title}</div></div>${body}</section>`}
function ring(pct,label,value){let v=Math.max(0,Math.min(100,Number(pct)||0));return `<div class="ring"><svg viewBox="0 0 100 100"><circle class="track" cx="50" cy="50" r="45"/><circle class="progress" cx="50" cy="50" r="45" style="stroke-dasharray:283;stroke-dashoffset:${283-(283*v/100)}"/></svg><div class="ringval"><strong>${esc(value)}</strong><span>${esc(label)}</span></div></div>`}
function empty(text){return `<div class="empty">${text}</div>`}
function listItems(items,kind){if(!items.length)return empty('Nothing here yet. Add your first entry to get started.');return `<div class="list">${items.map((x,i)=>`<div class="listitem"><div class="metric-icon">${kind==='routine'?'◷':kind==='workout'?'✳':'◉'}</div><div class="grow"><strong>${esc(x.name||x.type||'Entry')}</strong><small>${esc(x.detail||x.time||x.date||'Saved today')}</small></div>${x.amount?`<b>${esc(x.amount)}</b>`:''}<button class="btn secondary smallbtn" data-delete="${kind}" data-index="${i}" aria-label="Delete entry">×</button></div>`).join('')}</div>`}
function todayRoutine(){return state.routine}
function doneCount(){return state.routine.filter(x=>x.done).length}
function mealTotals(){return state.meals.reduce((a,m)=>({cal:a+Number(m.calories||0),protein:a+Number(m.protein||0)}),{cal:0,protein:0})}
function workoutCount(){return state.workouts.filter(w=>w.date===today()).length}
function activeStreak(){let count=0;for(let i=0;i<365;i++){const d=new Date();d.setDate(d.getDate()-i);const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;const h=state.history[k];const active=!!(h&&(((h.routine||[]).some(Boolean))||h.water>0||h.workouts>0||h.meals>0||h.sleepHours>0||h.steps>0||h.mood));if(active)count++;else if(i>0)break;else if(i===0)continue;}return count}
function focusMinutesThisWeek(){return (state.focus?.sessions||[]).filter(x=>withinWeek(x.date)).reduce((a,x)=>a+Number(x.minutes||0),0)}
