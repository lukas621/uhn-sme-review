/* ══════════════════════════════════════════════════════════════
   SCORM 1.2 API Wrapper
   Handles communication between the course and the LMS.
   Uses window.courseData from course-tracker.js.
   ══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  var api = null;
  var initialized = false;

  // ── Find the SCORM API object ──
  function findAPI(win) {
    var attempts = 0;
    while ((!win.API) && (win.parent) && (win.parent !== win) && (attempts < 10)) {
      win = win.parent;
      attempts++;
    }
    return win.API || null;
  }

  function getAPI() {
    if (api) return api;
    api = findAPI(window);
    if (!api && window.opener) {
      api = findAPI(window.opener);
    }
    return api;
  }

  // ── Initialize SCORM session ──
  function initialize() {
    var a = getAPI();
    if (!a) {
      console.log('SCORM API not found — running in standalone mode');
      return false;
    }
    var result = a.LMSInitialize('');
    initialized = (result === 'true' || result === true);
    if (initialized) {
      console.log('SCORM initialized');
      // Restore bookmark if available
      var bookmark = a.LMSGetValue('cmi.core.lesson_location');
      if (bookmark && window.courseData) {
        window.courseData.bookmarkSlide = parseInt(bookmark) || 1;
      }
    }
    return initialized;
  }

  // ── Set a SCORM value ──
  function setValue(key, value) {
    var a = getAPI();
    if (!a || !initialized) return false;
    return a.LMSSetValue(key, String(value));
  }

  // ── Get a SCORM value ──
  function getValue(key) {
    var a = getAPI();
    if (!a || !initialized) return '';
    return a.LMSGetValue(key);
  }

  // ── Commit data to LMS ──
  function commit() {
    var a = getAPI();
    if (!a || !initialized) return false;
    return a.LMSCommit('');
  }

  // ── Terminate SCORM session ──
  function terminate() {
    var a = getAPI();
    if (!a || !initialized) return false;
    var result = a.LMSFinish('');
    initialized = false;
    return result;
  }

  // ── Sync courseData to SCORM ──
  function syncToLMS() {
    if (!initialized || !window.courseData) return;

    var data = window.courseData;

    // Lesson location (bookmark)
    setValue('cmi.core.lesson_location', String(data.currentSlide));

    // Lesson status
    if (data.courseCompleted) {
      setValue('cmi.core.lesson_status', 'completed');
    } else {
      setValue('cmi.core.lesson_status', 'incomplete');
    }

    // Score
    if (data.quizTotal > 0) {
      var scaledScore = Math.round((data.quizScore / data.quizTotal) * 100);
      setValue('cmi.core.score.raw', String(scaledScore));
      setValue('cmi.core.score.min', '0');
      setValue('cmi.core.score.max', '100');
    }

    // Session time (HH:MM:SS format)
    var totalSec = data.timeSpent || 0;
    var hrs = Math.floor(totalSec / 3600);
    var mins = Math.floor((totalSec % 3600) / 60);
    var secs = totalSec % 60;
    var timeStr = String(hrs).padStart(4, '0') + ':' +
                  String(mins).padStart(2, '0') + ':' +
                  String(secs).padStart(2, '0');
    setValue('cmi.core.session_time', timeStr);

    // Suspend data (full state for resume)
    try {
      var suspendData = JSON.stringify({
        visitedSlides: data.visitedSlides,
        quizScore: data.quizScore,
        submissions: data.submissions,
        mapCompleted: data.mapCompleted,
        timeSpent: data.timeSpent
      });
      setValue('cmi.suspend_data', suspendData);
    } catch (e) {
      console.warn('Could not save suspend_data:', e);
    }

    commit();
  }

  // ── Restore from SCORM suspend data ──
  function restoreFromLMS() {
    if (!initialized || !window.courseData) return false;

    var raw = getValue('cmi.suspend_data');
    if (!raw) return false;

    try {
      var saved = JSON.parse(raw);
      if (saved.visitedSlides) window.courseData.visitedSlides = saved.visitedSlides;
      if (saved.quizScore !== undefined) window.courseData.quizScore = saved.quizScore;
      if (saved.submissions) {
        if (!window.courseData.submissions) window.courseData.submissions = {};
        for (var sk in saved.submissions) {
          window.courseData.submissions[sk] = saved.submissions[sk];
        }
      }
      if (saved.mapCompleted !== undefined) window.courseData.mapCompleted = saved.mapCompleted;
      if (saved.timeSpent !== undefined) window.courseData.timeSpent = saved.timeSpent;
      return true;
    } catch (e) {
      console.warn('Could not restore suspend_data:', e);
      return false;
    }
  }

  // ── Public API ──
  window.SCORM = {
    initialize: initialize,
    syncToLMS: syncToLMS,
    restoreFromLMS: restoreFromLMS,
    terminate: terminate,
    setValue: setValue,
    getValue: getValue,
    commit: commit,
    isInitialized: function() { return initialized; }
  };

  // ── Auto-initialize on load ──
  window.addEventListener('load', function() {
    initialize();
    restoreFromLMS();
  });

  // ── Auto-sync periodically and on unload ──
  setInterval(function() { syncToLMS(); }, 30000); // every 30 seconds

  window.addEventListener('beforeunload', function() {
    syncToLMS();
    terminate();
  });

})();
