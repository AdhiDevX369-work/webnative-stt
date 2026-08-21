/**
 * EchoNative STT Studio
 * Native Web Speech API (SpeechRecognition / webkitSpeechRecognition)
 */

// Supported Languages Database
const LANGUAGES = [
  { code: 'si-LK', name: 'Sinhala (Sri Lanka)', native: 'සිංහල (ශ්‍රී ලංකා)', group: 'South Asia' },
  { code: 'en-US', name: 'English (United States)', native: 'English (US)', group: 'English' },
  { code: 'en-GB', name: 'English (United Kingdom)', native: 'English (UK)', group: 'English' },
  { code: 'en-IN', name: 'English (India)', native: 'English (India)', group: 'English' },
  { code: 'en-AU', name: 'English (Australia)', native: 'English (AU)', group: 'English' },
  { code: 'ta-LK', name: 'Tamil (Sri Lanka)', native: 'தமிழ் (இலங்கை)', group: 'South Asia' },
  { code: 'ta-IN', name: 'Tamil (India)', native: 'தமிழ் (இந்தியா)', group: 'South Asia' },
  { code: 'hi-IN', name: 'Hindi (India)', native: 'हिन्दी (भारत)', group: 'South Asia' },
  { code: 'ml-IN', name: 'Malayalam (India)', native: 'മലയാളം (ഇന്ത്യ)', group: 'South Asia' },
  { code: 'te-IN', name: 'Telugu (India)', native: 'తెలుగు (భారతదేశం)', group: 'South Asia' },
  { code: 'ja-JP', name: 'Japanese', native: '日本語', group: 'East Asia' },
  { code: 'ko-KR', name: 'Korean', native: '한국어', group: 'East Asia' },
  { code: 'zh-CN', name: 'Chinese (Mandarin Simplified)', native: '普通话 (中国)', group: 'East Asia' },
  { code: 'es-ES', name: 'Spanish (Spain)', native: 'Español (España)', group: 'European' },
  { code: 'fr-FR', name: 'French (France)', native: 'Français (France)', group: 'European' },
  { code: 'de-DE', name: 'German (Germany)', native: 'Deutsch (Deutschland)', group: 'European' },
  { code: 'it-IT', name: 'Italian (Italy)', native: 'Italiano (Italia)', group: 'European' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', native: 'Português (Brasil)', group: 'European' },
  { code: 'ru-RU', name: 'Russian (Russia)', native: 'Русский', group: 'European' },
  { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', native: 'العربية (السعودية)', group: 'Middle East' }
];

class STTStudioApp {
  constructor() {
    this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = null;
    this.isRecording = false;
    this.userExplicitlyStopped = true;
    this.selectedLanguage = 'si-LK';
    this.currentSessionText = '';

    // State metrics
    this.sessionStartTime = null;
    this.timerInterval = null;
    this.segments = [];
    this.confidenceScores = [];
    this.diagnosticsLogs = [];

    // Audio Visualizer Web Audio API
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.animationFrameId = null;

    // DOM Elements
    this.initDOMElements();
    this.initLanguages();
    this.checkBrowserSupport();
    this.initNetworkAndOffline();
    this.loadSessionFromStorage();
    this.setupEventListeners();
    this.initCanvas();
  }

  initDOMElements() {
    // Header & Badges
    this.networkStatusBadge = document.getElementById('networkStatusBadge');
    this.networkStatusText = document.getElementById('networkStatusText');
    this.browserSupportBadge = document.getElementById('browserSupportBadge');
    this.unsupportedBanner = document.getElementById('unsupportedBanner');
    this.toggleDiagnosticsBtn = document.getElementById('toggleDiagnosticsBtn');
    this.logCountBadge = document.getElementById('logCountBadge');
    this.diagnosticsDrawer = document.getElementById('diagnosticsDrawer');
    this.closeDiagnosticsBtn = document.getElementById('closeDiagnosticsBtn');
    this.clearLogsBtn = document.getElementById('clearLogsBtn');
    this.eventLogsList = document.getElementById('eventLogsList');

    // Controls
    this.languageSelect = document.getElementById('languageSelect');
    this.currentLangTag = document.getElementById('currentLangTag');
    this.langPills = document.querySelectorAll('.lang-pill');
    this.continuousToggle = document.getElementById('continuousToggle');
    this.interimToggle = document.getElementById('interimToggle');
    this.autoRestartToggle = document.getElementById('autoRestartToggle');
    this.visualizerToggle = document.getElementById('visualizerToggle');
    this.apiEndpointInput = document.getElementById('apiEndpointInput');
    this.apiAuthKeyInput = document.getElementById('apiAuthKeyInput');
    this.apiRefIdInput = document.getElementById('apiRefIdInput');
    this.apiAutoSendToggle = document.getElementById('apiAutoSendToggle');
    this.apiSourceInput = document.getElementById('apiSourceInput');
    this.sendToApiBtn = document.getElementById('sendToApiBtn');

    // Hero Station
    this.micButton = document.getElementById('micButton');
    this.micIcon = document.getElementById('micIcon');
    this.micStopIcon = document.getElementById('micStopIcon');
    this.micStatusText = document.getElementById('micStatusText');
    this.micHintText = document.getElementById('micHintText');
    this.waveformCanvas = document.getElementById('waveformCanvas');
    this.visualizerOverlay = document.getElementById('visualizerOverlay');

    // Metrics
    this.durationTimer = document.getElementById('durationTimer');
    this.wordCount = document.getElementById('wordCount');
    this.charCount = document.getElementById('charCount');
    this.avgConfidence = document.getElementById('avgConfidence');

    // Output & Transcripts
    this.liveStreamText = document.getElementById('liveStreamText');
    this.liveConfidence = document.getElementById('liveConfidence');
    this.finalTranscriptArea = document.getElementById('finalTranscriptArea');
    this.timelineContainer = document.getElementById('timelineContainer');
    this.tabButtons = document.querySelectorAll('.tab-btn');
    this.tabContents = document.querySelectorAll('.tab-content');

    // Actions
    this.copyBtn = document.getElementById('copyBtn');
    this.ttsBtn = document.getElementById('ttsBtn');
    this.clearBtn = document.getElementById('clearBtn');
    this.exportDropdownBtn = document.getElementById('exportDropdownBtn');
    this.exportMenu = document.getElementById('exportMenu');
    this.exportTxtBtn = document.getElementById('exportTxtBtn');
    this.exportJsonBtn = document.getElementById('exportJsonBtn');
    this.exportSrtBtn = document.getElementById('exportSrtBtn');
    this.toastNotification = document.getElementById('toastNotification');
    this.toastMessage = document.getElementById('toastMessage');
  }

  initLanguages() {
    this.languageSelect.innerHTML = '';
    const groups = {};

    LANGUAGES.forEach(lang => {
      if (!groups[lang.group]) groups[lang.group] = [];
      groups[lang.group].push(lang);
    });

    Object.keys(groups).forEach(groupName => {
      const optGroup = document.createElement('optgroup');
      optGroup.label = groupName;

      groups[groupName].forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = `${lang.native} — ${lang.code}`;
        if (lang.code === this.selectedLanguage) {
          option.selected = true;
        }
        optGroup.appendChild(option);
      });

      this.languageSelect.appendChild(optGroup);
    });

    this.updateCurrentLangDisplay();
  }

  checkBrowserSupport() {
    if (this.SpeechRecognition) {
      this.browserSupportBadge.className = 'support-badge supported';
      this.browserSupportBadge.innerHTML = `
        <span class="status-dot"></span>
        <span class="status-text">Web Speech API Supported ✓</span>
      `;
      this.logDiagnostic('SYSTEM', 'SpeechRecognition API is supported in this browser.', {
        engine: this.SpeechRecognition.name || 'WebKit/Standard',
        userAgent: navigator.userAgent
      });
    } else {
      this.browserSupportBadge.className = 'support-badge unsupported';
      this.browserSupportBadge.innerHTML = `
        <span class="status-dot"></span>
        <span class="status-text">API Unsupported ✕</span>
      `;
      this.unsupportedBanner.classList.remove('hidden');
      this.micButton.disabled = true;
      this.micButton.style.opacity = '0.5';
      this.micButton.style.cursor = 'not-allowed';
      this.micStatusText.textContent = 'Browser Unsupported';
      this.micHintText.textContent = 'Please open in Chrome, Edge, Safari, or Brave';
      this.logDiagnostic('SYSTEM_ERROR', 'SpeechRecognition API is NOT supported in this browser environment.', {
        userAgent: navigator.userAgent
      });
    }
  }

  initNetworkAndOffline() {
    // Register Service Worker for offline asset caching
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            this.logDiagnostic('SERVICE_WORKER', `Service Worker registered successfully (scope: ${reg.scope})`);
          })
          .catch((err) => {
            this.logDiagnostic('SERVICE_WORKER_WARN', 'Service Worker registration failed:', err);
          });
      });
    }

    // Monitor Online / Offline status
    const updateStatus = () => {
      const isOnline = navigator.onLine;
      if (this.networkStatusBadge) {
        if (isOnline) {
          this.networkStatusBadge.className = 'network-badge online';
          this.networkStatusText.textContent = 'Online';
        } else {
          this.networkStatusBadge.className = 'network-badge offline';
          this.networkStatusText.textContent = 'Offline Mode';
        }
      }
    };

    window.addEventListener('online', () => {
      updateStatus();
      this.showToast('Back Online 🌐 (Cloud & on-device recognition active)');
      this.logDiagnostic('NETWORK_ONLINE', 'Network connection restored.');
    });

    window.addEventListener('offline', () => {
      updateStatus();
      this.showToast('Offline Mode ⚡ (Using cached app shell & on-device speech engine)', 'info');
      this.logDiagnostic('NETWORK_OFFLINE', 'Device is offline. Web Speech API will utilize local on-device speech dictation if installed.');
    });

    updateStatus();
  }

  saveSessionToStorage() {
    try {
      const data = {
        language: this.selectedLanguage,
        finalText: this.finalTranscriptArea.value,
        segments: this.segments,
        confidenceScores: this.confidenceScores,
        apiEndpoint: this.apiEndpointInput ? this.apiEndpointInput.value : 'http://localhost:8000/api/stt',
        apiAuthKey: this.apiAuthKeyInput ? this.apiAuthKeyInput.value : '',
        apiAutoSend: this.apiAutoSendToggle ? this.apiAutoSendToggle.checked : true,
        apiSource: this.apiSourceInput ? this.apiSourceInput.value : 'CRM',
        apiRefId: this.apiRefIdInput ? this.apiRefIdInput.value : '',
        updatedAt: Date.now()
      };
      localStorage.setItem('echonative_stt_session', JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  loadSessionFromStorage() {
    try {
      const raw = localStorage.getItem('echonative_stt_session');
      if (!raw) return;
      const data = JSON.parse(raw);

      if (data.finalText) {
        this.finalTranscriptArea.value = data.finalText;
      }
      if (Array.isArray(data.segments) && data.segments.length > 0) {
        this.segments = data.segments;
        this.confidenceScores = data.confidenceScores || [];
        this.timelineContainer.innerHTML = '';
        data.segments.forEach(seg => this.appendTimelineCard(seg));
      }
      if (data.language) {
        this.setLanguage(data.language);
      }
      if (data.apiEndpoint && this.apiEndpointInput) {
        this.apiEndpointInput.value = data.apiEndpoint;
      }
      if (data.apiAuthKey !== undefined && this.apiAuthKeyInput) {
        this.apiAuthKeyInput.value = data.apiAuthKey;
      }
      if (data.apiAutoSend !== undefined && this.apiAutoSendToggle) {
        this.apiAutoSendToggle.checked = data.apiAutoSend;
      }
      if (data.apiSource && this.apiSourceInput) {
        this.apiSourceInput.value = data.apiSource;
      }
      if (data.apiRefId !== undefined && this.apiRefIdInput) {
        this.apiRefIdInput.value = data.apiRefId;
      }
      this.updateMetrics();
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }
  }

  setupEventListeners() {
    // Mic Button
    this.micButton.addEventListener('click', () => {
      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    });

    // Language Select
    this.languageSelect.addEventListener('change', (e) => {
      this.setLanguage(e.target.value);
    });

    // Quick Language Pills
    this.langPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const lang = pill.dataset.lang;
        this.setLanguage(lang);
      });
    });

    // Tab Switching
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        this.switchTab(targetTab);
      });
    });

    // Action Buttons
    this.copyBtn.addEventListener('click', () => this.copyTranscript());
    this.ttsBtn.addEventListener('click', () => this.speakTranscript());
    this.clearBtn.addEventListener('click', () => this.clearAll());

    // Export Dropdown
    this.exportDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.exportMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      if (!this.exportMenu.classList.contains('hidden')) {
        this.exportMenu.classList.add('hidden');
      }
    });

    this.exportTxtBtn.addEventListener('click', () => this.exportAsTxt());
    this.exportJsonBtn.addEventListener('click', () => this.exportAsJson());
    this.exportSrtBtn.addEventListener('click', () => this.exportAsSrt());

    // Final textarea editing
    this.finalTranscriptArea.addEventListener('input', () => {
      this.updateMetrics();
    });

    if (this.apiEndpointInput) {
      this.apiEndpointInput.addEventListener('input', () => {
        this.saveSessionToStorage();
      });
    }
    if (this.apiAuthKeyInput) {
      this.apiAuthKeyInput.addEventListener('input', () => {
        this.saveSessionToStorage();
      });
    }
    if (this.apiAutoSendToggle) {
      this.apiAutoSendToggle.addEventListener('change', () => {
        this.saveSessionToStorage();
      });
    }
    if (this.apiSourceInput) {
      this.apiSourceInput.addEventListener('input', () => {
        this.saveSessionToStorage();
      });
    }
    if (this.apiRefIdInput) {
      this.apiRefIdInput.addEventListener('input', () => {
        this.saveSessionToStorage();
      });
    }
    if (this.sendToApiBtn) {
      this.sendToApiBtn.addEventListener('click', () => {
        this.sendCurrentSessionTranscript(true);
      });
    }

    // Diagnostics Drawer
    this.toggleDiagnosticsBtn.addEventListener('click', () => {
      this.diagnosticsDrawer.classList.toggle('hidden');
    });

    this.closeDiagnosticsBtn.addEventListener('click', () => {
      this.diagnosticsDrawer.classList.add('hidden');
    });

    this.clearLogsBtn.addEventListener('click', () => {
      this.diagnosticsLogs = [];
      this.eventLogsList.innerHTML = '';
      this.logCountBadge.textContent = '0';
      this.showToast('Diagnostics logs cleared');
    });
  }

  setLanguage(langCode) {
    this.selectedLanguage = langCode;
    this.languageSelect.value = langCode;

    this.langPills.forEach(pill => {
      if (pill.dataset.lang === langCode) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    this.updateCurrentLangDisplay();
    this.showToast(`Language set to: ${langCode}`);
    this.logDiagnostic('CONFIG_CHANGE', `Language changed to ${langCode}`);

    // If currently recording, restart recognition with new language
    if (this.isRecording && this.recognition) {
      this.recognition.lang = langCode;
      this.recognition.stop();
    }
  }

  updateCurrentLangDisplay() {
    const langObj = LANGUAGES.find(l => l.code === this.selectedLanguage);
    if (langObj) {
      this.currentLangTag.textContent = `${langObj.code} (${langObj.native.split(' ')[0]})`;
    } else {
      this.currentLangTag.textContent = this.selectedLanguage;
    }
  }

  switchTab(tabKey) {
    this.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });

    document.getElementById('fullViewTab').classList.toggle('active', tabKey === 'full');
    document.getElementById('timelineViewTab').classList.toggle('active', tabKey === 'timeline');
  }

  startRecording() {
    if (!this.SpeechRecognition) {
      this.showToast('Speech Recognition not supported in this browser', 'error');
      return;
    }

    try {
      this.recognition = new this.SpeechRecognition();
      this.recognition.continuous = this.continuousToggle.checked;
      this.recognition.interimResults = this.interimToggle.checked;
      this.recognition.lang = this.selectedLanguage;
      this.recognition.maxAlternatives = 3;

      this.attachRecognitionEvents();
      this.userExplicitlyStopped = false;
      this.currentSessionText = '';
      this.recognition.start();

      this.isRecording = true;
      this.updateMicUI(true);
      this.startDurationTimer();

      if (this.visualizerToggle.checked) {
        this.startAudioVisualizer();
      }

      this.logDiagnostic('RECOGNITION_START_REQUEST', `Starting recognition [lang: ${this.selectedLanguage}, continuous: ${this.recognition.continuous}, interim: ${this.recognition.interimResults}]`);
    } catch (err) {
      this.logDiagnostic('ERROR_ON_START', err.message, err);
      this.showToast(`Failed to start: ${err.message}`, 'error');
    }
  }

  stopRecording() {
    this.userExplicitlyStopped = true;
    this.isRecording = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Recognition stop error', err);
      }
    }

    this.updateMicUI(false);
    this.stopDurationTimer();
    this.stopAudioVisualizer();
    this.liveStreamText.innerHTML = '<span class="placeholder-text">Recognition stopped. Click microphone to start again.</span>';
    this.liveConfidence.textContent = 'Idle';
    this.liveConfidence.className = 'confidence-indicator';
    this.logDiagnostic('USER_STOP', 'User explicitly stopped recording');
    this.sendCurrentSessionTranscript();
  }

  attachRecognitionEvents() {
    this.recognition.onstart = () => {
      this.updateMicStatus('Listening...', 'recording', 'Speak clearly into your microphone');
      this.logDiagnostic('onstart', 'Speech recognition engine started');
    };

    this.recognition.onaudiostart = () => {
      this.logDiagnostic('onaudiostart', 'Audio capture hardware started');
    };

    this.recognition.onsoundstart = () => {
      this.logDiagnostic('onsoundstart', 'Sound has been detected');
    };

    this.recognition.onspeechstart = () => {
      this.updateMicStatus('Speech Detected', 'recording', 'Transcribing spoken words in real-time...');
      this.logDiagnostic('onspeechstart', 'Human speech patterns detected');
    };

    this.recognition.onspeechend = () => {
      this.updateMicStatus('Processing Speech...', 'recording', 'Finalizing transcript...');
      this.logDiagnostic('onspeechend', 'Speech segment completed');
    };

    this.recognition.onsoundend = () => {
      this.logDiagnostic('onsoundend', 'Sound transmission ended');
    };

    this.recognition.onaudioend = () => {
      this.logDiagnostic('onaudioend', 'Audio stream capture ended');
    };

    this.recognition.onresult = (event) => {
      this.handleRecognitionResult(event);
    };

    this.recognition.onnomatch = (event) => {
      this.logDiagnostic('onnomatch', 'No confident speech match found', event);
    };

    this.recognition.onerror = (event) => {
      this.handleRecognitionError(event);
    };

    this.recognition.onend = () => {
      this.logDiagnostic('onend', 'Recognition session ended');

      if (!this.userExplicitlyStopped && this.autoRestartToggle.checked) {
        this.logDiagnostic('AUTO_RESTART', 'Auto-restarting speech recognition instance...');
        try {
          this.recognition.start();
        } catch (e) {
          console.warn('Auto-restart retry:', e);
          setTimeout(() => {
            if (!this.userExplicitlyStopped) this.startRecording();
          }, 300);
        }
      } else {
        if (this.isRecording) {
          this.isRecording = false;
          this.updateMicUI(false);
          this.stopDurationTimer();
          this.stopAudioVisualizer();
          this.sendCurrentSessionTranscript();
        } else if (this.userExplicitlyStopped) {
          this.updateMicUI(false);
        }
      }
    };
  }

  handleRecognitionResult(event) {
    let interimTranscript = '';
    let finalTranscriptBatch = '';
    let latestConfidence = 0;

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      if (result.isFinal) {
        finalTranscriptBatch += transcript + ' ';
        this.currentSessionText += transcript + ' ';
        latestConfidence = confidence;

        // Record segment in timeline
        const timestampStr = new Date().toLocaleTimeString();
        const segmentObj = {
          id: Date.now() + Math.random().toString(36).substr(2, 4),
          text: transcript.trim(),
          confidence: confidence > 0 ? (confidence * 100).toFixed(1) : '95.0',
          timestamp: timestampStr,
          lang: this.selectedLanguage
        };

        this.segments.push(segmentObj);
        this.confidenceScores.push(parseFloat(segmentObj.confidence));
        this.appendTimelineCard(segmentObj);

        this.logDiagnostic('onresult (FINAL)', `Committed: "${transcript.trim()}"`, {
          confidence: segmentObj.confidence + '%',
          alternatives: Array.from(result).map(a => ({ text: a.transcript, conf: a.confidence }))
        });
      } else {
        interimTranscript += transcript;
        latestConfidence = confidence;
        this.logDiagnostic('onresult (INTERIM)', `Stream: "${transcript}"`);
      }
    }

    // Update live box
    if (interimTranscript) {
      this.liveStreamText.innerHTML = `<span class="live-interim-text">${this.escapeHTML(interimTranscript)}</span>`;
      this.liveConfidence.textContent = 'Live Streaming...';
      this.liveConfidence.className = 'confidence-indicator active';
    } else if (finalTranscriptBatch) {
      this.liveStreamText.innerHTML = `<span style="color: #6ee7b7;">✓ ${this.escapeHTML(finalTranscriptBatch)}</span>`;
    }

    // Append to textarea if final
    if (finalTranscriptBatch) {
      const currentAreaText = this.finalTranscriptArea.value;
      const separator = currentAreaText.length > 0 && !currentAreaText.endsWith(' ') ? ' ' : '';
      this.finalTranscriptArea.value = currentAreaText + separator + finalTranscriptBatch.trim();
      this.finalTranscriptArea.scrollTop = this.finalTranscriptArea.scrollHeight;
    }

    this.updateMetrics();
  }

  handleRecognitionError(event) {
    let errorMsg = event.error;
    let hint = 'Check microphone settings';

    switch (event.error) {
      case 'not-allowed':
        errorMsg = 'Microphone permission denied';
        hint = 'Please grant microphone access in your browser settings';
        this.showToast('Microphone access denied', 'error');
        this.stopRecording();
        break;
      case 'no-speech':
        errorMsg = 'No speech detected';
        hint = 'Ensure your microphone is close and unmuted';
        break;
      case 'network':
        errorMsg = 'Network connectivity issue';
        hint = 'Web Speech API requires an active internet connection';
        this.showToast('Network error in Web Speech API', 'error');
        break;
      case 'audio-capture':
        errorMsg = 'Audio capture failed';
        hint = 'No microphone device was found or audio is busy';
        this.showToast('Audio capture failed', 'error');
        this.stopRecording();
        break;
      case 'aborted':
        errorMsg = 'Recognition aborted';
        hint = 'Session was halted';
        break;
      default:
        errorMsg = `Error: ${event.error}`;
        hint = 'An unexpected recognition error occurred';
    }

    this.updateMicStatus(errorMsg, '', hint);
    this.logDiagnostic('onerror', `Error: ${event.error}`, { hint, message: event.message || '' });
  }

  appendTimelineCard(segment) {
    const emptyState = this.timelineContainer.querySelector('.empty-timeline-state');
    if (emptyState) emptyState.remove();

    const card = document.createElement('div');
    card.className = 'timeline-segment-card';
    card.innerHTML = `
      <div class="segment-meta">
        <span class="segment-time">${segment.timestamp} • [${segment.lang}]</span>
        <span class="segment-confidence">Conf: ${segment.confidence}%</span>
      </div>
      <div class="segment-text">${this.escapeHTML(segment.text)}</div>
    `;

    this.timelineContainer.prepend(card);
  }

  updateMetrics() {
    const text = this.finalTranscriptArea.value.trim();
    const words = text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
    const chars = text.length;

    this.wordCount.textContent = words;
    this.charCount.textContent = chars;

    if (this.confidenceScores.length > 0) {
      const avg = (this.confidenceScores.reduce((a, b) => a + b, 0) / this.confidenceScores.length).toFixed(1);
      this.avgConfidence.textContent = `${avg}%`;
    } else {
      this.avgConfidence.textContent = '--';
    }

    this.saveSessionToStorage();
  }

  startDurationTimer() {
    this.sessionStartTime = Date.now();
    this.durationTimer.textContent = '00:00';
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const secs = String(elapsed % 60).padStart(2, '0');
      this.durationTimer.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  stopDurationTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateMicUI(isRecording) {
    if (isRecording) {
      this.micButton.classList.add('recording');
      this.micIcon.classList.add('hidden');
      this.micStopIcon.classList.remove('hidden');
      this.visualizerOverlay.classList.add('recording');
    } else {
      this.micButton.classList.remove('recording');
      this.micIcon.classList.remove('hidden');
      this.micStopIcon.classList.add('hidden');
      this.visualizerOverlay.classList.remove('recording');
      this.updateMicStatus('Click Microphone to Start', '', 'Choose language & click to test voice input');
    }
  }

  updateMicStatus(text, statusClass = '', hint = '') {
    this.micStatusText.textContent = text;
    this.micStatusText.className = `mic-status-label ${statusClass}`;
    if (hint) {
      this.micHintText.textContent = hint;
    }
  }

  // =========================================================================
  // Web Audio API Visualizer
  // =========================================================================
  initCanvas() {
    const canvas = this.waveformCanvas;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Draw initial idle wave
    this.drawIdleWave();
  }

  drawIdleWave() {
    const canvas = this.waveformCanvas;
    const ctx = canvas.getContext('2d');
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.lineWidth = 2;
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }

  async startAudioVisualizer() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = this.waveformCanvas;
      const ctx = canvas.getContext('2d');

      const draw = () => {
        if (!this.isRecording) return;
        this.animationFrameId = requestAnimationFrame(draw);

        this.analyser.getByteFrequencyData(dataArray);

        const width = canvas.width / window.devicePixelRatio;
        const height = canvas.height / window.devicePixelRatio;

        ctx.clearRect(0, 0, width, height);

        // Draw frequency bars with gradient
        const barWidth = (width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * (height * 0.85);

          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#6366f1');
          gradient.addColorStop(0.5, '#06b6d4');
          gradient.addColorStop(1, '#f43f5e');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight - 4, barWidth - 1, barHeight + 4, [3, 3, 0, 0]);
          ctx.fill();

          x += barWidth + 1.5;
        }
      };

      draw();
      this.logDiagnostic('WEBAUDIO', 'Live microphone Web Audio visualizer initialized');
    } catch (err) {
      console.warn('Microphone visualizer stream error:', err);
      this.drawIdleWave();
    }
  }

  stopAudioVisualizer() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.drawIdleWave();
  }

  // =========================================================================
  // Actions & Export Helpers
  // =========================================================================
  copyTranscript() {
    const text = this.finalTranscriptArea.value;
    if (!text.trim()) {
      this.showToast('No transcript to copy');
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      this.showToast('Transcript copied to clipboard! 📋');
    }).catch(err => {
      this.showToast('Failed to copy text', 'error');
    });
  }

  speakTranscript() {
    const text = this.finalTranscriptArea.value.trim();
    if (!text) {
      this.showToast('No text to speak');
      return;
    }

    if (!('speechSynthesis' in window)) {
      this.showToast('Text-to-Speech not supported in this browser', 'error');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.selectedLanguage;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => this.showToast('Playing TTS playback 🔊');
    utterance.onend = () => this.showToast('Playback finished');
    utterance.onerror = (e) => this.showToast(`TTS Error: ${e.error}`, 'error');

    window.speechSynthesis.speak(utterance);
    this.logDiagnostic('TTS_PLAYBACK', `Playing text-to-speech with lang ${this.selectedLanguage}`);
  }

  exportAsTxt() {
    const text = this.finalTranscriptArea.value;
    if (!text.trim()) {
      this.showToast('Transcript is empty');
      return;
    }
    this.downloadFile(`transcript-${this.selectedLanguage}-${Date.now()}.txt`, 'text/plain', text);
    this.showToast('Downloaded text file (.txt)');
  }

  exportAsJson() {
    if (this.segments.length === 0 && !this.finalTranscriptArea.value.trim()) {
      this.showToast('No transcript data to export');
      return;
    }

    const payload = {
      meta: {
        app: 'EchoNative STT Studio',
        language: this.selectedLanguage,
        exportedAt: new Date().toISOString(),
        totalWords: parseInt(this.wordCount.textContent, 10),
        totalCharacters: parseInt(this.charCount.textContent, 10),
        avgConfidence: this.avgConfidence.textContent
      },
      fullTranscript: this.finalTranscriptArea.value,
      segments: this.segments
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    this.downloadFile(`stt-session-${this.selectedLanguage}-${Date.now()}.json`, 'application/json', jsonStr);
    this.showToast('Downloaded JSON session data (.json)');
  }

  exportAsSrt() {
    if (this.segments.length === 0) {
      this.showToast('No timeline segments to export as SRT');
      return;
    }

    let srtContent = '';
    this.segments.forEach((seg, index) => {
      const idx = index + 1;
      const startSec = index * 4;
      const endSec = startSec + 3;

      const formatTime = (seconds) => {
        const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        return `${h}:${m}:${s},000`;
      };

      srtContent += `${idx}\n${formatTime(startSec)} --> ${formatTime(endSec)}\n${seg.text}\n\n`;
    });

    this.downloadFile(`subtitles-${this.selectedLanguage}-${Date.now()}.srt`, 'text/plain', srtContent);
    this.showToast('Downloaded Subtitle file (.srt)');
  }

  downloadFile(filename, mimeType, content) {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  clearAll() {
    if (this.isRecording) {
      this.stopRecording();
    }
    this.finalTranscriptArea.value = '';
    this.liveStreamText.innerHTML = '<span class="placeholder-text">Speak into your microphone to see live transcription here...</span>';
    this.liveConfidence.textContent = 'Ready';
    this.liveConfidence.className = 'confidence-indicator';
    this.segments = [];
    this.confidenceScores = [];
    this.timelineContainer.innerHTML = `
      <div class="empty-timeline-state">
        <p>No speech segments captured yet. Start speaking to build the timeline!</p>
      </div>
    `;
    this.updateMetrics();
    try {
      localStorage.removeItem('echonative_stt_session');
    } catch (e) {
      console.warn('LocalStorage clear error:', e);
    }
    this.durationTimer.textContent = '00:00';
    this.showToast('Transcripts cleared');
  }

  // =========================================================================
  // Diagnostics & Toast Logger
  // =========================================================================
  logDiagnostic(eventName, message, payload = null) {
    const time = new Date().toLocaleTimeString();
    const logItem = { time, eventName, message, payload };
    this.diagnosticsLogs.unshift(logItem);

    // Render in drawer
    const itemEl = document.createElement('div');
    const eventClass = `event-${eventName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    itemEl.className = `log-item ${eventClass}`;

    let payloadStr = '';
    if (payload) {
      payloadStr = `<div class="log-payload">${this.escapeHTML(typeof payload === 'object' ? JSON.stringify(payload, null, 2) : String(payload))}</div>`;
    }

    itemEl.innerHTML = `
      <div class="log-meta">
        <span class="log-event-name">[${this.escapeHTML(eventName)}]</span>
        <span>${time}</span>
      </div>
      <div class="log-msg">${this.escapeHTML(message)}</div>
      ${payloadStr}
    `;

    this.eventLogsList.prepend(itemEl);
    this.logCountBadge.textContent = this.diagnosticsLogs.length;
  }

  showToast(message, type = 'info') {
    this.toastMessage.textContent = message;
    this.toastNotification.className = `toast ${type === 'error' ? 'btn-danger-soft' : ''}`;
    this.toastNotification.classList.remove('hidden');

    setTimeout(() => {
      this.toastNotification.classList.add('hidden');
    }, 3200);
  }

  generateRefId() {
    const timestamp = Date.now();
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `crm_ref_${timestamp}_${rand}`;
  }

  async sendCurrentSessionTranscript(isManual = false) {
    // If auto-sending (isManual === false) and auto-send toggle is turned off, skip it
    if (!isManual && this.apiAutoSendToggle && !this.apiAutoSendToggle.checked) {
      this.logDiagnostic('API_SEND_SKIP', 'Auto-send is disabled by toggle.');
      return;
    }

    // Determine target text: manual send sends editor contents, auto-send sends recorded session
    let text = '';
    if (isManual) {
      text = this.finalTranscriptArea.value ? this.finalTranscriptArea.value.trim() : '';
    } else {
      text = this.currentSessionText ? this.currentSessionText.trim() : '';
      // Fallback to final transcript area if session text is empty but final text exists
      if (!text && this.finalTranscriptArea.value) {
        text = this.finalTranscriptArea.value.trim();
      }
    }

    if (!text) {
      this.logDiagnostic('API_SEND_SKIP', 'No transcript text to send to API.');
      this.showToast('No transcript text to send', 'info');
      return;
    }

    let refId = this.apiRefIdInput ? this.apiRefIdInput.value.trim() : '';
    if (!refId) {
      refId = this.generateRefId();
    }
    const source = this.apiSourceInput ? this.apiSourceInput.value.trim() : 'CRM';
    const payload = {
      text: text,
      ref_id: refId,
      source: source
    };

    const apiEndpoint = this.apiEndpointInput ? this.apiEndpointInput.value.trim() : 'http://localhost:8000/api/stt';

    const headers = {
      'Content-Type': 'application/json'
    };

    const token = this.apiAuthKeyInput ? this.apiAuthKeyInput.value.trim() : '';
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('%c[API Request] Details:', 'color: #8b5cf6; font-weight: bold;');
    console.log('URL:', apiEndpoint);
    console.log('Headers:', headers);
    console.log('Payload:', payload);
    console.table(payload);

    this.logDiagnostic('API_SEND_PAYLOAD', 'Preparing to send formatted payload to API', payload);

    try {
      this.showToast(`Sending to API (Ref: ${refId})...`);
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        let responseData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json().catch(() => null);
        } else {
          responseData = await response.text().catch(() => '');
        }
        console.log('%c[API Response] Success:', 'color: #10b981; font-weight: bold;');
        console.log(responseData);
        this.showToast(`API success! Transcript sent.`, 'success');
        this.logDiagnostic('API_SEND_SUCCESS', 'API request succeeded', {
          status: response.status,
          statusText: response.statusText,
          response: responseData
        });
      } else {
        const errorText = await response.text().catch(() => '');
        console.error('%c[API Response] Error:', 'color: #f43f5e; font-weight: bold;', response.status);
        console.log(errorText);
        this.showToast(`API error: ${response.status}`, 'error');
        this.logDiagnostic('API_SEND_ERROR', `API returned status ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
      }
    } catch (err) {
      console.error('%c[API Fetch Exception] Failed to connect:', 'color: #f43f5e; font-weight: bold;', err);
      this.showToast(`Failed to connect to API`, 'error');
      this.logDiagnostic('API_SEND_EXCEPTION', `Fetch failed: ${err.message}`, {
        error: err.stack || err.message
      });
    }

    if (!isManual) {
      this.currentSessionText = '';
    }
  }

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  window.sttStudio = new STTStudioApp();
});
