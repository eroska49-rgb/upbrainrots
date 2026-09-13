
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const STORAGE = "brainrotup_demo_v1";
const COLORS = [
  {name:"Красный", emoji:"🔴", key:"red"},
  {name:"Синий", emoji:"🔵", key:"blue"},
  {name:"Зелёный", emoji:"🟢", key:"green"},
  {name:"Жёлтый", emoji:"🟡", key:"yellow"},
  {name:"Фиолетовый", emoji:"🟣", key:"purple"},
  {name:"Оранжевый", emoji:"🟠", key:"orange"}
];
const defaultState = {
  publicId: "#"+Math.floor(100000+Math.random()*899999),
  balance: 0, games: 0, wins: 0, losses: 0, deposited: 0, withdrawn: 0,
  history: [], promoUsed: [], page:"home"
};
let state = JSON.parse(localStorage.getItem(STORAGE) || "null") || defaultState;
function save(){ localStorage.setItem(STORAGE,JSON.stringify(state)); }
function money(n){ return Math.floor(n).toLocaleString("ru-RU"); }
function toast(msg){ const el=document.getElementById("toast"); el.textContent=msg; el.classList.add("show"); clearTimeout(window.__t); window.__t=setTimeout(()=>el.classList.remove("show"),2200); }
function addTx(type, amount){
  state.history.unshift({type,amount,time:new Date().toLocaleString("ru-RU",{hour:"2-digit",minute:"2-digit"})});
  state.history=state.history.slice(0,30); save();
}
function go(page){ state.page=page; save(); render(); window.scrollTo({top:0,behavior:"smooth"}); }
function pageTitle(t){ return `<div class="page-title">${t}</div>`; }

