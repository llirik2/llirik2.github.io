(function(){
  const LANG_KEY = 'site_lang';
  let i18n = {};
  let lang = localStorage.getItem(LANG_KEY) || 'ru';

  async function loadI18n(){
    try{
      const res = await fetch('data/i18n.json?cache=' + Date.now());
      if(!res.ok) throw new Error('i18n response '+res.status);
      i18n = await res.json();
      console.log('i18n loaded:', i18n);
    }catch(e){
      console.error('i18n load failed:', e);
      i18n = {};
    }
  }

  function t(key){
    const value = (i18n[lang] && i18n[lang][key]) || '';
    return value;
  }

  function applyTranslations(){
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      const value = t(key);
      if(!value) return;
      if(value.includes('\n')){
        el.innerHTML = value.split('\n').map(txt => txt.trim()).join('<br>');
      } else {
        el.textContent = value;
      }
    });
  }

  function setupLangSwitch(){
    const btnRu = document.getElementById('lang-ru');
    const btnEn = document.getElementById('lang-en');
    if(btnRu) btnRu.addEventListener('click',()=>setLang('ru'));
    if(btnEn) btnEn.addEventListener('click',()=>setLang('en'));
    updateLangButtons();
  }

  function updateLangButtons(){
    document.querySelectorAll('.lang').forEach(b=>b.classList.remove('active'));
    const active = document.getElementById('lang-'+lang);
    if(active) active.classList.add('active');
  }

  function setLang(l){
    lang = l;
    localStorage.setItem(LANG_KEY,lang);
    updateLangButtons();
    applyTranslations();
    
    // Переводим статус Дискорда при смене языка
    checkOnlineStatus();
    
    if(window.Portfolio && window.Portfolio.render) window.Portfolio.render(lang);
  }

  function setYear(){
    const y = new Date().getFullYear();
    const el = document.getElementById('year'); if(el) el.textContent = y;
  }

  // Логика индикатора онлайна
  async function checkOnlineStatus() {
    const badge = document.querySelector('.online-badge');
    if (!badge) return;

    const discordId = "982175024255471626"; // Твой Discord ID
    
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
      const data = await res.json();
      
      if (data.success) {
        const status = data.data.discord_status; // 'online', 'idle', 'dnd', 'offline'
        const dot = badge.querySelector('.online-dot');
        if (dot) dot.style.animation = 'none';

        if (status === 'online') {
          badge.innerHTML = `<span class="online-dot"></span>${lang === 'ru' ? 'Онлайн' : 'Online'}`;
          badge.style.background = 'linear-gradient(90deg, rgba(0, 255, 136, 0.3), rgba(0, 196, 107, 0.02))';
          badge.style.color = '#00ff88';
          badge.style.borderColor = 'rgba(0, 255, 136, 0.3)';
        } 
        else if (status === 'idle') {
          badge.innerHTML = `<span class="online-dot" style="background:#ffaa00; box-shadow:0 0 12px #ffaa00;"></span>${lang === 'ru' ? 'Отошел' : 'Idle'}`;
          badge.style.background = 'linear-gradient(90deg, rgba(255, 170, 0, 0.3), rgba(0, 196, 107, 0.02))';
          badge.style.color = '#ffaa00';
          badge.style.borderColor = 'rgba(255, 170, 0, 0.3)';
        } 
        else if (status === 'dnd') {
          badge.innerHTML = `<span class="online-dot" style="background:#ff3333; box-shadow:0 0 12px #ff3333;"></span>${lang === 'ru' ? 'Не беспокоить' : 'Do Not Disturb'}`;
          badge.style.color = '#ff3333';
          badge.style.background = 'linear-gradient(90deg, rgba(255, 51, 51, 0.1), rgba(0, 196, 107, 0.02))';
          badge.style.borderColor = 'rgba(255, 51, 51, 0.3)';
        }
        else {
          badge.innerHTML = `<span class="online-dot" style="background:#555; box-shadow:none;"></span>${lang === 'ru' ? 'Не в сети' : 'Offline'}`;
          badge.style.background = 'linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(0, 196, 107, 0.02))';
          badge.style.color = '#92cfa7'; 
          badge.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        }
      }
    } catch (e) {
      console.error("Ошибка обновления статуса Discord:", e);
      badge.innerHTML = `<span class="online-dot"></span>${lang === 'ru' ? 'Онлайн' : 'Online'}`;
    }
  }

  function setupGlowCursor() {
    const glow = document.getElementById('cursor-glow'); // Исправлено ID в соответствии с твоим index.html
    if (!glow) return;
    
    // Сделаем его видимым, раз скрипт инициализировался
    glow.style.display = 'block';
    
    window.addEventListener('mousemove', (e) => {
      window.requestAnimationFrame(() => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
      });
    });
  }

