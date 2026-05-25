/* ── Background Music Toggle ── */
(function(){
  var audio = document.getElementById('bgmAudio');
  var btn = document.getElementById('bgmToggle');
  if (!audio || !btn) return;

  audio.volume = 0.15;

  // BGM always starts playing when entering the course (on first user interaction)
  function startBgm() {
    btn.classList.remove('muted');
    audio.play().catch(function(){});
  }

  // Start BGM when welcome dialog is dismissed (BEGIN GUIDE / RESUME click)
  var welcomeStart = document.getElementById('welcomeStartBtn');
  var welcomeResume = document.getElementById('welcomeResumeBtn');
  if (welcomeStart) welcomeStart.addEventListener('click', startBgm);
  if (welcomeResume) welcomeResume.addEventListener('click', startBgm);

  // Fallback: if no welcome dialog, start on first click/keydown
  if (!welcomeStart) {
    function fallbackStart() {
      startBgm();
      document.removeEventListener('click', fallbackStart);
      document.removeEventListener('keydown', fallbackStart);
    }
    document.addEventListener('click', fallbackStart);
    document.addEventListener('keydown', fallbackStart);
  }

  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (btn.classList.contains('muted')) {
      btn.classList.remove('muted');
      audio.play().catch(function(){});
      localStorage.setItem('bgm-muted', 'false');
    } else {
      btn.classList.add('muted');
      audio.pause();
      localStorage.setItem('bgm-muted', 'true');
    }
  });

  // Pause BGM when voiceover plays, resume after
  var voAudios = document.querySelectorAll('audio[data-vo]');
  var bgmPausedByVo = false;
  voAudios.forEach(function(vo) {
    vo.addEventListener('play', function() {
      if (!btn.classList.contains('muted') && !audio.paused) {
        bgmPausedByVo = true;
        audio.volume = 0.05;
      }
    });
    vo.addEventListener('pause', function() {
      if (bgmPausedByVo) {
        bgmPausedByVo = false;
        audio.volume = 0.15;
      }
    });
    vo.addEventListener('ended', function() {
      if (bgmPausedByVo) {
        bgmPausedByVo = false;
        audio.volume = 0.15;
      }
    });
  });
})();
