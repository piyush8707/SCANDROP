import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, doc, onSnapshot, collection, addDoc, serverTimestamp, deleteDoc, getDocs, query 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';

// ── FIREBASE CONFIG ───────────────────────────────────────────
const getFirebaseConfig = () => {
  if (typeof __firebase_config !== 'undefined') return JSON.parse(__firebase_config);
  return {
    apiKey: "AIzaSyC1O9d3mEWJ2hPGTBhj3PRpxx5TqHiDrV4",
    authDomain: "airdops-30748.firebaseapp.com",
    projectId: "airdops-30748",
    storageBucket: "airdops-30748.firebasestorage.app",
    messagingSenderId: "301012365212",
    appId: "1:301012365212:web:6f3300f519fbb9b51b2259"
  };
};

const firebaseConfig = getFirebaseConfig();
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'airdops-30748';

// ── STYLES ────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #0e0e0e;
    --paper: #f2ede6;
    --cream: #ebe4da;
    --accent: #e84a1e;
    --accent2: #1a56db;
    --muted: #9e9890;
    --border: #0e0e0e;
  }

  body { background: var(--paper); }

  .ad-root {
    min-height: 100vh;
    background: var(--paper);
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    overflow-x: hidden;
  }

  .ad-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9999;
    opacity: 0.5;
  }

  .ad-loading {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
  }
  .ad-loading-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 80px;
    letter-spacing: -2px;
    line-height: 1;
  }
  .ad-loading-logo span { color: var(--accent); }
  .ad-loading-bar {
    width: 200px;
    height: 2px;
    background: var(--cream);
    border: 1px solid var(--ink);
    overflow: hidden;
  }
  .ad-loading-bar-fill {
    height: 100%;
    background: var(--ink);
    animation: loadbar 1.2s ease-in-out infinite alternate;
  }
  @keyframes loadbar { from { width: 0%; } to { width: 100%; } }

  .ad-landing {
    display: grid;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
  }
  .ad-nav {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 28px 48px 0;
    border-bottom: 2px solid var(--ink);
    padding-bottom: 20px;
  }
  .ad-wordmark {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 32px;
    letter-spacing: 1px;
  }
  .ad-wordmark em { color: var(--accent); font-style: normal; }
  .ad-nav-tag {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .ad-hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: calc(100vh - 150px);
  }

  .ad-hero-left {
    padding: 64px 48px;
    border-right: 2px solid var(--ink);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .ad-hero-headline {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(60px, 9vw, 140px);
    line-height: 0.9;
    letter-spacing: -2px;
  }
  .ad-hero-headline .red { color: var(--accent); }
  .ad-hero-headline .blue { color: var(--accent2); }

  .ad-hero-sub {
    font-size: 16px;
    color: var(--muted);
    line-height: 1.6;
    max-width: 400px;
    font-weight: 500;
  }

  .ad-hero-cta {
    display: inline-flex;
    align-items: center;
    gap: 16px;
    background: var(--ink);
    color: var(--paper);
    font-family: 'Bebas Neue', sans-serif;
    font-size: 24px;
    letter-spacing: 2px;
    padding: 16px 32px;
    border: 2px solid var(--ink);
    cursor: pointer;
    transition: background 0.18s, color 0.18s;
    width: fit-content;
  }
  .ad-hero-cta:hover { background: var(--accent); border-color: var(--accent); }
  .ad-hero-cta svg { width: 20px; height: 20px; }

  .ad-hero-right {
    padding: 64px 48px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 24px;
    background: var(--cream);
  }

  .ad-feature-row {
    display: flex;
    gap: 0;
    border: 2px solid var(--ink);
  }
  .ad-feature-item {
    flex: 1;
    padding: 20px;
    border-right: 2px solid var(--ink);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .ad-feature-item:last-child { border-right: none; }
  .ad-feature-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 42px;
    color: var(--accent);
    line-height: 1;
  }
  .ad-feature-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--muted);
  }

  .ad-big-divider {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 200px;
    line-height: 0.8;
    color: var(--cream);
    border-top: 2px solid var(--cream);
    -webkit-text-stroke: 2px var(--ink);
    letter-spacing: -5px;
    padding: 0 40px;
    pointer-events: none;
    overflow: hidden;
    white-space: nowrap;
  }

  .ad-footer {
    border-top: 2px solid var(--ink);
    padding: 20px 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }
  .ad-footer span {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .ad-app {
    display: grid;
    grid-template-rows: auto 1fr;
    min-height: 100vh;
  }
  .ad-app-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 40px;
    border-bottom: 2px solid var(--ink);
    background: var(--ink);
    color: var(--paper);
    gap: 12px;
  }
  .ad-app-wordmark {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 24px;
    letter-spacing: 2px;
    cursor: pointer;
    flex-shrink: 0;
  }
  .ad-app-wordmark span { color: var(--accent); }

  .ad-session-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .ad-session-id {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 2px;
    color: #aaa;
    text-transform: uppercase;
    border: 1px solid #444;
    padding: 6px 10px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ad-session-id:hover { border-color: var(--accent); color: #fff; }
  .ad-close-btn {
    background: none;
    border: 1px solid #555;
    color: #aaa;
    cursor: pointer;
    padding: 6px 10px;
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    transition: border-color 0.15s, color 0.15s;
    flex-shrink: 0;
  }
  .ad-close-btn:hover { border-color: var(--accent); color: var(--accent); }

  .ad-receiver {
    display: grid;
    grid-template-columns: 340px 1fr;
    min-height: calc(100vh - 65px);
  }

  .ad-qr-panel {
    border-right: 2px solid var(--ink);
    padding: 40px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    background: var(--cream);
  }

  .ad-qr-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 42px;
    line-height: 1;
    letter-spacing: 1px;
  }
  .ad-qr-title span { display: block; color: var(--accent); font-size: 16px; letter-spacing: 4px; }

  .ad-qr-frame {
    border: 3px solid var(--ink);
    padding: 8px;
    background: #fff;
    box-shadow: 4px 4px 0 var(--ink);
    width: fit-content;
  }
  .ad-qr-frame img { display: block; width: 180px; height: 180px; max-width: 100%; height: auto; }

  .ad-qr-instructions {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.6;
    font-weight: 500;
    border-left: 3px solid var(--ink);
    padding-left: 16px;
  }

  .ad-timer-note {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: var(--ink);
    color: var(--paper);
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .ad-timer-dot {
    width: 6px;
    height: 6px;
    background: var(--accent);
    border-radius: 50%;
    flex-shrink: 0;
    animation: pulse 1.2s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

  .ad-files-panel {
    padding: 40px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .ad-files-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 16px;
    border-bottom: 2px solid var(--ink);
  }

  .ad-files-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px;
    line-height: 1;
    letter-spacing: 1px;
  }

  .ad-files-count {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--muted);
    border: 1px solid var(--ink);
    padding: 4px 8px;
  }

  .ad-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    gap: 16px;
    padding: 60px 0;
  }

  .ad-empty-grid {
    display: grid;
    grid-template-columns: repeat(4,1fr);
    grid-template-rows: repeat(4,1fr);
    gap: 6px;
    opacity: 0.15;
  }
  .ad-empty-cell {
    width: 24px;
    height: 24px;
    border: 1px solid var(--ink);
    animation: flicker 2s ease-in-out infinite;
  }
  @keyframes flicker { 0%,100%{opacity:0.2} 50%{opacity:1} }

  .ad-empty-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 24px;
    color: var(--muted);
    letter-spacing: 2px;
  }

  .ad-file-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .ad-file-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    border-bottom: 1px solid var(--ink);
    gap: 16px;
    transition: background 0.1s;
  }
  .ad-file-row:hover { background: var(--cream); padding-left: 8px; padding-right: 8px; margin: 0 -8px; }

  .ad-file-icon {
    width: 40px;
    height: 40px;
    border: 2px solid var(--ink);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 11px;
    letter-spacing: 1px;
    flex-shrink: 0;
    background: var(--paper);
  }
  .ad-file-icon.img { background: var(--accent); color: var(--paper); border-color: var(--accent); }
  .ad-file-icon.pdf { background: var(--accent2); color: var(--paper); border-color: var(--accent2); }

  .ad-file-info { flex-grow: 1; min-width: 0; }
  .ad-file-name {
    font-weight: 700;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
  }
  .ad-file-meta {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    color: var(--muted);
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .ad-file-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
  .ad-action-btn {
    border: 2px solid var(--ink);
    background: var(--paper);
    cursor: pointer;
    padding: 8px 12px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 12px;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .ad-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .ad-action-btn:hover:not(:disabled) { background: var(--ink); color: var(--paper); }

  .ad-sender {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-height: calc(100vh - 65px);
    max-width: 480px;
    margin: 0 auto;
    width: 100%;
    padding: 0 16px;
  }

  .ad-sender-header {
    padding: 32px 16px 20px;
    border-bottom: 2px solid var(--ink);
    background: var(--ink);
    color: var(--paper);
    margin: 0 -16px;
  }
  .ad-sender-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #777;
    margin-bottom: 8px;
  }
  .ad-sender-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 56px;
    line-height: 0.9;
    letter-spacing: -1px;
  }
  .ad-sender-title span { color: var(--accent); }
  .ad-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    border: 1px solid #3a3a3a;
    padding: 4px 8px;
    color: #aaa;
  }

  .ad-upload-zone-wrap {
    flex: 1;
    padding: 24px 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ad-upload-zone {
    position: relative;
    border: 3px dashed var(--ink);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px 24px;
    cursor: pointer;
    background: var(--cream);
    min-height: 240px;
  }
  .ad-upload-zone input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    z-index: 2;
    width: 100%;
    height: 100%;
  }
  .ad-upload-icon {
    width: 56px;
    height: 56px;
    border: 3px solid var(--ink);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--paper);
    box-shadow: 4px 4px 0 var(--ink);
  }
  .ad-upload-zone-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 1px;
    text-align: center;
  }

  .ad-toast {
    position: fixed;
    bottom: 24px;
    left: 24px;
    right: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    border: 2px solid var(--ink);
    box-shadow: 4px 4px 0 var(--ink);
    z-index: 9000;
    animation: toastIn 0.25s ease;
    font-weight: 700;
    font-size: 13px;
    background: var(--ink);
    color: var(--paper);
  }
  .ad-toast.error { background: var(--accent); }

  .ad-restore-panel {
    padding: 40px 48px;
    border-top: 2px solid var(--ink);
    background: var(--cream);
  }
  .ad-restore-row {
    display: flex;
    gap: 0;
    max-width: 560px;
  }
  .ad-restore-input {
    flex: 1;
    border: 2px solid var(--ink);
    border-right: none;
    padding: 12px 16px;
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    letter-spacing: 2px;
    text-transform: lowercase;
    background: var(--paper);
    color: var(--ink);
    outline: none;
    min-width: 0;
  }
  .ad-restore-btn {
    background: var(--ink);
    color: var(--paper);
    border: 2px solid var(--ink);
    padding: 12px 20px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px;
    letter-spacing: 1px;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    .ad-hero { grid-template-columns: 1fr; min-height: auto; }
    .ad-hero-right { display: none; }
    .ad-nav { padding: 20px 24px; }
    .ad-hero-left { padding: 40px 24px; border-right: none; border-bottom: 2px solid var(--ink); }
    .ad-receiver { grid-template-columns: 1fr; }
    .ad-qr-panel { border-right: none; border-bottom: 2px solid var(--ink); padding: 32px 24px; }
    .ad-files-panel { padding: 32px 24px; }
    .ad-app-nav { padding: 16px 24px; }
    .ad-restore-panel { padding: 32px 24px; }
    .ad-big-divider { font-size: 120px; padding: 0 20px; }
  }

  @media (max-width: 480px) {
    .ad-nav { flex-direction: column; align-items: flex-start; gap: 8px; }
    .ad-nav-tag { letter-spacing: 1px; font-size: 10px; }
    .ad-hero-headline { font-size: 56px; }
    .ad-footer { flex-direction: column; text-align: center; padding: 24px; }
    .ad-file-row { flex-direction: column; align-items: flex-start; gap: 12px; }
    .ad-file-actions { width: 100%; }
    .ad-action-btn { flex: 1; justify-content: center; font-size: 14px; }
    .ad-hero-cta { width: 100%; justify-content: center; }
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes toastIn { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;

// ── SUB-COMPONENTS ───────────────────────────────────────────

function Footer() {
  return (
    <footer className="ad-footer">
      <div>
        © 2026 <strong>SYNC SQUAD</strong>
      </div>
     
    </footer>
  );
}

function SEO() {
  useEffect(() => {
    document.title = "ScanDrop – Secure File Transfer |";
    const metaTags = [
      { name: "description", content: "Secure real-time file transfer using QR code, Firebase and encrypted session. Developed by SYNC SQUAD." },
      { name: "keywords", content: "ScanDrop, file transfer, firebase file share, qr transfer, secure upload, badri vishal developer" },
      { name: "author", content: "SYNC SQUAD" },
    ];

    metaTags.forEach(tag => {
      let meta = document.querySelector(`meta[name="${tag.name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", tag.name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", tag.content);
    });
  }, []);
  return null;
}

const Icon = {
  arrow: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  upload: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  download: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  print: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  spin: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:'spin 1s linear infinite'}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
};

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB limit
const CHUNK_SIZE = 700 * 1024; // 700KB chunks (to fit 1MB Firestore limit with base64 overhead)

// ── MAIN APP COMPONENT ────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [sessionId, setSessionId] = useState('');
  const [view, setView] = useState('landing');
  const [role, setRole] = useState(null);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notification, setNotification] = useState(null);
  const [restoreInput, setRestoreInput] = useState('');
  const [restoreError, setRestoreError] = useState('');
  const [recentSessions, setRecentSessions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ad_sessions') || '[]'); } catch { return []; }
  });

  const pendingFileRef = useRef(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Error:", err);
      } finally {
        setIsAuthLoading(false);
      }
    };
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setIsAuthLoading(false);
      }
    });
    
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('sid');
    if (sid) { 
      setSessionId(sid); 
      setRole('sender'); 
      setView('app'); 
    }
    
    initAuth();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !sessionId || view !== 'app' || role !== 'receiver') return;
    
    const sessionCol = `session_${sessionId}`;
    const filesRef = collection(db, 'artifacts', appId, 'public', 'data', sessionCol);
    
    const unsubscribe = onSnapshot(filesRef, (snapshot) => {
      const fetchedDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Group documents by parentId (for chunked files)
      const headers = fetchedDocs.filter(d => d.isHeader);
      const chunks = fetchedDocs.filter(d => d.parentId);

      const assembledFiles = headers.map(header => {
        const fileChunks = chunks.filter(c => c.parentId === header.id);
        const progress = Math.round((fileChunks.length / header.totalChunks) * 100);
        
        let finalData = null;
        if (fileChunks.length === header.totalChunks) {
          // All chunks present, sort and assemble
          finalData = fileChunks
            .sort((a, b) => a.chunkIndex - b.chunkIndex)
            .map(c => c.data)
            .join('');
        }

        return {
          ...header,
          base64Data: finalData,
          assemblyProgress: progress,
          isReady: !!finalData
        };
      });

      const sorted = assembledFiles.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setFiles(sorted);
      
      const now = Date.now();
      fetchedDocs.forEach(async (docData) => {
        if (docData.createdAt && (now - docData.createdAt.toMillis() > 300000)) {
          try {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', sessionCol, docData.id));
          } catch (e) {}
        }
      });
    }, (error) => console.error('Listener error:', error));
    
    return () => unsubscribe();
  }, [user, sessionId, view, role]);

  const saveSession = (sid) => {
    const entry = { id: sid, ts: Date.now() };
    const updated = [entry, ...recentSessions.filter(s => s.id !== sid)].slice(0, 5);
    setRecentSessions(updated);
    try { localStorage.setItem('ad_sessions', JSON.stringify(updated)); } catch {}
  };

  const startAsReceiver = () => {
    const newSid = Math.random().toString(36).substring(2, 9);
    setSessionId(newSid);
    setRole('receiver');
    setView('app');
    saveSession(newSid);
    window.history.pushState({}, '', `?sid=${newSid}`);
  };

  const restoreSession = (sid) => {
    const clean = sid.trim().toLowerCase();
    if (!clean) { setRestoreError('Please enter a session ID.'); return; }
    setRestoreError('');
    setSessionId(clean);
    setRole('receiver');
    setView('app');
    saveSession(clean);
    window.history.pushState({}, '', `?sid=${clean}`);
  };

  const deleteSession = (sid, e) => {
    e.stopPropagation();
    const updated = recentSessions.filter(s => s.id !== sid);
    setRecentSessions(updated);
    localStorage.setItem('ad_sessions', JSON.stringify(updated));
  };

  const formatTime = (ts) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    return `${Math.floor(diff/3600000)}h ago`;
  };

  const showNotice = (msg, type) => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    
    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_BYTES) {
        showNotice(`File "${file.name}" too large (Max 10MB)`, 'error');
        continue;
      }
      pendingFileRef.current = file;
      await processUpload(file);
    }
    e.target.value = null;
  };

  const processUpload = async (file) => {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Chunk the base64 string
      const chunks = [];
      for (let i = 0; i < base64.length; i += CHUNK_SIZE) {
        chunks.push(base64.substring(i, i + CHUNK_SIZE));
      }

      const sessionCol = `session_${sessionId}`;
      const filesRef = collection(db, 'artifacts', appId, 'public', 'data', sessionCol);
      
      // Step 1: Create Header Document
      const headerRef = await addDoc(filesRef, {
        name: file.name,
        type: file.type,
        size: file.size,
        totalChunks: chunks.length,
        isHeader: true,
        createdAt: serverTimestamp(),
        senderId: auth.currentUser.uid
      });

      // Step 2: Upload Chunks
      for (let i = 0; i < chunks.length; i++) {
        await addDoc(filesRef, {
          parentId: headerRef.id,
          chunkIndex: i,
          data: chunks[i],
          createdAt: serverTimestamp()
        });
        setUploadProgress(Math.round(((i + 1) / chunks.length) * 100));
      }

      setUploadProgress(100);
      pendingFileRef.current = null;
      showNotice(`"${file.name}" dropped! ✓`, "success");
    } catch (err) {
      console.error(err);
      showNotice("Drop failed: " + err.message, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadFile = (file) => {
    if (!file.base64Data) return;
    const a = document.createElement('a');
    a.href = file.base64Data;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const printFile = (file) => {
    if (!file.base64Data) return;
    const win = window.open("");
    if (!win) return showNotice("Pop-up blocked!", "error");
    if (file.type.startsWith('image/')) {
      win.document.write(`<div style="display:flex;justify-content:center;"><img src="${file.base64Data}" style="max-width:100%;"></div>`);
    } else {
      win.document.write(`<iframe src="${file.base64Data}" style="width:100%;height:100%;border:none;"></iframe>`);
    }
    setTimeout(() => { win.print(); win.close(); }, 1000);
  };

  const fileIcon = (type) => {
    if (type?.includes('image')) return 'IMG';
    if (type?.includes('pdf')) return 'PDF';
    return 'DOC';
  };

  const shareUrl = `${window.location.origin}${window.location.pathname}?sid=${sessionId}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shareUrl)}&color=0e0e0e&bgcolor=ffffff`;

  return (
    <div className="ad-root">
      <SEO />
      <style>{STYLES}</style>

      {isAuthLoading && (
        <div className="ad-loading">
          <div className="ad-loading-logo">SCAN<span>DROP</span></div>
          <div className="ad-loading-bar"><div className="ad-loading-bar-fill" /></div>
        </div>
      )}

      {!isAuthLoading && view === 'landing' && (
        <>
          <div className="ad-landing">
            <nav className="ad-nav">
              <div className="ad-wordmark">SCAN<span>DROP</span></div>
              <div className="ad-nav-tag">v2.0 · Secure · Instant</div>
            </nav>

            <div className="ad-hero">
              <div className="ad-hero-left">
                <div className="ad-hero-headline">
                  <div>DROP</div>
                  <div className="red">FILES</div>
                  <div>TO YOUR</div>
                  <div className="blue">PC.</div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:24}}>
                  <p className="ad-hero-sub">
                    The fastest way to move photos and PDFs from your phone to any desktop. Scan, drop, done — no apps, no accounts.
                  </p>
                  <button className="ad-hero-cta" onClick={startAsReceiver}>
                    <Icon.arrow /> START NEW SESSION
                  </button>
                </div>
              </div>

              <div className="ad-hero-right">
                <div className="ad-big-divider">DROP</div>
                <div className="ad-feature-row">
                  {[
                    { num: '05', label: 'Min auto-delete' },
                    { num: '0↯', label: 'Setup required' },
                    { num: '∞', label: 'File types' },
                  ].map(f => (
                    <div className="ad-feature-item" key={f.label}>
                      <div className="ad-feature-num">{f.num}</div>
                      <div className="ad-feature-label">{f.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="ad-restore-panel">
              <div className="ad-restore-title">RESTORE SESSION <span>REJOIN</span></div>
              <div className="ad-restore-row">
                <input
                  className="ad-restore-input"
                  placeholder="enter session id"
                  value={restoreInput}
                  onChange={(e) => setRestoreInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && restoreSession(restoreInput)}
                />
                <button className="ad-restore-btn" onClick={() => restoreSession(restoreInput)}>REJOIN</button>
              </div>
              {recentSessions.length > 0 && (
                <div className="ad-recent-list">
                  {recentSessions.map(s => (
                    <div className="ad-recent-item" key={s.id} onClick={() => restoreSession(s.id)}>
                      <span>#{s.id}</span>
                      <span style={{fontSize:'10px', color: 'var(--muted)'}}>{formatTime(s.ts)}</span>
                      <button onClick={(e) => deleteSession(s.id, e)} style={{background:'none', border:'none', cursor:'pointer', padding: '0 4px'}}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Footer />
          </div>
        </>
      )}

      {!isAuthLoading && view === 'app' && (
        <div className="ad-app">
          <nav className="ad-app-nav">
            <div className="ad-app-wordmark" onClick={() => setView('landing')}>SCAN<span>DROP</span></div>
            <div className="ad-session-badge">
              <div className="ad-session-id" onClick={() => {
                navigator.clipboard.writeText(sessionId);
                showNotice('Copied: ' + sessionId, 'success');
              }}>
                #{sessionId} 📋
              </div>
              <button className="ad-close-btn" onClick={() => setView('landing')}>✕</button>
            </div>
          </nav>

          {role === 'receiver' ? (
            <div className="ad-receiver">
              <div className="ad-qr-panel">
                <div className="ad-qr-title"><span>STEP 01</span>SCAN TO LINK PHONE</div>
                <div className="ad-qr-frame"><img src={qrImageUrl} alt="QR" /></div>
                <p className="ad-qr-instructions">Scan with your phone to start dropping files to this screen.</p>
                <div className="ad-timer-note"><div className="ad-timer-dot" /> Live Session Active</div>
              </div>

              <div className="ad-files-panel">
                <div className="ad-files-header">
                  <div className="ad-files-title">INCOMING FILES</div>
                  <div className="ad-files-count">{files.length} found</div>
                </div>
                {files.length === 0 ? (
                  <div className="ad-empty-state">
                    <div className="ad-empty-grid">{Array.from({length:16}).map((_,i)=><div className="ad-empty-cell" key={i}/>)}</div>
                    <div className="ad-empty-text">WAITING FOR DROP</div>
                  </div>
                ) : (
                  <div className="ad-file-list">
                    {files.map(file => (
                      <div className="ad-file-row" key={file.id}>
                        <div className={`ad-file-icon ${file.type.includes('image') ? 'img' : 'pdf'}`}>{fileIcon(file.type)}</div>
                        <div className="ad-file-info">
                          <div className="ad-file-name">{file.name}</div>
                          <div className="ad-file-meta">
                            {(file.size/1024).toFixed(1)} KB 
                            {!file.isReady && ` · Assembling (${file.assemblyProgress}%)`}
                          </div>
                        </div>
                        <div className="ad-file-actions">
                          <button 
                            className="ad-action-btn" 
                            disabled={!file.isReady} 
                            onClick={() => downloadFile(file)}
                          >
                            <Icon.download /> SAVE
                          </button>
                          <button 
                            className="ad-action-btn print" 
                            disabled={!file.isReady} 
                            onClick={() => printFile(file)}
                          >
                            <Icon.print /> PRINT
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="ad-sender">
               <div className="ad-sender-header">
                  <div className="ad-sender-label">Linked Session</div>
                  <div className="ad-sender-title">DROP<br/><span>IT.</span></div>
                  <div className="ad-status-pill"><div className="ad-status-dot" /> Session #{sessionId}</div>
                </div>
                <div className="ad-upload-zone-wrap">
                  <div className="ad-upload-zone">
                    <input type="file" onChange={handleFileUpload} accept="image/*,application/pdf" disabled={isUploading} multiple />
                    <div className={`ad-upload-icon ${isUploading ? 'active' : ''}`}>
                      {isUploading ? <Icon.spin /> : <Icon.upload />}
                    </div>
                    <div className="ad-upload-zone-title">{isUploading ? 'SENDING...' : 'TAP TO UPLOAD'}</div>
                    <div style={{fontSize: '11px', opacity: 0.6, marginTop: '8px'}}>
                      {isUploading ? `Uploading segments... ${uploadProgress}%` : 'Supports multiple files up to 10MB'}
                    </div>
                  </div>
                  <div className="ad-info-card">
                    <div className="ad-info-card-icon"></div>
                    <div>
                      <div className="ad-info-card-title">Chunking Mode Active</div>
                      <div className="ad-info-card-body">Max file size UPTO 10MB.</div>
                    </div>
                  </div>
                </div>
            </div>
          )}
          <Footer />
        </div>
      )}

      {notification && (
        <div className={`ad-toast ${notification.type}`}>{notification.msg}</div>
      )}
    </div>
  );
}
