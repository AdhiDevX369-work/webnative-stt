# 🎙️ EchoNative STT Studio

> **Native Browser Speech-to-Text (STT) Playground & Testing Suite**  
> Built with pure HTML5, CSS3, JavaScript, the **Web Speech API (`SpeechRecognition`)**, **Web Audio API**, and **Service Worker (PWA)** for complete offline support.

---

## 🌟 Overview

**EchoNative STT Studio** is a developer playground and testing tool designed to test, benchmark, and demonstrate browser-native Speech-to-Text capabilities without requiring third-party cloud API keys or external server backends.

It leverages the browser's built-in `window.SpeechRecognition` (or `webkitSpeechRecognition`), featuring real-time interim streaming, audio waveform visualization, multi-language support (including **Sinhala `si-LK`**, **English**, **Tamil**, and 20+ languages), confidence scoring, export options, and full offline functionality via PWA.

---

## ✨ Features

- **🚀 Native Web Speech Engine**:
  - Direct integration with browser-native `SpeechRecognition` / `webkitSpeechRecognition`.
  - Continuous listening with resilient auto-reconnection.
  - Real-time interim results stream (live typing) and committed final text segments.
  - Multi-alternatives inspection with confidence scores (`%`).

- **🇱🇰 Multilingual Speech Recognition**:
  - Primary quick-access buttons for **Sinhala (`si-LK`)**, **English (US, UK, India, Australia)**, and **Tamil (`ta-LK`, `ta-IN`)**.
  - Dropdown selector covering 20+ global locales (Hindi, Japanese, Spanish, German, French, Chinese, Arabic, and more).

- **⚡ Complete Offline & PWA Support**:
  - Service Worker (`sw.js`) pre-caches the application shell for instant offline loading.
  - Offline network detection with live header status badge (`Online` vs `Offline Mode`).
  - Automatic fallback to on-device speech dictation engines (macOS/iOS Safari & Android/Chrome local speech packs).
  - Web App Manifest (`manifest.webmanifest`) for standalone desktop/mobile installation.

- **💾 Local Session Persistence**:
  - Automatic `localStorage` sync preserves transcripts, segment history, and language configuration across reloads.

- **📊 Live Web Audio Waveform Visualizer**:
  - Utilizes Web Audio API (`AudioContext` + `AnalyserNode`) to capture live frequency spectrum data from the microphone.
  - Dynamic HTML5 `<canvas>` rendering vibrant animated gradient frequency bars during speech.

- **📝 Dual Workspace & Export Suite**:
  - **Full Document Editor**: Cumulative editable textarea with real-time word count, character count, and session duration.
  - **Timeline History**: Segmented chronological speech cards with exact timestamps and individual confidence ratings.
  - **Export Formats**:
    - 📋 **Copy to Clipboard**
    - 📄 **Plain Text (`.txt`)**
    - 📊 **Structured JSON (`.json`)** with metadata and confidence scores
    - 🎬 **SubRip Subtitles (`.srt`)** with calculated timecodes
    - 🔊 **Native TTS Playback** using `window.speechSynthesis`

- **🛠️ Developer Diagnostics Drawer**:
  - Real-time event monitor logging all Web Speech API lifecycle events (`onstart`, `onaudiostart`, `onspeechstart`, `onspeechend`, `onresult`, `onnomatch`, `onerror`, `onend`).
  - Inspect raw payload structures, alternatives, confidence levels, and error diagnostics.

---

## 🌐 Browser Compatibility

| Browser | Platform | Native STT Support | Engine Backend |
| :--- | :--- | :---: | :--- |
| **Google Chrome** | macOS / Windows / Linux / Android | ✅ Supported | Google Cloud Neural + On-device |
| **Microsoft Edge** | macOS / Windows / Android | ✅ Supported | Microsoft Cognitive / Chromium |
| **Apple Safari** | macOS / iOS / iPadOS | ✅ Supported | Apple Siri / On-device Dictation |
| **Brave** | Desktop / Mobile | ✅ Supported | Chromium Engine (requires speech service toggle) |
| **Mozilla Firefox** | Desktop | ⚠️ Flag Required | `media.webspeech.recognition.enable` |

> 💡 **Note**: Chromium browsers (Chrome, Edge) use Google's speech recognition backend online, and on-device language models when available offline. Apple Safari uses Apple's native on-device dictation engine.

---

## 📁 Project Structure

```
native-web-stt/
├── index.html              # Main UI markup, glassmorphism layout, canvas visualizer
├── style.css               # Modern dark-mode styling, glowing animations & tokens
├── app.js                  # SpeechRecognition lifecycle, Web Audio, PWA & UI logic
├── sw.js                   # Service Worker for offline asset caching
├── manifest.webmanifest    # PWA configuration manifest
├── package.json            # Vite build & development scripts
├── .gitignore              # Git ignore configuration
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18+ recommended)
- A modern Chromium or Safari browser with microphone permissions enabled.

### 1. Installation

Clone the repository and install dev dependencies:

```bash
git clone https://github.com/your-username/native-web-stt.git
cd native-web-stt
npm install
```

### 2. Run Development Server

Start the local Vite dev server:

```bash
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 3. Production Build

Build optimized static assets:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 🎯 How to Use

1. **Select Language**: Choose **සිංහල (`si-LK`)**, **English (`en-US`)**, or any preferred locale from the quick pills or dropdown.
2. **Start Listening**: Click the glowing **Microphone** button. Grant microphone permissions when prompted by your browser.
3. **Speak**: As you speak, observe the:
   - Live **audio waveform visualizer**.
   - **Interim stream box** displaying real-time live typing.
   - **Metrics strip** updating duration, word count, character count, and average confidence.
4. **Inspect Diagnostics**: Click the **Diagnostics** button in the header to view low-level Web Speech API events in real time.
5. **Export Transcripts**: Use the toolbar to copy, listen back via TTS, or download as `.txt`, `.json`, or `.srt`.

---

## ⚙️ Web Speech API Reference

The core recognition lifecycle utilized in `app.js`:

```javascript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;       // Continuous listening
recognition.interimResults = true;   // Stream interim transcripts
recognition.lang = 'si-LK';          // Language BCP-47 tag
recognition.maxAlternatives = 3;     // Number of alternate interpretations

recognition.onresult = (event) => {
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    const transcript = event.results[i][0].transcript;
    const confidence = event.results[i][0].confidence;
    const isFinal = event.results[i].isFinal;
    // Handle interim vs final transcripts...
  }
};
```

---

## 🔧 Troubleshooting & Tips

- **Permission Denied (`not-allowed`)**: Click the lock icon in your browser's address bar and set Microphone to **Allow**, then refresh the page.
- **No Speech Detected (`no-speech`)**: Ensure your default input microphone is selected in OS audio settings and not muted.
- **Network Error (`network`)**: In Chromium, cloud speech recognition requires an internet connection. If offline, on-device dictation is used when language packs are present.
- **Microphone in Visualizer**: The waveform visualizer requests a separate audio stream via `navigator.mediaDevices.getUserMedia({ audio: true })`.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute for personal or commercial projects.
