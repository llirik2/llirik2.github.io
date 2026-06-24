(function(){
  const ThreeBG = {};
  let scene, camera, renderer, cubes = [], rafId;
  let scrollTarget = {x:0,y:0};
  let scrollCurrent = {x:0,y:0};

  function init(){
    if(typeof THREE === 'undefined') return;
    const container = document.getElementById('bg');
    scene = new THREE.Scene();
    const w = window.innerWidth, h = window.innerHeight;
    camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 2000);
    camera.position.z = 120;
    const lowPower = window.matchMedia('(prefers-reduced-motion: reduce)').matches || (navigator.deviceMemory && navigator.deviceMemory < 2);
    const pixelRatio = lowPower ? Math.min(1, window.devicePixelRatio||1) : Math.min(1.6, window.devicePixelRatio||1);
    renderer = new THREE.WebGLRenderer({antialias: !lowPower, alpha:true});
    renderer.setSize(w,h);
    renderer.setPixelRatio(pixelRatio);
    renderer.domElement.style.display='block';
    renderer.domElement.style.width='100%';
    renderer.domElement.style.height='100%';
    renderer.domElement.style.position='fixed';
    renderer.domElement.style.left='0';
    renderer.domElement.style.top='0';
    renderer.domElement.style.zIndex='-1';
    renderer.domElement.style.filter='blur(10px)';
    renderer.domElement.style.opacity='0.88';
    renderer.domElement.style.pointerEvents='none';
    container.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xc8ffe1,0.75);
    light.position.set(1,1,1); scene.add(light);
    const amb = new THREE.AmbientLight(0x406040,0.5); scene.add(amb);

    const mat = new THREE.MeshStandardMaterial({color:0x00c46b,metalness:0.2,roughness:0.45,transparent:true,opacity:0.78});
    const geo = new THREE.BoxGeometry(1,1,1);

    const count = lowPower ? Math.max(4, Math.floor(Math.min(window.innerWidth,900)/180)) : Math.max(12, Math.floor(Math.min(window.innerWidth,1200)/120));
    for(let i=0;i<count;i++){
      const m = new THREE.Mesh(geo,mat.clone());
      const scale = 4 + Math.random()*16;
      m.scale.set(scale,scale,scale);
      m.position.x = (Math.random()-0.5)*(220 + scale*3);
      m.position.y = (Math.random()-0.5)*(140 + scale*2);
      m.position.z = (Math.random()-0.5)*(240 + scale*2);
      m.rotation.x = Math.random()*Math.PI;
      m.rotation.y = Math.random()*Math.PI;
      m.material.opacity = 0.58 + Math.random()*0.22;
      scene.add(m); cubes.push(m);
    }

    onResize();
    window.addEventListener('resize',onResize);
    window.addEventListener('scroll',onScroll,{passive:true});
    animate();
    ThreeBG.scene = scene;
  }

  function onScroll(){
    const maxShift = 35;
    const scrollNorm = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
    scrollTarget.y = (scrollNorm - 0.5) * maxShift;
    scrollTarget.x = (scrollNorm - 0.5) * (maxShift * 0.45);
  }

  function animate(){
    rafId = requestAnimationFrame(animate);
    const ease = 0.08;
    scrollCurrent.x += (scrollTarget.x - scrollCurrent.x) * ease;
    scrollCurrent.y += (scrollTarget.y - scrollCurrent.y) * ease;
    camera.position.x = scrollCurrent.x;
    camera.position.y = scrollCurrent.y;
    camera.lookAt(0,0,0);

    cubes.forEach((c,i)=>{
      c.rotation.x += 0.002 + (i%3)*0.001;
      c.rotation.y += 0.003 + (i%2)*0.0016;
    });
    renderer.render(scene,camera);
  }

  function onResize(){
    if(!renderer) return;
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w/h; camera.updateProjectionMatrix();
    renderer.setSize(w,h);
  }

  function destroy(){
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize',onResize);
    window.removeEventListener('scroll',onScroll);
    if(renderer && renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  }

  ThreeBG.init = init; ThreeBG.destroy = destroy;
  window.ThreeBG = ThreeBG;
})();