function setupContactButton() {
  // Ищем кнопку по её реальному классу на сайте (.cta-button)
  const contactBtn = document.querySelector('.cta-button');
  const contactsSection = document.getElementById('contacts');
  const contactsHeader = document.querySelector('.contacts-header');

  if (contactBtn && contactsSection) {
    contactBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // 1. Плавный скролл до блока контактов ровно по центру экрана
      contactsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // 2. Вспышка горизонтального прямоугольника
      if (contactsHeader) {
        // Включаем прямоугольник (он мгновенно разлетается на 200vw)
        contactsHeader.classList.add('pulse-line');

        // Через 600 миллисекунд (когда скролл завершится) плавно тушим полосу
        setTimeout(() => {
          // Делаем затухание чуть более медленным и красивым
          contactsHeader.style.transition = 'transform 2s ease, opacity 2s ease';
          contactsHeader.classList.remove('pulse-line');
          
          // Возвращаем дефолтные быстрые настройки анимации для следующего клика
          setTimeout(() => {
            contactsHeader.style.transition = '';
          }, 900);
        }, 600);
      }
    });
  }
}

  async function init(){
    await loadI18n();
    setupLangSwitch();
    applyTranslations();
    setYear();
    setupGlowCursor();
    setupContactButton();
    checkOnlineStatus();
    
    // Автоматический опрос статуса раз в 30 секунд
    setInterval(checkOnlineStatus, 30000);

    if(window.Portfolio && window.Portfolio.init) window.Portfolio.init(lang);
    if(window.ThreeBG && window.ThreeBG.init) window.ThreeBG.init();
    if(window.ScrollAnim && window.ScrollAnim.init) window.ScrollAnim.init();
  }

  /*
  // Инициализация холста светлячков
  const canvas = document.getElementById('bgSV-canvas');
  
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const mouse = { x: null, y: null };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => { 
      mouse.x = e.clientX; 
      mouse.y = e.clientY; 
    });
    window.addEventListener('mouseleave', () => { 
      mouse.x = null; 
      mouse.y = null; 
    });

    class Particle {
      constructor() {
        this.reset();
        // Рандомно распределяем частицы по высоте при старте, чтобы они не летели все снизу одновременно
        this.y = Math.random() * canvas.height;
      }
      
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 10;
        this.size = Math.random() * 2 + 1;
        this.speedY = Math.random() * 0.4 + 0.1;
        this.alpha = Math.random() * 0.4 + 0.1;
      }
      
      update() {
        if (mouse.x !== null && mouse.y !== null) {
          // Рассчитываем расстояние до курсора мыши
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Если светлячок подлетел слишком близко (ближе 80px), он плавно облетает мышь вверх
          if (distance < 80) {
            this.y -= this.speedY * 1.5;
            this.x += (Math.random() - 0.5) * 0.5; // Легкое пиксельное покачивание в стороны
          } else {
            // Если далеко — плавно притягивается по красивой дуге
            this.x += dx * 0.015;
            this.y += dy * 0.015;
          }
        } else {
          // Обычный ленивый полет вверх, если мышка ушла с экрана
          this.y -= this.speedY;
        }

        // Если светлячок вылетел за любую из границ экрана — сбрасываем его вниз
        if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
          this.reset();
        }
      }
      
      draw() {
        ctx.fillStyle = `rgba(0, 255, 136, ${this.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00ff88';
        ctx.fillRect(this.x, this.y, this.size, this.size);
      }
    }

    function init() {
      resize();
      particles = [];
      for (let i = 0; i < 25; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      // Очищаем строго буфер холста
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Сбрасываем тень контекста, чтобы она случайно не размывала другие элементы сайта
      ctx.shadowBlur = 0; 
      
      particles.forEach(p => { 
        p.update(); 
        p.draw(); 
      });
      
      requestAnimationFrame(animate);
    }
    
    init();
    animate();
  }
*/

  document.addEventListener('DOMContentLoaded', init);
})();
