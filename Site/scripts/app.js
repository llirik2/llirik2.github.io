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
    btnRu.addEventListener('click',()=>setLang('ru'));
    btnEn.addEventListener('click',()=>setLang('en'));
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
    if(window.Portfolio && window.Portfolio.render) window.Portfolio.render(lang);
  }

  function setYear(){
    const y = new Date().getFullYear();
    const el = document.getElementById('year'); if(el) el.textContent = y;
  }

  async function init(){
    await loadI18n();
    setupLangSwitch();
    applyTranslations();
    setYear();
    if(window.Portfolio && window.Portfolio.init) window.Portfolio.init(lang);
    if(window.ThreeBG && window.ThreeBG.init) window.ThreeBG.init();
    if(window.ScrollAnim && window.ScrollAnim.init) window.ScrollAnim.init();
    setupGlowCursor();
    checkOnlineStatus();
  }

  function setupGlowCursor() {
    const glow = document.getElementById('glow-cursor');
    if (!glow) return;
    
    window.addEventListener('mousemove', (e) => {
      // Используем requestAnimationFrame для плавности и производительности
      window.requestAnimationFrame(() => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
  const contactBtn = document.getElementById('contact-btn');
  const contactsSection = document.getElementById('contacts');

  if (contactBtn && contactsSection) {
    contactBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // 1. Плавный скролл до блока контактов
      contactsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // 2. Красивая GSAP анимация подсветки (запустится параллельно со скроллом)
      // Сначала блок резко вспыхнет зеленым свечением и слегка увеличится,
      // а затем плавно вернется в исходное состояние.
      gsap.fromTo(contactsSection, 
        {
          boxShadow: '0 0 40px rgba(0, 255, 136, 0.6)',
          borderColor: '#00ff88',
          scale: 1.02,
          backgroundColor: 'rgba(0, 255, 136, 0.04)'
        }, 
        {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', // Твоя стандартная тень
          borderColor: 'rgba(255, 255, 255, 0.08)', // Твой стандартный border
          scale: 1,
          backgroundColor: 'transparent',
          duration: 1.2, // Длительность затухания в секундах
          ease: 'power2.out',
          clearProps: 'scale,backgroundColor' // Очищаем временные стили после анимации
        }
      );
    });
  }
});

  // Логика индикатора онлайна
  async function checkOnlineStatus() {
  // Находим элементы по классам, которые реально прописаны у тебя в index.html
  const badge = document.querySelector('.online-badge');
  if (!badge) return;

  const discordId = "982175024255471626"; // Твой проверенный Discord ID
  
  // Определяем текущий язык сайта. 
  // Мы смотрим на кнопку RU, если у неё есть класс active — значит язык русский, иначе английский.
  const ruBtn = document.getElementById('lang-ru');
  const currentLang = (ruBtn && ruBtn.classList.contains('active')) ? 'ru' : 'en';

  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
    const data = await res.json();
    
    if (data.success) {
      const status = data.data.discord_status; // 'online', 'idle', 'dnd', 'offline'
      
      // Находим точку внутри плашки, чтобы управлять её анимацией и цветом
      const dot = badge.querySelector('.online-dot');
      if (dot) dot.style.animation = 'none'; // Сбрасываем дефолтную анимацию для кастомных статусов

      if (status === 'online') {
        badge.innerHTML = `<span class="online-dot"></span>${currentLang === 'ru' ? 'Онлайн' : 'Online'}`;
        badge.style.color = '#00ff88';
        badge.style.borderColor = 'rgba(0, 255, 136, 0.3)';
      } 
      else if (status === 'idle') {
        badge.innerHTML = `<span class="online-dot" style="background:#ffaa00; box-shadow:0 0 12px #ffaa00;"></span>${currentLang === 'ru' ? 'Отошел' : 'Idle'}`;
        badge.style.color = '#ffaa00';
        badge.style.borderColor = 'rgba(255, 170, 0, 0.3)';
      } 
      else if (status === 'dnd') {
        badge.innerHTML = `<span class="online-dot" style="background:#ff3333; box-shadow:0 0 12px #ff3333;"></span>${currentLang === 'ru' ? 'Не беспокоить' : 'Do Not Disturb'}`;
        badge.style.color = '#ff3333';
        badge.style.borderColor = 'rgba(255, 51, 51, 0.3)';
      } 
      else {
        // Статус 'offline'
        badge.innerHTML = `<span class="online-dot" style="background:#555; box-shadow:none;"></span>${currentLang === 'ru' ? 'Не в сети' : 'Offline'}`;
        badge.style.color = '#92cfa7'; // Твой цвет --muted
        badge.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      }
    }
  } catch (e) {
    console.error("Ошибка обновления статуса Discord:", e);
    // Фоллбек на случай сбоя сети — показываем «В сети» по умолчанию
    badge.innerHTML = `<span class="online-dot"></span>${currentLang === 'ru' ? 'Онлайн' : 'Online'}`;
  }
}
})();
