(function() {
  let currentProject = null;
  let currentLang = 'ru';
  let isEditMode = false;
  let projects = [];

  // Получить все проекты из портфолио
  function setProjects(projectsData) {
    projects = projectsData;
  }

  function setLang(lang) {
    currentLang = lang;
    if (currentProject) {
      renderModal();
    }
  }

  function openModal(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    currentProject = { ...project };
    isEditMode = false;
    renderModal();
    showModal();
  }

  function closeModal() {
    const modal = document.getElementById('project-modal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
  }

  function showModal() {
    const modal = document.getElementById('project-modal');
    if (!modal) {
      console.error('Modal not found in DOM');
      return;
    }
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  }

  function renderModal() {
    const content = document.getElementById('modal-content');
    if (!content || !currentProject) return;

    const p = currentProject;
    const lang = currentLang;

    content.innerHTML = `
      <div class="modal-header">
        <div class="modal-cover">
          <img src="${p.cover}" alt="${p.title[lang] || p.title.ru}">
          <div class="modal-cover-overlay"></div>
        </div>
      </div>

      <div class="modal-body">
        <button class="modal-close" id="modal-close-btn" aria-label="Закрыть">&times;</button>

        ${isEditMode ? renderEditMode(p, lang) : renderViewMode(p, lang)}

        <div class="modal-actions">
          ${!isEditMode ? `<button class="btn btn-edit" id="edit-btn">✏️ Редактировать</button>` : ''}
          ${isEditMode ? `
            <button class="btn btn-save" id="save-btn">✓ Сохранить</button>
            <button class="btn btn-cancel" id="cancel-btn">✕ Отмена</button>
          ` : ''}
          ${p.downloadUrl && p.downloadUrl !== '#' ? `<a href="${p.downloadUrl}" class="btn btn-download" download>⬇️ Скачать</a>` : ''}
        </div>
      </div>
    `;

    // Привязываем события
    const closeBtn = content.querySelector('#modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    const editBtn = content.querySelector('#edit-btn');
    if (editBtn) editBtn.addEventListener('click', enableEditMode);

    const saveBtn = content.querySelector('#save-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveChanges);

    const cancelBtn = content.querySelector('#cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', disableEditMode);
  }

  function renderViewMode(p, lang) {
    return `
      <div class="modal-info">
        <h1>${p.title[lang] || p.title.ru}</h1>
        
        <div class="modal-badges">
          ${p.tags && p.tags.map(tag => {
            const tagTexts = {
              'order': { ru: 'Заказ', en: 'Order' },
              'own': { ru: 'Собственная инициатива', en: 'Own initiative' },
              'tips': { ru: 'Чаевые', en: 'Tips' }
            };
            if (tagTexts[tag]) {
              return `<span class="badge badge-${tag}">${tagTexts[tag][lang] || tagTexts[tag].ru}</span>`;
            }
            return '';
          }).join('')}
          
          ${p.rating ? `
            <span class="badge badge-rating" style="border-color: var(--accent); color: var(--accent); background: rgba(0, 255, 136, 0.05);">
              ★ ${Number(p.rating).toFixed(1)}
            </span>
          ` : ''}
          
          ${p.category ? `<span class="badge badge-category">${p.category[lang] || p.category.ru}</span>` : ''}
        </div>

        <p class="modal-description">${p.description[lang] || p.description.ru}</p>

        ${p.longDescription ? `
          <div class="modal-section">
            <h3>${lang === 'ru' ? 'Описание' : 'Description'}</h3>
            <p>${p.longDescription[lang] || p.longDescription.ru}</p>
          </div>
        ` : ''}

        ${p.features && p.features[lang] ? `
          <div class="modal-section">
            <h3>${lang === 'ru' ? 'Особенности' : 'Features'}</h3>
            <ul class="features-list">
              ${p.features[lang].map(f => `<li>${f}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${p.feedback ? `
          <div class="modal-section feedback-section">
            <h3>${lang === 'ru' ? 'Отзыв' : 'Feedback'}</h3>
            <p class="feedback-text">"${p.feedback}"</p>
          </div>
        ` : ''}

        <div class="modal-footer">
          <div>
            <strong>${lang === 'ru' ? 'Дата' : 'Date'}</strong>
            <p>${new Date(p.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}</p>
          </div>
          ${p.price && p.price.amount > 0 ? `
            <div>
              <strong>${lang === 'ru' ? 'Цена' : 'Price'}</strong>
              <p>${formatPrice(p.price.amount, p.price.currency, lang)}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderEditMode(p, lang) {
    return `
      <div class="modal-info edit-mode">
        <div class="edit-field">
          <label>${lang === 'ru' ? 'Название' : 'Title'}</label>
          <input type="text" id="edit-title" value="${p.title[lang] || p.title.ru}" class="edit-input">
        </div>

        <div class="edit-field">
          <label>${lang === 'ru' ? 'Короткое описание' : 'Short Description'}</label>
          <textarea id="edit-description" class="edit-input">${p.description[lang] || p.description.ru}</textarea>
        </div>

        <div class="edit-field">
          <label>${lang === 'ru' ? 'Полное описание' : 'Long Description'}</label>
          <textarea id="edit-long-description" class="edit-input">${p.longDescription && (p.longDescription[lang] || p.longDescription.ru) || ''}</textarea>
        </div>

        <div class="edit-row">
          <div class="edit-field" style="flex: 1;">
            <label>${lang === 'ru' ? 'Цена' : 'Price'}</label>
            <input type="number" id="edit-price" value="${p.price?.amount || 0}" class="edit-input">
          </div>
          <div class="edit-field" style="flex: 1;">
            <label>${lang === 'ru' ? 'Рейтинг' : 'Rating'}</label>
            <input type="number" id="edit-rating" value="${p.rating || 0}" min="0" max="5" step="0.1" class="edit-input">
          </div>
        </div>

        <div class="edit-field">
          <label>${lang === 'ru' ? 'Отзыв' : 'Feedback'}</label>
          <textarea id="edit-feedback" class="edit-input">${p.feedback || ''}</textarea>
        </div>

        <div class="edit-field">
          <label>${lang === 'ru' ? 'Ссылка на скачивание' : 'Download URL'}</label>
          <input type="text" id="edit-download-url" value="${p.downloadUrl || '#'}" class="edit-input">
        </div>
      </div>
    `;
  }

  function enableEditMode() {
    isEditMode = true;
    renderModal();
  }

  function disableEditMode() {
    isEditMode = false;
    currentProject = projects.find(p => p.id === currentProject.id);
    renderModal();
  }

  function saveChanges() {
    if (!currentProject) return;

    const lang = currentLang;
    
    // Обновляем проект в памяти
    currentProject.title[lang] = document.getElementById('edit-title').value;
    currentProject.description[lang] = document.getElementById('edit-description').value;
    
    if (!currentProject.longDescription) currentProject.longDescription = {};
    currentProject.longDescription[lang] = document.getElementById('edit-long-description').value;
    
    currentProject.price.amount = parseInt(document.getElementById('edit-price').value) || 0;
    currentProject.rating = parseFloat(document.getElementById('edit-rating').value) || 0;
    currentProject.feedback = document.getElementById('edit-feedback').value;
    currentProject.downloadUrl = document.getElementById('edit-download-url').value;

    // Обновляем в основном массиве проектов
    const index = projects.findIndex(p => p.id === currentProject.id);
    if (index !== -1) {
      projects[index] = currentProject;
    }

    // Сохраняем в localStorage
    // localStorage.setItem('projects_data', JSON.stringify(projects));

    // Обновляем портфолио
    if (window.Portfolio && window.Portfolio.render) {
      window.Portfolio.render(lang);
    }

    // Выходим из режима редактирования
    isEditMode = false;
    renderModal();

    // Показываем уведомление
    showNotification(lang === 'ru' ? 'Изменения сохранены!' : 'Changes saved!');
    Portfolio.exportJSON();
  }

  function formatPrice(amount, currency, lang) {
    try {
      if (!amount) return '';
      const locale = lang === 'ru' ? 'ru-RU' : 'en-US';
      const opts = {
        style: 'currency',
        currency: currency === 'RUB' ? 'RUB' : 'USD',
        maximumFractionDigits: currency === 'RUB' ? 0 : 2
      };
      return new Intl.NumberFormat(locale, opts).format(amount);
    } catch (e) {
      return amount + ' ' + currency;
    }
  }

  function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    document.body.appendChild(notif);

    setTimeout(() => {
      notif.classList.add('show');
    }, 10);

    setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }

  // Закрытие модального окна при клике на фон
  document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('project-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });
    }

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeModal();
      }
    });
  });

  window.ProjectModal = {
    openModal,
    closeModal,
    setProjects,
    setLang,
    setCurrentProject: (p) => { currentProject = p; }
  };
})();
