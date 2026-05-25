/* ── Podcast Player ── */
(function(){
  var audio, playBtn, fill, timeEl;
  function init(){
    audio = document.getElementById('podAudio');
    playBtn = document.getElementById('podPlayBtn');
    fill = document.getElementById('podFill');
    timeEl = document.getElementById('podTime');
    if(audio) audio.addEventListener('timeupdate', updateProgress);
    if(audio) audio.addEventListener('ended', function(){ if(playBtn) playBtn.textContent = '▶'; });
  }
  function fmt(s){ var m=Math.floor(s/60); var sec=Math.floor(s%60); return m+':'+(sec<10?'0':'')+sec; }
  function highlightTranscript(currentTime){
    var paras = document.querySelectorAll('.transcript-p');
    var activeIdx = -1;
    for(var i = paras.length - 1; i >= 0; i--){
      var t = parseFloat(paras[i].getAttribute('data-time'));
      if(currentTime >= t){ activeIdx = i; break; }
    }
    paras.forEach(function(p, i){
      if(i === activeIdx){
        if(!p.classList.contains('active')){
          p.classList.add('active');
          var panel = document.getElementById('podTranscript');
          if(panel && panel.style.display !== 'none'){
            p.scrollIntoView({behavior:'smooth', block:'center'});
          }
        }
      } else {
        p.classList.remove('active');
      }
    });
  }
  function updateProgress(){
    if(!audio||!fill||!timeEl) return;
    var pct = audio.duration ? (audio.currentTime/audio.duration)*100 : 0;
    fill.style.width = pct+'%';
    timeEl.textContent = fmt(audio.currentTime)+' / '+fmt(audio.duration||0);
    highlightTranscript(audio.currentTime);
  }
  window.togglePod = function(){
    if(!audio){ init(); }
    if(!audio) return;
    if(audio.paused){ audio.play(); if(playBtn) playBtn.textContent='⏸'; }
    else { audio.pause(); if(playBtn) playBtn.textContent='▶'; }
  };
  window.seekPod = function(e){
    if(!audio) init();
    if(!audio||!audio.duration) return;
    var rect = e.currentTarget.getBoundingClientRect();
    var pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  };
  window.seekTo = function(sec){
    if(!audio) init();
    if(!audio) return;
    audio.currentTime = sec;
    if(audio.paused){ audio.play(); if(playBtn) playBtn.textContent='⏸'; }
  };
  document.addEventListener('DOMContentLoaded', init);
})();

/* ── Impact Carousel ── */
(function(){
  let carouselIdx = 0;
  const carouselTotal = 4;
  function goCarousel(idx) {
    carouselIdx = Math.max(0, Math.min(idx, carouselTotal - 1));
    var track = document.getElementById('impactTrack');
    if (track) track.style.transform = 'translateX(-' + (carouselIdx * 100) + '%)';
    var dots = document.querySelectorAll('.carousel-nav .dot');
    dots.forEach(function(d, i) { d.classList.toggle('active', i === carouselIdx); });
  }
  function moveCarousel(dir) { goCarousel(carouselIdx + dir); }
  window.goCarousel = goCarousel;
  window.moveCarousel = moveCarousel;
})();

