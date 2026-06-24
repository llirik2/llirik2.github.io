(function(){
  function createPanel(){
    const root = document.getElementById('admin-root');
    const panel = document.createElement('div'); panel.className='admin-panel'; panel.style.display='none';
    panel.innerHTML = `
      <h3>Генератор проекта</h3>
      <label>Заголовок (RU)</label><input id="ap_title_ru" />
      <label>Заголовок (EN)</label><input id="ap_title_en" />
      <label>Описание (RU)</label><textarea id="ap_desc_ru" rows="3"></textarea>
      <label>Описание (EN)</label><textarea id="ap_desc_en" rows="3"></textarea>
      <div class="row">
        <div>
          <label>Тег</label>
          <select id="ap_tag"><option value="order">Заказ</option><option value="own">Собственная инициатива</option></select>
        </div>
        <div>
          <label>Валюта</label>
          <select id="ap_currency"><option value="RUB">RUB</option><option value="USD">USD</option></select>
        </div>
      </div>
      <div class="row">
        <div>
          <label>Цена</label><input id="ap_price" type="number" />
        </div>
        <div>
          <label>Ссылка</label><input id="ap_link" />
        </div>
      </div>
      <label>Cover URL</label><input id="ap_cover" placeholder="https://... (опционально)" />
      <div class="admin-actions">
        <button type="button" id="ap_add">Добавить</button>
        <button type="button" id="ap_export">Экспорт JSON</button>
        <button type="button" id="ap_close">Закрыть</button>
      </div>
    `;
    root.appendChild(panel);

    document.getElementById('ap_add').addEventListener('click',()=>{
      const obj = {
        id: 'proj-'+Date.now(),
        title: { ru: document.getElementById('ap_title_ru').value || 'Новый проект', en: document.getElementById('ap_title_en').value || 'New project' },
        description: { ru: document.getElementById('ap_desc_ru').value || '', en: document.getElementById('ap_desc_en').value || '' },
        tags: [document.getElementById('ap_tag').value],
        price: { amount: Number(document.getElementById('ap_price').value) || 0, currency: document.getElementById('ap_currency').value },
        date: new Date().toISOString().slice(0,10),
        cover: document.getElementById('ap_cover').value || '',
        link: document.getElementById('ap_link').value || '#'
      };
      if(window.Portfolio && window.Portfolio.addProject) window.Portfolio.addProject(obj);
    });

    document.getElementById('ap_export').addEventListener('click',()=>{
      if(window.Portfolio && window.Portfolio.exportJSON) window.Portfolio.exportJSON();
    });

    document.getElementById('ap_close').addEventListener('click',()=>{ panel.style.display='none'; });

    return panel;
  }

  document.addEventListener('DOMContentLoaded',()=>{
    const panel = createPanel();
    const btn = document.getElementById('open-admin');
    btn.addEventListener('click',()=>{ panel.style.display = panel.style.display==='none'?'block':'none'; });
  });
})();
