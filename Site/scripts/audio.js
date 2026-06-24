(function(){
  let audioElement;
  let isPlaying = false;

  function playAudio(){
    if(!audioElement) return;
    audioElement.volume = 0.1;
    audioElement.play().then(()=>{
      isPlaying = true;
      updateStatus();
    }).catch(()=>{
      isPlaying = false;
      updateStatus();
    });
  }

  function pauseAudio(){
    if(!audioElement) return;
    audioElement.pause();
    isPlaying = false;
    updateStatus();
  }

  function toggleAudio(){
    if(isPlaying){
      pauseAudio();
    } else {
      playAudio();
    }
  }

  function updateStatus(){
    const status = document.getElementById('music-status');
    if(!status) return;
    status.textContent = isPlaying ? 'Вкл' : 'Выкл';
  }

  document.addEventListener('DOMContentLoaded',()=>{
    audioElement = document.getElementById('bg-music');
    const button = document.getElementById('music-toggle');
    if(!button || !audioElement) return;
    button.addEventListener('click',()=>{
      toggleAudio();
    });

    const tryPlay = () => {
      playAudio();
      window.removeEventListener('click', tryPlay);
      window.removeEventListener('keydown', tryPlay);
    };

    updateStatus();
    playAudio();
    window.addEventListener('click', tryPlay, {once:true});
    window.addEventListener('keydown', tryPlay, {once:true});
  });
})();
