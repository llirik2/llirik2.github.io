(function(){
  function init(){
    // Smooth scroll to contacts
    const contactBtn = document.getElementById('contact-btn');
    const contactSection = document.getElementById('contacts');
    if(contactBtn && contactSection){
      contactBtn.addEventListener('click',()=>{
        contactSection.scrollIntoView({behavior:'smooth', block:'start'});
      });
    }

    // Cursor glow effect
    const glowEl = document.getElementById('cursor-glow');
    if(!glowEl) return;
    glowEl.style.display = 'block';

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove',(e)=>{
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function updateGlow(){
      const ease = 0.12;
      glowX += (mouseX - glowX) * ease;
      glowY += (mouseY - glowY) * ease;
      glowEl.style.left = (glowX - 100) + 'px';
      glowEl.style.top = (glowY - 100) + 'px';
      requestAnimationFrame(updateGlow);
    }

    updateGlow();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