function home(){
return `
<div class="card user-card">
  <div class="avatar">🧠</div>
  <div><div class="user-name">${getName()} 👑</div><div>Баланс:</div><div class="balance">🧠 ${money(state.balance)} мозгов</div></div>
  <button class="primary" onclick="bonus()">🎁 Получить 3 мозга<br><small>Ежедневный бонус</small></button>
</div>
<div class="hero">
 <div class="card hero-art"><div class="hero-title">UPBRAINROTS</div></div>
 <div class="card info"><h3>🧠 Мозги — это валюта!</h3><p>UPBRAINROTS — игровое мини-приложение в Telegram. Пополняй баланс мозгами, играй в игры и участвуй в событиях.</p></div>
</div>
<div class="section-title">НАШИ ИГРЫ</div>
<div class="games-grid">
 ${gameCard("🎰","СЛОТЫ","Крути и выигрывай!","slots")}
 ${gameCard("🎯","АПГРЕЙДЕР","Испытай удачу и умножь мозги!","upgrader")}
 ${gameCard("💎","ДЖЕКПОТ","Все против всех!","jackpot",true)}
 ${gameCard("🎲","КОЛОР ДАЙС","Угадай цвет и умножь!","dice")}
</div>
<div class="mini-row">
 <div class="card mini" onclick="toast('Раздел в разработке')"><span>🧠</span><b>Топ игроков</b><small>Стань лучшим!</small></div>
 <div class="card mini" onclick="toast('Ежедневный бонус уже выше')"><span>🎁</span><b>Бонусы</b><small>Ежедневные награды</small></div>
 <div class="card mini" onclick="toast('Реферальная система подключается на backend')"><span>👑</span><b>Рефералы</b><small>Приглашай друзей</small></div>
</div>`;
}
function getName(){
  return tg?.initDataUnsafe?.user ? (tg.initDataUnsafe.user.username || tg.initDataUnsafe.user.first_name || "Игрок") : "user"+state.publicId.replace("#","");
}
function gameCard(icon,title,desc,key,disabled=false){
 return `<div class="card game-card"><div class="game-art">${icon}</div><div><h3>${title}</h3><p>${desc}</p><button class="game-btn" onclick="${disabled?"toast('Джекпот будет доступен после подключения backend'): `go('${key}')`}">▶ Играть</button></div></div>`;
}
function games(){
return `${pageTitle("🎮 НАШИ ИГРЫ")}<div class="games-grid">
 ${gameCard("🎯","АПГРЕЙДЕР","75% / 50% / 35% / 15%","upgrader")}
 ${gameCard("🎲","КОЛОР ДАЙС","6 цветов • 4 кубика","dice")}
 ${gameCard("🎰","СЛОТЫ","Крути барабаны","slots")}
 ${gameCard("💎","ДЖЕКПОТ","Глобальная игра","jackpot",true)}
</div>`;
}
function balance(){
return `${pageTitle("🧠 БАЛАНС")}
<div class="card"><div class="balance" style="font-size:38px">🧠 ${money(state.balance)}</div><p class="notice">Демо-режим: операции ниже изменяют локальный баланс. Для реального пополнения/вывода нужен защищённый backend и платёжный провайдер.</p></div>
<div class="card"><h3>💳 Пополнить</h3><div class="amounts">
${[100,500,1000,5000].map(x=>`<button class="amount-btn" onclick="demoDeposit(${x})">+${money(x)} 🧠</button>`).join("")}</div></div>
<div class="card"><h3>💸 Вывести</h3><input id="withdrawAmount" class="input" type="number" min="1" placeholder="Количество мозгов"><br><br><button class="primary" onclick="demoWithdraw()">Создать заявку</button></div>`;
}
function promo(){
return `${pageTitle("🏷 ПРОМОКОД")}
<div class="card"><h3>🎁 Активировать промокод</h3><input id="promoInput" class="input" placeholder="Введите промокод"><br><br><button class="primary" onclick="activatePromo()">Активировать</button><p class="notice">Для демо доступны: <b>BRAIN100</b> и <b>WELCOME50</b>.</p></div>`;
}
function profile(){
return `${pageTitle("👤 ПРОФИЛЬ")}
<div class="card"><div class="profile-id">${state.publicId}</div><p>${getName()}</p></div>
<div class="stats">
 <div class="stat">🧠 Баланс<b>${money(state.balance)}</b></div><div class="stat">🎮 Игр<b>${state.games}</b></div>
 <div class="stat">🏆 Побед<b>${state.wins}</b></div><div class="stat">💥 Поражений<b>${state.losses}</b></div>
 <div class="stat">💳 Пополнено<b>${money(state.deposited)}</b></div><div class="stat">💸 Выведено<b>${money(state.withdrawn)}</b></div>
</div>
<div class="card"><h3>📜 История</h3>${state.history.length?state.history.map(h=>`<div class="history-item"><span>${h.type}<small> ${h.time}</small></span><b class="${h.amount>=0?'plus':'minus'}">${h.amount>=0?'+':''}${money(h.amount)} 🧠</b></div>`).join(""):`<div class="empty">История пока пуста</div>`}</div>`;
}
function upgrader(){
return `${pageTitle("🎯 UPGRADER")}
<div class="card"><div class="wheel-wrap"><div class="wheel" id="wheel" style="--chance:75%"><div class="pointer">▼</div><div class="center">🧠</div></div></div>
<div class="risk-grid">${[[75,1.5],[50,2],[35,2.5],[15,3.5]].map((r,i)=>`<button class="risk ${i===0?'selected':''}" data-risk="${r[0]}" onclick="selectRisk(this,${r[0]},${r[1]})">${r[0]}%<br>×${r[1]}</button>`).join("")}</div><br>
<input id="upBet" class="input" type="number" min="1" placeholder="Ставка, мозги"><br><br>
<div id="upWin" class="notice">Потенциальная выплата: —</div><br><button class="primary" style="width:100%" onclick="playUpgrader()">КРУТИТЬ</button></div>`;
}
let selectedRisk={chance:75,mult:1.5};
function selectRisk(el,chance,mult){ selectedRisk={chance,mult}; document.querySelectorAll(".risk").forEach(x=>x.classList.remove("selected")); el.classList.add("selected"); document.getElementById("wheel").style.setProperty("--chance",chance+"%"); }
function playUpgrader(){
 const bet=Number(document.getElementById("upBet").value);
 if(!Number.isFinite(bet)||bet<=0||bet>state.balance)return toast("Недостаточно мозгов или неверная ставка");
 const win=Math.random()*100<selectedRisk.chance;
 const wheel=document.getElementById("wheel"); wheel.style.transform=`rotate(${1440+Math.random()*720}deg)`;
 state.balance-=bet; state.games++;
 setTimeout(()=>{
   if(win){const payout=Math.floor(bet*selectedRisk.mult);state.balance+=payout;state.wins++;addTx("Upgrader WIN",payout-bet);toast(`🎉 WIN +${money(payout-bet)} 🧠`)}
   else{state.losses++;addTx("Upgrader LOSE",-bet);toast(`💥 LOSE -${money(bet)} 🧠`)}
   save();render();
 },1800);
}
function dice(){
return `${pageTitle("🎲 COLOR DICE")}
<div class="card"><div class="dice-grid" id="diceGrid">${[1,2,3,4].map(()=>`<div class="die">?</div>`).join("")}</div>
<h3>Выберите цвет</h3><div class="colors">${COLORS.map(c=>`<button class="color-btn" data-color="${c.key}" style="background:${colorCss(c.key)}" onclick="selectColor(this,'${c.key}')">${c.emoji} ${c.name}</button>`).join("")}</div><br>
<input id="diceBet" class="input" type="number" min="1" placeholder="Ставка, мозги"><br><br><button class="primary" style="width:100%" onclick="playDice()">БРОСИТЬ КУБИКИ</button>
</div>`;
}
let selectedColor=null;
function colorCss(k){return {red:"#8f1729",blue:"#143d92",green:"#126b36",yellow:"#806b09",purple:"#54218c",orange:"#9a4812"}[k]}
function selectColor(el,k){selectedColor=k;document.querySelectorAll(".color-btn").forEach(x=>x.classList.remove("sel"));el.classList.add("sel")}
function playDice(){
 const bet=Number(document.getElementById("diceBet").value);
 if(!selectedColor)return toast("Выберите цвет");
 if(!Number.isFinite(bet)||bet<=0||bet>state.balance)return toast("Недостаточно мозгов или неверная ставка");
 state.balance-=bet;state.games++;
 const results=Array.from({length:4},()=>COLORS[Math.floor(Math.random()*COLORS.length)]);
 const grid=document.getElementById("diceGrid");
 results.forEach((r,i)=>setTimeout(()=>grid.children[i].textContent=r.emoji,350+i*300));
 const win=results.some(r=>r.key===selectedColor);
 setTimeout(()=>{if(win){state.balance+=bet*2;state.wins++;addTx("Color Dice WIN",bet);toast(`🎉 WIN +${money(bet)} 🧠`)}else{state.losses++;addTx("Color Dice LOSE",-bet);toast(`💥 LOSE -${money(bet)} 🧠`)}save();render()},1900);
}
function slots(){
return `${pageTitle("🎰 SLOTS")}
<div class="card"><div class="slots" id="slots"><div class="slot">🧠</div><div class="slot">7️⃣</div><div class="slot">💎</div></div><br>
<input id="slotBet" class="input" type="number" min="1" placeholder="Ставка, мозги"><br><br><button class="primary" style="width:100%" onclick="playSlots()">SPIN</button>
<p class="notice">Демо-выплаты: 7️⃣7️⃣7️⃣ ×10 • 💎💎💎 ×5 • ⭐⭐⭐ ×3 • 🍒🍒🍒 ×2.</p></div>`;
}
const symbols=["🍒","🍋","🍊","💎","⭐","7️⃣","🧠"];
function playSlots(){
 const bet=Number(document.getElementById("slotBet").value);
 if(!Number.isFinite(bet)||bet<=0||bet>state.balance)return toast("Недостаточно мозгов или неверная ставка");
 state.balance-=bet;state.games++;
 const out=Array.from({length:3},()=>symbols[Math.floor(Math.random()*symbols.length)]);
 const el=document.querySelectorAll("#slots .slot");
 let ticks=0;const timer=setInterval(()=>{el.forEach(x=>x.textContent=symbols[Math.floor(Math.random()*symbols.length)]);if(++ticks>13){clearInterval(timer);finish(out,bet)}},90);
 function finish(r,b){
  el.forEach((x,i)=>x.textContent=r[i]);let mult=0;
  if(r.every(x=>x==="7️⃣"))mult=10;else if(r.every(x=>x==="💎"))mult=5;else if(r.every(x=>x==="⭐"))mult=3;else if(r.every(x=>x==="🍒"))mult=2;
  if(mult){const payout=b*mult;state.balance+=payout;state.wins++;addTx("Slots WIN",payout-b);toast(`🎰 WIN ×${mult} +${money(payout-b)} 🧠`)}else{state.losses++;addTx("Slots LOSE",-b);toast(`💥 LOSE -${money(b)} 🧠`)}
  save();
 }
 setTimeout(()=>render(),1800);
}
function jackpot(){return `${pageTitle("💎 ДЖЕКПОТ")}<div class="card empty"><div style="font-size:80px">💎</div><h2>Скоро</h2><p>Джекпот требует серверной версии с общей игровой комнатой и синхронизацией участников.</p><button class="primary" onclick="go('games')">Вернуться к играм</button></div>`}
function demoDeposit(x){state.balance+=x;state.deposited+=x;addTx("Демо-пополнение",x);toast(`+${money(x)} 🧠`);render()}
function demoWithdraw(){const x=Number(document.getElementById("withdrawAmount").value);if(!x||x<=0||x>state.balance)return toast("Неверная сумма");state.balance-=x;state.withdrawn+=x;addTx("Демо-вывод",-x);toast("Заявка создана");render()}
function bonus(){const key=new Date().toISOString().slice(0,10);if(state.lastBonus===key)return toast("Бонус уже получен сегодня");state.lastBonus=key;state.balance+=3;addTx("Ежедневный бонус",3);toast("+3 🧠");save();render()}
function activatePromo(){const code=(document.getElementById("promoInput").value||"").trim().toUpperCase();if(state.promoUsed.includes(code))return toast("Промокод уже использован");const rewards={BRAIN100:100,WELCOME50:50};if(!rewards[code])return toast("Промокод не найден");state.balance+=rewards[code];state.promoUsed.push(code);addTx("Промокод",rewards[code]);toast(`🎁 +${rewards[code]} 🧠`);save();render()}

function render(){
 const view=document.getElementById("view");
 view.innerHTML = ({home,games,balance,promo,profile,upgrader,dice,slots,jackpot}[state.page]||home)();
 document.querySelectorAll("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===state.page));
}
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-page]"); if(b) go(b.dataset.page);
});
document.getElementById("backBtn").onclick=()=>go("home");
document.getElementById("moreBtn").onclick=()=>toast("Меню проекта");
render();
