/* ── Voiceover + Closed Captions Engine ── */
(function(){
  var audio = document.getElementById('voAudio');
  var playBtn = document.getElementById('voPlayBtn');
  var playIcon = document.getElementById('voPlayIcon');
  var pauseIcon = document.getElementById('voPauseIcon');
  var progressFill = document.getElementById('voProgressFill');
  var progressWrap = document.getElementById('voProgressWrap');
  var timeLabel = document.getElementById('voTime');
  var ccBtn = document.getElementById('voCCBtn');
  var ccBar = document.getElementById('ccBar');
  var ccEnabled = true; // CC on by default
  ccBtn.classList.add('active');

  // Slide → VO file mapping (slide data-slide number → filename)
  var voMap = {
    1:'voiceover_1.1.mp3',
    2:'voiceover_1.2.mp3',
    3:'voiceover_1.3a.mp3',
    4:'voiceover_1.3b.mp3',
    5:'voiceover_1.3c.mp3',
    6:'voiceover_1.3d.mp3',
    7:'voiceover_1.4.mp3',
    8:'voiceover_1.5.mp3',
    9:'voiceover_1.6.mp3',
    10:'voiceover_1.7.mp3',
    11:'voiceover_1.8.mp3',
    12:'voiceover_1.9.mp3',
    13:'voiceover_1.10.mp3',
    // 14 = KC Q2, no separate VO
    15:'voiceover_1.11.mp3',
    16:'voiceover_1.12.mp3',
    17:'voiceover_1.13.mp3',
    18:'voiceover_1.14.mp3',
    19:'voiceover_1.15.mp3',
    20:'voiceover_1.16.mp3',
    21:'voiceover_1.17.mp3',
    22:'voiceover_1.18.mp3',
    23:'voiceover_1.19.mp3'
  };

  // Caption text per slide (broken into timed segments)
  var ccData = {
    1:[
      "Welcome to the Accessibility First series. This is Guide 1: Foundations of Disability Inclusion and Accessible Design.",
      "Over the next 15 to 20 minutes, you will build the foundation for everything that follows in this 18-guide series.",
      "You will explore what disability means, examine the models that shape how we think about it, and learn a practical framework you can use starting today.",
      "At UHN, accessibility is not a checklist or a compliance exercise.",
      "It is a commitment to making sure every person who walks through our doors — as a patient, a visitor, or a colleague — can participate fully and with dignity.",
      "This guide is for everyone at UHN, regardless of your role. Whether you work at the bedside, at the front desk, in a lab, or in an office, accessibility is part of your practice.",
      "Let us get started."
    ],
    2:[
      "By the end of this guide, you will be able to do four things.",
      "First, you will be able to define disability using the human rights model and explain why this model matters in healthcare.",
      "Second, you will be able to identify common barriers that people with disabilities face when accessing healthcare at UHN.",
      "Third, you will be able to apply the Accessibility Decision Path — a five-step framework — to real workplace situations.",
      "And fourth, you will be able to describe how the four areas of the Accessibility in Practice model connect to your daily work.",
      "These are not abstract concepts. Each objective ties directly to something you will practise in a scenario later in this guide."
    ],
    3:[
      "Here is a number worth knowing. According to Statistics Canada, more than 27 percent of Canadians aged 15 and older have at least one disability. In Ontario, that number is even higher.",
      "That means more than one in four people who come to UHN for care may experience barriers related to disability.",
      "And many of those disabilities are non-visible — you may not know someone has a disability unless they tell you.",
      "Take a moment with that number. One in four. That is not a small group. That is your patients, your colleagues, and your community."
    ],
    4:[
      "Healthcare systems were often designed without disability in mind.",
      "Narrow doorways make it impossible for some wheelchair users to enter exam rooms. Small print on intake forms excludes people with low vision. Booking systems that require phone calls shut out people who are Deaf or hard of hearing.",
      "These are not edge cases — they are structural barriers that affect thousands of patients at UHN every year.",
      "When these barriers exist, patients avoid or delay the care they need. Not because they do not want help, but because the system was not designed to include them."
    ],
    5:[
      "Communication barriers are among the most common — and the most dangerous — in healthcare.",
      "When a clinician assumes a patient understands verbal instructions, but the patient has a cognitive or language-related disability, critical information gets lost.",
      "Misdiagnosis can follow. Wrong assumptions about what a person can or cannot understand lead to wrong care decisions.",
      "Adapting your communication — using plain language, visual aids, or simply asking how someone prefers to receive information — can change the outcome of a visit entirely."
    ],
    6:[
      "When barriers go unaddressed, patients do not just have a bad experience — they stop coming. They delay care, miss follow-ups, or abandon treatment altogether.",
      "These barriers compound for people who face intersecting forms of marginalization.",
      "Indigenous peoples in Ontario, for example, navigate not only disability-related barriers but also systemic racism, geographic isolation, and culturally unsafe healthcare environments.",
      "Removing barriers is not just about compliance. It is about making sure no one is excluded from the care they need and deserve."
    ],
    7:[
      "How we think about disability shapes how we respond to it. So let us look at three models that have influenced healthcare and society.",
      "The first is the medical model. This model treats disability as a problem located in the individual — something to be diagnosed, treated, or cured.",
      "For decades, this was the dominant view in healthcare. Under this model, the focus is on fixing the person.",
      "The second is the social model. This model shifts the focus from the person to the environment.",
      "It says that people are disabled not by their bodies or minds, but by barriers in society — stairs instead of ramps, information only in print, attitudes that exclude.",
      "The third — and the one that guides this series — is the human rights model.",
      "This model builds on the social model but goes further. It says that people with disabilities have the right to full participation in every aspect of life.",
      "It is not enough to remove barriers. We must actively ensure inclusion, dignity, and equity.",
      "At UHN, we use the human rights model as our foundation. This means we do not just accommodate — we include."
    ],
    8:[
      "Now let us look at a framework you will use throughout this entire series. It is called the Accessibility in Practice model, and it has four areas.",
      "The first area is Awareness. This means recognizing barriers and biases — including your own unconscious assumptions about disability.",
      "The second area is Communication. This means adapting how you share and receive information.",
      "The third area is Environment. This means shaping inclusive physical and digital spaces.",
      "The fourth area is Response. This means acting with dignity and flexibility when someone needs something different.",
      "These four areas work together. Throughout this series, each guide will explore how awareness, communication, environment, and response apply to a specific disability context."
    ],
    9:[
      "When you encounter a situation involving accessibility, what do you actually do? That is where the Accessibility Decision Path comes in.",
      "Step one is Pause. Before you act, take a breath and notice what is happening.",
      "Step two is Listen. Hear the person in front of you. Ask how they would like to be supported.",
      "Step three is Apply. Use what you have learned to respond appropriately.",
      "Step four is Adapt. If your first approach does not work, adjust. Flexibility is not a sign of failure. It is a sign of competence.",
      "And step five is Seek Support. If you are unsure, ask for help.",
      "These five steps — Pause, Listen, Apply, Adapt, Seek Support — will come back in every guide. They are your anchor."
    ],
    10:[
      "Let us put what you have learned into practice with a scenario.",
      "Mrs. Okafor is a 68-year-old patient who has arrived at the front desk of a UHN clinic. She looks frustrated.",
      "She explains that she has been trying to use the new online booking system for three days, but she cannot navigate it.",
      "The system meets accessibility standards — it has been tested for screen reader compatibility and colour contrast. But Mrs. Okafor has limited digital literacy.",
      "Now it is your turn. You are the staff member at the front desk. Think about the Accessibility Decision Path.",
      "You will see three options on screen. Choose the one that best reflects an accessible, dignity-centred response.",
      "Take your time. There is no penalty for choosing an imperfect answer — this is about learning."
    ],
    11:[
      "Here is a second scenario.",
      "You notice a patient with low vision squinting at a directional sign in the outpatient clinic.",
      "The sign was recently installed and meets Ontario Building Code standards, but the font is small and it is mounted high on the wall.",
      "You are a staff member who happens to be walking through this corridor. You notice the patient looking up at the sign.",
      "What do you do? Think about the Decision Path — Pause, Listen, Apply, Adapt, Seek Support.",
      "Choose from the options on screen. Remember, the best response addresses both the immediate need and the systemic barrier."
    ],
    12:[
      "Here is one more scenario — and this one is about how teams work together.",
      "Your team uses an accessibility checklist when supporting patients. A colleague mentions that a patient who speaks Cantonese and has a cognitive disability seemed confused during intake.",
      "Your colleague says, 'We followed the checklist — I am not sure what else we can do.'",
      "Think about this carefully. The checklist was completed. The process was followed. But the patient was still confused. What does that tell you?",
      "Choose the response that best reflects the Accessibility in Practice model.",
      "Remember, accessibility is more than a checklist. It requires curiosity, flexibility, and a willingness to look beyond the process."
    ],
    13:[
      "Time for a quick knowledge check to see how the concepts are landing.",
      "You will see a question on screen with four answer options. Select the best answer. You have two attempts.",
      "This is not a test — it is a chance to reinforce what you have learned about the models of disability and the Accessibility in Practice framework.",
      "Read the question carefully and select your answer when you are ready."
    ],
    15:[
      "Here is one more knowledge check, this time based on a short scenario.",
      "Read the situation described on screen. Then choose the response that best applies the Accessibility Decision Path.",
      "Think about which step of the path is most relevant — Pause, Listen, Apply, Adapt, or Seek Support.",
      "When you are ready, select your answer. Remember, you have two attempts."
    ],
    16:[
      "Before we wrap up the core content, here are five inclusive practice tips you can start using today.",
      "Tip number one: Always ask — never assume. If you are not sure how to support someone, ask them directly.",
      "Tip number two: Make your space scan a habit. Before your next shift, look at your workspace with fresh eyes.",
      "Tip number three: Speak to the person, not their companion. When a patient is accompanied by a support person or interpreter, direct your conversation to the patient.",
      "Tip number four: Offer information in more than one format.",
      "Tip number five: Report barriers — do not just work around them. If you notice a barrier, flag it for your team lead or facilities.",
      "These five tips connect directly to the Accessibility in Practice model — awareness, communication, environment, and response."
    ],
    17:[
      "Take a moment now to reflect.",
      "Think about a recent interaction at work — with a patient, a colleague, or a visitor. Was there a moment where accessibility could have been handled differently?",
      "On screen, you will see a text box where you can write a brief reflection.",
      "Your reflection is private. It is not shared with your manager or anyone else. This is for your own learning.",
      "Take as much time as you need. When you are ready, move on to the action planning screen."
    ],
    18:[
      "Now it is time to create your My Action Plan — your MAP. This is a tool you will use in every guide throughout the series.",
      "Stop: What is one thing you will stop doing?",
      "Start: What is one thing you will start doing?",
      "Continue: What is one thing you are already doing well that you want to keep doing?",
      "Fill in your MAP on screen. You can also download it as a PDF to keep at your workstation."
    ],
    19:[
      "Let us bring it all together. Here are the key takeaways from Guide 1.",
      "First: Disability is best understood through the human rights model — a framework that centres full participation, dignity, and equity.",
      "Second: The Accessibility in Practice model gives you four areas to focus on — awareness, communication, environment, and response.",
      "Third: The Accessibility Decision Path — Pause, Listen, Apply, Adapt, Seek Support — is your go-to framework for any accessibility situation.",
      "Fourth: Accessibility is not a special accommodation. It is a standard of care.",
      "And fifth: Small actions matter. A space scan, a question asked with respect, a form offered in a different format — these are the building blocks of an inclusive healthcare environment.",
      "You have completed Guide 1. Well done."
    ],
    20:[
      "Before we close this guide, take some time to listen.",
      "On this screen, you will find a deep dive conversation — about 18 minutes — exploring accessibility through the eyes of a patient advisor at UHN.",
      "The conversation centres on one question: what does dignity actually feel like when you are a patient navigating a hospital with a disability?",
      "Here are some moments to listen for. At the beginning, you will hear why a 50 million dollar diagnostic wing means nothing if the first human interaction fails.",
      "Around the nine-minute mark, you will hear about five words from a nurse that changed everything.",
      "Captions and a full transcript are available. You can also download the audio if you would like to listen during a commute or a break.",
      "After listening, consider this reflection: think of one patient interaction this week — which moment would have shifted if you had paused to ask, before you acted?"
    ],
    21:[
      "Here is one more practice activity — a decision tree.",
      "A patient is at the intake desk, visibly frustrated while trying to complete the intake form. You do not yet know the cause.",
      "This is the moment where the Accessibility Decision Path matters most. What is your first move — before assuming anything about the barrier?",
      "You will see three options on screen. One is recommended.",
      "Each opens a brief consequence panel showing what happens next — for the patient, for the chart, and for the team.",
      "Choose the option that best reflects 'Pause and Assess' — the first step of the path. Take your time."
    ],
    22:[
      "You have completed Guide 1 — and with it, you have unlocked the rest of the Accessibility First series.",
      "On this screen, you can see the full 18-guide journey mapped across three stages.",
      "Stage 1 is Foundations — that is Guides 1 through 4.",
      "Stage 2 is Understanding Disability Experiences — Guides 5 through 9.",
      "Stage 3 is Applied Practice — Guides 10 through 18.",
      "Guides unlock by stage. Completing all four Foundation guides opens Stage 2. You are on your way."
    ],
    23:[
      "Congratulations — you have completed Guide 1: Foundations of Disability Inclusion and Accessible Design.",
      "This guide is the foundation for the entire Accessibility First series.",
      "The concepts you explored today — the human rights model, the Accessibility in Practice model, and the Accessibility Decision Path — will appear in every guide that follows.",
      "On this screen, you will find a list of resources that support the content in this guide.",
      "If you have questions about accessibility at UHN, reach out to Patient Relations, the IDEAA Office, or your unit's accessibility lead.",
      "Thank you for investing your time in building a more accessible UHN. Every step you take matters.",
      "See you in Guide 2."
    ]
  };

  var currentSlide = 1;

  function formatTime(sec) {
    if (isNaN(sec)) return '0:00';
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // Build word-weighted timing breakpoints per slide
  var ccTimingCache = {};
  function getCCTimings(slideNum) {
    if (ccTimingCache[slideNum]) return ccTimingCache[slideNum];
    var segs = ccData[slideNum];
    if (!segs || !audio.duration) return null;
    var wordCounts = segs.map(function(s){ return s.split(/\s+/).length; });
    var totalWords = wordCounts.reduce(function(a,b){ return a+b; }, 0);
    var breakpoints = [];
    var cumulative = 0;
    for (var i = 0; i < segs.length; i++) {
      breakpoints.push(cumulative);
      cumulative += (wordCounts[i] / totalWords) * audio.duration;
    }
    ccTimingCache[slideNum] = breakpoints;
    return breakpoints;
  }

  function updateProgress() {
    if (!audio.duration) return;
    var pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = pct + '%';
    timeLabel.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);

    // Update CC text with word-weighted timing
    if (ccEnabled && ccData[currentSlide]) {
      var segs = ccData[currentSlide];
      var bp = getCCTimings(currentSlide);
      if (!bp) return;
      var idx = 0;
      for (var i = bp.length - 1; i >= 0; i--) {
        if (audio.currentTime >= bp[i]) { idx = i; break; }
      }
      ccBar.textContent = segs[idx];
      ccBar.classList.add('visible');
    }
  }

  function playSlideVO(slideNum) {
    currentSlide = slideNum;
    delete ccTimingCache[slideNum]; // recalc with new audio duration
    audio.pause();
    audio.currentTime = 0;
    progressFill.style.width = '0%';
    ccBar.classList.remove('visible');
    ccBar.textContent = '';

    var file = voMap[slideNum];
    if (!file) {
      playIcon.style.display = '';
      pauseIcon.style.display = 'none';
      timeLabel.textContent = '—';
      return;
    }

    audio.src = 'media/vo/' + file;
    audio.load();
    audio.play().then(function(){
      playIcon.style.display = 'none';
      pauseIcon.style.display = '';
    }).catch(function(){
      // Autoplay blocked — user must click play
      playIcon.style.display = '';
      pauseIcon.style.display = 'none';
    });
  }

  // Play/Pause button
  playBtn.addEventListener('click', function(){
    if (!audio.src || !voMap[currentSlide]) return;
    if (audio.paused) {
      audio.play();
      playIcon.style.display = 'none';
      pauseIcon.style.display = '';
    } else {
      audio.pause();
      playIcon.style.display = '';
      pauseIcon.style.display = 'none';
    }
  });

  // Progress bar click to seek
  progressWrap.addEventListener('click', function(e){
    if (!audio.duration) return;
    var rect = progressWrap.getBoundingClientRect();
    var pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });

  // CC toggle
  ccBtn.addEventListener('click', function(){
    ccEnabled = !ccEnabled;
    ccBtn.classList.toggle('active', ccEnabled);
    if (!ccEnabled) {
      ccBar.classList.remove('visible');
    }
  });

  // Audio events
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('ended', function(){
    playIcon.style.display = '';
    pauseIcon.style.display = 'none';
    ccBar.classList.remove('visible');
  });

  // Volume control
  var volBtn = document.getElementById('voVolBtn');
  var volRange = document.getElementById('voVolRange');
  var volIcon = document.getElementById('voVolIcon');
  var muteIcon = document.getElementById('voMuteIcon');
  audio.volume = 0.8;
  var savedVol = 0.8;
  volRange.addEventListener('input', function(){
    audio.volume = this.value / 100;
    savedVol = audio.volume;
    volIcon.style.display = audio.volume === 0 ? 'none' : '';
    muteIcon.style.display = audio.volume === 0 ? '' : 'none';
  });
  volBtn.addEventListener('click', function(){
    if (audio.volume > 0) {
      savedVol = audio.volume;
      audio.volume = 0;
      volRange.value = 0;
      volIcon.style.display = 'none';
      muteIcon.style.display = '';
    } else {
      audio.volume = savedVol || 0.8;
      volRange.value = Math.round(audio.volume * 100);
      volIcon.style.display = '';
      muteIcon.style.display = 'none';
    }
  });

  // Show/hide controls bar
  var controls = document.getElementById('voControls');
  var hideBtn = document.getElementById('voHideBtn');
  var showBtn = document.getElementById('voShowBtn');
  hideBtn.addEventListener('click', function(){
    controls.classList.add('hidden');
    showBtn.classList.add('visible');
  });
  showBtn.addEventListener('click', function(){
    controls.classList.remove('hidden');
    showBtn.classList.remove('visible');
  });

  // Hook into goSlide
  var _prevGoSlide = window.goSlide;
  window.goSlide = function(n){
    var beforeSlide = document.querySelector('.slide.active');
    var beforeN = beforeSlide ? parseInt(beforeSlide.getAttribute('data-slide')) : 0;
    _prevGoSlide(n);
    // Only play VO if slide actually changed
    var afterSlide = document.querySelector('.slide.active');
    var afterN = afterSlide ? parseInt(afterSlide.getAttribute('data-slide')) : beforeN;
    if (afterN !== beforeN) playSlideVO(afterN);
  };

  // Play VO after welcome dialog is dismissed (not on page load)
  // The welcome dialog click counts as user interaction, so autoplay works
  var voStarted = false;
  function startVOAfterWelcome() {
    if (voStarted) return;
    voStarted = true;
    var activeSlide = document.querySelector('.slide.active');
    var slideNum = activeSlide ? parseInt(activeSlide.getAttribute('data-slide')) : 1;
    setTimeout(function(){ playSlideVO(slideNum); }, 300);
  }
  var welcomeStart = document.getElementById('welcomeStartBtn');
  var welcomeResume = document.getElementById('welcomeResumeBtn2') || document.getElementById('welcomeResumeBtn');
  var welcomeStartOver = document.getElementById('welcomeStartOverBtn');
  if (welcomeStart) welcomeStart.addEventListener('click', startVOAfterWelcome);
  if (welcomeResume) welcomeResume.addEventListener('click', startVOAfterWelcome);
  if (welcomeStartOver) welcomeStartOver.addEventListener('click', startVOAfterWelcome);
  // Fallback if no welcome dialog
  if (!welcomeStart) setTimeout(function(){ playSlideVO(1); }, 500);
})();
