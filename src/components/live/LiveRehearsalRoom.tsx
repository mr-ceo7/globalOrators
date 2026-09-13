import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Clock, 
  Save, 
  Radio, 
  FileText, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  ScreenShare, 
  Volume2, 
  Users, 
  Server, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

export interface LiveRehearsalRoomProps {
  isOpen: boolean;
  onClose: () => void;
  roomTitle: string;
  speakerName: string;
  speakerId?: string;
  userRole: 'coach' | 'speaker';
  branch?: 'Academy' | 'Foundation';
  onSaveFeedback?: (feedback: {
    wpm: number;
    score: number;
    notes: string;
    durationSeconds: number;
  }) => void;
}

type TimerPreset = 420 | 300 | 180 | 60; // 7 min (BP), 5 min (Catharsis), 3 min (Rebuttal), 1 min (Impromptu)

export const LiveRehearsalRoom: React.FC<LiveRehearsalRoomProps> = ({
  isOpen,
  onClose,
  roomTitle,
  speakerName,
  speakerId,
  userRole,
  branch = 'Academy',
  onSaveFeedback
}) => {
  // Mobile Tab State
  const [mobileTab, setMobileTab] = useState<'video' | 'forensics'>('video');

  // Studio Mode: Self-Hosted Jitsi (meet.globalorators.com) vs Native P2P Studio
  const jitsiDomain = (import.meta as any).env?.VITE_JITSI_DOMAIN || 'meet.globalorators.com';
  const [studioMode, setStudioMode] = useState<'jitsi' | 'native'>('jitsi');

  // Room Identifier: unique, stable room string for this speaker
  const cleanSpeakerName = (speakerName || 'Speaker').replace(/[^a-zA-Z0-9]/g, '');
  const cleanSpeakerId = (speakerId || 'rehearsal').replace(/[^a-zA-Z0-9]/g, '');
  const safeRoomId = `GlobalOrators-${cleanSpeakerName}-${cleanSpeakerId}`;

  // Jitsi URL for Self-Hosted Instance
  const displayName = userRole === 'coach' ? 'Head Coach Tyrese / Qassim' : speakerName;
  const selfHostedMeetingUrl = `https://${jitsiDomain}/${safeRoomId}#config.prejoinConfig.enabled=false&config.prejoinPageEnabled=false&config.defaultLanguage="en"&config.disableDeepLinking=true&userInfo.displayName=${encodeURIComponent(displayName)}&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false&interfaceConfig.SHOW_BRAND_WATERMARK=false&interfaceConfig.SHOW_POWERED_BY=false&interfaceConfig.SHOW_CHROME_EXTENSION_BANNER=false`;

  // Security Context Check (Mobile WebRTC strictly requires HTTPS or localhost)
  const isInsecureContext = typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  // Native WebRTC State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isRemoteConnected, setIsRemoteConnected] = useState<boolean>(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Executive Room check
  const isExecutiveRoom = useMemo(() => {
    const text = `${roomTitle || ''} ${speakerName || ''} ${branch || ''}`.toLowerCase();
    return text.includes('executive') || text.includes('pitch') || text.includes('board') || text.includes('keynote') || text.includes('capital') || text.includes('vance');
  }, [roomTitle, speakerName, branch]);

  // Parliamentary / Executive Countdown Timer
  const [timerPreset, setTimerPreset] = useState<TimerPreset>(branch === 'Foundation' ? 300 : 420);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(timerPreset);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<any>(null);

  // Coach Live Rubric
  const [rubricScore, setRubricScore] = useState<number>(8);
  const [cadenceWpm, setCadenceWpm] = useState<number>(138);
  const [rehearsalNotes, setRehearsalNotes] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Refs for WebRTC & Audio
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);

  // Audio synthesis chime for POI bells
  const playSynthesizedChime = useCallback((frequency = 880, duration = 0.28) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy or test environment fallback
    }
  }, []);

  // WebRTC Signal Sender (BroadcastChannel + WebSocket)
  const sendSignalingMessage = useCallback((message: any) => {
    const payload = JSON.stringify({
      ...message,
      senderRole: userRole,
      roomId: safeRoomId,
      timestamp: Date.now()
    });

    try {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage(payload);
      }
    } catch {}

    try {
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.send(payload);
      }
    } catch {}
  }, [userRole, safeRoomId]);

  // Handle incoming signaling message
  const handleSignalingData = useCallback(async (rawText: string) => {
    try {
      const data = JSON.parse(rawText);
      if (data.senderRole === userRole || data.roomId !== safeRoomId) return;

      const pc = peerConnectionRef.current;
      if (!pc) return;

      if (data.type === 'peer-ready') {
        if (pc.signalingState === 'stable') {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignalingMessage({ type: 'offer', sdp: offer });
        }
      } else if (data.type === 'offer' && data.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignalingMessage({ type: 'answer', sdp: answer });
      } else if (data.type === 'answer' && data.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      } else if (data.type === 'ice-candidate' && data.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch {}
      } else if (data.type === 'peer-left') {
        setIsRemoteConnected(false);
        setRemoteStream(null);
      }
    } catch {}
  }, [userRole, safeRoomId, sendSignalingMessage]);

  // Setup Native WebRTC when in native mode
  useEffect(() => {
    if (!isOpen || studioMode !== 'native') return;

    let isSubscribed = true;

    const initWebRTC = async () => {
      if (typeof window !== 'undefined' && window.RTCPeerConnection) {
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        });

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            sendSignalingMessage({ type: 'ice-candidate', candidate: event.candidate });
          }
        };

        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
            setIsRemoteConnected(true);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'connected') {
            setIsRemoteConnected(true);
          } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
            setIsRemoteConnected(false);
          }
        };

        peerConnectionRef.current = pc;
      }

      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel(`go_webrtc_${safeRoomId}`);
          bc.onmessage = (e) => handleSignalingData(e.data);
          broadcastChannelRef.current = bc;
        } catch {}
      }

      try {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = window.location.hostname === 'localhost' ? 'localhost:8005' : window.location.host;
        const authToken = localStorage.getItem('globalorators_token') || localStorage.getItem('nubianfit_token') || '';
        const wsUrl = `${wsProtocol}//${wsHost}/ws/signaling/${safeRoomId}`;
        const ws = new WebSocket(wsUrl);

        ws.onmessage = (e) => handleSignalingData(e.data);
        ws.onopen = () => {
          // In-band authentication handshake frame: bearer token is not exposed in query strings or server access logs
          if (authToken) {
            ws.send(JSON.stringify({ type: 'auth', token: authToken, roomId: safeRoomId }));
          }
          sendSignalingMessage({ type: 'peer-ready' });
        };
        websocketRef.current = ws;
      } catch {}

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
            audio: true 
          });

          if (!isSubscribed) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }

          setLocalStream(stream);
          setMediaError(null);

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }

          if (peerConnectionRef.current) {
            stream.getTracks().forEach(track => {
              peerConnectionRef.current?.addTrack(track, stream);
            });
          }

          try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
              const audioCtx = new AudioCtx();
              audioContextRef.current = audioCtx;
              const analyser = audioCtx.createAnalyser();
              analyser.fftSize = 128;
              analyser.smoothingTimeConstant = 0.5;

              const source = audioCtx.createMediaStreamSource(stream);
              source.connect(analyser);

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const updateLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
                }
                const avg = sum / dataArray.length;
                setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
                animationFrameRef.current = requestAnimationFrame(updateLevel);
              };
              updateLevel();
            }
          } catch {}

          sendSignalingMessage({ type: 'peer-ready' });
        } else {
          setMediaError(
            typeof window !== 'undefined' && !window.isSecureContext
              ? 'Microphone and camera access requires a secure HTTPS connection on mobile devices.'
              : 'WebRTC media devices are unavailable or restricted in this browser context.'
          );
        }
      } catch (err: any) {
        setMediaError('Microphone/Camera permission prompt closed or unattached. Studio remains operational.');
      }
    };

    initWebRTC();

    return () => {
      isSubscribed = false;
      try { sendSignalingMessage({ type: 'peer-left' }); } catch {}

      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }
      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, studioMode, safeRoomId, handleSignalingData, sendSignalingMessage]);

  // Attach remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Reset timer on modal open
  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(timerPreset);
      setIsTimerRunning(false);
      setSavedSuccess(false);
    }
  }, [isOpen, timerPreset]);

  // Timer Tick & POI Bell Logic
  useEffect(() => {
    if (isTimerRunning && secondsRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (timerPreset === 420 && prev === 361) {
            playSynthesizedChime(880, 0.35);
          }
          if (timerPreset === 420 && prev === 61) {
            playSynthesizedChime(660, 0.2);
            setTimeout(() => playSynthesizedChime(880, 0.35), 220);
          }

          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            playSynthesizedChime(440, 0.6);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, secondsRemaining, timerPreset, playSynthesizedChime]);

  // Native Control Actions
  const toggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(t => { t.enabled = !t.enabled; });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(t => { t.enabled = !t.enabled; });
      setIsVideoDisabled(!isVideoDisabled);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const screenTrack = screenStream.getVideoTracks()[0];
          screenTrackRef.current = screenTrack;

          if (peerConnectionRef.current) {
            const senders = peerConnectionRef.current.getSenders();
            const videoSender = senders.find(s => s.track && s.track.kind === 'video');
            if (videoSender) {
              videoSender.replaceTrack(screenTrack);
            }
          }

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }

          setIsScreenSharing(true);

          screenTrack.onended = () => {
            stopScreenShare();
          };
        }
      } catch {}
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      const cameraTrack = localStream.getVideoTracks()[0];
      if (peerConnectionRef.current && cameraTrack) {
        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find(s => s.track && s.track.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(cameraTrack);
        }
      }
    }
    setIsScreenSharing(false);
  };

  const handleSelectPreset = (preset: TimerPreset) => {
    setIsTimerRunning(false);
    setTimerPreset(preset);
    setSecondsRemaining(preset);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const elapsedSeconds = timerPreset - secondsRemaining;
  const isBPMode = timerPreset === 420;
  const isProtectedFirstMinute = isBPMode && elapsedSeconds < 60;
  const isProtectedFinalMinute = isBPMode && secondsRemaining <= 60 && secondsRemaining > 0;
  const isPoiFloorOpen = isBPMode && !isProtectedFirstMinute && !isProtectedFinalMinute && secondsRemaining > 0;

  const handleCopyLink = async () => {
    const shareUrl = studioMode === 'jitsi' ? selfHostedMeetingUrl : `${window.location.origin}/live-rehearsal?room=${safeRoomId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const handleSaveNotes = () => {
    if (onSaveFeedback) {
      onSaveFeedback({
        wpm: cadenceWpm,
        score: rubricScore,
        notes: rehearsalNotes,
        durationSeconds: timerPreset - secondsRemaining
      });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-room-title"
    >
      {/* Top Architectural Navigation Bar */}
      <header className="h-16 px-4 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#C89630]/15 border border-[#C89630]/30 flex items-center justify-center text-[#C89630] shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <h2 id="live-room-title" className="text-sm sm:text-base font-serif font-bold text-white tracking-tight truncate">
                {roomTitle}
              </h2>
              <span className="hidden sm:inline-flex text-[10px] font-mono tracking-widest uppercase bg-[#C89630]/15 text-[#C89630] px-2 py-0.5 rounded border border-[#C89630]/30">
                Live Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              {userRole === 'coach' 
                ? `Coaching Rehearsal with ${speakerName}` 
                : `Active Floor Rehearsal • ${speakerName}`}
            </p>
          </div>
        </div>

        {/* Studio Engine Switcher & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mode Switcher: Sovereign Chamber (SFU) vs Native P2P (1-on-1) */}
          <div className="hidden md:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setStudioMode('jitsi')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                studioMode === 'jitsi'
                  ? 'bg-[#C89630] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Sovereign multi-participant chamber"
            >
              <Server className="w-3.5 h-3.5" />
              <span>{isExecutiveRoom ? 'Sovereign Chamber' : 'Self-Hosted Jitsi'}</span>
            </button>
            <button
              onClick={() => setStudioMode('native')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                studioMode === 'native'
                  ? 'bg-[#C89630] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Direct 1-on-1 peer-to-peer rehearsal studio with audio diagnostics"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Native P2P Studio</span>
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors border border-slate-700"
            title="Copy rehearsal invite link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{copied ? 'Link Copied' : 'Invite Link'}</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-medium transition-all shadow-sm active:scale-95"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Leave Studio</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center border-b border-slate-800 bg-slate-900/60 shrink-0">
        <button
          onClick={() => setMobileTab('video')}
          className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-wider text-center border-b-2 transition-colors ${
            mobileTab === 'video'
              ? 'border-[#C89630] text-[#C89630] bg-[#C89630]/5 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Rehearsal Stage
        </button>
        <button
          onClick={() => setMobileTab('forensics')}
          className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-wider text-center border-b-2 transition-colors ${
            mobileTab === 'forensics'
              ? 'border-[#C89630] text-[#C89630] bg-[#C89630]/5 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Timer & Rubric
        </button>
      </div>

      {/* Main Studio Body: Video Stage + Forensics Sidebar */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* VIDEO STAGE (Cols 1-8 on desktop) */}
        <div className={`lg:col-span-8 flex flex-col bg-slate-950 p-3 sm:p-5 relative ${
          mobileTab === 'video' ? 'flex' : 'hidden lg:flex'
        }`}>

          {/* ENGINE 1: SELF-HOSTED JITSI CHAMBER (Multi-Speaker Debates) */}
          {studioMode === 'jitsi' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="mb-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2 truncate">
                  <Server className="w-3.5 h-3.5 text-[#C89630]" />
                  <span className="text-slate-200 font-medium">Sovereign SFU:</span>
                  <span className="text-[#C89630]">
                    {jitsiDomain.includes('trycloudflare') ? 'Private Faculty Node' : jitsiDomain}
                  </span>
                  <span className="hidden sm:inline text-[9px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 uppercase tracking-wider">
                    High-Def Voice
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={selfHostedMeetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#C89630] hover:text-[#e0ab44] transition-colors"
                    title="Launch directly in fullscreen browser tab (recommended for mobile devices)"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Launch Fullscreen</span>
                  </a>
                  <button
                    onClick={() => setStudioMode('native')}
                    className="text-xs text-slate-400 hover:text-slate-200 underline"
                  >
                    Switch to Native 1-on-1 P2P
                  </button>
                </div>
              </div>

              {isInsecureContext && (
                <div className="mb-2 p-2.5 rounded-xl bg-amber-950/50 border border-amber-800/60 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-300 block">Mobile WebRTC Notice:</span>
                      <span className="text-amber-200/80">
                        Chrome on mobile blocks microphone and camera access on plain HTTP network addresses ({typeof window !== 'undefined' ? window.location.host : 'local IP'}). Launch the secure chamber directly to grant camera & mic permissions.
                      </span>
                    </div>
                  </div>
                  <a
                    href={selfHostedMeetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-[#C89630] hover:bg-[#d9a53b] text-slate-950 font-medium text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Secure Chamber</span>
                  </a>
                </div>
              )}

              <div className="flex-1 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl relative">
                <iframe
                  title={`Live Meeting: ${roomTitle}`}
                  src={selfHostedMeetingUrl}
                  allow="camera *; microphone *; display-capture *; autoplay *; clipboard-write *; screen-wake-lock *; fullscreen *; speaker-selection *; compute-pressure *"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

          {/* ENGINE 2: NATIVE WEBRTC STUDIO (1-on-1 P2P with Live Vocal VU Meter) */}
          {studioMode === 'native' && (
            <div className="flex-1 flex flex-col min-h-0">
              {mediaError && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{mediaError}</span>
                </div>
              )}

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0 relative">
                {/* Remote Peer */}
                <div className="relative rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden flex items-center justify-center shadow-xl">
                  {isRemoteConnected && remoteStream ? (
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-6 text-center max-w-sm flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                        <Users className="w-7 h-7 text-[#C89630]/70" />
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">
                        {userRole === 'coach' ? `Awaiting ${speakerName}` : 'Awaiting Faculty Coach'}
                      </h3>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                        {userRole === 'coach' 
                          ? 'When your speaker clicks "Join Room" in their portal, their video feed will connect directly here without ads or sign-ins.'
                          : 'Your coach will connect here directly from Coach OS to conduct your live floor review.'}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700">
                        <span className="text-[#C89630] font-bold">ROOM:</span>
                        <span className="truncate max-w-[170px]">{safeRoomId}</span>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <span className={`text-[9px] font-bold ${isRemoteConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isRemoteConnected ? 'CONNECTED' : 'STANDBY'}
                    </span>
                    <span className="text-slate-700">|</span>
                    <span>
                      {userRole === 'coach' ? `${speakerName} (Speaker)` : 'Head Coach Tyrese / Qassim'}
                    </span>
                  </div>
                </div>

                {/* Local Peer */}
                <div className="relative rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden flex items-center justify-center shadow-xl">
                  {localStream && !isVideoDisabled ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${isScreenSharing ? '' : 'scale-x-[-1]'}`}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-2">
                        <VideoOff className="w-5 h-5 text-slate-500" />
                      </div>
                      <p className="text-xs text-slate-400 font-medium">Camera is Disabled</p>
                      <button
                        onClick={toggleVideo}
                        className="mt-2 text-[11px] text-[#C89630] hover:underline font-mono"
                      >
                        Turn Camera On
                      </button>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <span className="text-[9px] text-[#C89630] font-bold">LOCAL</span>
                    <span className="text-slate-700">|</span>
                    <span>{userRole === 'coach' ? 'You (Coach Lead)' : `You (${speakerName})`}</span>
                  </div>

                  {/* Vocal Projection VU Meter */}
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80 flex items-center gap-2.5 text-slate-300">
                    <Volume2 className="w-3.5 h-3.5 text-[#C89630] shrink-0" />
                    <div className="flex-1 flex flex-col gap-0.5">
                      <div className="flex justify-between text-[9px] font-mono text-slate-400">
                        <span>Vocal Projection</span>
                        <span>{audioLevel}% {audioLevel > 50 ? '• Resonant' : '• Soft'}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-75 ${
                            audioLevel > 75 
                              ? 'bg-amber-400' 
                              : audioLevel > 20 
                                ? 'bg-emerald-400' 
                                : 'bg-slate-600'
                          }`}
                          style={{ width: `${Math.max(4, audioLevel)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls Bar for Native Studio */}
              <div className="mt-3 py-2 px-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleAudio}
                    className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-medium ${
                      isAudioMuted 
                        ? 'bg-red-950/60 border-red-800/80 text-red-300 hover:bg-red-900/80' 
                        : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    }`}
                    title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                  >
                    {isAudioMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                    <span className="hidden sm:inline">{isAudioMuted ? 'Muted' : 'Mute'}</span>
                  </button>

                  <button
                    onClick={toggleVideo}
                    className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-medium ${
                      isVideoDisabled 
                        ? 'bg-red-950/60 border-red-800/80 text-red-300 hover:bg-red-900/80' 
                        : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    }`}
                    title={isVideoDisabled ? 'Turn Camera On' : 'Turn Camera Off'}
                  >
                    {isVideoDisabled ? <VideoOff className="w-4 h-4 text-red-400" /> : <Video className="w-4 h-4 text-slate-200" />}
                    <span className="hidden sm:inline">{isVideoDisabled ? 'Video Off' : 'Camera'}</span>
                  </button>

                  <button
                    onClick={toggleScreenShare}
                    className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-medium ${
                      isScreenSharing 
                        ? 'bg-[#C89630]/20 border-[#C89630]/60 text-[#C89630]' 
                        : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    }`}
                    title="Share debate motion, brief, or slide deck"
                  >
                    <ScreenShare className="w-4 h-4" />
                    <span className="hidden sm:inline">{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden md:inline text-[10px] font-mono text-slate-400 tracking-wider">
                    ZERO-ADS • ENCRYPTED P2P
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FORENSICS & RUBRIC SIDEBAR (Cols 9-12 on desktop) */}
        <div className={`lg:col-span-4 border-l border-slate-800 bg-slate-900/70 p-4 sm:p-6 overflow-y-auto flex flex-col gap-6 ${
          mobileTab === 'forensics' ? 'flex' : 'hidden lg:flex'
        }`}>

          {/* Section 1: Speech & Floor Timer */}
          <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
                <Clock className="w-3.5 h-3.5 text-[#C89630]" />
                <span>Speech & Floor Timer</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {isExecutiveRoom ? 'Executive Presentation Sprint' : branch === 'Foundation' ? 'Catharsis Sprint' : 'British Parliamentary'}
              </span>
            </div>

            {/* Big Countdown Digits */}
            <div className="py-4 px-2 text-center bg-slate-950 rounded-xl border border-slate-800/80 mb-4">
              <div className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-white">
                {formatTime(secondsRemaining)}
              </div>

              {/* Phase Indicator */}
              <div className="mt-2.5">
                {isExecutiveRoom ? (
                  isProtectedFirstMinute ? (
                    <span className="inline-block text-[10px] font-mono tracking-widest uppercase bg-slate-900 text-slate-300 px-3 py-1 rounded-lg border border-slate-800">
                      Opening Hook • Uninterrupted Flow
                    </span>
                  ) : isPoiFloorOpen ? (
                    <span className="inline-block text-[10px] font-mono tracking-widest uppercase bg-amber-500/15 text-amber-300 px-3 py-1 rounded-lg border border-amber-500/30">
                      Executive Delivery • Cadence & Presence
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] font-mono tracking-widest uppercase bg-slate-900 text-slate-300 px-3 py-1 rounded-lg border border-slate-800">
                      BLUF Conclusion • High-Conviction Close
                    </span>
                  )
                ) : isBPMode ? (
                  isProtectedFirstMinute ? (
                    <span className="inline-block text-[10px] font-mono tracking-widest uppercase bg-slate-900 text-slate-300 px-3 py-1 rounded-lg border border-slate-800">
                      Protected Period • No POIs
                    </span>
                  ) : isPoiFloorOpen ? (
                    <span className="inline-block text-[10px] font-mono tracking-widest uppercase bg-amber-500/15 text-amber-300 px-3 py-1 rounded-lg border border-amber-500/30">
                      Floor Open • POIs Permitted
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] font-mono tracking-widest uppercase bg-slate-900 text-slate-300 px-3 py-1 rounded-lg border border-slate-800">
                      Protected Final Minute • Conclude
                    </span>
                  )
                ) : (
                  <span className="inline-block text-[10px] font-mono tracking-widest uppercase bg-emerald-500/15 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/30">
                    Vocal Cadence Flow
                  </span>
                )}
              </div>
            </div>

            {/* Timer Presets Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => handleSelectPreset(420)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  timerPreset === 420 
                    ? 'bg-[#C89630]/15 border-[#C89630]/50 text-white' 
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">{isExecutiveRoom ? '7:00 Boardroom Defense' : '7:00 BP Speech'}</div>
                <div className="text-[10px] text-slate-400 font-mono">{isExecutiveRoom ? 'Q&A Stress Test & Close' : 'Full Standard Round'}</div>
              </button>

              <button
                onClick={() => handleSelectPreset(300)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  timerPreset === 300 
                    ? 'bg-[#C89630]/15 border-[#C89630]/50 text-white' 
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">{isExecutiveRoom ? '5:00 Venture Pitch' : '5:00 Catharsis'}</div>
                <div className="text-[10px] text-slate-400 font-mono">{isExecutiveRoom ? 'Investor Thesis & Ask' : 'Vocal Release Flow'}</div>
              </button>

              <button
                onClick={() => handleSelectPreset(180)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  timerPreset === 180 
                    ? 'bg-[#C89630]/15 border-[#C89630]/50 text-white' 
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">{isExecutiveRoom ? '3:00 Exec Summary' : '3:00 Rebuttal'}</div>
                <div className="text-[10px] text-slate-400 font-mono">{isExecutiveRoom ? 'BLUF Problem & Solution' : 'Clash & Extension'}</div>
              </button>

              <button
                onClick={() => handleSelectPreset(60)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  timerPreset === 60 
                    ? 'bg-[#C89630]/15 border-[#C89630]/50 text-white' 
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">{isExecutiveRoom ? '1:00 Elevator Hook' : '1:00 POI / Hook'}</div>
                <div className="text-[10px] text-slate-400 font-mono">{isExecutiveRoom ? 'High-Stakes Introduction' : 'Impromptu Sprint'}</div>
              </button>
            </div>

            {/* Timer Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-md active:scale-95 ${
                  isTimerRunning 
                    ? 'bg-amber-600 hover:bg-amber-500 text-slate-950' 
                    : 'bg-[#C89630] hover:bg-[#d6a543] text-slate-950'
                }`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isTimerRunning ? 'Pause Clock' : 'Start Speech Clock'}</span>
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setSecondsRemaining(timerPreset);
                }}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Reset Clock"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Section 2: Coach Live Evaluation Rubric */}
          <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
                <FileText className="w-3.5 h-3.5 text-[#C89630]" />
                <span>{isExecutiveRoom ? 'Executive Delivery & Poise Rubric' : 'Coach Live Evaluation Rubric'}</span>
              </div>
              <span className="text-xs font-mono text-[#C89630] font-bold">
                {rubricScore}/10 Score
              </span>
            </div>

            {/* Dialectic Clash & Poise Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>{isExecutiveRoom ? 'Executive Presence & Conviction' : 'Dialectical Clash & Poise'}</span>
                <span className="font-mono text-slate-400">{rubricScore} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={rubricScore}
                onChange={(e) => setRubricScore(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#C89630]"
              />
            </div>

            {/* Speaking Pace (WPM) Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Estimated Speaking Pace</span>
                <span className="font-mono text-slate-400">{cadenceWpm} WPM</span>
              </div>
              <input
                type="range"
                min="100"
                max="200"
                step="2"
                value={cadenceWpm}
                onChange={(e) => setCadenceWpm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#C89630]"
              />
            </div>

            {/* Rehearsal Critique Notes */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                {isExecutiveRoom ? 'Executive Critique & Boardroom Delivery Notes' : 'Rehearsal Critique & Refutation Notes'}
              </label>
              <textarea
                value={rehearsalNotes}
                onChange={(e) => setRehearsalNotes(e.target.value)}
                placeholder={
                  isExecutiveRoom
                    ? 'Jot down specific feedback on executive composure, BLUF framing, vocal resonance, strategic pauses, and objection handling...'
                    : 'Jot down specific feedback on framing, syllogistic structure, eye contact, vocal variety, or rebuttal execution...'
                }
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#C89630] resize-none"
              />
            </div>

            {/* Save Feedback Button */}
            <button
              onClick={handleSaveNotes}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Feedback Saved to Speaker Profile</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-slate-400" />
                  <span>Save Feedback to Speaker Vault</span>
                </>
              )}
            </button>
          </section>

        </div>

      </div>

      {/* Architectural Bottom Status Bar */}
      <footer className="h-9 px-4 sm:px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <span className="text-slate-400 font-medium truncate">
            {studioMode === 'jitsi' 
              ? (jitsiDomain.includes('trycloudflare') ? 'Sovereign SFU Infrastructure' : `Dedicated SFU · ${jitsiDomain}`) 
              : 'End-to-End Encrypted Speech Chamber · Direct P2P'}
          </span>
          <span className="text-slate-800">|</span>
          <span className="text-emerald-400 font-semibold tracking-wider uppercase text-[10px]">
            {isExecutiveRoom ? 'Executive Faculty Protocol' : 'Chamber Secured'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span>Chamber: <strong className="text-slate-400 font-medium">{safeRoomId}</strong></span>
          <span className="text-slate-800">|</span>
          <span>Zero Ads · End-to-End Encrypted</span>
        </div>
      </footer>
    </div>
  );
};
