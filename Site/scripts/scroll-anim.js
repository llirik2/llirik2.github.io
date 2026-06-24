(function(){
  const ScrollAnim = {};
  let observer;
  function init(){
    observer = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){e.target.classList.add('in-view');}
      });
    },{threshold:0.12});
    const els = document.querySelectorAll('.reveal');
    els.forEach(el=>observer.observe(el));
  }
  function observe(list){
    if(!observer || !list) return;
    list.forEach(el=>observer.observe(el));
  }
  ScrollAnim.init = init; ScrollAnim.observe = observe; window.ScrollAnim = ScrollAnim;
})();
