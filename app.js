(function(){
  const KEY = 'sb_data_v1';
  const SESSION = 'sb_session_v1';

  const seed = {
    users: [
      {login:'resident@house.kz', pass:'12345', role:'resident', apt:'47', name:'Александр Макухин', phone:'+7 700 456-78-90'},
      {login:'admin@house.kz', pass:'admin', role:'admin', apt:null, name:'Марина Козлова', phone:'+7 701 100-00-00'},
      {login:'apt23@house.kz', pass:'12345', role:'resident', apt:'23', name:'Ольга Иванова', phone:'+7 702 345-67-89'}
    ],
    residents: [
      {apt:'23', name:'Ольга Иванова', floor:'3', debt:2340, phone:'+7 702 345-67-89'},
      {apt:'47', name:'Александр Макухин', floor:'6', debt:0, phone:'+7 700 456-78-90'}
    ],
    requests: [
      {id:1, apt:'47', cat:'Сантехника', title:'Течет кран в ванной', desc:'Капает уже 3 дня.', status:'В работе', urgent:false, created:'15.03.2026 18:10', comments:[{from:'uk', text:'Мастер назначен на завтра.', time:'15.03.2026 18:20'}]},
      {id:2, apt:'23', cat:'Уборка', title:'Мусор на площадке', desc:'Нужно убрать 3 этаж.', status:'Новая', urgent:false, created:'15.03.2026 17:30', comments:[]}
    ],
    announcements: [
      {id:1, type:'urgent', title:'Отключение горячей воды', body:'17–19 марта будут техработы.', date:'15.03.2026'},
      {id:2, type:'info', title:'Собрание жильцов', body:'20 марта в 18:00 в холле.', date:'14.03.2026'}
    ],
    votes:[
      {id:1, title:'Установка шлагбаума', desc:'Ограничить въезд во двор.', opts:['За','Против'], results:[5,2], deadline:'25.03.2026', votedBy:{}}
    ],
    payments:[
      {apt:'47', month:'Март 2026', amount:11060, paid:false},
      {apt:'23', month:'Март 2026', amount:11060, paid:false}
    ],
    history:[
      {apt:'47', month:'Февраль 2026', amount:10840, date:'10.02.2026'}
    ],
    meters:{
      '47': {cold:{prev:152.4,curr:null}, hot:{prev:48.7,curr:null}, elec:{prev:3812,curr:null}},
      '23': {cold:{prev:201.8,curr:null}, hot:{prev:62.1,curr:null}, elec:{prev:4520,curr:null}}
    },
    chats:{
      '47': [{id:1, from:'uk', text:'Добрый день! Чем можем помочь?', time:'15.03.2026 16:00', read:true}],
      '23': [{id:2, from:'resident', text:'Когда вывезут мусор?', time:'15.03.2026 15:10', read:false}]
    },
    profile:{
      '47': {birth:'1990-03-15', notices:{meters:true,payments:true,announces:true}, smart:{living:false,bedroom:true,kitchen:false,hall:false,security:true,tempTarget:22}},
      '23': {birth:'1993-07-10', notices:{meters:true,payments:true,announces:false}, smart:{living:true,bedroom:false,kitchen:true,hall:true,security:false,tempTarget:21}}
    }
  };

  function loadData(){
    const raw = localStorage.getItem(KEY);
    if(!raw){ localStorage.setItem(KEY, JSON.stringify(seed)); return structuredClone(seed); }
    try { return JSON.parse(raw); } catch { localStorage.setItem(KEY, JSON.stringify(seed)); return structuredClone(seed); }
  }
  function saveData(data){ localStorage.setItem(KEY, JSON.stringify(data)); }
  function getSession(){ const raw = localStorage.getItem(SESSION); return raw ? JSON.parse(raw) : null; }
  function setSession(user){ localStorage.setItem(SESSION, JSON.stringify(user)); }
  function clearSession(){ localStorage.removeItem(SESSION); }
  function now(){ const d = new Date(); const p=n=>String(n).padStart(2,'0'); return `${p(d.getDate())}.${p(d.getMonth()+1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`; }
  function toast(text){ const t=document.getElementById('toast'); if(!t) return; t.textContent=text; t.className='toast show'; clearTimeout(toast._t); toast._t=setTimeout(()=>t.className='toast',2500); }
  function esc(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function badge(status){
    if(status==='Новая') return '<span class="badge b-danger">Новая</span>';
    if(status==='В работе') return '<span class="badge b-warn">В работе</span>';
    if(status==='Выполнено' || status==='Закрыто') return '<span class="badge b-success">'+esc(status)+'</span>';
    return '<span class="badge b-info">'+esc(status)+'</span>';
  }

  function initLogin(){
    const form = document.getElementById('loginForm'); if(!form) return;
    const data = loadData();
    const residentTab = document.getElementById('residentTab');
    const adminTab = document.getElementById('adminTab');
    const hint = document.getElementById('authHint');
    const loginInput = document.getElementById('loginInput');
    const passInput = document.getElementById('passInput');
    let mode='resident';
    function syncTabs(){
      residentTab.classList.toggle('active', mode==='resident'); adminTab.classList.toggle('active', mode==='admin');
      if(mode==='resident'){ hint.textContent='Жильцы: resident@house.kz / 12345'; loginInput.value='resident@house.kz'; passInput.value='12345'; }
      else { hint.textContent='УК: admin@house.kz / admin'; loginInput.value='admin@house.kz'; passInput.value='admin'; }
    }
    residentTab.onclick=()=>{mode='resident'; syncTabs();}; adminTab.onclick=()=>{mode='admin'; syncTabs();};
    syncTabs();

    form.addEventListener('submit', e=>{
      e.preventDefault();
      const login = loginInput.value.trim().toLowerCase();
      const pass = passInput.value;
      const user = data.users.find(u=>u.login.toLowerCase()===login && u.pass===pass);
      if(!user){ toast('Неверный логин или пароль'); return; }
      setSession({login:user.login});
      location.href='dashboard.html';
    });

    const regForm = document.getElementById('registerForm');
    document.getElementById('showRegisterBtn').onclick=()=>regForm.classList.remove('hidden');
    document.getElementById('hideRegisterBtn').onclick=()=>regForm.classList.add('hidden');
    document.getElementById('registerBtn').onclick=()=>{
      const name = document.getElementById('regName').value.trim();
      const apt = document.getElementById('regApt').value.trim();
      const login = document.getElementById('regLogin').value.trim().toLowerCase();
      const pass = document.getElementById('regPass').value;
      const pass2 = document.getElementById('regPass2').value;
      if(!name || !apt || !login || !pass) return toast('Заполни все поля');
      if(pass !== pass2) return toast('Пароли не совпадают');
      if(data.users.some(u=>u.login.toLowerCase()===login)) return toast('Логин уже существует');
      data.users.push({login, pass, role:'resident', apt, name, phone:'—'});
      if(!data.residents.some(r=>r.apt===apt)) data.residents.push({apt, name, floor:'—', debt:0, phone:'—'});
      if(!data.meters[apt]) data.meters[apt] = {cold:{prev:0,curr:null}, hot:{prev:0,curr:null}, elec:{prev:0,curr:null}};
      data.payments.push({apt, month:'Март 2026', amount:11060, paid:false});
      data.chats[apt]=[];
      data.profile[apt]={birth:'', notices:{meters:true,payments:true,announces:true}, smart:{living:false,bedroom:false,kitchen:false,hall:false,security:true,tempTarget:22}};
      saveData(data);
      toast('Аккаунт создан');
      regForm.classList.add('hidden');
      loginInput.value=login; passInput.value=pass;
    };
  }

  function initDashboard(){
    const content = document.getElementById('content'); if(!content) return;
    const data = loadData();
    const session = getSession();
    if(!session){ location.href='login.html'; return; }
    const user = data.users.find(u=>u.login===session.login);
    if(!user){ clearSession(); location.href='login.html'; return; }
    const profile = user.apt ? data.profile[user.apt] : null;

    const nav = document.getElementById('nav');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');
    const sidebar = document.querySelector('.sidebar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileOverlay = document.getElementById('mobileOverlay');
    function closeMobileMenu(){ if(sidebar) sidebar.classList.remove('mobile-open'); if(mobileOverlay) mobileOverlay.classList.remove('open'); }
    function openMobileMenu(){ if(sidebar) sidebar.classList.add('mobile-open'); if(mobileOverlay) mobileOverlay.classList.add('open'); }
    if(mobileMenuBtn) mobileMenuBtn.onclick=()=>{ if(sidebar && sidebar.classList.contains('mobile-open')) closeMobileMenu(); else openMobileMenu(); };
    if(mobileOverlay) mobileOverlay.onclick=closeMobileMenu;
    window.addEventListener('resize', ()=>{ if(window.innerWidth>800) closeMobileMenu(); });
    userName.textContent=user.name;
    userRole.textContent=user.role==='admin' ? 'Управляющий' : `Жилец • кв. ${user.apt}`;
    userAvatar.textContent=user.name.split(' ').map(x=>x[0]).join('').slice(0,2);
    document.getElementById('logoutBtn').onclick=()=>{ clearSession(); location.href='login.html'; };

    const pages = user.role==='admin'
      ? {dashboard:'Дашборд',requests:'Заявки',residents:'Жильцы',announcements:'Объявления',votes:'Голосования',chat:'Чат'}
      : {dashboard:'Главная',payments:'Платежи',meters:'Счетчики',requests:'Мои заявки',announcements:'Объявления',votes:'Голосования',chat:'Чат с УК',profile:'Профиль',smarthome:'Умный дом'};

    let current = Object.keys(pages)[0];
    function renderNav(){
      nav.innerHTML = Object.entries(pages).map(([k,v])=>`<button class="nav-btn ${k===current?'active':''}" data-page="${k}">${v}</button>`).join('');
      nav.querySelectorAll('.nav-btn').forEach(btn=>btn.onclick=()=>{ current=btn.dataset.page; renderNav(); renderPage(); if(window.innerWidth<=800) setTimeout(closeMobileMenu,80); });
    }
    function setHeader(title, subtitle=''){ document.getElementById('pageTitle').textContent=title; document.getElementById('pageSubtitle').textContent=subtitle; }
    function modal(title, html){ document.getElementById('modalTitle').textContent=title; document.getElementById('modalBody').innerHTML=html; document.getElementById('modal').classList.remove('hidden'); }
    document.getElementById('closeModalBtn').onclick=()=>document.getElementById('modal').classList.add('hidden');
    document.getElementById('modal').addEventListener('click', e=>{ if(e.target.id==='modal') e.currentTarget.classList.add('hidden'); });

    function residentDashboard(){
      const myReq = data.requests.filter(r=>r.apt===user.apt);
      const pay = data.payments.find(p=>p.apt===user.apt && !p.paid);
      const unread = (data.chats[user.apt]||[]).filter(m=>m.from==='uk' && !m.read).length;
      setHeader('Главная', `Квартира ${user.apt}`);
      content.innerHTML = `
        <div class="grid cols-4">
          <div class="stat"><div class="muted">К оплате</div><div class="v">${pay ? pay.amount.toLocaleString('ru-RU')+' ₸' : '0 ₸'}</div></div>
          <div class="stat"><div class="muted">Мои заявки</div><div class="v">${myReq.length}</div></div>
          <div class="stat"><div class="muted">Непрочитанных</div><div class="v">${unread}</div></div>
          <div class="stat"><div class="muted">Голосований</div><div class="v">${data.votes.length}</div></div>
        </div>
        <div class="grid cols-2 top-gap">
          <div class="card"><div class="between"><h3>Последние заявки</h3><button class="btn btn-ghost" id="goReq">Открыть</button></div><div class="list">${myReq.slice(0,3).map(r=>`<div class="item"><div class="between"><strong>${esc(r.title)}</strong>${badge(r.status)}</div><div class="muted">${esc(r.desc)}</div></div>`).join('') || '<div class="muted">Нет заявок</div>'}</div></div>
          <div class="card"><h3>Объявления</h3><div class="list">${data.announcements.map(a=>`<div class="item"><strong>${esc(a.title)}</strong><div class="muted">${esc(a.body)}</div></div>`).join('')}</div></div>
        </div>`;
      document.getElementById('goReq').onclick=()=>{ current='requests'; renderNav(); renderPage(); };
    }

    function residentPayments(){
      const currentPay = data.payments.find(p=>p.apt===user.apt && !p.paid);
      const history = data.history.filter(h=>h.apt===user.apt);
      setHeader('Платежи', `Квартира ${user.apt}`);
      content.innerHTML = `<div class="grid cols-2">
        <div class="card"><h3>Текущий платеж</h3>${currentPay ? `<p><strong>${esc(currentPay.month)}</strong></p><p class="muted">Сумма: ${currentPay.amount.toLocaleString('ru-RU')} ₸</p><button class="btn btn-primary" id="payBtn">Оплатить</button>` : '<p class="muted">Задолженности нет</p>'}</div>
        <div class="card"><h3>История</h3><div class="list">${history.map(h=>`<div class="item"><strong>${esc(h.month)}</strong><div class="muted">${h.amount.toLocaleString('ru-RU')} ₸ • ${esc(h.date)}</div></div>`).join('') || '<div class="muted">История пуста</div>'}</div></div>
      </div>`;
      const btn = document.getElementById('payBtn');
      if(btn) btn.onclick=()=>{
        const idx = data.payments.findIndex(p=>p.apt===user.apt && !p.paid);
        if(idx<0) return;
        const p = data.payments[idx];
        p.paid = true;
        const res = data.residents.find(r=>r.apt===user.apt); if(res) res.debt = 0;
        data.history.unshift({apt:user.apt, month:p.month, amount:p.amount, date:now()});
        saveData(data); toast('Платеж оплачен'); renderPage();
      };
    }

    function residentMeters(){
      const m = data.meters[user.apt];
      setHeader('Счетчики', `Квартира ${user.apt}`);
      content.innerHTML = `<div class="grid cols-3">${[
        ['cold','Холодная вода','м³'],['hot','Горячая вода','м³'],['elec','Электроэнергия','кВт·ч']
      ].map(([k,t,u])=>`<div class="card"><h3>${t}</h3><p class="muted">Предыдущее: ${m[k].prev} ${u}</p><input type="number" step="0.1" id="m_${k}" value="${m[k].curr ?? ''}" placeholder="Новое значение" /><button class="btn btn-primary top-gap" data-meter="${k}">Сохранить</button></div>`).join('')}</div>`;
      content.querySelectorAll('[data-meter]').forEach(btn=>btn.onclick=()=>{
        const k = btn.dataset.meter;
        const input = document.getElementById(`m_${k}`);
        const value = parseFloat(input.value);
        if(Number.isNaN(value) || value <= Number(m[k].prev)) return toast('Новое значение должно быть больше предыдущего');
        m[k].curr = value; m[k].prev = value; saveData(data); toast('Показания сохранены'); renderPage();
      });
    }

    function residentRequests(){
      const myReq = data.requests.filter(r=>r.apt===user.apt).sort((a,b)=>b.id-a.id);
      setHeader('Мои заявки', `Квартира ${user.apt}`);
      content.innerHTML = `<div class="between"><button class="btn btn-primary" id="newReqBtn">Новая заявка</button></div><div class="list top-gap">${myReq.map(r=>`<div class="item"><div class="between"><strong>${esc(r.title)}</strong>${badge(r.status)}</div><div class="muted">${esc(r.cat)} • ${esc(r.created)}</div><p>${esc(r.desc)}</p><button class="btn btn-ghost" data-open-req="${r.id}">Открыть</button></div>`).join('') || '<div class="muted">Заявок нет</div>'}</div>`;
      document.getElementById('newReqBtn').onclick=()=>{
        modal('Новая заявка', `<div class="stack"><label class="field"><span>Категория</span><select id="reqCat"><option>Сантехника</option><option>Электрика</option><option>Уборка</option><option>Освещение</option><option>Аварийная</option></select></label><label class="field"><span>Тема</span><input id="reqTitle" /></label><label class="field"><span>Описание</span><textarea id="reqDesc"></textarea></label><label class="field"><span>Срочность</span><select id="reqUrgent"><option value="0">Обычная</option><option value="1">Срочная</option></select></label><button class="btn btn-primary" id="saveReqBtn">Отправить</button></div>`);
        document.getElementById('saveReqBtn').onclick=()=>{
          const title = document.getElementById('reqTitle').value.trim(); const desc = document.getElementById('reqDesc').value.trim();
          if(!title || !desc) return toast('Заполни тему и описание');
          data.requests.unshift({id:Date.now(), apt:user.apt, cat:document.getElementById('reqCat').value, title, desc, status:'Новая', urgent:document.getElementById('reqUrgent').value==='1', created:now(), comments:[]});
          saveData(data); document.getElementById('modal').classList.add('hidden'); toast('Заявка создана'); renderPage();
        };
      };
      content.querySelectorAll('[data-open-req]').forEach(btn=>btn.onclick=()=>openRequest(Number(btn.dataset.openReq), false));
    }

    function openRequest(id, isAdmin){
      const req = data.requests.find(r=>r.id===id); if(!req) return;
      const comments = req.comments.map(c=>`<div class="item"><strong>${c.from==='uk'?'УК':'Жилец'}</strong><div class="muted">${esc(c.time)}</div><div>${esc(c.text)}</div></div>`).join('') || '<div class="muted">Комментариев нет</div>';
      modal(`Заявка: ${req.title}`, `<div class="stack"><div>${badge(req.status)}</div><div class="muted">Кв. ${esc(req.apt)} • ${esc(req.cat)} • ${esc(req.created)}</div><p>${esc(req.desc)}</p>${isAdmin?`<label class="field"><span>Статус</span><select id="reqStatusSel"><option ${req.status==='Новая'?'selected':''}>Новая</option><option ${req.status==='В работе'?'selected':''}>В работе</option><option ${req.status==='Выполнено'?'selected':''}>Выполнено</option><option ${req.status==='Закрыто'?'selected':''}>Закрыто</option></select></label>`:''}<div><strong>Комментарии</strong></div><div class="list">${comments}</div><label class="field"><span>Новый комментарий</span><textarea id="reqComment"></textarea></label><div class="row">${isAdmin?'<button class="btn btn-primary" id="saveReqStatus">Сохранить статус</button>':''}<button class="btn btn-primary" id="addReqComment">Добавить комментарий</button></div></div>`);
      const add = document.getElementById('addReqComment');
      add.onclick=()=>{
        const txt = document.getElementById('reqComment').value.trim(); if(!txt) return toast('Напиши комментарий');
        req.comments.push({from:isAdmin?'uk':'resident', text:txt, time:now()}); saveData(data); openRequest(id, isAdmin); toast('Комментарий добавлен');
      };
      const saveBtn = document.getElementById('saveReqStatus');
      if(saveBtn) saveBtn.onclick=()=>{ req.status = document.getElementById('reqStatusSel').value; saveData(data); document.getElementById('modal').classList.add('hidden'); toast('Статус обновлен'); renderPage(); };
    }

    function residentAnnouncements(){
      setHeader('Объявления', 'Новости дома');
      content.innerHTML = `<div class="list">${data.announcements.map(a=>`<div class="item"><div class="between"><strong>${esc(a.title)}</strong><span class="badge ${a.type==='urgent'?'b-danger':'b-info'}">${a.type==='urgent'?'Срочно':'Инфо'}</span></div><div class="muted">${esc(a.date)}</div><p>${esc(a.body)}</p></div>`).join('')}</div>`;
    }

    function residentVotes(){
      setHeader('Голосования', 'Активные опросы');
      content.innerHTML = `<div class="list">${data.votes.map(v=>{
        const voted = Boolean(v.votedBy[user.login]);
        const total = v.results.reduce((a,b)=>a+b,0) || 1;
        return `<div class="item"><div class="between"><strong>${esc(v.title)}</strong><span class="badge ${voted?'b-success':'b-info'}">${voted?'Вы голосовали':'Активно'}</span></div><div class="muted">До ${esc(v.deadline)}</div><p>${esc(v.desc)}</p><div class="list">${v.opts.map((o,i)=>`<div class="between"><span>${esc(o)}</span><span class="muted">${Math.round(v.results[i]/total*100)}%</span>${!voted?`<button class="btn btn-ghost" data-vote="${v.id}:${i}">Выбрать</button>`:''}</div>`).join('')}</div></div>`;
      }).join('')}</div>`;
      content.querySelectorAll('[data-vote]').forEach(btn=>btn.onclick=()=>{
        const [id,opt] = btn.dataset.vote.split(':').map(Number);
        const vote = data.votes.find(v=>v.id===id); if(!vote || vote.votedBy[user.login]) return;
        vote.results[opt] += 1; vote.votedBy[user.login] = opt; saveData(data); toast('Голос принят'); renderPage();
      });
    }

    function residentChat(){
      const room = data.chats[user.apt] || (data.chats[user.apt]=[]);
      room.forEach(m=>{ if(m.from==='uk') m.read=true; }); saveData(data);
      setHeader('Чат с УК', `Квартира ${user.apt}`);
      content.innerHTML = `<div class="card"><div class="list" id="chatList">${room.map(m=>`<div class="item"><strong>${m.from==='uk'?'УК':'Вы'}</strong><div class="muted">${esc(m.time)}</div><div>${esc(m.text)}</div></div>`).join('') || '<div class="muted">Сообщений пока нет</div>'}</div><div class="top-gap stack"><textarea id="chatInput" placeholder="Написать сообщение..."></textarea><button class="btn btn-primary" id="sendChatBtn">Отправить</button></div></div>`;
      document.getElementById('sendChatBtn').onclick=()=>{
        const txt = document.getElementById('chatInput').value.trim(); if(!txt) return toast('Напиши сообщение');
        room.push({id:Date.now(), from:'resident', text:txt, time:now(), read:false});
        room.push({id:Date.now()+1, from:'uk', text:'Сообщение получено. Мы ответим в ближайшее время.', time:now(), read:false});
        saveData(data); renderPage();
      };
    }

    function residentProfile(){
      const res = data.residents.find(r=>r.apt===user.apt) || {phone:'—'};
      setHeader('Профиль', `Квартира ${user.apt}`);
      content.innerHTML = `<div class="grid cols-2"><div class="card stack"><label class="field"><span>ФИО</span><input id="profName" value="${esc(user.name)}"></label><label class="field"><span>Телефон</span><input id="profPhone" value="${esc(res.phone||'')}" ></label><label class="field"><span>Дата рождения</span><input type="date" id="profBirth" value="${esc(profile.birth||'')}"></label><button class="btn btn-primary" id="saveProfileBtn">Сохранить профиль</button></div><div class="card stack"><label class="field"><span>Текущий пароль</span><input type="password" id="oldPass"></label><label class="field"><span>Новый пароль</span><input type="password" id="newPass"></label><button class="btn btn-ghost" id="changePassBtn">Сменить пароль</button></div></div>`;
      document.getElementById('saveProfileBtn').onclick=()=>{
        user.name = document.getElementById('profName').value.trim() || user.name;
        const newPhone = document.getElementById('profPhone').value.trim();
        res.phone = newPhone; if(profile) profile.birth = document.getElementById('profBirth').value;
        const userIndex = data.users.findIndex(u=>u.login===user.login); data.users[userIndex] = user;
        const resIndex = data.residents.findIndex(r=>r.apt===user.apt); if(resIndex>=0) data.residents[resIndex] = res;
        saveData(data); toast('Профиль сохранен'); initDashboard();
      };
      document.getElementById('changePassBtn').onclick=()=>{
        if(document.getElementById('oldPass').value !== user.pass) return toast('Текущий пароль неверный');
        const np = document.getElementById('newPass').value.trim(); if(np.length < 4) return toast('Новый пароль слишком короткий');
        user.pass = np; const idx = data.users.findIndex(u=>u.login===user.login); data.users[idx] = user; saveData(data); toast('Пароль изменен');
      };
    }

    function residentSmart(){
      setHeader('Умный дом', `Квартира ${user.apt}`);
      const smart = profile.smart;
      content.innerHTML = `<div class="grid cols-2"><div class="card"><h3>Освещение</h3><div class="list">${['living','bedroom','kitchen','hall'].map(k=>`<div class="switch"><span>${({living:'Гостиная',bedroom:'Спальня',kitchen:'Кухня',hall:'Прихожая'})[k]}</span><button class="btn ${smart[k]?'btn-primary':'btn-ghost'}" data-switch="${k}">${smart[k]?'Включено':'Выключено'}</button></div>`).join('')}</div></div><div class="card"><h3>Охрана и климат</h3><div class="switch"><span>Охрана</span><button class="btn ${smart.security?'btn-primary':'btn-ghost'}" id="securityBtn">${smart.security?'Активна':'Отключена'}</button></div><div class="top-gap"><label class="field"><span>Целевая температура</span><input type="number" id="tempTarget" value="${smart.tempTarget}" min="16" max="30"></label><button class="btn btn-primary" id="saveTempBtn">Сохранить</button></div></div></div>`;
      content.querySelectorAll('[data-switch]').forEach(btn=>btn.onclick=()=>{ smart[btn.dataset.switch]=!smart[btn.dataset.switch]; saveData(data); renderPage(); });
      document.getElementById('securityBtn').onclick=()=>{ smart.security=!smart.security; saveData(data); renderPage(); };
      document.getElementById('saveTempBtn').onclick=()=>{ const v=Number(document.getElementById('tempTarget').value); if(v<16||v>30) return toast('Температура 16–30'); smart.tempTarget=v; saveData(data); toast('Температура сохранена'); };
    }

    function adminDashboard(){
      const newReq = data.requests.filter(r=>r.status==='Новая').length;
      const debt = data.residents.reduce((s,r)=>s+Number(r.debt||0),0);
      const unread = Object.values(data.chats).flat().filter(m=>m.from==='resident' && !m.read).length;
      setHeader('Дашборд УК', 'Общая сводка');
      content.innerHTML = `<div class="grid cols-4"><div class="stat"><div class="muted">Новые заявки</div><div class="v">${newReq}</div></div><div class="stat"><div class="muted">Жильцы</div><div class="v">${data.residents.length}</div></div><div class="stat"><div class="muted">Долг</div><div class="v">${debt.toLocaleString('ru-RU')} ₸</div></div><div class="stat"><div class="muted">Новых сообщений</div><div class="v">${unread}</div></div></div>`;
    }

    function adminRequests(){
      setHeader('Заявки', 'Все обращения жильцов');
      content.innerHTML = `<div class="card"><table class="table"><thead><tr><th>ID</th><th>Кв.</th><th>Категория</th><th>Тема</th><th>Статус</th><th></th></tr></thead><tbody>${data.requests.map(r=>`<tr><td>${r.id}</td><td>${esc(r.apt)}</td><td>${esc(r.cat)}</td><td>${esc(r.title)}</td><td>${badge(r.status)}</td><td><button class="btn btn-ghost" data-admin-req="${r.id}">Открыть</button></td></tr>`).join('')}</tbody></table></div>`;
      content.querySelectorAll('[data-admin-req]').forEach(btn=>btn.onclick=()=>openRequest(Number(btn.dataset.adminReq), true));
    }

    function adminResidents(){
      setHeader('Жильцы', 'Список квартир');
      content.innerHTML = `<div class="card"><table class="table"><thead><tr><th>Кв.</th><th>ФИО</th><th>Этаж</th><th>Телефон</th><th>Долг</th></tr></thead><tbody>${data.residents.map(r=>`<tr><td>${esc(r.apt)}</td><td>${esc(r.name)}</td><td>${esc(r.floor)}</td><td>${esc(r.phone||'—')}</td><td>${Number(r.debt||0).toLocaleString('ru-RU')} ₸</td></tr>`).join('')}</tbody></table></div>`;
    }

    function adminAnnouncements(){
      setHeader('Объявления', 'Управление новостями');
      content.innerHTML = `<div class="between"><button class="btn btn-primary" id="newAnnBtn">Создать объявление</button></div><div class="list top-gap">${data.announcements.map(a=>`<div class="item"><div class="between"><strong>${esc(a.title)}</strong><div class="row"><button class="btn btn-ghost" data-edit-ann="${a.id}">Изменить</button><button class="btn btn-danger" data-del-ann="${a.id}">Удалить</button></div></div><div class="muted">${esc(a.date)}</div><p>${esc(a.body)}</p></div>`).join('')}</div>`;
      document.getElementById('newAnnBtn').onclick=()=>openAnnouncement();
      content.querySelectorAll('[data-edit-ann]').forEach(btn=>btn.onclick=()=>openAnnouncement(Number(btn.dataset.editAnn)));
      content.querySelectorAll('[data-del-ann]').forEach(btn=>btn.onclick=()=>{ data.announcements = data.announcements.filter(a=>a.id!==Number(btn.dataset.delAnn)); saveData(data); renderPage(); toast('Удалено'); });
    }
    function openAnnouncement(id){
      const a = data.announcements.find(x=>x.id===id) || {type:'info', title:'', body:'', date:now().slice(0,10)};
      modal(id?'Редактировать объявление':'Новое объявление', `<div class="stack"><label class="field"><span>Тип</span><select id="annType"><option value="info" ${a.type==='info'?'selected':''}>Инфо</option><option value="urgent" ${a.type==='urgent'?'selected':''}>Срочное</option></select></label><label class="field"><span>Заголовок</span><input id="annTitle" value="${esc(a.title)}"></label><label class="field"><span>Текст</span><textarea id="annBody">${esc(a.body)}</textarea></label><button class="btn btn-primary" id="saveAnnBtn">Сохранить</button></div>`);
      document.getElementById('saveAnnBtn').onclick=()=>{
        const payload = {id:id || Date.now(), type:document.getElementById('annType').value, title:document.getElementById('annTitle').value.trim(), body:document.getElementById('annBody').value.trim(), date:now().slice(0,10)};
        if(!payload.title || !payload.body) return toast('Заполни все поля');
        const idx = data.announcements.findIndex(x=>x.id===payload.id);
        if(idx>=0) data.announcements[idx]=payload; else data.announcements.unshift(payload);
        saveData(data); document.getElementById('modal').classList.add('hidden'); renderPage(); toast('Сохранено');
      };
    }

    function adminVotes(){
      setHeader('Голосования', 'Управление опросами');
      content.innerHTML = `<div class="between"><button class="btn btn-primary" id="newVoteBtn">Создать голосование</button></div><div class="list top-gap">${data.votes.map(v=>`<div class="item"><div class="between"><strong>${esc(v.title)}</strong><button class="btn btn-danger" data-del-vote="${v.id}">Удалить</button></div><div class="muted">До ${esc(v.deadline)}</div><p>${esc(v.desc)}</p>${v.opts.map((o,i)=>`<div class="between"><span>${esc(o)}</span><span>${v.results[i]}</span></div>`).join('')}</div>`).join('')}</div>`;
      document.getElementById('newVoteBtn').onclick=()=>{
        modal('Новое голосование', `<div class="stack"><label class="field"><span>Вопрос</span><input id="voteTitle"></label><label class="field"><span>Описание</span><textarea id="voteDesc"></textarea></label><label class="field"><span>Варианты (каждый с новой строки)</span><textarea id="voteOpts">За\nПротив</textarea></label><label class="field"><span>Дата окончания</span><input type="date" id="voteDeadline"></label><button class="btn btn-primary" id="saveVoteBtn">Создать</button></div>`);
        document.getElementById('saveVoteBtn').onclick=()=>{
          const opts = document.getElementById('voteOpts').value.split('\n').map(s=>s.trim()).filter(Boolean);
          if(opts.length<2) return toast('Нужно минимум 2 варианта');
          data.votes.unshift({id:Date.now(), title:document.getElementById('voteTitle').value.trim(), desc:document.getElementById('voteDesc').value.trim(), opts, results:opts.map(()=>0), deadline:document.getElementById('voteDeadline').value || '2026-03-30', votedBy:{}});
          saveData(data); document.getElementById('modal').classList.add('hidden'); renderPage(); toast('Голосование создано');
        };
      };
      content.querySelectorAll('[data-del-vote]').forEach(btn=>btn.onclick=()=>{ data.votes = data.votes.filter(v=>v.id!==Number(btn.dataset.delVote)); saveData(data); renderPage(); toast('Удалено'); });
    }

    function adminChat(){
      setHeader('Чат', 'Сообщения жильцов');
      const apts = Object.keys(data.chats);
      content.innerHTML = `<div class="grid cols-2">${apts.map(apt=>{
        const room = data.chats[apt];
        const last = room[room.length-1];
        return `<div class="card"><div class="between"><strong>Квартира ${esc(apt)}</strong><button class="btn btn-ghost" data-open-chat="${apt}">Открыть</button></div><p class="muted">${last ? esc(last.text) : 'Нет сообщений'}</p></div>`;
      }).join('')}</div>`;
      content.querySelectorAll('[data-open-chat]').forEach(btn=>btn.onclick=()=>openAdminChat(btn.dataset.openChat));
    }
    function openAdminChat(apt){
      const room = data.chats[apt] || (data.chats[apt]=[]);
      room.forEach(m=>{ if(m.from==='resident') m.read=true; }); saveData(data);
      modal(`Чат • кв. ${apt}`, `<div class="list">${room.map(m=>`<div class="item"><strong>${m.from==='uk'?'УК':'Жилец'}</strong><div class="muted">${esc(m.time)}</div><div>${esc(m.text)}</div></div>`).join('')}</div><div class="top-gap stack"><textarea id="adminChatInput"></textarea><button class="btn btn-primary" id="adminSendBtn">Ответить</button></div>`);
      document.getElementById('adminSendBtn').onclick=()=>{
        const txt = document.getElementById('adminChatInput').value.trim(); if(!txt) return toast('Напиши сообщение');
        room.push({id:Date.now(), from:'uk', text:txt, time:now(), read:false}); saveData(data); openAdminChat(apt); toast('Сообщение отправлено');
      };
    }

    function renderPage(){
      if(user.role==='admin'){
        if(current==='dashboard') adminDashboard();
        if(current==='requests') adminRequests();
        if(current==='residents') adminResidents();
        if(current==='announcements') adminAnnouncements();
        if(current==='votes') adminVotes();
        if(current==='chat') adminChat();
      } else {
        if(current==='dashboard') residentDashboard();
        if(current==='payments') residentPayments();
        if(current==='meters') residentMeters();
        if(current==='requests') residentRequests();
        if(current==='announcements') residentAnnouncements();
        if(current==='votes') residentVotes();
        if(current==='chat') residentChat();
        if(current==='profile') residentProfile();
        if(current==='smarthome') residentSmart();
      }
    }

    renderNav();
    renderPage();
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    initLogin();
    initDashboard();
  });
})();
