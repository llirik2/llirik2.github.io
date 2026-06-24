(function(){
  let projects = [];
  let currentLang = 'ru';
  const container = () => document.getElementById('portfolio-list');
  const fallbackProjects = [
    {
      id:'proj-001',
      title:{ru:'Приключенческая карта',en:'Adventure Map'},
      description:{ru:'Большая карта с механиками и сюжетом.',en:'Large map with mechanics and storyline.'},
      tags:['order'],
      price:{amount:15000,currency:'RUB'},
      date:'2025-11-01',
      cover:'https://images.unsplash.com/photo-1612832021061-26975f93d2f2?auto=format&fit=crop&w=800&q=80',
      link:'#'
    },
    {
      id:'proj-002',
      title:{ru:'Датапак с новыми функциями',en:'Datapack with new features'},
      description:{ru:'Набор команд и механик для сервера.',en:'Set of commands and mechanics for a server.'},
      tags:['own'],
      price:{amount:50,currency:'USD'},
      date:'2026-02-15',
      cover:'https://images.unsplash.com/photo-1523473827535-7c8b9c0c1f5c?auto=format&fit=crop&w=800&q=80',
      link:'#'
    }
  ];

  function formatPrice(amount,currency,lang){
    try{
      const locale = lang === 'ru' ? 'ru-RU' : 'en-US';
      const opts = {style:'currency',currency: currency==='RUB'?'RUB':'USD',maximumFractionDigits: currency==='RUB'?0:2};
      return new Intl.NumberFormat(locale,opts).format(amount);
    }catch(e){return amount+' '+currency}
  }

  function createCard(p,lang){
    const el = document.createElement('div'); el.className='card';
    // cover
    if(p.cover){
      const cov = document.createElement('div'); cov.className='cover';
      const img = document.createElement('img'); img.src = p.cover; img.alt = p.title[lang] || p.title.ru;
      cov.appendChild(img); el.appendChild(cov);
    }
    const title = document.createElement('div'); title.className='title'; title.textContent = p.title[lang] || p.title.ru;
    const desc = document.createElement('div'); desc.className='desc'; desc.textContent = p.description[lang] || p.description.ru;
    const tagWrap = document.createElement('div'); tagWrap.style.marginTop='8px';
    p.tags.forEach(t => {
      const b = document.createElement('span'); b.className='badge'; b.textContent = t === 'order' ? (lang==='ru'? 'Заказ':'Order') : (lang==='ru'? 'Собственная инициатива':'Own');
      tagWrap.appendChild(b);
    });
    const price = document.createElement('div'); price.className='price'; price.textContent = formatPrice(p.price.amount,p.price.currency,lang);
    el.appendChild(title); el.appendChild(desc); el.appendChild(tagWrap); el.appendChild(price);
    return el;
  }

  async function load(){
    try{
      const res = await fetch('data/projects.json');
      if(!res.ok) throw new Error('projects response '+res.status);
      projects = await res.json();
    }catch(e){
      console.warn('projects load failed, using fallback', e);
      projects = fallbackProjects;
    }
  }

  function render(lang){
    currentLang = lang || currentLang;
    const list = container(); if(!list) return;
    list.innerHTML='';
    projects.forEach(p=> list.appendChild(createCard(p,currentLang)));
    // reattach reveal observer
    if(window.ScrollAnim && window.ScrollAnim.observe) window.ScrollAnim.observe(document.querySelectorAll('.card'));
  }

  function addProject(obj){
    // minimal validation
    if(!obj.id) obj.id = 'proj-'+(Date.now());
    projects.unshift(obj);
    render(currentLang);
  }

  function exportJSON(){
    const dataStr = JSON.stringify(projects,null,2);
    const blob = new Blob([dataStr],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='projects.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  function setupFilters(){
    document.querySelectorAll('.filter').forEach(btn=>{
      btn.addEventListener('click',()=>{
        document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.getAttribute('data-filter');
        filterTo(f);
      });
    });
  }

  function filterTo(filter){
    const list = container(); if(!list) return;
    list.innerHTML='';
    const items = projects.filter(p=> filter==='all' ? true : p.tags.includes(filter));
    items.forEach(p=> list.appendChild(createCard(p,currentLang)));
    if(window.ScrollAnim && window.ScrollAnim.observe) window.ScrollAnim.observe(document.querySelectorAll('.card'));
  }

  async function init(lang){
    currentLang = lang || currentLang;
    await load();
    setupFilters();
    render(currentLang);
  }

  window.Portfolio = { init, render, addProject, exportJSON };
})();
