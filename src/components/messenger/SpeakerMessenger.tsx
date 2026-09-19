import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Play, 
  Pause, 
  CheckCheck, 
  Check,
  Search, 
  Video, 
  Zap, 
  Mic, 
  X, 
  Reply,
  FileText, 
  Trash2, 
  Volume2,
  ExternalLink,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatMessage, Client } from '../../types';
import { RecordingResponse } from '../../services/apiClient';

const WHATSAPP_REACTIONS = ['👍', '🎙️', '🔥', '👏', '💡', '❤️'];

interface SpeakerMessengerProps {
  assignedCoach?: any | null;
  pairedClient?: Client | null;
  profile: any;
  isExecutive: boolean;
  isAcademy: boolean;
  persistedRecordings?: RecordingResponse[];
  onOpenLiveRehearsal: () => void;
}

export const SpeakerMessenger: React.FC<SpeakerMessengerProps> = ({
  assignedCoach,
  pairedClient,
  profile,
  isExecutive,
  isAcademy,
  persistedRecordings = [],
  onOpenLiveRehearsal,
}) => {
  const { 
    messages, 
    sendMessage,
    deleteMessage,
    markMessagesRead,
    reactToMessage,
    onlineUserIds,
    coaches
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [audioSpeed, setAudioSpeed] = useState<1 | 1.5 | 2>(1);
  const [inChatSearch, setInChatSearch] = useState('');
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showRecordingsPicker, setShowRecordingsPicker] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [activeReactionMenuId, setActiveReactionMenuId] = useState<string | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<ChatMessage | null>(null);

  // Voice Note Recording State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const recordingDurationRef = useRef<number>(0);
  const playbackTimerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Voice Note Helper Utilities
  const isVoiceNote = (msg: ChatMessage) => {
    if (msg.messageType === 'audio') return true;
    if (msg.attachment?.type === 'voice' || msg.attachmentData?.type === 'voice') return true;
    if (msg.attachment?.audioUrl || msg.attachmentData?.audioUrl) return true;
    if (msg.attachment?.waveform || msg.attachmentData?.waveform) return true;
    const t = msg.text || (msg as any).content || '';
    if (typeof t === 'string' && (t.startsWith('🎙️') || t.toLowerCase().includes('voice rehearsal') || t.toLowerCase().includes('voice critique'))) return true;
    return false;
  };

  const getVoiceDuration = (msg: ChatMessage) => {
    const rawDur = msg.attachment?.duration || msg.attachmentData?.duration;
    if (rawDur && rawDur !== '0:00') return rawDur;
    const t = msg.text || (msg as any).content || '';
    const match = typeof t === 'string' ? t.match(/\((\d+:\d\d)\)/) : null;
    if (match && match[1] !== '0:00') return match[1];
    return '0:15';
  };

  const getVoiceWaveform = (msg: ChatMessage) => {
    if (Array.isArray(msg.attachment?.waveform) && msg.attachment.waveform.length > 0) return msg.attachment.waveform;
    if (Array.isArray(msg.attachmentData?.waveform) && msg.attachmentData.waveform.length > 0) return msg.attachmentData.waveform;
    return [14, 22, 18, 28, 14, 20, 30, 16, 26, 14, 18, 24, 12, 18, 22];
  };

  const getVoiceAudioUrl = (msg: ChatMessage) => {
    return msg.attachment?.audioUrl || msg.attachment?.url || msg.attachmentData?.audioUrl || msg.attachmentData?.url || null;
  };

  // Coach Information
  const coachName = assignedCoach?.name || 'Head Coach Qassim';
  const coachTitle = assignedCoach?.title || 'Faculty Speech & Debate Coach';
  const coachInitials = coachName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'HQ';

  // Online Presence: Check if assigned coach user ID or faculty is online via SSE
  const isCoachOnline = useMemo(() => {
    if (!onlineUserIds || onlineUserIds.length === 0) return false;
    if (assignedCoach?.id && onlineUserIds.includes(assignedCoach.id)) return true;
    if (assignedCoach?.email && onlineUserIds.includes(assignedCoach.email)) return true;
    // Also check if any coach account is online
    return onlineUserIds.some(id => id.includes('coach') || id === 'coach-1');
  }, [onlineUserIds, assignedCoach]);

  // Messages filtered for this speaker client
  const activeMessages = useMemo(() => {
    if (!pairedClient?.id) return [];
    return messages.filter(m => m.clientId === pairedClient.id);
  }, [messages, pairedClient?.id]);

  // Search filtered messages
  const displayedMessages = useMemo(() => {
    if (!inChatSearch.trim()) return activeMessages;
    const query = inChatSearch.toLowerCase();
    return activeMessages.filter(m => 
      m.text?.toLowerCase().includes(query) ||
      m.attachment?.title?.toLowerCase().includes(query) ||
      m.attachment?.replyTo?.text?.toLowerCase().includes(query)
    );
  }, [activeMessages, inChatSearch]);

  // Mark messages as read on mount or message update
  useEffect(() => {
    if (pairedClient?.id && markMessagesRead) {
      markMessagesRead(pairedClient.id);
    }
  }, [pairedClient?.id, markMessagesRead, activeMessages.length]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [displayedMessages.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      clearInterval(playbackTimerRef.current);
      clearInterval(recordingTimerRef.current);
    };
  }, []);

  // Voice Note Recording with Ref-based Duration (prevents stale closure bug)
  const startRecordingAudio = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      simulateVoiceNote();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const elapsedSec = Math.max(1, Math.round((Date.now() - recordingStartTimeRef.current) / 1000));
        const finalDurationSec = elapsedSec > 0 ? elapsedSec : (recordingDurationRef.current || 15);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        sendVoiceNote(audioUrl, finalDurationSec);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
      setRecordingDuration(0);
      recordingDurationRef.current = 0;

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const next = prev + 1;
          recordingDurationRef.current = next;
          return next;
        });
      }, 1000);
    } catch {
      simulateVoiceNote();
    }
  };

  const stopAndSendRecording = () => {
    const elapsedSec = Math.max(1, Math.round((Date.now() - recordingStartTimeRef.current) / 1000));
    const finalSec = elapsedSec > 0 ? elapsedSec : (recordingDurationRef.current || 15);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      simulateVoiceNote(finalSec);
    }
    clearInterval(recordingTimerRef.current);
    setIsRecordingAudio(false);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
    }
    clearInterval(recordingTimerRef.current);
    setIsRecordingAudio(false);
    setRecordingDuration(0);
    recordingDurationRef.current = 0;
    audioChunksRef.current = [];
  };

  const simulateVoiceNote = (forcedDurationSec?: number) => {
    if (!pairedClient?.id) return;
    const durSec = forcedDurationSec && forcedDurationSec > 0 ? forcedDurationSec : (recordingDurationRef.current > 0 ? recordingDurationRef.current : 15);
    const minutes = Math.floor(durSec / 60);
    const seconds = durSec % 60;
    const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    sendMessage({
      clientId: pairedClient.id,
      sender: 'client',
      messageType: 'audio',
      content: `🎙️ Voice Rehearsal Note (${durationStr})`,
      attachmentData: {
        type: 'voice',
        title: `Voice Rehearsal Memo (${durationStr})`,
        duration: durationStr,
        durationSeconds: durSec,
        waveform: [14, 28, 18, 32, 16, 24, 36, 20, 30, 18, 22, 28, 14, 20, 26, 12]
      }
    });
    setIsRecordingAudio(false);
    setRecordingDuration(0);
    recordingDurationRef.current = 0;
    clearInterval(recordingTimerRef.current);
  };

  const sendVoiceNote = (audioUrl: string, durationSec: number) => {
    if (!pairedClient?.id) return;
    const safeSec = durationSec > 0 ? durationSec : 15;
    const minutes = Math.floor(safeSec / 60);
    const seconds = safeSec % 60;
    const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    sendMessage({
      clientId: pairedClient.id,
      sender: 'client',
      messageType: 'audio',
      content: `🎙️ Voice Rehearsal Memo (${durationStr})`,
      attachmentData: {
        type: 'voice',
        title: `Voice Rehearsal Memo (${durationStr})`,
        url: audioUrl,
        audioUrl,
        duration: durationStr,
        durationSeconds: safeSec,
        waveform: [12, 24, 18, 28, 14, 20, 32, 16, 26, 12, 18, 22, 10, 24, 18, 14]
      }
    });
  };

  // Audio Playback Handling with WhatsApp Speed & Real/Simulated Controller
  const handleTogglePlayAudio = (msg: ChatMessage) => {
    if (isPlayingAudio === msg.id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      clearInterval(playbackTimerRef.current);
      setIsPlayingAudio(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    clearInterval(playbackTimerRef.current);

    setIsPlayingAudio(msg.id);
    setPlaybackProgress(0);

    const audioUrl = getVoiceAudioUrl(msg);
    if (audioUrl) {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
      }
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.playbackRate = audioSpeed;
      audioPlayerRef.current.ontimeupdate = () => {
        if (audioPlayerRef.current && audioPlayerRef.current.duration) {
          setPlaybackProgress((audioPlayerRef.current.currentTime / audioPlayerRef.current.duration) * 100);
        }
      };
      audioPlayerRef.current.onended = () => {
        setIsPlayingAudio(null);
        setPlaybackProgress(0);
      };
      audioPlayerRef.current.play().catch(() => {
        startSimulatedPlayback(msg);
      });
    } else {
      startSimulatedPlayback(msg);
    }
  };

  const startSimulatedPlayback = (msg: ChatMessage) => {
    const durStr = getVoiceDuration(msg);
    const [mins, secs] = durStr.split(':').map(Number);
    const totalSecs = Math.max(3, (mins || 0) * 60 + (secs || 15));
    const effectiveSecs = totalSecs / audioSpeed;
    const intervalMs = 100;
    const stepPercent = (intervalMs / (effectiveSecs * 1000)) * 100;

    let current = 0;
    playbackTimerRef.current = setInterval(() => {
      current += stepPercent;
      if (current >= 100) {
        clearInterval(playbackTimerRef.current);
        setIsPlayingAudio(null);
        setPlaybackProgress(0);
      } else {
        setPlaybackProgress(current);
      }
    }, intervalMs);
  };

  const cycleAudioSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSpeed: 1 | 1.5 | 2 = audioSpeed === 1 ? 1.5 : audioSpeed === 1.5 ? 2 : 1;
    setAudioSpeed(nextSpeed);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playbackRate = nextSpeed;
    }
  };

  // Text message send
  const handleSendText = async (textToSend?: string) => {
    if (isSending) return;
    const text = (textToSend || inputMessage).trim();
    if (!text || !pairedClient?.id) return;

    setIsSending(true);
    setInputMessage('');
    setReplyingToMessage(null);
    setShowAttachmentMenu(false);

    let attachmentData: any = undefined;
    if (replyingToMessage) {
      attachmentData = {
        replyTo: {
          id: replyingToMessage.id,
          text: replyingToMessage.text,
          sender: replyingToMessage.sender,
          senderName: replyingToMessage.sender === 'client' ? profile.fullName : coachName
        }
      };
    }

    try {
      await sendMessage({
        clientId: pairedClient.id,
        sender: 'client',
        text,
        content: text,
        attachmentData
      });
    } finally {
      setIsSending(false);
    }
  };

  // Attach a saved drill recording
  const handleAttachRecording = (rec: RecordingResponse) => {
    if (!pairedClient?.id) return;
    const durationMin = Math.floor(rec.duration_seconds / 60);
    const durationSec = rec.duration_seconds % 60;
    const durationStr = `${durationMin}:${durationSec < 10 ? '0' : ''}${durationSec}`;

    sendMessage({
      clientId: pairedClient.id,
      sender: 'client',
      messageType: 'audio',
      content: `Attached saved rehearsal recording: "${rec.title}" (${durationStr})`,
      attachmentData: {
        type: 'voice',
        title: rec.title,
        url: rec.file_url,
        duration: durationStr,
        durationSeconds: rec.duration_seconds,
        waveform: [16, 28, 22, 34, 18, 26, 30, 24, 32, 20, 26, 18, 14, 22, 28, 16]
      }
    });
    setShowRecordingsPicker(false);
    setShowAttachmentMenu(false);
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pairedClient?.id) return;

    sendMessage({
      clientId: pairedClient.id,
      sender: 'client',
      messageType: 'document',
      content: `Attached speech document: ${file.name}`,
      attachmentData: {
        type: 'document',
        title: file.name,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`
      }
    });
    setShowAttachmentMenu(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleToggleReaction = (messageId: string, emoji: string) => {
    reactToMessage(messageId, emoji);
    setActiveReactionMenuId(null);
  };

  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`msg-${messageId}`);
    if (element) {
      element.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-amber-400');
      setTimeout(() => element.classList.remove('ring-2', 'ring-amber-400'), 1500);
    }
  };

  // Context-aware Quick Rhetoric & Practice Cues for speakers
  const speakerQuickCues = useMemo(() => {
    if (isExecutive) {
      return [
        'Can you evaluate the hook and pacing of my executive keynote?',
        'Reviewing my 60-second venture pitch rehearsal.',
        'Would like calibration on executive cadence (target: 145 WPM).',
        'Requesting 1-on-1 board presentation rehearsal in the live chamber.'
      ];
    }
    if (isAcademy) {
      return [
        'How was my Parliamentary rebuttal structure on that round?',
        'Reviewing my cross-examination flow and clarity.',
        'Targeting 160 WPM cadence with strict articulation.',
        'Requesting live chamber debate spar session.'
      ];
    }
    return [
      'Submitted my cathartic voice journal for your feedback.',
      'Working on pausing comfortably before my main thesis.',
      'Reflecting on vocal presence and somatic grounding.',
      'Ready for our next live consultation.'
    ];
  }, [isExecutive, isAcademy]);

  const accentColor = isExecutive ? '#C89630' : isAcademy ? '#10B981' : '#14B8A6';
  const themeBorder = isExecutive ? 'border-[#C89630]/40' : isAcademy ? 'border-emerald-500/40' : 'border-teal-500/40';

  return (
    <div className="flex-1 min-h-0 flex flex-col rounded-3xl bg-slate-900/95 border border-slate-800 overflow-hidden shadow-2xl animate-fadeIn">
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".pdf,.doc,.docx,.txt,.mp3,.wav,.webm" 
      />

      {/* WhatsApp Modern Header */}
      <div className="p-3.5 sm:p-4 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center font-bold text-slate-950 text-sm shadow-md border ${
              isExecutive ? 'bg-[#C89630] border-[#C89630]' : 'bg-emerald-500 border-emerald-400'
            }`}>
              {coachInitials}
            </div>
            <span 
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 ${
                isCoachOnline ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
              title={isCoachOnline ? 'Coach is currently online' : 'Coach is offline (notifications dispatched via email)'}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white truncate">{coachName}</h3>
              <span className={`hidden sm:inline text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                isExecutive 
                  ? 'bg-[#C89630]/10 text-[#C89630] border-[#C89630]/30' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {coachTitle}
              </span>
            </div>
            
            {/* Real-Time Online Status & Presence Indicator */}
            <div className="text-[10px] font-mono tracking-wider flex items-center gap-2 mt-0.5">
              <span className={isCoachOnline ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                {isCoachOnline ? 'ONLINE • SSE ACTIVE' : 'OFFLINE • DIRECT FACULTY THREAD'}
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-400 hidden sm:inline truncate">
                {profile.branch} Scholar Protocol
              </span>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search conversation toggle */}
          <button
            onClick={() => {
              setIsSearchingInChat(!isSearchingInChat);
              if (isSearchingInChat) setInChatSearch('');
            }}
            className={`p-2 rounded-xl border transition-colors ${
              isSearchingInChat 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Search conversation messages"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Launch Live Rehearsal Chamber */}
          <button
            onClick={onOpenLiveRehearsal}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer ${
              isExecutive 
                ? 'bg-[#C89630] hover:bg-[#d6a543] shadow-[#C89630]/20' 
                : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
            }`}
            title="Launch Live Rehearsal Chamber"
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Live Chamber</span>
          </button>
        </div>
      </div>

      {/* In-Chat Search Bar */}
      {isSearchingInChat && (
        <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800 flex items-center gap-2 text-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search messages in this consultation thread..."
            value={inChatSearch}
            onChange={(e) => setInChatSearch(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-hidden"
          />
          {inChatSearch && (
            <span className="text-[10px] font-mono text-slate-400">
              {displayedMessages.length} found
            </span>
          )}
          <button
            onClick={() => {
              setInChatSearch('');
              setIsSearchingInChat(false);
            }}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Messages Stream Container */}
      <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-3.5 text-xs">
        {/* Date separator pill */}
        <div className="flex justify-center my-2">
          <span className="px-3 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-widest shadow-inner">
            TODAY · FACULTY THREAD
          </span>
        </div>

        {displayedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center space-y-3 p-6 text-slate-400">
            <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">Start Consultation with {coachName}</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Send a question, record a voice rehearsal memo, or attach a practice recording for faculty review.
              </p>
            </div>
          </div>
        ) : (
          displayedMessages.map((msg) => {
            const isSpeaker = msg.sender === 'client';
            const isHovered = hoveredMessageId === msg.id;
            const isReactionMenuOpen = activeReactionMenuId === msg.id;
            const reactions = msg.attachment?.reactions || [];
            const replyTo = msg.attachment?.replyTo;

            return (
              <div
                key={msg.id}
                id={`msg-${msg.id}`}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
                className={`group relative flex gap-2 max-w-[88%] sm:max-w-[75%] transition-all ${
                  isSpeaker ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Floating WhatsApp Action Bar on Hover */}
                {(isHovered || isReactionMenuOpen) && (
                  <div className={`absolute -top-7 ${isSpeaker ? 'right-0' : 'left-0'} z-20 flex items-center gap-1 p-1 rounded-full bg-slate-950 border border-slate-700 shadow-xl backdrop-blur-md`}>
                    {/* Quick Reaction Emojis */}
                    {WHATSAPP_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleToggleReaction(msg.id, emoji)}
                        className="h-6 w-6 rounded-full hover:bg-slate-800 flex items-center justify-center text-xs transition-transform hover:scale-125 cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}

                    {/* Reply / Quote Button */}
                    <button
                      onClick={() => setReplyingToMessage(msg)}
                      className="h-6 w-6 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ml-0.5"
                      title="Quote / Reply"
                    >
                      <Reply className="w-3 h-3" />
                    </button>

                    {/* Delete Message Button */}
                    {isSpeaker && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage(msg.id);
                          setActiveReactionMenuId(null);
                        }}
                        className="h-6 w-6 rounded-full hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ml-0.5"
                        title="Delete Message"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* Avatar Icon */}
                {isSpeaker ? (
                  <div className={`h-7 w-7 rounded-xl flex items-center justify-center font-bold text-[10px] shrink-0 self-end border ${
                    isExecutive 
                      ? 'bg-[#C89630]/20 border-[#C89630]/60 text-[#C89630]' 
                      : 'bg-emerald-950 border-emerald-500/60 text-emerald-400'
                  }`}>
                    {(profile.fullName || 'Speaker').slice(0, 2).toUpperCase()}
                  </div>
                ) : (
                  <div className="h-7 w-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-[10px] shrink-0 self-end">
                    {coachInitials}
                  </div>
                )}

                <div className={`space-y-1 ${isSpeaker ? 'items-end' : 'items-start'} max-w-full`}>
                  {/* Message Bubble */}
                  <div 
                    onClick={() => setActiveReactionMenuId(activeReactionMenuId === msg.id ? null : msg.id)}
                    className={`relative px-4 py-3 rounded-2xl shadow-sm cursor-pointer ${
                    isSpeaker
                      ? isExecutive
                        ? 'bg-[#C89630]/25 border border-[#C89630]/60 text-slate-100 rounded-br-xs'
                        : 'bg-emerald-950/80 border border-emerald-500/50 text-slate-100 rounded-br-xs'
                      : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-xs'
                  }`}>
                    {/* Quoted Message Card (WhatsApp Quote-Reply Preview) */}
                    {replyTo && (
                      <div 
                        onClick={() => scrollToMessage(replyTo.id)}
                        className={`mb-2 p-2 rounded-xl text-[11px] border-l-4 cursor-pointer transition-colors ${
                          isSpeaker 
                            ? 'bg-black/30 border-[#C89630] text-slate-200 hover:bg-black/40' 
                            : 'bg-slate-950/70 border-slate-600 text-slate-300 hover:bg-slate-950'
                        }`}
                      >
                        <div className="font-bold text-[10px] text-amber-400">
                          {replyTo.senderName || (replyTo.sender === 'client' ? profile.fullName : coachName)}
                        </div>
                        <p className="truncate line-clamp-1 opacity-80 mt-0.5">{replyTo.text}</p>
                      </div>
                    )}

                    {/* Message Text Content */}
                    {(!isVoiceNote(msg) || (msg.text && !msg.text.startsWith('🎙️') && !msg.text.includes('Voice Rehearsal') && !msg.text.includes('Voice critique'))) && (
                      <p className="leading-relaxed text-xs break-words text-slate-100 font-medium">{msg.text || (msg as any).content}</p>
                    )}

                    {/* Document File Attachment Card */}
                    {msg.attachment?.fileName && (
                      <div className="mt-2 p-2.5 rounded-xl bg-black/40 border border-slate-700 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[11px] text-white truncate">{msg.attachment.fileName}</div>
                          <div className="text-[9px] font-mono text-slate-400">{msg.attachment.fileSize || 'Document'}</div>
                        </div>
                      </div>
                    )}

                    {/* Voice Note Audio Bubble (WhatsApp Voice Note Player) */}
                    {isVoiceNote(msg) && (() => {
                      const voiceWaveform = getVoiceWaveform(msg);
                      const voiceDuration = getVoiceDuration(msg);
                      const isThisPlaying = isPlayingAudio === msg.id;

                      return (
                        <div className="mt-2.5 flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl bg-black/40 border border-white/5 min-w-[240px] sm:min-w-[280px]">
                          <button
                            type="button"
                            onClick={() => handleTogglePlayAudio(msg)}
                            className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer shadow-md text-slate-950 ${
                              isExecutive ? 'bg-[#C89630] hover:bg-[#d6a543]' : 'bg-emerald-400 hover:bg-emerald-300'
                            }`}
                            title={isThisPlaying ? 'Pause Voice Memo' : 'Play Voice Memo'}
                          >
                            {isThisPlaying ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4 ml-0.5 fill-current" />
                            )}
                          </button>

                          {/* Waveform Visualization Bars */}
                          <div 
                            className="flex-1 flex items-center gap-1 h-7 cursor-pointer py-1"
                            onClick={() => handleTogglePlayAudio(msg)}
                            title="Tap to play/pause"
                          >
                            {voiceWaveform.map((h: number, i: number) => {
                              const barProgress = (i / voiceWaveform.length) * 100;
                              const isPlayed = isThisPlaying && barProgress <= playbackProgress;
                              return (
                                <div
                                  key={i}
                                  className={`w-1 rounded-full transition-all duration-150 ${
                                    isPlayed 
                                      ? isExecutive ? 'bg-[#C89630]' : 'bg-emerald-300'
                                      : isThisPlaying
                                        ? isExecutive ? 'bg-[#C89630]/40 animate-pulse' : 'bg-emerald-500/40 animate-pulse'
                                        : 'bg-slate-400/80'
                                  }`}
                                  style={{ height: `${Math.max(8, h)}px` }}
                                />
                              );
                            })}
                          </div>

                          {/* Duration label & WhatsApp Speed Multiplier */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-mono text-slate-300">
                              {voiceDuration}
                            </span>
                            <button
                              type="button"
                              onClick={cycleAudioSpeed}
                              className={`px-1.5 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[9px] font-mono border border-slate-700 cursor-pointer transition-colors ${
                                isExecutive ? 'text-[#C89630]' : 'text-emerald-400'
                              }`}
                              title="Toggle Playback Speed (1x, 1.5x, 2x)"
                            >
                              {audioSpeed}x
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Message Footer: Timestamp & WhatsApp Delivery Status */}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                      <span>{msg.timestamp?.split('T')[1]?.substring(0, 5) || msg.timestamp || '12:00'}</span>
                      {isSpeaker && (
                        <CheckCheck 
                          className={`h-3 w-3 ${msg.isRead ? 'text-cyan-400' : 'text-slate-400'}`}
                          title={msg.isRead ? 'Read by Coach (WhatsApp Blue Ticks)' : 'Delivered to Coach'}
                        />
                      )}
                    </div>
                  </div>

                  {/* Emoji Reactions Tray */}
                  {reactions.length > 0 && (
                    <div className={`flex flex-wrap gap-1 px-1 ${isSpeaker ? 'justify-end' : 'justify-start'}`}>
                      {reactions.map((r: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleToggleReaction(msg.id, r.emoji)}
                          className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 hover:border-amber-500/50 text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                          title={`Reacted by ${r.userName || 'User'}`}
                        >
                          <span>{r.emoji}</span>
                          <span className="font-mono text-[9px] text-slate-400">1</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Rhetoric & Practice Cues Bar for Speakers */}
      <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar shrink-0">
        <span className={`text-[10px] font-mono uppercase tracking-widest shrink-0 flex items-center gap-1 ${
          isExecutive ? 'text-[#C89630]' : 'text-emerald-400'
        }`}>
          <Zap className="h-3 w-3" />
          SPEAKER CUES:
        </span>
        {speakerQuickCues.map((cue, idx) => (
          <button
            key={idx}
            onClick={() => handleSendText(cue)}
            className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 whitespace-nowrap transition-colors truncate max-w-xs cursor-pointer text-xs"
          >
            {cue}
          </button>
        ))}
      </div>

      {/* Input & Voice Note Composer */}
      <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 relative shrink-0">
        {/* Attachment Menu Popup */}
        {showAttachmentMenu && (
          <div className="absolute bottom-16 left-4 p-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-1 text-xs animate-in slide-in-from-bottom-2 z-30 min-w-[220px]">
            {persistedRecordings.length > 0 && (
              <button
                onClick={() => {
                  setShowRecordingsPicker(true);
                  setShowAttachmentMenu(false);
                }}
                className="w-full px-3 py-2 rounded-xl text-left font-bold text-slate-200 hover:bg-slate-800 hover:text-amber-400 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Award className="h-4 w-4 text-amber-400" />
                <span>Share Saved Rehearsal ({persistedRecordings.length})</span>
              </button>
            )}
            <button
              onClick={() => {
                fileInputRef.current?.click();
                setShowAttachmentMenu(false);
              }}
              className="w-full px-3 py-2 rounded-xl text-left font-bold text-slate-200 hover:bg-slate-800 hover:text-cyan-400 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>Attach Speech Document / PDF</span>
            </button>
          </div>
        )}

        {/* Saved Rehearsal Recordings Picker Modal */}
        {showRecordingsPicker && (
          <div className="absolute bottom-16 left-4 p-3 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-2 text-xs z-30 max-h-64 overflow-y-auto w-80">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="font-bold text-xs text-white">Select Saved Rehearsal</span>
              <button onClick={() => setShowRecordingsPicker(false)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {persistedRecordings.map((rec) => (
              <div 
                key={rec.id}
                onClick={() => handleAttachRecording(rec)}
                className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 cursor-pointer flex items-center justify-between gap-2 transition-colors"
              >
                <div className="truncate min-w-0">
                  <div className="font-bold text-slate-200 truncate">{rec.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {Math.floor(rec.duration_seconds / 60)}:{(rec.duration_seconds % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <Send className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Quoted Reply Banner */}
        {replyingToMessage && (
          <div className="mb-2 p-2.5 rounded-xl bg-slate-900 border-l-4 border-amber-500 flex items-center justify-between gap-2 animate-in fade-in">
            <div className="min-w-0 flex-1">
              <div className="font-bold text-[10px] text-amber-400">
                Replying to {replyingToMessage.sender === 'client' ? 'Yourself' : coachName}
              </div>
              <div className="text-[11px] text-slate-300 truncate">
                {replyingToMessage.text || (replyingToMessage as any).content}
              </div>
            </div>
            <button
              onClick={() => setReplyingToMessage(null)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Live Audio Recording Toolbar OR Standard Input */}
        {isRecordingAudio ? (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-rose-950/40 border border-rose-500/40 animate-in fade-in">
            <div className="flex items-center gap-2 flex-1 pl-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-mono text-xs font-bold text-rose-300">
                RECORDING: {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
              </span>
              <div className="flex-1 flex items-center gap-0.5 h-4 ml-3">
                {[12, 20, 16, 24, 18, 28, 14, 22, 16, 20].map((h, i) => (
                  <div key={i} className="w-1 bg-rose-400 rounded-full animate-pulse" style={{ height: `${h}px` }} />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={cancelRecording}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
              title="Cancel Recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={stopAndSendRecording}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer text-slate-950 ${
                isExecutive ? 'bg-[#C89630] hover:bg-[#d6a543]' : 'bg-emerald-500 hover:bg-emerald-400'
              }`}
            >
              <span>Send Memo</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendText();
            }}
            className="flex items-center gap-2"
          >
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Attach Rehearsal or Document"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Input Field */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Message ${coachName} about your presentation, speech delivery, or pacing...`}
              className="flex-1 h-10 px-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#C89630]"
            />

            {/* Voice Memo Mic Button (When input empty) OR Send Button (When text typed) */}
            {inputMessage.trim() ? (
              <button
                type="submit"
                disabled={isSending}
                className={`h-10 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer text-slate-950 transition-all ${
                  isExecutive
                    ? 'bg-[#C89630] hover:bg-[#d6a543] shadow-[#C89630]/20'
                    : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
                } ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>{isSending ? 'Sending...' : 'Send'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecordingAudio}
                className="h-10 w-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Record Voice Rehearsal Memo"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
