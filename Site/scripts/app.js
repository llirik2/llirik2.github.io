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

  // Логика индикатора онлайна
  async function checkOnlineStatus() {
    const badge = document.getElementById('online-status');
    const txt = badge ? badge.querySelector('.status-text') : null;
    if (!badge || !txt) return;

    // ОТВЕТ НА ВОПРОС: Как трекать онлайн?
    // Самый надежный бесплатный способ — проверять статус через API Discord (через сервис Lanyard)
    // Твой Discord ID (из контактов boober4uk): чтобы узнать точный числовой ID, включи режим разработчика в Discord, 
    // нажми правой кнопкой на свой профиль и выбери "Копировать ID". Замени строку ниже на свой ID.
    const discordId = "ТВОЙ_ЦИФРОВОЙ_DISCORD_ID"; 

    if (discordId === "ТВОЙ_ЦИФРОВОЙ_DISCORD_ID") {
      // Если ID не настроен, выставляем заглушку «В сети»
      badge.classList.add('online');
      txt.textContent = lang === 'ru' ? 'В сети' : 'Online';
      return;
    }

    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
      const data = await res.json();
      
      if (data.success && (data.data.discord_status === 'online' || data.data.discord_status === 'dnd' || data.data.discord_status === 'idle')) {
        badge.className = 'online-badge online';
        txt.textContent = lang === 'ru' ? 'В сети' : 'Online';
      } else {
        badge.className = 'online-badge offline';
        txt.textContent = lang === 'ru' ? 'Не в сети' : 'Offline';
      }
    } catch (e) {
      // Фоллбек на случай ошибки сети
      badge.className = 'online-badge online';
      txt.textContent = lang === 'ru' ? 'В сети' : 'Online';
    }
  }

  document.addEventListener('DOMContentLoaded',init);
  window.Site = { setLang };
})();
