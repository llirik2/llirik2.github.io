(function(){
  const LANG_KEY = 'site_lang';
  let lang = localStorage.getItem(LANG_KEY) || 'ru';
  let projects = [];
  let currentProject = null;

  function getProjectId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  // Секретная проверка: включен ли режим разработчика в URL (?id=...&dev)
  function isDevMode() {
    return new URLSearchParams(window.location.search).has('dev');
  }

  function loadProjects() {
    return new Promise(async (resolve) => {
      const saved = localStorage.getItem('projects_data');
      if (saved) {
        try {
          projects = JSON.parse(saved);
          resolve(projects);
          return;
        } catch (e) {
          console.warn('project-detail: failed to parse saved projects', e);
        }
      }

      try {
        const res = await fetch('data/projects.json?cache=' + Date.now());
        if (!res.ok) throw new Error(res.statusText);
        projects = await res.json();
      } catch (e) {
        console.error('project-detail: unable to load projects', e);
      }
      resolve(projects);
    });
  }

  function getLabel(key) {
    const labels = {
      title: {ru:'Проект', en:'Project'},
      description: {ru:'Описание', en:'Description'},
      features: {ru:'Особенности', en:'Features'},
      feedback: {ru:'Отзыв', en:'Feedback'},
      date: {ru:'Дата', en:'Date'},
      price: {ru:'Цена', en:'Price'},
      edit: {ru:'✏️ Редактировать', en:'✏️ Edit'},
      save: {ru:'✓ Сохранить', en:'✓ Save'},
      cancel: {ru:'✕ Отмена', en:'✕ Cancel'},
      download: {ru:'⬇️ Скачать', en:'⬇️ Download'},
      missing: {ru:'Проект не найден', en:'Project not found'},
      back: {ru:'← Назад', en:'← Back'}
    };
    return labels[key] ? labels[key][lang] : '';
  }

  function formatPrice(amount,currency){
    try {
      if (!amount) return '';
      const locale = lang === 'ru' ? 'ru-RU' : 'en-US';
      const opts = { style:'currency', currency: currency==='RUB' ? 'RUB' : 'USD', maximumFractionDigits: currency==='RUB'?0:2 };
      return new Intl.NumberFormat(locale, opts).format(amount);
    } catch (e) {
      return amount + ' ' + currency;
    }
  }

  function renderError() {
    const target = document.getElementById('project-details');
    if (!target) return;
    target.innerHTML = `
      <div class="project-missing">
        <h1>${getLabel('missing')}</h1>
        <p>${lang === 'ru' ? 'Указан неверный идентификатор проекта. Перейдите назад и выберите другой проект.' : 'Invalid project identifier. Go back and choose another project.'}</p>
        <a href="index.html" class="btn btn-edit">${getLabel('back')}</a>
      </div>
    `;
  }

  function renderProject() {
    if (!currentProject) {
      renderError();
      return;
    }

    const p = currentProject;
    const details = document.getElementById('project-details');
    if (!details) return;

    details.innerHTML = `
      <article class="project-detail-card">
        <div class="project-header">
          <div class="project-hero">
            <div class="project-cover">
              <img src="${p.cover}" alt="${p.title[lang] || p.title.ru}">
              <div class="project-cover-overlay"></div>
            </div>
            <div class="project-meta">
              <span class="badge badge-category">${p.category ? (p.category[lang] || p.category.ru) : ''}</span>
              <span class="badge badge-${p.tags?.[0] || 'own'}">${p.tags?.map(t => {
                const map = {order:{ru:'Заказ',en:'Order'},own:{ru:'Собственная',en:'Own'},tips:{ru:'Чаевые',en:'Tips'}};
                return map[t] ? map[t][lang] : t;
              }).join(', ')}</span>
            </div>
          </div>

          <div class="project-info">
            <h1 class="project-main-title">${p.title[lang] || p.title.ru}</h1>
            <p class="project-description">${p.description[lang] || p.description.ru}</p>
            <div class="project-actions">
              <!-- Кнопка появится ТОЛЬКО если в URL передан секретный параметр &dev -->
              ${isDevMode() ? `<button class="btn btn-edit" id="edit-project">${getLabel('edit')}</button>` : ''}
              ${p.downloadUrl && p.downloadUrl !== '#' ? `<a href="${p.downloadUrl}" class="btn btn-download" download>${getLabel('download')}</a>` : ''}
            </div>
          </div>
        </div>

        <section class="project-section">
          <h2>${getLabel('description')}</h2>
          <p>${p.longDescription ? (p.longDescription[lang] || p.longDescription.ru) : (p.description[lang] || p.description.ru)}</p>
        </section>

        ${p.features && p.features[lang] ? `
          <section class="project-section">
            <h2>${getLabel('features')}</h2>
            <ul class="features-list">
              ${p.features[lang].map(item => `<li>${item}</li>`).join('')}
            </ul>
          </section>
        ` : ''}

        ${p.feedback ? `
          <section class="project-section feedback-section">
            <h2>${getLabel('feedback')}</h2>
            <p class="feedback-text">${p.feedback}</p>
          </section>
        ` : ''}

        <div class="project-grid">
          <div class="project-card">
            <strong>${getLabel('date')}</strong>
            <p>${new Date(p.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}</p>
          </div>
          ${p.price && p.price.amount > 0 ? `
          <div class="project-card">
            <strong>${getLabel('price')}</strong>
            <p>${formatPrice(p.price.amount, p.price.currency)}</p>
          </div>
          ` : ''}
        </div>
      </article>
    `;

    document.getElementById('edit-project')?.addEventListener('click', toggleEditMode);
  }

  function renderEditMode() {
    if (!currentProject) return;
    const p = currentProject;
    const details = document.getElementById('project-details');
    if (!details) return;

    details.innerHTML = `
      <article class="project-detail-card edit-page">
        <div class="project-header">
          <div class="project-cover project-cover-small">
            <img src="${p.cover}" alt="${p.title[lang] || p.title.ru}">
            <div class="project-cover-overlay"></div>
          </div>
        </div>

        <div class="project-form">
          <div class="edit-field">
            <label>${lang === 'ru' ? 'Название' : 'Title'}</label>
            <input id="edit-title" class="edit-input" value="${p.title[lang] || p.title.ru}">
          </div>

          <div class="edit-field">
            <label>${lang === 'ru' ? 'Короткое описание' : 'Short description'}</label>
            <textarea id="edit-description" class="edit-input">${p.description[lang] || p.description.ru}</textarea>
          </div>

          <div class="edit-field">
            <label>${lang === 'ru' ? 'Полное описание' : 'Long description'}</label>
            <textarea id="edit-long-description" class="edit-input">${p.longDescription ? (p.longDescription[lang] || p.longDescription.ru) : ''}</textarea>
          </div>

          <div class="edit-row">
            <div class="edit-field">
              <label>${lang === 'ru' ? 'Цена' : 'Price'}</label>
              <input id="edit-price" class="edit-input" type="number" value="${p.price?.amount || 0}">
            </div>
            <div class="edit-field">
              <label>${lang === 'ru' ? 'Рейтинг' : 'Rating'}</label>
              <input id="edit-rating" class="edit-input" type="number" min="0" max="5" step="0.1" value="${p.rating || 0}">
            </div>
          </div>

          <div class="edit-field">
            <label>${lang === 'ru' ? 'Отзыв' : 'Feedback'}</label>
            <textarea id="edit-feedback" class="edit-input">${p.feedback || ''}</textarea>
          </div>

          <div class="edit-field">
            <label>${lang === 'ru' ? 'Ссылка на скачивание' : 'Download URL'}</label>
            <input id="edit-download-url" class="edit-input" value="${p.downloadUrl || '#'}">
          </div>

          <div class="modal-actions">
            <button class="btn btn-save" id="save-project">${getLabel('save')}</button>
            <button class="btn btn-cancel" id="cancel-project">${getLabel('cancel')}</button>
          </div>
        </div>
      </article>
    `;

    document.getElementById('save-project')?.addEventListener('click', saveEdits);
    document.getElementById('cancel-project')?.addEventListener('click', renderProject);
  }

  function toggleEditMode() {
    renderEditMode();
  }

  function saveEdits() {
    if (!currentProject) return;

    currentProject.title = currentProject.title || {};
    currentProject.description = currentProject.description || {};
    currentProject.longDescription = currentProject.longDescription || {};

    currentProject.title[lang] = document.getElementById('edit-title').value;
    currentProject.description[lang] = document.getElementById('edit-description').value;
    currentProject.longDescription[lang] = document.getElementById('edit-long-description').value;
    currentProject.price = currentProject.price || { amount: 0, currency: 'RUB' };
    currentProject.price.amount = parseInt(document.getElementById('edit-price').value) || 0;
    currentProject.rating = parseFloat(document.getElementById('edit-rating').value) || 0;
    currentProject.feedback = document.getElementById('edit-feedback').value;
    currentProject.downloadUrl = document.getElementById('edit-download-url').value;

    const index = projects.findIndex(p => p.id === currentProject.id);
    if (index !== -1) {
      projects[index] = currentProject;
      localStorage.setItem('projects_data', JSON.stringify(projects));
    }

    renderProject();
    showNotification(lang === 'ru' ? 'Изменения сохранены' : 'Changes saved');
    Portfolio.exportJSON();
  }

  function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    requestAnimationFrame(() => notif.classList.add('show'));
    setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => notif.remove(), 300);
    }, 2800);
  }

  function updateBackLink(){
    const back = document.getElementById('back-link');
    if(!back) return;
    back.textContent = lang === 'ru' ? '← Назад в портфолио' : '← Back to portfolio';
  }

  function setLang(newLang){
    parentLang = newLang; // Локальный апдейт
    lang = newLang;
    updateBackLink();
    renderProject();
  }

  async function init() {
    lang = localStorage.getItem(LANG_KEY) || 'ru';
    const projectId = getProjectId();
    await loadProjects();
    currentProject = projects.find(p => p.id === projectId);
    updateBackLink();
    renderProject();
  }

  document.addEventListener('DOMContentLoaded', init);

  window.ProjectDetail = {
    setLang
  };
})();