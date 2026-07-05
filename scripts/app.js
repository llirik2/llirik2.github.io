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
    
    // Обновляем язык модального окна
    if(window.ProjectModal && window.ProjectModal.setLang) window.ProjectModal.setLang(lang);
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
    if(window.ProjectDetail && window.ProjectDetail.setLang) window.ProjectDetail.setLang(lang);
    if(window.ThreeBG && window.ThreeBG.init) window.ThreeBG.init();
    if(window.ScrollAnim && window.ScrollAnim.init) window.ScrollAnim.init();
  }

  (function() {
      const canvas = document.getElementById('matrix-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      function resizeCanvas() {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      const magicChars = "ᔑʖᓵ╎ꖎᒲ⊣ℸ̣cup⎓ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛜᛝᛟ".split("");
      const fontSize = 14; 
      const columnSpacing = 32; // Хорошее расстояние, чтобы фон оставался просторным
      const columns = Math.floor(canvas.width / columnSpacing);

      const rainDrops = [];
      for (let x = 0; x < columns; x++) {
          rainDrops[x] = Math.random() * -150;
      }

      function drawMatrix() {
          // Очищаем именно 2D-холст рун с эффектом затухания
          ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.font = fontSize + 'px Minecraftia, monospace';

          for (let i = 0; i < rainDrops.length; i++) {
              const char = magicChars[Math.floor(Math.random() * magicChars.length)];
              const xPosition = i * columnSpacing;
              const yPosition = rainDrops[i] * fontSize;

              // Делаем руны очень блёклыми (8% видимости), чтобы они не спорили с текстом
              if (Math.random() > 0.988) {
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // Редкие тусклые белые вспышки
              } else {
                  ctx.fillStyle = 'rgba(0, 255, 102, 0.48)'; // Едва заметный неоново-зеленый
              }

              ctx.fillText(char, xPosition, yPosition);

              if (yPosition > canvas.height && Math.random() > 0.993) {
                  rainDrops[i] = Math.random() * -20;
              }
              rainDrops[i] += 0.35; // Медленное, атмосферное падение
          }
      }

      setInterval(drawMatrix, 40);
  })();

  document.addEventListener('DOMContentLoaded', init);
  // ========== ОЗВУЧКА КНОПОК ПРИ НАВЕДЕНИИ ==========
// ========== УЛУЧШЕННАЯ ОЗВУЧКА КНОПОК, КАРТОЧЕК И КОНТАКТОВ ==========
  document.addEventListener('DOMContentLoaded', () => {
      // Создаем один аудио-объект для сайта
      const hoverSound = new Audio('/assets/hover.mp3');
      hoverSound.volume = 0.4; // Громкость (от 0.0 до 1.0)

      // Функция для привязки звука к элементу
      function initHoverSound(element) {
          // Проверяем, чтобы не вешать слушатель дважды на один и тот же элемент
          if (element.dataset.hoverAudioSet) return;
          element.dataset.hoverAudioSet = "true";

          element.addEventListener('mouseenter', () => {
              // Сбрасываем аудио к началу для мгновенного отклика
              hoverSound.currentTime = 0;
              
              // Воспроизводим звук
              hoverSound.play().catch(err => {
                  // Игнорируем блокировку автоплея браузеров до первого клика
              });
          });
      }

      // Полный список селекторов, включая новые карточки и контакты
      const selectors = [
          'button',             // Все стандартные кнопки
          '.btn',                // Главные кнопки (например, "Связаться")
          '.nav-btn',            // Кнопки навигации
          '.lang-btn',           // Переключатели языков
          '.modal-close',        // Закрытие модалок
          '.social-icon',        // Иконки соцсетей (Telegram, Discord и т.д.)
          '.contact-link',       // Любые ссылки в блоке контактов
          '.card',               // Базовый класс карточек
          '.card-link',          // Интерактивные карточки проектов
          '.service-card',       // Карточки услуг из нового скрипта
          '.project-card'        // Альтернативный класс карточек проектов
      ].join(', ');
      
      // 1. Сразу вешаем звук на то, что уже загружено в HTML
      document.querySelectorAll(selectors).forEach(initHoverSound);

      // 2. Следим за перерисовкой страницы (смена языка, фильтры, генерация карточек)
      const observer = new MutationObserver(() => {
          document.querySelectorAll(selectors).forEach(initHoverSound);
      });

      observer.observe(document.body, {
          childList: true,
          subtree: true
      });
  });
})();
