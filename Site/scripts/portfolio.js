(function(){
  let projects = [];
  let currentLang = 'ru';
  const container = () => document.getElementById('portfolio-list');
  
  const fallbackProjects = [
    {
      id:'proj-001',
      title:{ru:'Приключенческая карта',en:'Adventure Map'},
      description:{ru:'Большая карта с механиками и сюжетом.',en:'Large map with mechanics and storyline.'},
      tags: ['order', 'tips'], 
      rating: 4.8,             
      feedback: "Всё супер, бобёр лучший!",
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
      price:{amount:80,currency:'RUB'}, // Исправили структуру цены, чтобы не было краша
      date:'2026-02-15',
      cover:'https://images.unsplash.com/photo-1523473827535-7c8b9c0c1f5c?auto=format&fit=crop&w=800&q=80',
      link:'#'
    }
  ];

  // Массив твоих услуг. Чтобы добавить новую услугу — просто допиши её сюда по аналогии!
  const servicesData = [
    {
      title: { ru: "Создание датапаков на заказ", en: "Custom Datapack Development" },
      description: { ru: "Разработка .mcfunction любой сложности: кастомные механики, крафты, оптимизация и триггеры для серверов.", en: "Development of .mcfunction of any complexity: custom mechanics, crafts, optimization, and server triggers." }
    },
    {
      title: { ru: "Создание карт на заказ", en: "Custom Map Making" },
      description: { ru: "Уникальные mini-игры, карты с сюжетом, лобби, сложная система очередей и подсчет статистики.", en: "Unique mini-games, story maps, lobbies, complex queue systems, and statistics tracking." }
    },
    {
      title: { ru: "Создание баннеров/превью", en: "Banner & Preview Design" },
      description: { ru: "Яркое и сочное оформление для твоих проектов, серверов или видео на YouTube в стилистике Minecraft.", en: "Bright and juicy designs for your projects, servers, or YouTube videos in Minecraft style." }
    }
  ];

  // Функция для рендера блока услуг
  function renderServices(lang) {
    const sList = document.getElementById('services-list');
    if (!sList) return;
    sList.innerHTML = '';

    servicesData.forEach(s => {
      const card = document.createElement('div');
      card.className = 'card service-card';

      const title = document.createElement('div');
      title.className = 'title';
      title.style.fontSize = '1.2rem';
      title.textContent = s.title[lang] || s.title.ru;

      const desc = document.createElement('div');
      desc.className = 'desc';
      desc.style.color = 'var(--muted)';
      desc.style.marginTop = '8px';
      desc.style.lineHeight = '1.6';
      desc.textContent = s.description[lang] || s.description.ru;

      card.appendChild(title);
      card.appendChild(desc);
      sList.appendChild(card);
    });
  }

  function formatPrice(amount,currency,lang){
    try{
      if (!amount) return '';
      const locale = lang === 'ru' ? 'ru-RU' : 'en-US';
      const opts = {style:'currency',currency: currency==='RUB'?'RUB':'USD',maximumFractionDigits: currency==='RUB'?0:2};
      return new Intl.NumberFormat(locale,opts).format(amount);
    }catch(e){return amount+' '+currency}
  }

  function createCard(p,lang){
    const el = document.createElement('div'); el.className='card';
    
    // 1. Обложка
    if(p.cover){
      const cov = document.createElement('div'); cov.className='cover';
      const img = document.createElement('img'); img.src = p.cover; img.alt = p.title[lang] || p.title.ru;
      cov.appendChild(img); el.appendChild(cov);
    }
    
    const title = document.createElement('div'); title.className='title'; title.textContent = p.title[lang] || p.title.ru;
    const desc = document.createElement('div'); desc.className='desc'; desc.textContent = p.description[lang] || p.description.ru;
    
    const tagWrap = document.createElement('div'); tagWrap.style.marginTop='8px';
    
    // Выводим обычные теги (Заказ, Инициатива, Чаевые)
    if (p.tags && Array.isArray(p.tags)) {
      p.tags.forEach(t => {
        const badge = document.createElement('span');
        badge.className = 'badge';

        const translations = {
          'order': { ru: 'Заказ', en: 'Order' },
          'own': { ru: 'Собственная инициатива', en: 'Own initiative' },
          'tips': { ru: 'Чаевые', en: 'Tips' }
        };

        if (translations[t]) {
          badge.textContent = translations[t][lang] || translations[t]['en'];
          badge.classList.add(`badge-${t}`); 
          tagWrap.appendChild(badge);
        }
      });
    }

    // Вывод и автоматическая покраска оценки (RATING)
    if (p.rating) {
      const ratingBadge = document.createElement('span');
      ratingBadge.className = 'badge badge-rating';
      ratingBadge.textContent = `★ ${Number(p.rating).toFixed(1)}`;

      if (p.rating >= 4.5) {
        ratingBadge.style.borderColor = 'var(--accent)'; 
        ratingBadge.style.color = 'var(--accent)';
        ratingBadge.style.background = 'rgba(0, 255, 136, 0.05)';
      } else if (p.rating >= 3.5) {
        ratingBadge.style.borderColor = '#ffaa00'; 
        ratingBadge.style.color = '#ffaa00';
        ratingBadge.style.background = 'rgba(255, 170, 0, 0.05)';
      } else {
        ratingBadge.style.borderColor = '#ff4444'; 
        ratingBadge.style.color = '#ff4444';
        ratingBadge.style.background = 'rgba(255, 68, 68, 0.05)';
      }

      tagWrap.appendChild(ratingBadge);
    }

    el.appendChild(title); 
    el.appendChild(desc); 
    el.appendChild(tagWrap); 

    // ВЫВОД ОТЗЫВА (Теперь он железно пушится прямо в карточку `el`, а не в родителя тегов)
    if (p.feedback) {
      const feedbackElement = document.createElement('p');
      feedbackElement.className = 'project-feedback';
      
      const feedbackTitle = lang === 'ru' ? 'Отзыв: ' : 'Feedback: ';
      feedbackElement.innerHTML = `<strong style="color: var(--muted); font-weight: 600;">${feedbackTitle}</strong>${p.feedback}`;
      
      feedbackElement.style.display = 'block';
      feedbackElement.style.visibility = 'visible';
      feedbackElement.style.marginTop = '15px';
      feedbackElement.style.padding = '10px 12px';
      feedbackElement.style.fontSize = '0.9rem';
      feedbackElement.style.color = 'var(--text)';
      feedbackElement.style.background = 'rgba(255, 255, 255, 0.03)';
      feedbackElement.style.borderLeft = '2px dashed rgba(0, 255, 136, 0.4)';
      feedbackElement.style.borderRadius = '2px';
      feedbackElement.style.width = '100%';

      el.style.height = 'auto';
      el.style.minHeight = 'max-content';
      
      el.appendChild(feedbackElement); // Добавляем в тело карточки
    }

    // Контейнер для нижней строки (Цена + Кастомная метка)
    const footerRow = document.createElement('div');
    footerRow.className = 'card-footer-row';
    footerRow.style.display = 'flex';
    footerRow.style.justifyContent = 'space-between';
    footerRow.style.alignItems = 'center';
    footerRow.style.marginTop = '15px';
    
    // Цена
    if (p.price && p.price.amount > 0) {
      const price = document.createElement('div'); 
      price.className='price'; 
      price.textContent = formatPrice(p.price.amount,p.price.currency,lang);
      footerRow.appendChild(price);
    }
    
    // Кастомная метка ("Датапак", "Карта" и т.д.)
    if (p.category) {
      const customBadge = document.createElement('div');
      customBadge.className = 'custom-project-badge';
      customBadge.textContent = p.category[lang] || p.category.ru || '';
      footerRow.appendChild(customBadge);
    }
    
    el.appendChild(footerRow);
    
    return el;
  }

  async function load(){
    try{
      const res = await fetch('data/projects.json?cache=' + Date.now());
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
    
    renderServices(currentLang);

    if(window.ScrollAnim && window.ScrollAnim.observe) window.ScrollAnim.observe(document.querySelectorAll('.card'));
  }

  function addProject(obj){
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