/* ── Slide Navigation ── */
(function(){
  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  let current = 1;

  /* ── Linear progression: visitedSlides tracking ── */
  if (!window.courseData) window.courseData = {};
  if (!window.courseData.submissions) window.courseData.submissions = {};
  if (!window.courseData.visitedSlides) {
    // Try to load from localStorage
    try {
      var saved = localStorage.getItem('courseVisitedSlides');
      if (saved) {
        window.courseData.visitedSlides = JSON.parse(saved);
      } else {
        window.courseData.visitedSlides = [1]; // Slide 1 is always unlocked
      }
    } catch(e) {
      window.courseData.visitedSlides = [1];
    }
  }

  function saveVisitedSlides() {
    try {
      localStorage.setItem('courseVisitedSlides', JSON.stringify(window.courseData.visitedSlides));
    } catch(e) {}
  }

  function isSlideUnlocked(n) {
    if (n === 1) return true;
    // Slide N is unlocked if slide N-1 has been visited
    return window.courseData.visitedSlides.indexOf(n - 1) !== -1;
  }

  function markSlideVisited(n) {
    if (window.courseData.visitedSlides.indexOf(n) === -1) {
      window.courseData.visitedSlides.push(n);
      saveVisitedSlides();
    }
  }

  /* ── Interactive slide lock: disable next until interaction is complete ── */
  // Slides that require interaction before advancing
  var interactiveSlides = {
    10: 'scenario',  // Scenario 1
    11: 'scenario',  // Scenario 2
    12: 'scenario',  // Scenario 3
    13: 'kc',        // KC1
    14: 'kc',        // KC2
    15: 'kc',        // KC3
    17: 'reflection', // Reflection prompt
    21: 'scenario'   // Scenario 4
  };

  function isSlideInteractionComplete(slideNum) {
    var type = interactiveSlides[slideNum];
    if (!type) return true; // not an interactive slide

    var slideEl = document.querySelector('[data-slide="' + slideNum + '"]');
    if (!slideEl) return true;

    if (type === 'scenario') {
      var opts = slideEl.querySelector('.options[data-correct]');
      return opts && opts.classList.contains('locked');
    }
    if (type === 'kc') {
      var kc = slideEl.querySelector('.kc-options[data-qnum]');
      return kc && kc.classList.contains('locked');
    }
    if (type === 'reflection') {
      var inputs = slideEl.querySelectorAll('.input[contenteditable]');
      for (var i = 0; i < inputs.length; i++) {
        var text = inputs[i].textContent.trim();
        if (text && text !== 'Type your reflection here...' && text !== 'Type your response here...' && text !== 'Type your response here... (optional)') {
          return true;
        }
      }
      return false;
    }
    return true;
  }

  function updateNextButtonState(slideNum) {
    var slideEl = document.querySelector('[data-slide="' + slideNum + '"]');
    if (!slideEl) return;
    var nextBtn = slideEl.querySelector('.sn-btn.next');
    if (!nextBtn) return;

    if (interactiveSlides[slideNum] && !isSlideInteractionComplete(slideNum)) {
      nextBtn.classList.add('disabled');
      nextBtn.style.opacity = '0.35';
      nextBtn.style.cursor = 'not-allowed';
    } else {
      nextBtn.classList.remove('disabled');
      nextBtn.style.opacity = '';
      nextBtn.style.cursor = '';
    }
  }

  // Expose so quiz/scenario handlers can call it after submission
  window.updateNextButtonState = updateNextButtonState;

  // Warning toast for clicking disabled next
  var warningToast = document.createElement('div');
  warningToast.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(25,40,88,0.95); color:#fff; padding:24px 40px; font-family:var(--font-head); font-size:18px; letter-spacing:1px; z-index:99999; opacity:0; pointer-events:none; transition:opacity 0.3s; text-align:center; max-width:500px; line-height:1.5;';
  document.body.appendChild(warningToast);
  var warningTimeout = null;

  function showWarningToast(msg) {
    warningToast.textContent = msg;
    warningToast.style.opacity = '1';
    if (warningTimeout) clearTimeout(warningTimeout);
    warningTimeout = setTimeout(function() {
      warningToast.style.opacity = '0';
    }, 2500);
  }

  function goSlide(n) {
    if (n < 1 || n > total) return;
    // Linear progression lock: prevent skipping ahead
    if (!isSlideUnlocked(n)) return;

    // Interactive slide lock: block forward if interaction not complete
    if (n > current && interactiveSlides[current] && !isSlideInteractionComplete(current)) {
      showWarningToast('Please complete the activity on this slide before continuing.');
      return;
    }

    slides.forEach(s => s.classList.remove('active'));
    current = n;
    const target = document.querySelector('[data-slide="' + n + '"]');
    if (target) target.classList.add('active');

    // Mark this slide as visited (unlocks the next one)
    markSlideVisited(n);

    // Update next button state for the new slide
    updateNextButtonState(n);

    resize();
  }
  window.goSlide = goSlide;

  var currentScale = 1;

  function resize() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scaleW = vw / 1920;
    const scaleH = vh / 1080;
    var scale = Math.min(scaleW, scaleH);
    currentScale = scale;
    var renderedW = 1920 * scale;
    var renderedH = 1080 * scale;
    var offsetX = (vw - renderedW) / 2;
    var offsetY = (vh - renderedH) / 2;
    slides.forEach(function(s) {
      s.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px) scale(' + scale + ')';
    });
  }

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', function() {
    setTimeout(resize, 100);
  });
  resize();

  /* ── Touch / Swipe Navigation ── */
  (function() {
    var touchStartX = 0;
    var touchStartY = 0;
    var SWIPE_MIN = 50;
    var interactiveSelector = 'input, textarea, select, button, [contenteditable], [contenteditable="true"], .option, .kc-opt, .tab-btn, .vo-controls, .vo-progress-wrap, .vo-vol-slider, .carousel-nav, .side-menu';

    document.addEventListener('touchstart', function(e) {
      if (e.target.closest && e.target.closest(interactiveSelector)) return;
      var touch = e.changedTouches[0];
      touchStartX = touch.screenX;
      touchStartY = touch.screenY;
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
      if (window.welcomeDialogOpen) return;
      if (e.target.closest && e.target.closest(interactiveSelector)) return;
      var touch = e.changedTouches[0];
      var dx = touch.screenX - touchStartX;
      var dy = touch.screenY - touchStartY;
      if (Math.abs(dy) > Math.abs(dx)) return;
      if (Math.abs(dx) < SWIPE_MIN) return;
      if (dx < 0) { goSlide(current + 1); }
      else { goSlide(current - 1); }
    }, { passive: true });
  })();

  document.addEventListener('keydown', function(e) {
    if (window.welcomeDialogOpen) return;
    if (e.target.hasAttribute && e.target.hasAttribute('contenteditable')) return;
    var tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.key === 'Escape') {
      if (document.body.classList.contains('nav-open')) {
        closeMenu();
        var menuBtn = document.querySelector('.slide.active .menu-btn');
        if (menuBtn) menuBtn.focus();
        e.preventDefault();
        return;
      }
      var openOverlay = document.querySelector('.slide.active .feedback-overlay.show');
      if (openOverlay) {
        openOverlay.classList.remove('show');
        e.preventDefault();
        return;
      }
    }

    var isInteractive = e.target.closest && e.target.closest('.option, .kc-opt, .tab-btn, .acc-header, .step, .sm-item');
    if (!isInteractive) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goSlide(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goSlide(current - 1); }
    }

    if (e.key === ' ' && !isInteractive) {
      e.preventDefault();
      goSlide(current + 1);
    }
  });

  /* ── Tab switching (with ARIA) ── */
  document.querySelectorAll('.tabbed').forEach(function(tabbed) {
    var btns = tabbed.querySelectorAll('.tab-btn');
    var panels = tabbed.querySelectorAll('.tab-panel');
    btns.forEach(function(btn, i) {
      btn.addEventListener('click', function() {
        btns.forEach(function(b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        panels.forEach(function(p) { p.classList.remove('active'); });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        if (panels[i]) panels[i].classList.add('active');
      });
      btn.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          var next = btns[(i + 1) % btns.length];
          next.focus();
          next.click();
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          var prev = btns[(i - 1 + btns.length) % btns.length];
          prev.focus();
          prev.click();
        }
      });
    });
  });

  /* ── Grid card expand/collapse ── */
  document.querySelectorAll('.g-card').forEach(function(card) {
    card.addEventListener('click', function(e) {
      if (e.target.closest && e.target.closest('.g-detail')) {
        card.classList.remove('expanded');
        return;
      }
      card.classList.toggle('expanded');
    });
  });

  /* ── Decision Path stepper ── */
  var stepDetailData = [
    { num: '01', title: 'Pause and Assess', text: 'Before you act, take a moment. Is there an accessibility need here? Don\'t assume — observe.' },
    { num: '02', title: 'Listen and Ask', text: 'Engage respectfully. Ask how you can help. Listen to what the person tells you, not what you think they need.' },
    { num: '03', title: 'Apply', text: 'Use the principles you\'re learning in this series. Think about the Accessibility in Practice model.' },
    { num: '04', title: 'Adapt', text: 'Adjust your communication, the environment, or the process. Accessibility often means flexibility, not perfection.' },
    { num: '05', title: 'Seek Support', text: 'If you\'re unsure, reach out. Talk to your manager, contact IDEAA, or connect with accessibility resources at UHN.' }
  ];

  document.querySelectorAll('.stepper-rail').forEach(function(rail) {
    var steps = rail.querySelectorAll('.step');
    var slide = rail.closest('.slide');
    if (!slide) return;
    var detail = slide.querySelector('.step-detail');
    if (!detail) return;

    steps.forEach(function(step, i) {
      step.addEventListener('click', function() {
        steps.forEach(function(s, j) {
          s.classList.remove('active', 'done');
          s.removeAttribute('aria-current');
          if (j < i) s.classList.add('done');
          if (j === i) { s.classList.add('active'); s.setAttribute('aria-current', 'step'); }
        });
        var d = stepDetailData[i];
        if (d) {
          var marker = detail.querySelector('.marker');
          var contentH3 = detail.querySelector('.content h3');
          var contentP = detail.querySelector('.content p');
          if (marker) marker.innerHTML = 'STEP<b>' + d.num + '</b>';
          if (contentH3) contentH3.textContent = d.title;
          if (contentP) contentP.textContent = d.text;
          announceToSR('Step ' + d.num + ': ' + d.title + '. ' + d.text);
        }
      });
    });
  });

  /* ══════════════════════════════════════════════════════════════
     TASK 1 & 4: Branching scenario choices (2 attempts, full feedback)
     ══════════════════════════════════════════════════════════════ */

  document.querySelectorAll('.options[data-correct]').forEach(function(optionsContainer, idx) {
    var correctAnswer = optionsContainer.getAttribute('data-correct');
    var overlayId = optionsContainer.getAttribute('data-overlay');
    var options = optionsContainer.querySelectorAll('.option');
    var submitBtn = optionsContainer.parentElement.querySelector('.submit-btn');
    var containerKey = overlayId || correctAnswer + '-' + Array.prototype.indexOf.call(document.querySelectorAll('.options[data-correct]'), optionsContainer);
    var selectedChoice = null;
    var MAX_ATTEMPTS = 2;

    // Initialize attempts tracking
    if (!window.courseData.submissions[containerKey]) {
      window.courseData.submissions[containerKey] = { attempts: 0, disabledChoices: [] };
    }

    // Defensive getter: always ensures a valid state object with all required fields
    function getState() {
      if (!window.courseData.submissions[containerKey]) {
        window.courseData.submissions[containerKey] = {};
      }
      var s = window.courseData.submissions[containerKey];
      if (typeof s.attempts !== 'number') s.attempts = 0;
      if (!Array.isArray(s.disabledChoices)) s.disabledChoices = [];
      return s;
    }

    // Restore visual state if previously completed
    var initState = getState();
    var isAlreadyComplete = false;
    if (initState.selected) {
      isAlreadyComplete = true;
      options.forEach(function(o) {
        var ch = o.getAttribute('data-choice');
        if (ch === initState.selected) {
          if (ch === correctAnswer) { o.classList.add('correct'); }
          else { o.classList.add('incorrect'); }
        }
        if (ch === correctAnswer && initState.selected !== correctAnswer) { o.classList.add('correct'); }
      });
      optionsContainer.classList.add('locked');
      if (submitBtn) {
        submitBtn.classList.remove('ready');
        submitBtn.classList.add('submitted');
        submitBtn.textContent = initState.selected === correctAnswer ? 'CORRECT \u2713' : 'SUBMITTED \u2713';
        submitBtn.disabled = true;
      }
      if (overlayId) {
        var overlay = document.getElementById(overlayId);
        if (overlay) {
          var fbContent = overlay.querySelector('.fb-content');
          if (fbContent) {
            fbContent.innerHTML = buildScenarioFeedback(optionsContainer, initState.selected, correctAnswer);
          }
          overlay.classList.add('show');
        }
      }
    }

    // Restore partial state (attempt 1 used, not yet completed)
    if (!isAlreadyComplete && initState.attempts > 0 && !initState.selected) {
      if (initState.disabledChoices) {
        initState.disabledChoices.forEach(function(ch) {
          var opt = optionsContainer.querySelector('[data-choice="' + ch + '"]');
          if (opt) {
            opt.classList.add('disabled-choice');
            opt.style.pointerEvents = 'none';
          }
        });
      }
    }

    // ALWAYS attach click handlers (even if already complete — needed for retry)
    options.forEach(function(opt) {
      opt.addEventListener('click', function() {
        if (optionsContainer.classList.contains('locked')) return;
        if (opt.classList.contains('disabled-choice')) return;
        options.forEach(function(o) {
          if (!o.classList.contains('disabled-choice')) {
            o.classList.remove('sel');
          }
          o.setAttribute('aria-checked', 'false');
        });
        opt.classList.add('sel');
        opt.setAttribute('aria-checked', 'true');
        selectedChoice = opt.getAttribute('data-choice');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.add('ready'); }
      });
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!selectedChoice || optionsContainer.classList.contains('locked')) return;

        var state = getState();
        state.attempts++;

        if (selectedChoice === correctAnswer) {
          // CORRECT on any attempt
          options.forEach(function(o) { o.classList.remove('sel'); });
          var chosenOpt = optionsContainer.querySelector('[data-choice="' + selectedChoice + '"]');
          chosenOpt.classList.add('correct');

          optionsContainer.classList.add('locked');
          submitBtn.classList.remove('ready');
          submitBtn.classList.add('submitted');
          submitBtn.textContent = 'CORRECT \u2713';
          submitBtn.disabled = true;

          state.selected = selectedChoice;
          saveSubmissions();

          if (overlayId) {
            var overlay = document.getElementById(overlayId);
            if (overlay) {
              var fbContent = overlay.querySelector('.fb-content');
              if (fbContent) fbContent.innerHTML = buildScenarioFeedback(optionsContainer, selectedChoice, correctAnswer);
              overlay.classList.add('show');
            }
          }
        } else if (state.attempts < MAX_ATTEMPTS) {
          // FIRST WRONG: show hint, disable wrong option, allow retry
          var chosenOpt = optionsContainer.querySelector('[data-choice="' + selectedChoice + '"]');
          chosenOpt.classList.remove('sel');
          chosenOpt.classList.add('incorrect', 'disabled-choice');
          chosenOpt.style.pointerEvents = 'none';

          if (!state.disabledChoices) state.disabledChoices = [];
          state.disabledChoices.push(selectedChoice);
          saveSubmissions();

          // Show hint inline
          showAttemptHint(optionsContainer, 'Incorrect \u2014 try again. 1 attempt remaining.');

          // Reset submit button
          submitBtn.disabled = true;
          submitBtn.classList.remove('ready');
          selectedChoice = null;
        } else {
          // SECOND WRONG: lock everything, reveal correct, show feedback
          options.forEach(function(o) { o.classList.remove('sel'); });
          var chosenOpt = optionsContainer.querySelector('[data-choice="' + selectedChoice + '"]');
          chosenOpt.classList.add('incorrect');
          options.forEach(function(o) {
            if (o.getAttribute('data-choice') === correctAnswer) o.classList.add('correct');
          });

          optionsContainer.classList.add('locked');
          submitBtn.classList.remove('ready');
          submitBtn.classList.add('submitted');
          submitBtn.textContent = 'SUBMITTED \u2713';
          submitBtn.disabled = true;

          state.selected = selectedChoice;
          saveSubmissions();

          // Remove hint if present
          removeAttemptHint(optionsContainer);

          if (overlayId) {
            var overlay = document.getElementById(overlayId);
            if (overlay) {
              var fbContent = overlay.querySelector('.fb-content');
              if (fbContent) fbContent.innerHTML = buildScenarioFeedback(optionsContainer, selectedChoice, correctAnswer);
              overlay.classList.add('show');
            }
          }
        }
      });
    }
  });

  /* Build scenario feedback showing both chosen + correct */
  function buildScenarioFeedback(optionsContainer, selectedChoice, correctAnswer) {
    var chosenOpt = optionsContainer.querySelector('[data-choice="' + selectedChoice + '"]');
    var correctOpt = optionsContainer.querySelector('[data-choice="' + correctAnswer + '"]');
    var html = '';

    if (selectedChoice === correctAnswer) {
      // Correct: show just their feedback
      html += '<div style="margin-bottom:12px;"><span style="display:inline-block;background:var(--chartreuse);color:#fff;font-family:var(--font-head);font-size:13px;letter-spacing:2px;padding:4px 12px;margin-bottom:10px;">YOUR ANSWER (CORRECT)</span></div>';
      html += '<div>' + (chosenOpt.getAttribute('data-fb') || '') + '</div>';
    } else {
      // Wrong: show their answer + correct answer
      html += '<div style="margin-bottom:16px;"><span style="display:inline-block;background:var(--red);color:#fff;font-family:var(--font-head);font-size:13px;letter-spacing:2px;padding:4px 12px;margin-bottom:10px;">YOUR ANSWER: ' + selectedChoice + '</span></div>';
      html += '<div style="margin-bottom:18px;">' + (chosenOpt.getAttribute('data-fb') || '') + '</div>';
      html += '<div style="border-top:1px solid rgba(255,255,255,0.25);padding-top:14px;margin-top:14px;">';
      html += '<span style="display:inline-block;background:var(--chartreuse);color:#fff;font-family:var(--font-head);font-size:13px;letter-spacing:2px;padding:4px 12px;margin-bottom:10px;">CORRECT ANSWER: ' + correctAnswer + '</span></div>';
      html += '<div>' + (correctOpt.getAttribute('data-fb') || '') + '</div>';
    }
    return html;
  }

  /* ══════════════════════════════════════════════════════════════
     TASK 2 & 4: Knowledge Check quiz interaction (2 attempts, feedback fix)
     ══════════════════════════════════════════════════════════════ */

  document.querySelectorAll('.kc-options[data-qnum]').forEach(function(kcContainer) {
    var correctAnswer = kcContainer.getAttribute('data-correct');
    var qnum = kcContainer.getAttribute('data-qnum');
    var opts = kcContainer.querySelectorAll('.kc-opt');
    var quizQ = kcContainer.closest('.quiz-q') || kcContainer.closest('.kc-question');
    var submitBtn = kcContainer.parentElement.querySelector('.submit-btn');
    var containerKey = 'kc-' + qnum;
    var selectedAnswer = null;
    var MAX_ATTEMPTS = 2;

    // Initialize attempts tracking
    if (!window.courseData.submissions[containerKey]) {
      window.courseData.submissions[containerKey] = { attempts: 0, disabledChoices: [] };
    }

    // Defensive getter: always ensures a valid state object with all required fields
    function getState() {
      if (!window.courseData.submissions[containerKey]) {
        window.courseData.submissions[containerKey] = {};
      }
      var s = window.courseData.submissions[containerKey];
      if (typeof s.attempts !== 'number') s.attempts = 0;
      if (!Array.isArray(s.disabledChoices)) s.disabledChoices = [];
      return s;
    }

    // Restore visual state if previously completed
    var initState = getState();
    var isAlreadyComplete = false;
    if (initState.selected) {
      isAlreadyComplete = true;
      opts.forEach(function(o) {
        var ans = o.getAttribute('data-answer');
        if (ans === initState.selected) {
          if (ans === correctAnswer) { o.classList.add('correct'); }
          else { o.classList.add('incorrect'); }
        }
        if (ans === correctAnswer && initState.selected !== correctAnswer) { o.classList.add('correct'); }
      });
      kcContainer.classList.add('locked');
      if (submitBtn) {
        submitBtn.classList.remove('ready');
        submitBtn.classList.add('submitted');
        submitBtn.textContent = initState.selected === correctAnswer ? 'CORRECT \u2713' : 'SUBMITTED \u2713';
        submitBtn.disabled = true;
      }
      showKcFeedback(kcContainer, initState.selected, correctAnswer);
      if (quizQ) {
        var nextBtn2 = quizQ.querySelector('[data-quiz-next]');
        if (nextBtn2) nextBtn2.style.display = 'inline-block';
      }
    }

    // Restore partial state (attempt 1 used, not yet completed)
    if (!isAlreadyComplete && initState.attempts > 0 && !initState.selected) {
      if (initState.disabledChoices) {
        initState.disabledChoices.forEach(function(ans) {
          var opt = kcContainer.querySelector('[data-answer="' + ans + '"]');
          if (opt) {
            opt.classList.add('disabled-choice');
            opt.style.pointerEvents = 'none';
          }
        });
      }
    }

    opts.forEach(function(opt) {
      opt.addEventListener('click', function() {
        if (kcContainer.classList.contains('locked')) return;
        if (opt.classList.contains('disabled-choice')) return;
        opts.forEach(function(o) {
          if (!o.classList.contains('disabled-choice')) {
            o.classList.remove('selected');
          }
          o.setAttribute('aria-checked', 'false');
        });
        opt.classList.add('selected');
        opt.setAttribute('aria-checked', 'true');
        selectedAnswer = opt.getAttribute('data-answer');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.add('ready'); }
      });
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!selectedAnswer || kcContainer.classList.contains('locked')) return;

        var state = getState();
        state.attempts++;

        if (selectedAnswer === correctAnswer) {
          // CORRECT on any attempt
          opts.forEach(function(o) { o.classList.remove('selected'); });
          var chosenOpt = kcContainer.querySelector('[data-answer="' + selectedAnswer + '"]');
          chosenOpt.classList.add('correct');

          kcContainer.classList.add('locked');
          submitBtn.classList.remove('ready');
          submitBtn.classList.add('submitted');
          submitBtn.textContent = 'CORRECT \u2713';
          submitBtn.disabled = true;

          state.selected = selectedAnswer;
          saveSubmissions();
          if (window.recalcQuizScore) window.recalcQuizScore();

          showKcFeedback(kcContainer, selectedAnswer, correctAnswer);

          if (quizQ) {
            var nextBtn = quizQ.querySelector('[data-quiz-next]');
            if (nextBtn) nextBtn.style.display = 'inline-block';
          }
        } else if (state.attempts < MAX_ATTEMPTS) {
          // FIRST WRONG: hint, disable wrong option, allow retry
          var chosenOpt = kcContainer.querySelector('[data-answer="' + selectedAnswer + '"]');
          chosenOpt.classList.remove('selected');
          chosenOpt.classList.add('incorrect', 'disabled-choice');
          chosenOpt.style.pointerEvents = 'none';

          if (!state.disabledChoices) state.disabledChoices = [];
          state.disabledChoices.push(selectedAnswer);
          saveSubmissions();

          showAttemptHint(kcContainer, 'Incorrect \u2014 try again. 1 attempt remaining.');

          submitBtn.disabled = true;
          submitBtn.classList.remove('ready');
          selectedAnswer = null;
        } else {
          // SECOND WRONG: lock, reveal, feedback
          opts.forEach(function(o) { o.classList.remove('selected'); });
          var chosenOpt = kcContainer.querySelector('[data-answer="' + selectedAnswer + '"]');
          chosenOpt.classList.add('incorrect');
          opts.forEach(function(o) {
            if (o.getAttribute('data-answer') === correctAnswer) o.classList.add('correct');
          });

          kcContainer.classList.add('locked');
          submitBtn.classList.remove('ready');
          submitBtn.classList.add('submitted');
          submitBtn.textContent = 'SUBMITTED \u2713';
          submitBtn.disabled = true;

          state.selected = selectedAnswer;
          saveSubmissions();
          if (window.recalcQuizScore) window.recalcQuizScore();

          removeAttemptHint(kcContainer);
          showKcFeedback(kcContainer, selectedAnswer, correctAnswer);

          if (quizQ) {
            var nextBtn = quizQ.querySelector('[data-quiz-next]');
            if (nextBtn) nextBtn.style.display = 'inline-block';
          }
        }
      });
    }
  });

  /* Show KC feedback panel */
  function showKcFeedback(kcContainer, selectedAnswer, correctAnswer) {
    var kcGrid = kcContainer.closest('.kc-grid');
    if (kcGrid) {
      var fbPanel = kcGrid.querySelector('.kc-feedback');
      if (fbPanel) {
        fbPanel.classList.remove('hidden');
        fbPanel.style.visibility = 'visible';
        fbPanel.style.opacity = '1';
        var head = fbPanel.querySelector('.head');
        if (selectedAnswer === correctAnswer) {
          if (head) { head.style.background = 'var(--chartreuse)'; }
        } else {
          if (head) { head.style.background = 'var(--red)'; }
        }
      }
    }
  }

  /* Show attempt hint below options */
  function showAttemptHint(container, message) {
    removeAttemptHint(container);
    var hint = document.createElement('div');
    hint.className = 'attempt-hint';
    hint.textContent = message;
    // Insert after the container
    container.parentNode.insertBefore(hint, container.nextSibling);
  }

  function removeAttemptHint(container) {
    var existing = container.parentNode.querySelector('.attempt-hint');
    if (existing) existing.remove();
  }

  /* Save submissions to localStorage */
  function saveSubmissions() {
    try {
      localStorage.setItem('courseSubmissions', JSON.stringify(window.courseData.submissions));
    } catch(e) {}
    // Update next button state after any submission change
    if (window.updateNextButtonState) {
      var activeSlide = document.querySelector('.slide.active');
      if (activeSlide) {
        var slideNum = parseInt(activeSlide.getAttribute('data-slide'));
        window.updateNextButtonState(slideNum);
      }
    }
  }

  // Load submissions from localStorage on init
  (function() {
    try {
      var saved = localStorage.getItem('courseSubmissions');
      if (saved) {
        var parsed = JSON.parse(saved);
        // Merge with existing
        for (var key in parsed) {
          if (!window.courseData.submissions[key] || !window.courseData.submissions[key].selected) {
            window.courseData.submissions[key] = parsed[key];
          }
        }
      }
    } catch(e) {}
  })();

  /* ── Quiz navigation (KC1 multi-question) ── */
  document.querySelectorAll('[data-quiz-next]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var targetQ = btn.getAttribute('data-quiz-next');
      var container = btn.closest('[id]') || btn.closest('.kc-grid');
      if (container) {
        container.querySelectorAll('.quiz-q').forEach(function(q) { q.classList.remove('active'); });
        var target = container.querySelector('.quiz-q[data-q="' + targetQ + '"]');
        if (target) target.classList.add('active');
      }
    });
  });

  /* ── Objective cards expand ── */
  document.querySelectorAll('.obj-card').forEach(function(card) {
    card.addEventListener('click', function() {
      card.classList.toggle('expanded');
    });
  });

  /* ── MAP form input clear-on-focus ── */
  document.querySelectorAll('.map-field .input[contenteditable], [contenteditable="true"]').forEach(function(input) {
    var original = input.textContent;
    input.addEventListener('focus', function() {
      if (input.textContent === original) {
        input.textContent = '';
        input.style.color = 'var(--ink)';
        input.style.fontStyle = 'normal';
      }
    });
    input.addEventListener('blur', function() {
      if (input.textContent.trim() === '') {
        input.textContent = original;
        input.style.color = '#888';
        input.style.fontStyle = 'italic';
      }
      // Update next button after typing in reflection/MAP
      if (window.updateNextButtonState) {
        var activeSlide = document.querySelector('.slide.active');
        if (activeSlide) window.updateNextButtonState(parseInt(activeSlide.getAttribute('data-slide')));
      }
    });
    input.addEventListener('input', function() {
      if (window.updateNextButtonState) {
        var activeSlide = document.querySelector('.slide.active');
        if (activeSlide) window.updateNextButtonState(parseInt(activeSlide.getAttribute('data-slide')));
      }
    });
  });

  /* ── Submit Reflection button (slide 17) ── */
  var reflectBtn = document.getElementById('submitReflectionBtn');
  if (reflectBtn) {
    reflectBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      var slide17 = document.querySelector('[data-slide="17"]');
      var input = slide17 ? slide17.querySelector('.input[contenteditable]') : null;
      var text = input ? input.textContent.trim() : '';
      if (!text || text === 'Type your reflection here...') {
        showWarningToast('Please type your reflection before submitting.');
        return;
      }
      // Save reflection to localStorage
      try {
        localStorage.setItem('guide01_reflection', text);
      } catch(ex) {}
      // Visual confirmation
      reflectBtn.textContent = 'SUBMITTED ✓';
      reflectBtn.style.background = 'var(--chartreuse)';
      reflectBtn.style.pointerEvents = 'none';
      // Update next button state
      if (window.updateNextButtonState) window.updateNextButtonState(17);
      // Advance to next slide after a brief pause
      setTimeout(function() { goSlide(18); }, 800);
    });
  }

  /* ── Start button on slide 1 ── */
  document.querySelectorAll('.start-bar .cta').forEach(function(btn) {
    btn.addEventListener('click', function() {
      goSlide(2);
    });
  });

  /* ══════════════════════════════════════════════════════════════
     TASK 5: Side Menu Navigation with linear progression lock
     ══════════════════════════════════════════════════════════════ */

  var menuSlides = [
    {n:1, name:'Welcome', screen:'1.1'},
    {n:2, name:'Learning Objectives', screen:'1.2'},
    {n:3, name:'Why This Matters: The Stat', screen:'1.3A'},
    {n:4, name:'Impact: Missed Care', screen:'1.3B'},
    {n:5, name:'Impact: Communication Gap', screen:'1.3C'},
    {n:6, name:'Impact: Avoidance', screen:'1.3D'},
    {n:7, name:'Models of Disability', screen:'1.4'},
    {n:8, name:'Accessibility in Practice Model', screen:'1.5'},
    {n:9, name:'Accessibility Decision Path', screen:'1.6'},
    {n:10, name:'Scenario 1: Hospital Booking', screen:'1.7'},
    {n:11, name:'Scenario 2: Clinic Signage', screen:'1.8'},
    {n:12, name:'Scenario 3: Employee Awareness', screen:'1.9'},
    {n:13, name:'Knowledge Check 1', screen:'1.10'},
    {n:14, name:'Knowledge Check 2', screen:'1.11'},
    {n:15, name:'Knowledge Check 3', screen:'1.12'},
    {n:16, name:'Inclusive Practice Tips', screen:'1.13'},
    {n:17, name:'Reflection Prompt', screen:'1.14'},
    {n:18, name:'MAP Action Planning', screen:'1.15'},
    {n:19, name:'Key Takeaways', screen:'1.16'},
    {n:20, name:'Listen & Reflect (Podcast)', screen:'1.17'},
    {n:21, name:'Decision Tree Activity', screen:'1.18'},
    {n:22, name:'Series Progress Map', screen:'1.19'},
    {n:23, name:'Resources & Completion', screen:'1.20'},
  ];

  function buildMenu(){
    var list = document.querySelector('.sm-list');
    if(!list) return;
    list.innerHTML = '';
    menuSlides.forEach(function(s){
      var unlocked = isSlideUnlocked(s.n);
      var visited = window.courseData.visitedSlides.indexOf(s.n) !== -1;
      var isCurrent = s.n === current;

      var btn = document.createElement('button');
      btn.className = 'sm-item';
      if (isCurrent) btn.classList.add('active');
      if (!unlocked) btn.classList.add('locked');
      if (visited && !isCurrent) btn.classList.add('visited');
      btn.setAttribute('data-menu-slide', s.n);

      var lockIcon = !unlocked ? '<span class="sm-lock" aria-hidden="true">&#x1F512;</span>' : '';
      btn.innerHTML = '<span class="sm-num">' + s.n + '</span><span class="sm-name">' + s.name + '</span>' + lockIcon + '<span class="sm-status">' + s.screen + '</span>';

      if (unlocked) {
        btn.onclick = function(){ goSlide(s.n); closeMenu(); };
      } else {
        btn.onclick = function(e){ e.preventDefault(); };
        btn.setAttribute('aria-disabled', 'true');
      }
      list.appendChild(btn);
    });
  }

  function openMenu(){
    document.body.classList.add('nav-open');
    buildMenu();
    setTimeout(function() {
      var closeBtn = document.querySelector('.sm-close');
      if (closeBtn) closeBtn.focus();
    }, 50);
  }
  function closeMenu(){ document.body.classList.remove('nav-open'); }
  window.openMenu = openMenu;
  window.closeMenu = closeMenu;

  /* ── Screen reader announcement helper ── */
  function announceToSR(message) {
    var el = document.getElementById('sr-announce');
    if (!el) return;
    el.textContent = '';
    setTimeout(function() { el.textContent = message; }, 100);
  }
  window.announceToSR = announceToSR;

  function getSlideName(n) {
    for (var i = 0; i < menuSlides.length; i++) {
      if (menuSlides[i].n === n) return menuSlides[i].name;
    }
    return 'Slide ' + n;
  }

  // Update menu active state when slide changes
  var origGoSlide = window.goSlide;
  window.goSlide = function(n){
    var prevCurrent = current;

    // Show warning if trying to advance on an incomplete interactive slide
    if (n > prevCurrent && interactiveSlides[prevCurrent] && !isSlideInteractionComplete(prevCurrent)) {
      showWarningToast('Please complete the activity on this slide before continuing.');
    }

    origGoSlide(n);
    // Check if slide actually changed (inner goSlide may have blocked)
    var activeEl = document.querySelector('.slide.active');
    var actualN = activeEl ? parseInt(activeEl.getAttribute('data-slide')) : prevCurrent;
    if (actualN === prevCurrent && n !== prevCurrent) return; // blocked
    current = actualN;
    n = actualN;
    var items = document.querySelectorAll('.sm-item');
    items.forEach(function(el){
      var sn = parseInt(el.getAttribute('data-menu-slide'));
      el.classList.toggle('active', sn === n);
    });
    var fill = document.querySelector('.sm-progress-fill');
    if(fill) fill.style.width = Math.round((n/total)*100) + '%';
    var txt = document.querySelector('.sm-progress-text');
    if(txt) txt.textContent = n + ' / ' + total;

    var name = getSlideName(n);
    announceToSR('Slide ' + n + ' of ' + total + ': ' + name);

    var activeSlide = document.querySelector('.slide.active');
    if (activeSlide) {
      activeSlide.setAttribute('tabindex', '-1');
      activeSlide.focus({ preventScroll: true });
    }
  };

  /* Exit button removed from footer — results page has EXIT in button row */

  /* ── Focus trapping within active slide ── */
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    if (document.body.classList.contains('nav-open')) {
      var menu = document.querySelector('.side-menu');
      if (!menu) return;
      var focusable = menu.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      return;
    }
    var activeSlide = document.querySelector('.slide.active');
    if (!activeSlide) return;
    var slideFocusable = Array.prototype.slice.call(
      activeSlide.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [contenteditable="true"], [tabindex]:not([tabindex="-1"]), .option, .kc-opt, .tab-btn, .acc-header, .step, .myth-card, .g-card, .risk-card')
    );
    var voControls = document.getElementById('voControls');
    if (voControls && !voControls.classList.contains('hidden')) {
      var voFocusable = voControls.querySelectorAll('button:not([disabled]), input');
      slideFocusable = slideFocusable.concat(Array.prototype.slice.call(voFocusable));
    }
    if (slideFocusable.length === 0) return;
    var first = slideFocusable[0];
    var last = slideFocusable[slideFocusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first || !slideFocusable.includes(document.activeElement)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last || !slideFocusable.includes(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ── Reset Quiz UI (called from course-tracker.js retryQuiz) ── */
  window.resetQuizUI = function() {
    // Reset all scenario containers
    document.querySelectorAll('.options[data-correct]').forEach(function(optionsContainer) {
      var overlayId = optionsContainer.getAttribute('data-overlay');
      var correctAnswer = optionsContainer.getAttribute('data-correct');
      var containerKey = overlayId || correctAnswer + '-' + Array.prototype.indexOf.call(document.querySelectorAll('.options[data-correct]'), optionsContainer);

      // Remove disabled-choice class and restore pointer-events on ALL options
      var opts = optionsContainer.querySelectorAll('.option');
      opts.forEach(function(o) {
        o.classList.remove('disabled-choice', 'correct', 'incorrect', 'sel', 'selected', 'submitted');
        o.style.pointerEvents = '';
        o.setAttribute('aria-checked', 'false');
      });

      // Remove attempt hints
      var hint = optionsContainer.parentNode.querySelector('.attempt-hint');
      if (hint) hint.remove();

      // Remove locked state
      optionsContainer.classList.remove('locked');

      // Reset submit button
      var submitBtn = optionsContainer.parentElement.querySelector('.submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.remove('ready', 'submitted');
        submitBtn.textContent = 'CONFIRM CHOICE';
      }

      // Re-initialize the submission state so closures pick up the new object
      window.courseData.submissions[containerKey] = { attempts: 0, disabledChoices: [] };
    });

    // Reset all KC containers
    document.querySelectorAll('.kc-options[data-qnum]').forEach(function(kcContainer) {
      var qnum = kcContainer.getAttribute('data-qnum');
      var containerKey = 'kc-' + qnum;

      // Remove disabled-choice class and restore pointer-events on ALL options
      var opts = kcContainer.querySelectorAll('.kc-opt');
      opts.forEach(function(o) {
        o.classList.remove('disabled-choice', 'correct', 'incorrect', 'selected', 'submitted');
        o.style.pointerEvents = '';
        o.setAttribute('aria-checked', 'false');
      });

      // Remove attempt hints
      var hint = kcContainer.parentNode.querySelector('.attempt-hint');
      if (hint) hint.remove();

      // Remove locked state
      kcContainer.classList.remove('locked');

      // Reset submit button
      var submitBtn = kcContainer.parentElement.querySelector('.submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.remove('ready', 'submitted');
        submitBtn.textContent = 'SUBMIT ANSWER';
      }

      // Hide feedback panels
      var kcGrid = kcContainer.closest('.kc-grid');
      if (kcGrid) {
        var fbPanel = kcGrid.querySelector('.kc-feedback');
        if (fbPanel) {
          fbPanel.classList.add('hidden');
          fbPanel.style.visibility = '';
          fbPanel.style.opacity = '';
        }
      }

      // Re-initialize the submission state so closures pick up the new object
      window.courseData.submissions[containerKey] = { attempts: 0, disabledChoices: [] };
    });

    // Hide all scenario feedback overlays
    document.querySelectorAll('.feedback-overlay').forEach(function(fb) {
      fb.classList.remove('show');
    });
  };

  /* ── Enter/Space on interactive elements ── */
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = e.target;
    if (!el) return;
    if (el.classList.contains('option') || el.classList.contains('kc-opt') ||
        el.classList.contains('myth-card') || el.classList.contains('g-card') ||
        el.classList.contains('risk-card') || el.classList.contains('step') ||
        el.classList.contains('acc-header') || el.classList.contains('obj-card') ||
        el.classList.contains('spoke-card')) {
      e.preventDefault();
      el.click();
    }
  });

  /* ══════════════════════════════════════════════════════════════
     Deferred visual sync: re-apply visual state from submissions
     after all scripts (welcome-dialog, course-tracker, SCORM) have
     had a chance to restore state from localStorage / LMS.
     This runs once on DOMContentLoaded + a short delay, and also
     exposes syncVisualState() for external callers.
     ══════════════════════════════════════════════════════════════ */
  function syncVisualState() {
    // Sync scenario containers
    document.querySelectorAll('.options[data-correct]').forEach(function(optionsContainer) {
      var correctAnswer = optionsContainer.getAttribute('data-correct');
      var overlayId = optionsContainer.getAttribute('data-overlay');
      var containerKey = overlayId || correctAnswer + '-' + Array.prototype.indexOf.call(document.querySelectorAll('.options[data-correct]'), optionsContainer);
      var state = window.courseData.submissions[containerKey];
      if (!state || !state.selected) return;
      // Already visually locked — skip
      if (optionsContainer.classList.contains('locked')) return;

      var options = optionsContainer.querySelectorAll('.option');
      var submitBtn = optionsContainer.parentElement.querySelector('.submit-btn');

      options.forEach(function(o) {
        var ch = o.getAttribute('data-choice');
        if (ch === state.selected) {
          if (ch === correctAnswer) { o.classList.add('correct'); }
          else { o.classList.add('incorrect'); }
        }
        if (ch === correctAnswer && state.selected !== correctAnswer) { o.classList.add('correct'); }
      });
      optionsContainer.classList.add('locked');
      if (submitBtn) {
        submitBtn.classList.remove('ready');
        submitBtn.classList.add('submitted');
        submitBtn.textContent = state.selected === correctAnswer ? 'CORRECT \u2713' : 'SUBMITTED \u2713';
        submitBtn.disabled = true;
      }
    });

    // Sync KC containers
    document.querySelectorAll('.kc-options[data-qnum]').forEach(function(kcContainer) {
      var correctAnswer = kcContainer.getAttribute('data-correct');
      var qnum = kcContainer.getAttribute('data-qnum');
      var containerKey = 'kc-' + qnum;
      var state = window.courseData.submissions[containerKey];
      if (!state || !state.selected) return;
      if (kcContainer.classList.contains('locked')) return;

      var opts = kcContainer.querySelectorAll('.kc-opt');
      var submitBtn = kcContainer.parentElement.querySelector('.submit-btn');

      opts.forEach(function(o) {
        var ans = o.getAttribute('data-answer');
        if (ans === state.selected) {
          if (ans === correctAnswer) { o.classList.add('correct'); }
          else { o.classList.add('incorrect'); }
        }
        if (ans === correctAnswer && state.selected !== correctAnswer) { o.classList.add('correct'); }
      });
      kcContainer.classList.add('locked');
      if (submitBtn) {
        submitBtn.classList.remove('ready');
        submitBtn.classList.add('submitted');
        submitBtn.textContent = state.selected === correctAnswer ? 'CORRECT \u2713' : 'SUBMITTED \u2713';
        submitBtn.disabled = true;
      }
      showKcFeedback(kcContainer, state.selected, correctAnswer);
    });
  }
  window.syncVisualState = syncVisualState;

  // Run deferred sync after all scripts have loaded and state has been restored
  window.addEventListener('load', function() {
    setTimeout(syncVisualState, 200);
  });

})();
