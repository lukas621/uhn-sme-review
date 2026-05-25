// SME Review App — Clean minimal UI
(function() {
  'use strict';

  var currentGuide = 1;
  var reviewerName = localStorage.getItem('sme_reviewer_name') || '';
  var feedbackData = {};
  var activeSlide = null;
  var supabase = null;

  function initSupabase() {
    if (typeof window.supabase !== 'undefined' && SUPABASE_URL && SUPABASE_URL !== 'https://YOUR_PROJECT.supabase.co') {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
      loadFromLocalStorage();
    }
  }

  function loadFromLocalStorage() {
    try { var r = localStorage.getItem('sme_feedback_data'); if (r) feedbackData = JSON.parse(r); } catch(e) {}
  }

  function saveToLocalStorage() {
    try { localStorage.setItem('sme_feedback_data', JSON.stringify(feedbackData)); } catch(e) {}
  }

  async function loadFeedback() {
    if (!supabase) { loadFromLocalStorage(); return; }
    try {
      var { data, error } = await supabase.from(FEEDBACK_TABLE).select('*').eq('guide_id', currentGuide).order('slide_num');
      if (error) throw error;
      feedbackData = {};
      (data || []).forEach(function(row) {
        var key = row.guide_id + '-' + row.slide_num;
        if (!feedbackData[key]) feedbackData[key] = [];
        feedbackData[key].push(row);
      });
    } catch(e) { loadFromLocalStorage(); }
  }

  async function saveFeedback(slideNum, status, comment) {
    var guideMeta = SLIDE_META[currentGuide];
    if (!guideMeta) return;
    var slideMeta = guideMeta.slides.find(function(s) { return s.num === slideNum; });
    if (!slideMeta) return;

    var record = {
      guide_id: currentGuide, slide_num: slideNum, slide_title: slideMeta.title,
      status: status, comment: comment, reviewer: reviewerName,
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        var key = currentGuide + '-' + slideNum;
        var existing = (feedbackData[key] || []).find(function(f) { return f.reviewer === reviewerName; });
        if (existing) await supabase.from(FEEDBACK_TABLE).update(record).eq('id', existing.id);
        else { record.created_at = new Date().toISOString(); await supabase.from(FEEDBACK_TABLE).insert(record); }
      } catch(e) {}
    }

    var key = currentGuide + '-' + slideNum;
    if (!feedbackData[key]) feedbackData[key] = [];
    var idx = feedbackData[key].findIndex(function(f) { return f.reviewer === reviewerName; });
    if (idx >= 0) feedbackData[key][idx] = Object.assign(feedbackData[key][idx], record);
    else { record.created_at = record.created_at || new Date().toISOString(); feedbackData[key].push(record); }
    saveToLocalStorage();
  }

  function getStatus(guideId, slideNum) {
    var entries = feedbackData[guideId + '-' + slideNum] || [];
    return entries.length > 0 ? entries[entries.length - 1].status || 'pending' : 'pending';
  }

  function renderSlideList() {
    var container = document.getElementById('slideList');
    if (!container) return;
    var guideMeta = SLIDE_META[currentGuide];
    if (!guideMeta) return;

    var html = '';
    guideMeta.slides.forEach(function(slide) {
      var status = getStatus(currentGuide, slide.num);
      var isActive = activeSlide === slide.num;
      var key = currentGuide + '-' + slide.num;
      var entries = feedbackData[key] || [];
      var myEntry = entries.find(function(e) { return e.reviewer === reviewerName; });

      html += '<div class="slide-card ' + (isActive ? 'active ' : '') + 'status-' + status + '" data-slide="' + slide.num + '">';
      html += '  <div class="num">' + slide.num + '</div>';
      html += '  <div class="info">';
      html += '    <div class="title">' + slide.title + '</div>';
      html += '    <div class="meta">Screen ' + slide.screen + ' · ' + slide.type + '</div>';
      html += '  </div>';
      html += '  <div class="status-indicator dot-' + status + '"></div>';

      // Feedback form
      html += '  <div class="slide-feedback">';
      html += '    <div class="status-buttons">';
      html += '      <button class="status-btn' + (myEntry && myEntry.status === 'approved' ? ' selected-approved' : '') + '" data-status="approved">Approved</button>';
      html += '      <button class="status-btn' + (myEntry && myEntry.status === 'needs_changes' ? ' selected-needs_changes' : '') + '" data-status="needs_changes">Needs Changes</button>';
      html += '      <button class="status-btn' + (myEntry && myEntry.status === 'flagged' ? ' selected-flagged' : '') + '" data-status="flagged">Flagged</button>';
      html += '    </div>';
      html += '    <textarea class="comment-box" placeholder="Leave your feedback...">' + (myEntry && myEntry.comment ? myEntry.comment : '') + '</textarea>';
      html += '    <button class="save-btn" data-slide="' + slide.num + '">Save</button>';

      if (entries.length > 0) {
        html += '    <div class="previous-feedback"><h4>History</h4>';
        entries.forEach(function(entry) {
          html += '      <div class="prev-comment">' + (entry.comment || '<em>No comment</em>');
          html += '        <div class="meta-line">' + entry.reviewer + ' · ' + (entry.status || 'pending').replace('_', ' ') + ' · ' + new Date(entry.updated_at || entry.created_at).toLocaleDateString() + '</div>';
          html += '      </div>';
        });
        html += '    </div>';
      }

      html += '  </div>';
      html += '</div>';
    });

    container.innerHTML = html;
    updateSummary();
    wireCards();
  }

  function updateSummary() {
    var guideMeta = SLIDE_META[currentGuide];
    if (!guideMeta) return;
    var c = { approved: 0, needs_changes: 0, flagged: 0, pending: 0 };
    guideMeta.slides.forEach(function(s) { var st = getStatus(currentGuide, s.num); c[st] = (c[st] || 0) + 1; });
    var el;
    el = document.getElementById('summaryApproved'); if (el) el.textContent = c.approved;
    el = document.getElementById('summaryChanges'); if (el) el.textContent = c.needs_changes;
    el = document.getElementById('summaryFlagged'); if (el) el.textContent = c.flagged;
    el = document.getElementById('summaryPending'); if (el) el.textContent = c.pending;
  }

  function wireCards() {
    document.querySelectorAll('.slide-card').forEach(function(card) {
      card.addEventListener('click', function(e) {
        if (e.target.closest('.slide-feedback') && !e.target.classList.contains('slide-card')) return;
        var n = parseInt(card.getAttribute('data-slide'));
        activeSlide = activeSlide === n ? null : n;
        renderSlideList();
      });
    });

    document.querySelectorAll('.status-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var card = btn.closest('.slide-card');
        card.querySelectorAll('.status-btn').forEach(function(b) { b.className = 'status-btn'; });
        btn.classList.add('selected-' + btn.getAttribute('data-status'));
      });
    });

    document.querySelectorAll('.save-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var card = btn.closest('.slide-card');
        var slideNum = parseInt(btn.getAttribute('data-slide'));
        var selBtn = card.querySelector('.status-btn[class*="selected-"]');
        var comment = card.querySelector('.comment-box').value.trim();

        if (!selBtn) { alert('Please select a status'); return; }
        var status = selBtn.getAttribute('data-status');

        if (!reviewerName) {
          reviewerName = prompt('Enter your name:');
          if (!reviewerName) return;
          localStorage.setItem('sme_reviewer_name', reviewerName);
          document.getElementById('reviewerInput').value = reviewerName;
        }

        saveFeedback(slideNum, status, comment).then(function() {
          btn.textContent = 'Saved ✓';
          btn.classList.add('saved');
          setTimeout(function() { btn.textContent = 'Save'; btn.classList.remove('saved'); renderSlideList(); }, 1200);
        });
      });
    });
  }

  function wireGuideSelector() {
    var sel = document.getElementById('guideSelector');
    if (!sel) return;
    for (var gid in SLIDE_META) {
      var opt = document.createElement('option');
      opt.value = gid;
      opt.textContent = SLIDE_META[gid].title;
      sel.appendChild(opt);
    }
    sel.addEventListener('change', function() {
      currentGuide = parseInt(sel.value);
      loadFeedback().then(renderSlideList);
    });
  }

  function wireReviewerInput() {
    var input = document.getElementById('reviewerInput');
    if (!input) return;
    input.value = reviewerName;
    input.addEventListener('change', function() {
      reviewerName = input.value.trim();
      localStorage.setItem('sme_reviewer_name', reviewerName);
    });
  }

  function init() {
    initSupabase();
    wireGuideSelector();
    wireReviewerInput();
    loadFeedback().then(renderSlideList);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
