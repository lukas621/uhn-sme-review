/* ══════════════════════════════════════════════════════════════
   Welcome Dialog
   - First visit: name/role fields + BEGIN GUIDE
   - Returning visit: skip name entry, show RESUME + START OVER
   ══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  var STORAGE_KEY = 'guide01_user';
  var overlay = document.getElementById('welcomeOverlay');
  var nameInput = document.getElementById('welcomeName');
  var roleInput = document.getElementById('welcomeRole');
  var startBtn = document.getElementById('welcomeStartBtn');
  var resumeBtn = document.getElementById('welcomeResumeBtn');

  if (!overlay || !nameInput || !roleInput || !startBtn) return;

  window.welcomeDialogOpen = true;

  // Check for returning user
  var savedUser = null;
  var savedSlide = null;
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) savedUser = JSON.parse(raw);
  } catch (e) {}

  try {
    var progressRaw = localStorage.getItem('guide01_progress');
    if (progressRaw) {
      var progress = JSON.parse(progressRaw);
      if (progress.currentSlide && progress.currentSlide > 1) {
        savedSlide = progress.currentSlide;
      }
    }
  } catch (e) {}

  function saveUser() {
    var userData = {
      name: nameInput.value.trim(),
      role: roleInput.value.trim(),
      lastVisit: new Date().toISOString()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (e) {}
    window.learnerName = userData.name;
    window.learnerRole = userData.role;
  }

  function dismissDialog() {
    overlay.classList.add('hidden');
    window.welcomeDialogOpen = false;
    var certName = document.querySelector('.cert-learner-name');
    if (certName && window.learnerName) {
      certName.value = window.learnerName;
    }
  }

  function resetProgress() {
    localStorage.removeItem('guide01_progress');
    localStorage.removeItem('courseVisitedSlides');
    localStorage.removeItem('courseSubmissions');
    localStorage.removeItem('guide01_map_responses');
    if (window.courseData) {
      window.courseData.visitedSlides = [1];
      window.courseData.submissions = {};
      window.courseData.quizScore = 0;
      window.courseData.quizPassed = false;
      window.courseData.mapCompleted = false;
      window.courseData.courseCompleted = false;
      window.courseData.completionDate = null;
      window.courseData.timeSpent = 0;
      window.courseData.currentSlide = 1;
    }
  }

  function restoreState() {
    try {
      var visitedRaw = localStorage.getItem('courseVisitedSlides');
      if (visitedRaw && window.courseData) {
        window.courseData.visitedSlides = JSON.parse(visitedRaw);
      }
    } catch (e) {}
    try {
      var subsRaw = localStorage.getItem('courseSubmissions');
      if (subsRaw && window.courseData) {
        var restoredSubs = JSON.parse(subsRaw);
        if (!window.courseData.submissions) window.courseData.submissions = {};
        for (var sk in restoredSubs) {
          window.courseData.submissions[sk] = restoredSubs[sk];
        }
      }
    } catch (e) {}
  }

  // ── RETURNING USER: skip name entry, show resume/start over ──
  if (savedUser && savedUser.name && savedSlide) {
    window.learnerName = savedUser.name;
    window.learnerRole = savedUser.role || '';

    // Replace the entire dialog content
    var card = overlay.querySelector('.welcome-card');
    card.innerHTML =
      '<img class="welcome-logo" src="assets/uhn-logo-dark.png" alt="UHN">' +
      '<div class="welcome-eyebrow">ACCESSIBILITY FIRST SERIES</div>' +
      '<h2>Welcome back, <span class="accent">' + savedUser.name + '</span></h2>' +
      '<p class="welcome-sub">Guide 01: Foundations of Disability, Inclusion &amp; Accessible Design</p>' +
      '<div style="display:flex; flex-direction:column; gap:12px; margin-top:24px;">' +
        '<button id="welcomeResumeBtn2" class="welcome-resume-btn">RESUME \u2014 SLIDE ' + savedSlide + '</button>' +
        '<button id="welcomeStartOverBtn" class="welcome-start-btn" style="background:transparent; color:var(--navy,#192858); border:2px solid var(--navy,#192858);">START OVER</button>' +
      '</div>';

    // Wire resume
    document.getElementById('welcomeResumeBtn2').addEventListener('click', function() {
      restoreState();
      dismissDialog();
      if (window.syncVisualState) window.syncVisualState();
      if (window.goSlide) window.goSlide(savedSlide);
    });

    // Wire start over — full reset and reload
    document.getElementById('welcomeStartOverBtn').addEventListener('click', function() {
      resetProgress();
      window.location.reload();
    });

    return;
  }

  // ── FIRST-TIME USER: show name/role fields + BEGIN ──
  // Hide resume button (not needed for first visit)
  if (resumeBtn) resumeBtn.style.display = 'none';

  function validate() {
    var valid = true;
    if (!nameInput.value.trim()) {
      nameInput.classList.add('error');
      valid = false;
    } else {
      nameInput.classList.remove('error');
    }
    if (!roleInput.value.trim()) {
      roleInput.classList.add('error');
      valid = false;
    } else {
      roleInput.classList.remove('error');
    }
    return valid;
  }

  startBtn.addEventListener('click', function() {
    if (!validate()) return;
    saveUser();
    dismissDialog();
  });

  // Enter key
  nameInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); roleInput.focus(); }
  });
  roleInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); startBtn.click(); }
  });

  nameInput.addEventListener('input', function() { nameInput.classList.remove('error'); });
  roleInput.addEventListener('input', function() { roleInput.classList.remove('error'); });

  setTimeout(function() { nameInput.focus(); }, 100);

})();
