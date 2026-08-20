/**
 * Curie AI Chat & Native Web STT Studio
 * High-performance browser speech recognition with CRM intelligence
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
  { code: 'te-IN', name: 'Telugu (India)', native: 'తెలుగు (భారతదేశം)', group: 'South Asia' },
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

class CurieChatApp {
  constructor() {
    this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = null;
    this.isRecording = false;
    this.userExplicitlyStopped = true;
    this.selectedLanguage = 'si-LK';
    this.currentSessionText = '';
    this.isHoldingMic = false;
    this.holdTimer = null;
    this.crmMode = true;

    // State metrics
    this.sessionStartTime = null;
    this.timerInterval = null;
    this.segments = [];
    this.confidenceScores = [];
    this.diagnosticsLogs = [];
    this.chatMessages = [];

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
    // Header & Navigation
    this.drawerToggleBtn = document.getElementById('drawerToggleBtn');
    this.sidePanelDrawer = document.getElementById('sidePanelDrawer');
    this.closeSidePanelBtn = document.getElementById('closeSidePanelBtn');
    this.drawerBackdrop = document.getElementById('drawerBackdrop');
    this.topSettingsBtn = document.getElementById('topSettingsBtn');
    this.railHomeBtn = document.getElementById('railHomeBtn');
    this.railNewChatBtn = document.getElementById('railNewChatBtn');
    this.railHistoryBtn = document.getElementById('railHistoryBtn');
    this.railSettingsBtn = document.getElementById('railSettingsBtn');
    this.departmentSelect = document.getElementById('departmentSelect');
    this.billingActionBtn = document.getElementById('billingActionBtn');
    this.logoutBtn = document.getElementById('logoutBtn');

    // Patient Search Modal (CTRL+P)
    this.patientSearchTrigger = document.getElementById('patientSearchTrigger');
    this.patientSearchModal = document.getElementById('patientSearchModal');
    this.closePatientModalBtn = document.getElementById('closePatientModalBtn');
    this.patientModalSearchInput = document.getElementById('patientModalSearchInput');
    this.patientSearchResults = document.getElementById('patientSearchResults');

    // Badges & Diagnostics
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

    // Workspace & Chat Views
    this.chatContentScroll = document.getElementById('chatContentScroll');
    this.curieHeroView = document.getElementById('curieHeroView');
    this.chatMessagesStream = document.getElementById('chatMessagesStream');
    this.suggestionButtons = document.querySelectorAll('.suggestion-pill-btn');
    this.liveVoiceStreamBar = document.getElementById('liveVoiceStreamBar');
    this.liveStreamText = document.getElementById('liveStreamText');
    this.liveConfidence = document.getElementById('liveConfidence');

    // Floating Input Controls
    this.chatTextInput = document.getElementById('chatTextInput');
    this.finalTranscriptArea = document.getElementById('finalTranscriptArea');
    this.crmModeToggleBtn = document.getElementById('crmModeToggleBtn');
    this.micButton = document.getElementById('micButton');
    this.micIcon = document.getElementById('micIcon');
    this.micStopIcon = document.getElementById('micStopIcon');
    this.sendChatBtn = document.getElementById('sendChatBtn');
    this.sendToApiBtn = document.getElementById('sendToApiBtn');
    this.micStatusText = document.getElementById('micStatusText');
    this.micHintText = document.getElementById('micHintText');
    this.currentLangTag = document.getElementById('currentLangTag');
    this.waveformCanvas = document.getElementById('waveformCanvas');
    this.visualizerOverlay = document.getElementById('visualizerOverlay');

    // Side Panel Tabs & Settings
    this.drawerTabButtons = document.querySelectorAll('.drawer-tab-btn');
    this.drawerSectionTabs = document.querySelectorAll('.drawer-section-tab');
    this.languageSelect = document.getElementById('languageSelect');
    this.langPills = document.querySelectorAll('.lang-pill');
    this.continuousToggle = document.getElementById('continuousToggle');
    this.interimToggle = document.getElementById('interimToggle');
    this.autoRestartToggle = document.getElementById('autoRestartToggle');
    this.visualizerToggle = document.getElementById('visualizerToggle');
    this.apiEndpointInput = document.getElementById('apiEndpointInput');
    this.apiAuthKeyInput = document.getElementById('apiAuthKeyInput');
    this.apiSourceInput = document.getElementById('apiSourceInput');
    this.apiAutoSendToggle = document.getElementById('apiAutoSendToggle');
    this.apiCorsProxyToggle = document.getElementById('apiCorsProxyToggle');

    // History & Timeline
    this.sessionHistoryList = document.getElementById('sessionHistoryList');
    this.timelineContainer = document.getElementById('timelineContainer');
    this.copyBtn = document.getElementById('copyBtn');
    this.ttsBtn = document.getElementById('ttsBtn');
    this.clearBtn = document.getElementById('clearBtn');
    this.exportDropdownBtn = document.getElementById('exportDropdownBtn');
    this.exportMenu = document.getElementById('exportMenu');
    this.exportTxtBtn = document.getElementById('exportTxtBtn');
    this.exportJsonBtn = document.getElementById('exportJsonBtn');
    this.exportSrtBtn = document.getElementById('exportSrtBtn');

    // Metrics
    this.durationTimer = document.getElementById('durationTimer');
    this.wordCount = document.getElementById('wordCount');
    this.charCount = document.getElementById('charCount');
    this.avgConfidence = document.getElementById('avgConfidence');

    // API Response Inspector
    this.apiTabBadge = document.getElementById('apiTabBadge');
    this.emptyApiState = document.getElementById('emptyApiState');
    this.apiResultCard = document.getElementById('apiResultCard');
    this.apiResponseStatusBadge = document.getElementById('apiResponseStatusBadge');
    this.apiResponseStatusText = document.getElementById('apiResponseStatusText');
    this.apiResponseLatency = document.getElementById('apiResponseLatency');
    this.apiResponseTimestamp = document.getElementById('apiResponseTimestamp');
    this.apiExtractedBox = document.getElementById('apiExtractedBox');
    this.apiExtractedText = document.getElementById('apiExtractedText');
    this.apiResponseBodyCode = document.getElementById('apiResponseBodyCode');
    this.copyApiResponseBtn = document.getElementById('copyApiResponseBtn');
    this.speakApiResponseBtn = document.getElementById('speakApiResponseBtn');
    this.clearApiResponseBtn = document.getElementById('clearApiResponseBtn');

    // Toasts
    this.toastNotification = document.getElementById('toastNotification');
    this.toastMessage = document.getElementById('toastMessage');

    this.lastApiResponseData = null;
    this.lastExtractedReply = '';
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
        <span class="status-text">Web Speech API ✓</span>
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
      this.logDiagnostic('SYSTEM_ERROR', 'SpeechRecognition API is NOT supported in this browser environment.');
    }
  }

  initNetworkAndOffline() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            this.logDiagnostic('SERVICE_WORKER', `Service Worker registered (scope: ${reg.scope})`);
          })
          .catch((err) => {
            this.logDiagnostic('SERVICE_WORKER_WARN', 'Service Worker registration failed:', err);
          });
      });
    }

    const updateStatus = () => {
      const isOnline = navigator.onLine;
      if (this.networkStatusBadge) {
        if (isOnline) {
          this.networkStatusBadge.className = 'network-badge online';
          this.networkStatusText.textContent = 'Online';
        } else {
          this.networkStatusBadge.className = 'network-badge offline';
          this.networkStatusText.textContent = 'Offline';
        }
      }
    };

    window.addEventListener('online', () => {
      updateStatus();
      this.showToast('Online 🌐 (Neural cloud & local speech active)');
      this.logDiagnostic('NETWORK_ONLINE', 'Network connection restored.');
    });

    window.addEventListener('offline', () => {
      updateStatus();
      this.showToast('Offline Mode ⚡ (Using local dictation)', 'info');
      this.logDiagnostic('NETWORK_OFFLINE', 'Device is offline.');
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
        chatMessages: this.chatMessages,
        apiEndpoint: this.apiEndpointInput ? this.apiEndpointInput.value : 'http://localhost:8000/api/stt',
        apiAuthKey: this.apiAuthKeyInput ? this.apiAuthKeyInput.value : '',
        apiAutoSend: this.apiAutoSendToggle ? this.apiAutoSendToggle.checked : true,
        apiCorsProxy: this.apiCorsProxyToggle ? this.apiCorsProxyToggle.checked : true,
        apiSource: this.apiSourceInput ? this.apiSourceInput.value : 'CRM',
        crmMode: this.crmMode,
        lastApiResponseData: this.lastApiResponseData,
        updatedAt: Date.now()
      };
      localStorage.setItem('curie_ai_chat_session', JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  loadSessionFromStorage() {
    try {
      const raw = localStorage.getItem('curie_ai_chat_session');
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
      if (Array.isArray(data.chatMessages) && data.chatMessages.length > 0) {
        this.chatMessages = data.chatMessages;
        this.curieHeroView.classList.add('hidden');
        this.chatMessagesStream.classList.remove('hidden');
        this.chatMessages.forEach(msg => this.renderMessageBubble(msg, false));
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
      if (data.apiCorsProxy !== undefined && this.apiCorsProxyToggle) {
        this.apiCorsProxyToggle.checked = data.apiCorsProxy;
      }
      if (data.apiSource && this.apiSourceInput) {
        this.apiSourceInput.value = data.apiSource;
      }
      if (data.crmMode !== undefined) {
        this.crmMode = data.crmMode;
        this.crmModeToggleBtn.classList.toggle('active', this.crmMode);
      }
      if (data.lastApiResponseData) {
        this.renderApiResponse(data.lastApiResponseData);
      }
      this.updateMetrics();
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }
  }

  setupEventListeners() {
    // 1. Drawer Toggle (Hamburger & Rail buttons)
    this.drawerToggleBtn.addEventListener('click', () => this.toggleSidePanel(true));
    this.closeSidePanelBtn.addEventListener('click', () => this.toggleSidePanel(false));
    this.drawerBackdrop.addEventListener('click', () => this.toggleSidePanel(false));

    if (this.topSettingsBtn) {
      this.topSettingsBtn.addEventListener('click', () => {
        this.toggleSidePanel(true);
        this.switchDrawerTab('settings');
      });
    }

    if (this.railSettingsBtn) {
      this.railSettingsBtn.addEventListener('click', () => {
        this.toggleSidePanel(true);
        this.switchDrawerTab('settings');
      });
    }

    if (this.railHistoryBtn) {
      this.railHistoryBtn.addEventListener('click', () => {
        this.toggleSidePanel(true);
        this.switchDrawerTab('history');
      });
    }

    if (this.railHomeBtn) {
      this.railHomeBtn.addEventListener('click', () => {
        this.toggleSidePanel(false);
      });
    }

    if (this.railNewChatBtn) {
      this.railNewChatBtn.addEventListener('click', () => {
        this.startNewChat();
      });
    }

    // 2. Drawer Navigation Tabs
    this.drawerTabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabKey = btn.dataset.drawerTab;
        this.switchDrawerTab(tabKey);
      });
    });

    // 3. Patient Search (CTRL+P & Click)
    this.patientSearchTrigger.addEventListener('click', () => this.openPatientSearchModal());
    this.closePatientModalBtn.addEventListener('click', () => this.closePatientSearchModal());
    this.patientSearchModal.addEventListener('click', (e) => {
      if (e.target === this.patientSearchModal) this.closePatientSearchModal();
    });

    window.addEventListener('keydown', (e) => {
      // Ctrl+P or Cmd+P
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        this.openPatientSearchModal();
      }
      // Escape
      if (e.key === 'Escape') {
        this.closePatientSearchModal();
        this.toggleSidePanel(false);
        this.diagnosticsDrawer.classList.add('hidden');
      }
    });

    this.patientModalSearchInput.addEventListener('input', (e) => {
      this.filterPatients(e.target.value);
    });

    this.patientSearchResults.addEventListener('click', (e) => {
      const item = e.target.closest('.patient-result-item');
      if (item) {
        const name = item.dataset.name;
        const id = item.dataset.id;
        const dept = item.dataset.dept;
        this.selectPatient(name, id, dept);
      }
    });

    // 4. Suggestion Pills
    this.suggestionButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.dataset.query;
        this.chatTextInput.value = query;
        this.sendChatMessage(query);
      });
    });

    // 5. Message Input & Send Button
    this.sendChatBtn.addEventListener('click', () => {
      const text = this.chatTextInput.value.trim();
      if (text) {
        this.sendChatMessage(text);
      }
    });

    this.chatTextInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = this.chatTextInput.value.trim();
        if (text) {
          this.sendChatMessage(text);
        }
      }
    });

    this.chatTextInput.addEventListener('input', () => {
      this.adjustInputHeight();
      this.finalTranscriptArea.value = this.chatTextInput.value;
      this.updateMetrics();
    });

    // 6. CRM Mode Toggle
    this.crmModeToggleBtn.addEventListener('click', () => {
      this.crmMode = !this.crmMode;
      this.crmModeToggleBtn.classList.toggle('active', this.crmMode);
      if (this.apiSourceInput) {
        this.apiSourceInput.value = this.crmMode ? 'AH_CRM' : 'GENERAL';
      }
      this.showToast(this.crmMode ? 'AH CRM Context Enabled' : 'Standard Chat Mode');
      this.saveSessionToStorage();
    });

    // 7. Microphone Hold-to-Talk and Click-to-Toggle
    // Hold behavior (Mouse/Touch)
    this.micButton.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      this.isHoldingMic = false;
      this.holdTimer = setTimeout(() => {
        this.isHoldingMic = true;
        if (!this.isRecording) {
          this.startRecording();
        }
      }, 250);
    });

    window.addEventListener('mouseup', () => {
      clearTimeout(this.holdTimer);
      if (this.isHoldingMic) {
        this.isHoldingMic = false;
        if (this.isRecording) {
          this.stopRecording();
        }
      }
    });

    // Touch support for mobile
    this.micButton.addEventListener('touchstart', (e) => {
      this.isHoldingMic = false;
      this.holdTimer = setTimeout(() => {
        this.isHoldingMic = true;
        if (!this.isRecording) {
          this.startRecording();
        }
      }, 250);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      clearTimeout(this.holdTimer);
      if (this.isHoldingMic) {
        this.isHoldingMic = false;
        if (this.isRecording) {
          this.stopRecording();
        }
      }
    });

    // Simple Click behavior
    this.micButton.addEventListener('click', () => {
      if (!this.isHoldingMic) {
        if (this.isRecording) {
          this.stopRecording();
        } else {
          this.startRecording();
        }
      }
    });

    // 8. Language Controls
    this.languageSelect.addEventListener('change', (e) => {
      this.setLanguage(e.target.value);
    });

    this.langPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.setLanguage(pill.dataset.lang);
      });
    });

    // 9. Actions (Copy, Speak, Clear, Export)
    this.copyBtn.addEventListener('click', () => this.copyTranscript());
    this.ttsBtn.addEventListener('click', () => this.speakTranscript());
    this.clearBtn.addEventListener('click', () => this.clearAll());

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

    // 10. API Settings & Inspector Actions
    if (this.apiEndpointInput) {
      this.apiEndpointInput.addEventListener('input', () => this.saveSessionToStorage());
    }
    if (this.apiAuthKeyInput) {
      this.apiAuthKeyInput.addEventListener('input', () => this.saveSessionToStorage());
    }
    if (this.apiSourceInput) {
      this.apiSourceInput.addEventListener('input', () => this.saveSessionToStorage());
    }
    if (this.apiAutoSendToggle) {
      this.apiAutoSendToggle.addEventListener('change', () => this.saveSessionToStorage());
    }
    if (this.apiCorsProxyToggle) {
      this.apiCorsProxyToggle.addEventListener('change', () => this.saveSessionToStorage());
    }

    if (this.copyApiResponseBtn) {
      this.copyApiResponseBtn.addEventListener('click', () => this.copyApiResponse());
    }
    if (this.speakApiResponseBtn) {
      this.speakApiResponseBtn.addEventListener('click', () => this.speakApiResponse());
    }
    if (this.clearApiResponseBtn) {
      this.clearApiResponseBtn.addEventListener('click', () => this.clearApiResponse());
    }

    // 11. Diagnostics Drawer
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
      this.logCountBadge.classList.add('hidden');
      this.showToast('Diagnostics logs cleared');
    });

    if (this.billingActionBtn) {
      this.billingActionBtn.addEventListener('click', () => {
        this.sendChatMessage("Show billing and claims status for pending items");
      });
    }

    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => {
        this.showToast('Session ehr_test active. Click to lock.');
      });
    }
  }

  toggleSidePanel(isOpen) {
    if (isOpen) {
      this.sidePanelDrawer.classList.add('open');
      this.drawerBackdrop.classList.remove('hidden');
    } else {
      this.sidePanelDrawer.classList.remove('open');
      this.drawerBackdrop.classList.add('hidden');
    }
  }

  switchDrawerTab(tabKey) {
    this.drawerTabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.drawerTab === tabKey);
    });

    this.drawerSectionTabs.forEach(tab => {
      tab.classList.remove('active');
    });

    const target = document.getElementById(`drawer${tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}Tab`);
    if (target) {
      target.classList.add('active');
    }
  }

  openPatientSearchModal() {
    this.patientSearchModal.classList.remove('hidden');
    this.patientModalSearchInput.value = '';
    this.patientModalSearchInput.focus();
    this.filterPatients('');
  }

  closePatientSearchModal() {
    this.patientSearchModal.classList.add('hidden');
  }

  filterPatients(query) {
    const q = query.toLowerCase().trim();
    const items = this.patientSearchResults.querySelectorAll('.patient-result-item');
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(q) ? 'flex' : 'none';
    });
  }

  selectPatient(name, id, dept) {
    this.closePatientSearchModal();
    this.departmentSelect.value = dept.toLowerCase().includes('cardio') ? 'cardiology' : 'all';
    this.showToast(`Selected Patient: ${name} (${id})`);
    this.sendChatMessage(`Review chart and pending orders for patient ${name} (${id})`);
  }

  startNewChat() {
    this.chatMessages = [];
    this.chatMessagesStream.innerHTML = '';
    this.chatMessagesStream.classList.add('hidden');
    this.curieHeroView.classList.remove('hidden');
    this.chatTextInput.value = '';
    this.finalTranscriptArea.value = '';
    this.segments = [];
    this.confidenceScores = [];
    this.timelineContainer.innerHTML = `
      <div class="empty-timeline-state">
        <p>No speech segments captured yet. Speak to build timeline.</p>
      </div>
    `;
    this.updateMetrics();
    this.saveSessionToStorage();
    this.showToast('Started new consultation session');
    this.toggleSidePanel(false);
  }

  adjustInputHeight() {
    this.chatTextInput.style.height = 'auto';
    this.chatTextInput.style.height = Math.min(this.chatTextInput.scrollHeight, 120) + 'px';
  }

  setLanguage(langCode) {
    this.selectedLanguage = langCode;
    this.languageSelect.value = langCode;

    this.langPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.lang === langCode);
    });

    this.updateCurrentLangDisplay();
    this.showToast(`Language set to: ${langCode}`);
    this.logDiagnostic('CONFIG_CHANGE', `Language changed to ${langCode}`);

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

  // =========================================================================
  // Speech Recognition Core
  // =========================================================================
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

      this.logDiagnostic('RECOGNITION_START', `Recognition started [lang: ${this.selectedLanguage}]`);
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
    this.liveVoiceStreamBar.classList.add('hidden');
    this.logDiagnostic('USER_STOP', 'User stopped recording');

    // Auto-send if enabled
    if (this.apiAutoSendToggle && this.apiAutoSendToggle.checked && this.currentSessionText.trim()) {
      this.sendCurrentSessionTranscript();
    }
  }

  attachRecognitionEvents() {
    this.recognition.onstart = () => {
      this.liveVoiceStreamBar.classList.remove('hidden');
      this.micStatusText.textContent = 'Listening...';
      this.logDiagnostic('onstart', 'Speech recognition engine active');
    };

    this.recognition.onspeechstart = () => {
      this.micStatusText.textContent = 'Speech Detected';
      this.logDiagnostic('onspeechstart', 'Human voice detected');
    };

    this.recognition.onspeechend = () => {
      this.micStatusText.textContent = 'Processing...';
      this.logDiagnostic('onspeechend', 'Speech segment ended');
    };

    this.recognition.onresult = (event) => {
      this.handleRecognitionResult(event);
    };

    this.recognition.onerror = (event) => {
      this.handleRecognitionError(event);
    };

    this.recognition.onend = () => {
      this.logDiagnostic('onend', 'Recognition session ended');
      if (!this.userExplicitlyStopped && this.autoRestartToggle.checked) {
        try {
          this.recognition.start();
        } catch (e) {
          setTimeout(() => {
            if (!this.userExplicitlyStopped) this.startRecording();
          }, 300);
        }
      } else {
        this.isRecording = false;
        this.updateMicUI(false);
        this.stopDurationTimer();
        this.stopAudioVisualizer();
      }
    };
  }

  handleRecognitionResult(event) {
    let interimTranscript = '';
    let finalTranscriptBatch = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      if (result.isFinal) {
        finalTranscriptBatch += transcript + ' ';
        this.currentSessionText += transcript + ' ';

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

        this.logDiagnostic('onresult (FINAL)', `"${transcript.trim()}"`, {
          confidence: segmentObj.confidence + '%'
        });
      } else {
        interimTranscript += transcript;
      }
    }

    // Update live bar
    if (interimTranscript) {
      this.liveVoiceStreamBar.classList.remove('hidden');
      this.liveStreamText.innerHTML = `<span class="live-interim-text">${this.escapeHTML(interimTranscript)}</span>`;
      this.liveConfidence.textContent = 'Transcribing...';
    } else if (finalTranscriptBatch) {
      this.liveStreamText.innerHTML = `<span>✓ ${this.escapeHTML(finalTranscriptBatch)}</span>`;
    }

    // Append to chat input
    if (finalTranscriptBatch) {
      const cur = this.chatTextInput.value;
      const sep = cur.length > 0 && !cur.endsWith(' ') ? ' ' : '';
      this.chatTextInput.value = cur + sep + finalTranscriptBatch.trim();
      this.adjustInputHeight();
      this.finalTranscriptArea.value = this.chatTextInput.value;
    }

    this.updateMetrics();
  }

  handleRecognitionError(event) {
    let errorMsg = event.error;
    let hint = 'Check microphone settings';

    switch (event.error) {
      case 'not-allowed':
        errorMsg = 'Microphone permission denied';
        hint = 'Please grant microphone access';
        this.showToast('Microphone access denied', 'error');
        this.stopRecording();
        break;
      case 'no-speech':
        errorMsg = 'No speech detected';
        break;
      case 'network':
        errorMsg = 'Network connectivity issue';
        this.showToast('Speech API network error', 'error');
        break;
      case 'audio-capture':
        errorMsg = 'Audio capture failed';
        this.stopRecording();
        break;
    }

    this.logDiagnostic('onerror', `Error: ${event.error}`, { hint, message: event.message || '' });
  }

  appendTimelineCard(segment) {
    const emptyState = this.timelineContainer.querySelector('.empty-timeline-state');
    if (emptyState) emptyState.remove();

    const card = document.createElement('div');
    card.className = 'timeline-segment-card';
    card.innerHTML = `
      <div class="segment-meta">
        <span>${segment.timestamp} [${segment.lang}]</span>
        <span>Conf: ${segment.confidence}%</span>
      </div>
      <div class="segment-text">${this.escapeHTML(segment.text)}</div>
    `;

    this.timelineContainer.prepend(card);
  }

  updateMetrics() {
    const text = this.chatTextInput.value.trim() || this.finalTranscriptArea.value.trim();
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
    } else {
      this.micButton.classList.remove('recording');
      this.micIcon.classList.remove('hidden');
      this.micStopIcon.classList.add('hidden');
    }
  }

  // =========================================================================
  // Web Audio Visualizer
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
    this.drawIdleWave();
  }

  drawIdleWave() {
    const canvas = this.waveformCanvas;
    const ctx = canvas.getContext('2d');
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.2)';
    ctx.lineWidth = 1.5;
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

        const barWidth = (width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * (height * 0.85);
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#2563eb');
          gradient.addColorStop(0.5, '#38bdf8');
          gradient.addColorStop(1, '#a855f7');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, barWidth - 1, barHeight, [2, 2, 0, 0]);
          ctx.fill();

          x += barWidth + 1.5;
        }
      };

      draw();
      this.logDiagnostic('WEBAUDIO', 'Live mic waveform visualizer active');
    } catch (err) {
      console.warn('Microphone stream error:', err);
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
  // Chat Conversation & Intelligence Stream
  // =========================================================================
  sendChatMessage(messageText) {
    if (!messageText) return;

    // Switch from hero to stream
    this.curieHeroView.classList.add('hidden');
    this.chatMessagesStream.classList.remove('hidden');

    const userMsg = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lang: this.selectedLanguage
    };

    this.chatMessages.push(userMsg);
    this.renderMessageBubble(userMsg);

    // Clear input
    this.chatTextInput.value = '';
    this.chatTextInput.style.height = 'auto';

    // Dispatch to Backend API
    this.sendCurrentSessionTranscript(true, messageText);

    // Generate intelligent Assistant reply
    this.generateAssistantReply(messageText);

    this.saveSessionToStorage();
  }

  renderMessageBubble(msg, scroll = true) {
    const row = document.createElement('div');
    row.className = `chat-bubble-row ${msg.sender}`;

    if (msg.sender === 'user') {
      row.innerHTML = `
        <div class="chat-bubble user">
          <div class="bubble-content">${this.escapeHTML(msg.text)}</div>
          <div class="bubble-meta">
            <span>${msg.timestamp}</span>
            <span>• [${msg.lang || 'si-LK'}]</span>
          </div>
        </div>
      `;
    } else {
      row.innerHTML = `
        <div class="chat-bubble assistant">
          <div class="bubble-content">${msg.html || this.escapeHTML(msg.text)}</div>
          <div class="bubble-actions-row">
            <button class="bubble-btn-action tts-play-btn" data-text="${this.escapeHTML(msg.text)}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
              <span>Speak</span>
            </button>
            <button class="bubble-btn-action copy-bubble-btn" data-text="${this.escapeHTML(msg.text)}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy</span>
            </button>
          </div>
        </div>
      `;

      // Wire action buttons
      row.querySelector('.tts-play-btn')?.addEventListener('click', (e) => {
        const t = e.currentTarget.dataset.text;
        this.speakText(t);
      });
      row.querySelector('.copy-bubble-btn')?.addEventListener('click', (e) => {
        const t = e.currentTarget.dataset.text;
        navigator.clipboard.writeText(t).then(() => this.showToast('Copied to clipboard!'));
      });
    }

    this.chatMessagesStream.appendChild(row);

    if (scroll) {
      this.chatContentScroll.scrollTop = this.chatContentScroll.scrollHeight;
    }
  }

  generateAssistantReply(query) {
    const q = query.toLowerCase();
    setTimeout(() => {
      let replyHtml = '';
      let replyText = '';

      if (q.includes('po') || q.includes('purchase order') || q.includes('approval')) {
        replyText = "Here are your pending Purchase Orders requiring approval. 3 POs are flagged for review.";
        replyHtml = `
          <p><strong>Curie CRM Intelligence:</strong> Found <strong>3 pending Purchase Orders</strong> awaiting your authorization.</p>
          <div class="po-approval-card">
            <div class="po-card-header">
              <span>📋 PO #2024-884 (Cardiology Stents)</span>
              <span class="patient-badge alert">$14,250.00</span>
            </div>
            <div class="po-item-row">
              <span>Vendor: MedTech Global Inc.</span>
              <span>Requested by: Dr. Vance</span>
            </div>
            <div class="po-item-row">
              <span>Items: 20x BioMatrix Drug-Eluting Stents</span>
              <span>Priority: High</span>
            </div>
            <div class="po-card-buttons">
              <button class="btn-po-approve" onclick="window.sttStudio.showToast('PO #2024-884 Approved ✓')">Approve PO</button>
              <button class="btn-po-details" onclick="window.sttStudio.showToast('Opening PO inspection view')">Inspect Items</button>
            </div>
          </div>
          <div class="po-approval-card" style="margin-top: 0.5rem;">
            <div class="po-card-header">
              <span>📋 PO #2024-889 (Radiology Contrast)</span>
              <span class="patient-badge">$3,800.00</span>
            </div>
            <div class="po-item-row">
              <span>Vendor: Bayer Healthcare</span>
              <span>Requested by: Sarah Jenkins</span>
            </div>
            <div class="po-card-buttons">
              <button class="btn-po-approve" onclick="window.sttStudio.showToast('PO #2024-889 Approved ✓')">Approve PO</button>
            </div>
          </div>
          <div class="po-approval-card" style="margin-top: 0.5rem;">
            <div class="po-card-header">
              <span>📋 PO #2024-892 (General Surgical Kits)</span>
              <span class="patient-badge">$1,450.00</span>
            </div>
            <div class="po-item-row">
              <span>Vendor: Apex Medical</span>
              <span>Requested by: Michael Chen</span>
            </div>
            <div class="po-card-buttons">
              <button class="btn-po-approve" onclick="window.sttStudio.showToast('PO #2024-892 Approved ✓')">Approve PO</button>
            </div>
          </div>
        `;
      } else if (q.includes('tackle first') || q.includes('duplicate')) {
        replyText = "High priority items to tackle first: PO #2024-884 has a 24hr expiration window. 2 duplicate items detected on PO #2024-890.";
        replyHtml = `
          <p><strong>Priority Recommendations:</strong></p>
          <ul style="margin-left: 1.25rem; margin-top: 0.5rem; font-size: 0.88rem; line-height: 1.6;">
            <li>🔴 <strong>PO #2024-884</strong> (Cardiology): Expiring in 24 hours — requires immediate signature.</li>
            <li>⚠️ <strong>Duplicate alert:</strong> PO #2024-890 shares 10x contrast vials with PO #2024-889.</li>
            <li>🟢 Grouping 4 general medical supply orders saved 12% in freight costs.</li>
          </ul>
        `;
      } else {
        replyText = `Processed your inquiry regarding "${query}". Transcribed and logged under department ${this.departmentSelect.value.toUpperCase()}.`;
        replyHtml = `<p>${replyText}</p>`;
      }

      const assistantMsg = {
        id: 'msg_' + Date.now(),
        sender: 'assistant',
        text: replyText,
        html: replyHtml,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      this.chatMessages.push(assistantMsg);
      this.renderMessageBubble(assistantMsg);
      this.saveSessionToStorage();
    }, 600);
  }

  // =========================================================================
  // API Transmission & Inspector
  // =========================================================================
  async sendCurrentSessionTranscript(isManual = false, overrideText = '') {
    if (!isManual && this.apiAutoSendToggle && !this.apiAutoSendToggle.checked) {
      return;
    }

    let text = overrideText || (isManual ? this.chatTextInput.value.trim() || this.finalTranscriptArea.value.trim() : this.currentSessionText.trim());
    if (!text) return;

    const refId = `crm_ref_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const source = this.apiSourceInput ? this.apiSourceInput.value.trim() : 'CRM';
    const payload = {
      text: text,
      ref_id: refId,
      source: source,
      language: this.selectedLanguage,
      department: this.departmentSelect.value
    };

    const apiEndpoint = this.apiEndpointInput ? this.apiEndpointInput.value.trim() : 'http://localhost:8000/api/stt';
    const headers = { 'Content-Type': 'application/json' };
    const token = this.apiAuthKeyInput ? this.apiAuthKeyInput.value.trim() : '';
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const useProxy = this.apiCorsProxyToggle ? this.apiCorsProxyToggle.checked : true;
    const isExternal = apiEndpoint.startsWith('http://') || apiEndpoint.startsWith('https://');

    let requestUrl = apiEndpoint;
    const requestHeaders = { ...headers };

    if (useProxy && isExternal && !apiEndpoint.startsWith(window.location.origin)) {
      requestUrl = '/api-proxy';
      requestHeaders['x-target-url'] = apiEndpoint;
    }

    const startTime = performance.now();

    try {
      this.logDiagnostic('API_SEND', `Sending payload to ${apiEndpoint}`, payload);
      let response;
      try {
        response = await fetch(requestUrl, {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(payload)
        });
      } catch (fetchErr) {
        if (!useProxy && isExternal) {
          requestHeaders['x-target-url'] = apiEndpoint;
          response = await fetch('/api-proxy', {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify(payload)
          });
        } else {
          throw fetchErr;
        }
      }

      const latencyMs = Math.round(performance.now() - startTime);
      const contentType = response.headers.get('content-type') || '';

      if (response.ok) {
        let responseData = contentType.includes('application/json') ? await response.json().catch(() => null) : await response.text().catch(() => '');
        this.renderApiResponse({
          ok: true,
          status: response.status,
          statusText: response.statusText || 'OK',
          responseData: responseData,
          endpoint: apiEndpoint,
          refId: refId,
          source: source,
          latencyMs: `${latencyMs}ms`,
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        let errorBody = contentType.includes('application/json') ? await response.json().catch(() => null) : await response.text().catch(() => '');
        this.renderApiResponse({
          ok: false,
          status: response.status,
          statusText: response.statusText || 'Error',
          responseData: errorBody,
          endpoint: apiEndpoint,
          refId: refId,
          source: source,
          latencyMs: `${latencyMs}ms`,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    } catch (err) {
      const latencyMs = Math.round(performance.now() - startTime);
      this.renderApiResponse({
        ok: false,
        status: 'Error',
        statusText: 'Connection Failed',
        responseData: { message: err.message },
        endpoint: apiEndpoint,
        refId: refId,
        source: source,
        latencyMs: `${latencyMs}ms`,
        timestamp: new Date().toLocaleTimeString(),
        rawError: err.message
      });
    } finally {
      if (!isManual) this.currentSessionText = '';
    }
  }

  renderApiResponse(data) {
    if (!data) return;
    this.lastApiResponseData = data;

    if (this.emptyApiState) this.emptyApiState.classList.add('hidden');
    if (this.apiResultCard) this.apiResultCard.classList.remove('hidden');

    const { ok, status, statusText, responseData, latencyMs, timestamp, rawError } = data;

    if (this.apiResponseStatusBadge) {
      this.apiResponseStatusBadge.className = `api-status-pill ${ok ? 'status-success' : 'status-error'}`;
    }
    if (this.apiResponseStatusText) {
      this.apiResponseStatusText.textContent = `${status} ${statusText || ''}`.trim();
    }
    if (this.apiResponseLatency) this.apiResponseLatency.textContent = latencyMs || '0ms';
    if (this.apiResponseTimestamp) this.apiResponseTimestamp.textContent = timestamp || new Date().toLocaleTimeString();

    if (this.apiResponseBodyCode) {
      this.apiResponseBodyCode.textContent = typeof responseData === 'object' ? JSON.stringify(responseData, null, 2) : String(responseData || rawError || 'OK');
    }

    let extractedText = '';
    if (responseData && typeof responseData === 'object') {
      extractedText = responseData.message || responseData.response || responseData.reply || responseData.result || responseData.text || '';
    }

    this.lastExtractedReply = extractedText;
    if (extractedText && this.apiExtractedBox && this.apiExtractedText) {
      this.apiExtractedBox.classList.remove('hidden');
      this.apiExtractedText.textContent = extractedText;
      if (this.speakApiResponseBtn) this.speakApiResponseBtn.classList.remove('hidden');
    }

    if (this.apiTabBadge) {
      this.apiTabBadge.className = `api-badge-tag ${ok ? '' : 'status-error'}`;
      this.apiTabBadge.textContent = String(status);
      this.apiTabBadge.classList.remove('hidden');
    }

    this.saveSessionToStorage();
  }

  copyApiResponse() {
    if (this.apiResponseBodyCode) {
      navigator.clipboard.writeText(this.apiResponseBodyCode.textContent).then(() => {
        this.showToast('API Response copied! 📋');
      });
    }
  }

  speakApiResponse() {
    if (this.lastExtractedReply) {
      this.speakText(this.lastExtractedReply);
    }
  }

  clearApiResponse() {
    this.lastApiResponseData = null;
    this.lastExtractedReply = '';
    if (this.apiResultCard) this.apiResultCard.classList.add('hidden');
    if (this.emptyApiState) this.emptyApiState.classList.remove('hidden');
    if (this.apiTabBadge) this.apiTabBadge.classList.add('hidden');
    this.saveSessionToStorage();
    this.showToast('API response cleared');
  }

  // =========================================================================
  // Actions & Export
  // =========================================================================
  copyTranscript() {
    const text = this.chatTextInput.value || this.finalTranscriptArea.value;
    if (!text.trim()) {
      this.showToast('No transcript text to copy');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('Transcript copied to clipboard! 📋');
    });
  }

  speakTranscript() {
    const text = this.chatTextInput.value.trim() || this.finalTranscriptArea.value.trim();
    if (!text) {
      this.showToast('No text to speak');
      return;
    }
    this.speakText(text);
  }

  speakText(text) {
    if (!('speechSynthesis' in window)) {
      this.showToast('TTS not supported in browser', 'error');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.selectedLanguage;
    utterance.rate = 1.0;
    utterance.onstart = () => this.showToast('Playing speech synthesis 🔊');
    window.speechSynthesis.speak(utterance);
  }

  exportAsTxt() {
    const text = this.chatMessages.map(m => `[${m.timestamp}] ${m.sender.toUpperCase()}: ${m.text}`).join('\n') || this.finalTranscriptArea.value;
    if (!text.trim()) {
      this.showToast('Chat history is empty');
      return;
    }
    this.downloadFile(`curie-chat-${this.selectedLanguage}-${Date.now()}.txt`, 'text/plain', text);
    this.showToast('Downloaded text log (.txt)');
  }

  exportAsJson() {
    const payload = {
      meta: {
        app: 'Curie AI Chat Studio',
        language: this.selectedLanguage,
        exportedAt: new Date().toISOString(),
        totalSegments: this.segments.length
      },
      chatMessages: this.chatMessages,
      segments: this.segments
    };
    this.downloadFile(`curie-session-${Date.now()}.json`, 'application/json', JSON.stringify(payload, null, 2));
    this.showToast('Downloaded session JSON (.json)');
  }

  exportAsSrt() {
    if (this.segments.length === 0) {
      this.showToast('No timeline segments to export as SRT');
      return;
    }
    let srtContent = '';
    this.segments.forEach((seg, idx) => {
      const s = idx * 3;
      const e = s + 3;
      const fmt = sec => {
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const sc = String(sec % 60).padStart(2, '0');
        return `00:${m}:${sc},000`;
      };
      srtContent += `${idx + 1}\n${fmt(s)} --> ${fmt(e)}\n${seg.text}\n\n`;
    });
    this.downloadFile(`curie-subtitles-${Date.now()}.srt`, 'text/plain', srtContent);
    this.showToast('Downloaded Subtitles (.srt)');
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
    if (this.isRecording) this.stopRecording();
    this.chatMessages = [];
    this.chatMessagesStream.innerHTML = '';
    this.chatMessagesStream.classList.add('hidden');
    this.curieHeroView.classList.remove('hidden');
    this.chatTextInput.value = '';
    this.finalTranscriptArea.value = '';
    this.segments = [];
    this.confidenceScores = [];
    this.timelineContainer.innerHTML = `
      <div class="empty-timeline-state">
        <p>No speech segments captured yet. Speak to build timeline.</p>
      </div>
    `;
    this.updateMetrics();
    try {
      localStorage.removeItem('curie_ai_chat_session');
    } catch (e) {}
    this.durationTimer.textContent = '00:00';
    this.showToast('Chat & Transcripts cleared');
  }

  // =========================================================================
  // Diagnostics & Toast Logger
  // =========================================================================
  logDiagnostic(eventName, message, payload = null) {
    const time = new Date().toLocaleTimeString();
    const logItem = { time, eventName, message, payload };
    this.diagnosticsLogs.unshift(logItem);

    const itemEl = document.createElement('div');
    itemEl.className = 'log-item';

    let payloadStr = '';
    if (payload) {
      payloadStr = `<pre style="margin-top: 4px; font-size: 0.68rem; color: #93c5fd;">${this.escapeHTML(typeof payload === 'object' ? JSON.stringify(payload, null, 2) : String(payload))}</pre>`;
    }

    itemEl.innerHTML = `
      <div class="log-meta">
        <span>[${this.escapeHTML(eventName)}]</span>
        <span>${time}</span>
      </div>
      <div class="log-msg">${this.escapeHTML(message)}</div>
      ${payloadStr}
    `;

    this.eventLogsList.prepend(itemEl);
    this.logCountBadge.textContent = this.diagnosticsLogs.length;
    this.logCountBadge.classList.remove('hidden');
  }

  showToast(message, type = 'info') {
    this.toastMessage.textContent = message;
    this.toastNotification.classList.remove('hidden');

    setTimeout(() => {
      this.toastNotification.classList.add('hidden');
    }, 3200);
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
  window.sttStudio = new CurieChatApp();
});
