import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Play, 
  Pause, 
  BookOpen, 
  CheckCheck, 
  Check,
  Search, 
  Video, 
  Zap, 
  Mic, 
  MicOff,
  User, 
  ExternalLink,
  Plus,
  Reply,
  X,
  Smile,
  FileText,
  Trash2,
  ArrowLeft,
  Volume2,
  Sparkles,
  PhoneCall,
  Radio,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatMessage, Client } from '../../types';
import { LiveRehearsalRoom } from '../live/LiveRehearsalRoom';
import { OratorAvatar } from '../common/OratorAvatar';
import { localDateString, formatMessageTime } from '../../utils/date';

// WhatsApp Standard Quick Reactions
const WHATSAPP_REACTIONS = ['👍', '🎙️', '🔥', '👏', '💡', '❤️'];

export const CoachMessenger: React.FC = () => {
  const { 
    clients, 
    selectedClientId, 
    setSelectedClientId, 
    messages, 
    sendMessage,
    deleteMessage,
    markMessagesRead,
    reactToMessage,
    onlineClientIds,
    setActiveTab,
    addCoachNote,
    addMetricEntry,
    currentCoachUser,
    coaches,
    groups = [],
    typingUsers = {},
    sendTypingIndicator
  } = useApp();

  const [isLiveRoomOpen, setIsLiveRoomOpen] = useState(false);
  const [customChamberRoomId, setCustomChamberRoomId] = useState<string | undefined>(undefined);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [audioSpeed, setAudioSpeed] = useState<1 | 1.5 | 2>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [inChatSearch, setInChatSearch] = useState('');
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [activeReactionMenuId, setActiveReactionMenuId] = useState<string | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<ChatMessage | null>(null);
  const [mobileView, setMobileView] = useState<'roster' | 'thread'>('thread');

  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const recordingDurationRef = useRef<number>(0);
  const playbackTimerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const typingDebounceTimeoutRef = useRef<any>(null);

  // Active client conversation
  const activeClient = clients.find(c => c.id === selectedClientId) || clients[0];
  const isClientOnline = activeClient ? onlineClientIds.includes(activeClient.id) : false;

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
    return '0:18';
  };

  const getVoiceWaveform = (msg: ChatMessage) => {
    if (Array.isArray(msg.attachment?.waveform) && msg.attachment.waveform.length > 0) return msg.attachment.waveform;
    if (Array.isArray(msg.attachmentData?.waveform) && msg.attachmentData.waveform.length > 0) return msg.attachmentData.waveform;
    return [14, 28, 18, 32, 16, 24, 36, 20, 30, 18, 22, 28, 14, 20, 26, 12];
  };

  const getVoiceAudioUrl = (msg: ChatMessage) => {
    return msg.attachment?.audioUrl || msg.attachment?.url || msg.attachmentData?.audioUrl || msg.attachmentData?.url || null;
  };

  // Active messages filtered by client
  const activeMessages = useMemo(() => {
    if (!activeClient) return [];
    return messages.filter(m => m.clientId === activeClient.id);
  }, [messages, activeClient?.id]);

  // In-chat search filter
  const displayedMessages = useMemo(() => {
    if (!inChatSearch.trim()) return activeMessages;
    const query = inChatSearch.toLowerCase();
    return activeMessages.filter(m => 
      m.text?.toLowerCase().includes(query) ||
      m.attachment?.title?.toLowerCase().includes(query) ||
      m.attachment?.replyTo?.text?.toLowerCase().includes(query)
    );
  }, [activeMessages, inChatSearch]);

  // Mark messages as read when active client changes
  useEffect(() => {
    if (activeClient?.id && markMessagesRead) {
      markMessagesRead(activeClient.id);
    }
  }, [activeClient?.id, activeMessages.length, markMessagesRead]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [activeMessages.length]);

  const quickSnippets = [
    "Sharp argument structure! Notice how the 2-second pause before your rebuttal captivated the room.",
    "Remember to maintain diaphragmatic breath support on long clauses today!",
    "Your weekly speech review is logged with excellent vocal projection. Keep it up!",
    "Pacing check: let's slow down the opening hook to ~135 WPM for maximum gravitas."
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMessage(val);
    if (!activeClient?.id || !sendTypingIndicator) return;

    if (val.trim()) {
      sendTypingIndicator(activeClient.id, true);
      if (typingDebounceTimeoutRef.current) {
        clearTimeout(typingDebounceTimeoutRef.current);
      }
      typingDebounceTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(activeClient.id, false);
      }, 3000);
    } else {
      if (typingDebounceTimeoutRef.current) {
        clearTimeout(typingDebounceTimeoutRef.current);
      }
      sendTypingIndicator(activeClient.id, false);
    }
  };

  // Send standard text or quoted reply
  const handleSendText = async (textToSend?: string) => {
    if (isSending) return;
    const text = (textToSend || inputMessage).trim();
    if (!text || !activeClient) return;

    if (typingDebounceTimeoutRef.current) {
      clearTimeout(typingDebounceTimeoutRef.current);
    }
    if (sendTypingIndicator && activeClient?.id) {
      sendTypingIndicator(activeClient.id, false);
    }

    setIsSending(true);
    setInputMessage('');
    setReplyingToMessage(null);
    setShowAttachmentMenu(false);

    const attachmentPayload: any = replyingToMessage ? {
      type: 'text_with_quote',
      title: 'Quoted Reply',
      replyTo: {
        id: replyingToMessage.id,
        text: replyingToMessage.text || replyingToMessage.content || '',
        sender: replyingToMessage.sender,
        senderName: replyingToMessage.sender === 'coach' ? (currentCoachUser?.full_name || 'Coach') : activeClient.name
      }
    } : undefined;

    try {
      await sendMessage({
        clientId: activeClient.id,
        sender: 'coach',
        messageType: 'text',
        content: text,
        text: text,
        attachmentData: attachmentPayload
      });
    } finally {
      setIsSending(false);
    }
  };

  // Reset audio playback on client change
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    clearInterval(playbackTimerRef.current);
    setIsPlayingAudio(null);
    setPlaybackProgress(0);
  }, [selectedClientId]);

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
  const startRecording = async () => {
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
    const finalSec = elapsedSec > 0 ? elapsedSec : (recordingDurationRef.current || 18);

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
    if (!activeClient) return;
    const durSec = forcedDurationSec && forcedDurationSec > 0 ? forcedDurationSec : (recordingDurationRef.current > 0 ? recordingDurationRef.current : 18);
    const minutes = Math.floor(durSec / 60);
    const seconds = durSec % 60;
    const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    sendMessage({
      clientId: activeClient.id,
      sender: 'coach',
      messageType: 'audio',
      content: `🎙️ Voice critique on opening rebuttal hook (${durationStr})`,
      attachmentData: {
        type: 'voice',
        title: `Voice Critique (${durationStr})`,
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
    if (!activeClient) return;
    const safeSec = durationSec > 0 ? durationSec : 15;
    const minutes = Math.floor(safeSec / 60);
    const seconds = safeSec % 60;
    const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    sendMessage({
      clientId: activeClient.id,
      sender: 'coach',
      messageType: 'audio',
      content: `🎙️ Voice critique (${durationStr})`,
      attachmentData: {
        type: 'voice',
        title: `Voice Critique (${durationStr})`,
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
    const totalSecs = Math.max(3, (mins || 0) * 60 + (secs || 18));
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

  const handleSendWorkoutAttachment = () => {
    if (!activeClient) return;
    sendMessage({
      clientId: activeClient.id,
      sender: 'coach',
      messageType: 'workout_assignment',
      content: `I've updated your next training session: Round 1 - Parliamentary Rebuttal & Flow. Focus on strategic 2s pauses!`,
      attachmentData: {
        title: 'Round 1: Parliamentary Rebuttal & Flow',
        workoutId: 'w-1',
        dayNumber: 1
      }
    });
    setShowAttachmentMenu(false);
  };

  const handleSendFormCheckReview = () => {
    if (!activeClient) return;
    sendMessage({
      clientId: activeClient.id,
      sender: 'coach',
      messageType: 'form_check',
      content: `Vocal delivery analysis completed for your Oxford Union Rebuttal drill (142 WPM): Outstanding clarity. Remember to ground your posture and project to the back row!`,
      attachmentData: {
        exerciseName: 'Oxford Union Rebuttal Drill',
        rating: 4.8,
        videoUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=400&q=80'
      }
    });
    setShowAttachmentMenu(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeClient) return;

    sendMessage({
      clientId: activeClient.id,
      sender: 'coach',
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
      element.classList.add('ring-2', 'ring-emerald-400');
      setTimeout(() => element.classList.remove('ring-2', 'ring-emerald-400'), 1500);
    }
  };

  // Filter clients by search
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.goal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col md:flex-row rounded-3xl bg-slate-900/95 border border-slate-800 overflow-hidden shadow-2xl">
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".pdf,.doc,.docx,.txt,.mp3,.wav" 
      />

      {/* Left Sidebar: Conversations List */}
      <div className={`w-full md:w-80 border-r border-slate-800 flex flex-col bg-slate-950/60 shrink-0 ${
        mobileView === 'thread' ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header & Search */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <span>Messenger</span>
            </h3>
            <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {clients.length} ORATORS
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Client chat list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
          {filteredClients.map((client) => {
            const isSelected = client.id === activeClient?.id;
            const clientMsgList = messages.filter(m => m.clientId === client.id);
            const lastMsg = clientMsgList[clientMsgList.length - 1];
            const isOnline = onlineClientIds.includes(client.id);
            const unreadCount = clientMsgList.filter(m => m.sender === 'client' && !m.isRead).length;

            return (
              <div
                key={client.id}
                onClick={() => {
                  setSelectedClientId(client.id);
                  setMobileView('thread');
                }}
                className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-slate-800/80 border-l-4 border-emerald-500' : 'hover:bg-slate-900/60'
                }`}
              >
                <div className="relative shrink-0">
                  <OratorAvatar src={client.avatar} name={client.name} className="h-10 w-10 rounded-xl" />
                  <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 ${
                    isOnline ? 'bg-emerald-500' : client.status === 'Active' ? 'bg-emerald-600/70' : 'bg-slate-500'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                      {client.name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {lastMsg ? formatMessageTime(lastMsg.timestamp) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    {typingUsers?.[client.id] ? (
                      <p className="text-[11px] text-cyan-400 font-mono italic animate-pulse">
                        typing...
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
                        {lastMsg ? lastMsg.text || (lastMsg as any).content : `Goal: ${client.goal}`}
                      </p>
                    )}
                    {unreadCount > 0 && (
                      <span className="h-4 min-w-[16px] px-1 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shrink-0">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Stream Container */}
      {activeClient ? (
        <div className={`flex-1 flex flex-col bg-slate-900/50 min-w-0 ${
          mobileView === 'roster' ? 'hidden md:flex' : 'flex'
        }`}>
          {/* WhatsApp Modern Chat Header */}
          <div className="p-3.5 sm:p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              {/* Back to roster on mobile */}
              <button
                onClick={() => setMobileView('roster')}
                className="md:hidden p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
                title="Back to Orator List"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="relative shrink-0">
                <OratorAvatar 
                  src={activeClient.avatar} 
                  name={activeClient.name} 
                  className="h-10 w-10 rounded-xl border border-slate-700" 
                />
                <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-950 ${
                  isClientOnline ? 'bg-emerald-400' : 'bg-slate-500'
                }`} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white truncate">{activeClient.name}</h3>
                  <span className="hidden sm:inline text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {activeClient.goal}
                  </span>
                </div>
                {/* Real-Time Online Status Indicator */}
                <div className="text-[10px] font-mono tracking-wider flex items-center gap-1.5 mt-0.5">
                  <span className={isClientOnline ? 'text-emerald-400' : 'text-slate-400'}>
                    {isClientOnline ? 'ONLINE • SSE ACTIVE' : 'OFFLINE • EMAIL BACKUP ARMED'}
                  </span>
                  <span className="hidden sm:inline text-slate-600">|</span>
                  <span className="hidden sm:inline text-slate-400 truncate">
                    {activeClient.currentProgramName || 'Master Orator Protocol'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Header Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Search in chat toggle */}
              <button
                onClick={() => {
                  setIsSearchingInChat(!isSearchingInChat);
                  if (isSearchingInChat) setInChatSearch('');
                }}
                className={`p-2 rounded-xl border transition-colors ${
                  isSearchingInChat 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Search conversation"
              >
                <Search className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsLiveRoomOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow cursor-pointer"
                title="Launch Live Rehearsal Chamber"
              >
                <Video className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Live Chamber</span>
              </button>

              <button
                onClick={() => setActiveTab('progress')}
                className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-colors"
              >
                Metrics
              </button>
            </div>
          </div>

          {/* In-Chat Search Bar */}
          {isSearchingInChat && (
            <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search messages in this thread..."
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

          {/* Messages Stream */}
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-3.5 text-xs">
            {/* Date separator pill */}
            <div className="flex justify-center my-2">
              <span className="px-3 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-widest shadow-inner">
                TODAY · ORATORY THREAD
              </span>
            </div>

            {displayedMessages.map((msg) => {
              const isCoach = msg.sender === 'coach';
              const isHovered = hoveredMessageId === msg.id;
              const isReactionMenuOpen = activeReactionMenuId === msg.id;
              const reactions = msg.attachment?.reactions || [];
              const replyTo = msg.attachment?.replyTo;

              const msgCoach = isCoach ? (
                (msg.coachId && coaches.find(c => c.id === msg.coachId)) ||
                (msg.coachId === 'coach-1' || msg.coachId === 'coach-test-admin' ? { id: 'coach-1', name: 'Head Coach Qassim', role: 'Head Coach' } : null) ||
                (currentCoachUser?.id === msg.coachId ? currentCoachUser : null) ||
                currentCoachUser ||
                { id: 'coach-1', name: 'Head Coach Qassim', role: 'Head Coach' }
              ) : null;
              const isHeadCoachSender = Boolean(
                msgCoach && (
                  msgCoach.id === 'coach-1' ||
                  msgCoach.id === 'coach-test-admin' ||
                  msgCoach.email?.toLowerCase() === 'kassimmusa322@gmail.com' ||
                  msgCoach.email?.toLowerCase() === 'coach@globalorators.com' ||
                  msgCoach.name?.toLowerCase().includes('head coach')
                )
              );
              const msgCoachName = msgCoach?.name || 'Head Coach Qassim';
              const coachInitials = isHeadCoachSender ? 'HQ' : (msgCoachName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'FC');

              return (
                <div
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  onMouseEnter={() => setHoveredMessageId(msg.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                  className={`group relative flex gap-2 max-w-[88%] sm:max-w-[75%] transition-all ${
                    isCoach ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  {/* Floating Action Bar (WhatsApp Reaction & Reply on hover) */}
                  {(isHovered || isReactionMenuOpen) && (
                    <div className={`absolute -top-7 ${isCoach ? 'right-0' : 'left-0'} z-20 flex items-center gap-1 p-1 rounded-full bg-slate-950 border border-slate-700 shadow-xl backdrop-blur-md`}>
                      {/* WhatsApp Quick Reaction Bar */}
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
                    </div>
                  )}

                  {/* Avatar Icon */}
                  {isCoach ? (
                    <div 
                      className={`h-7 w-7 rounded-xl flex items-center justify-center font-bold text-[10px] shrink-0 self-end border transition-colors ${
                        isHeadCoachSender
                          ? 'bg-[#C89630]/20 border-[#C89630]/70 text-brand-gold shadow-sm'
                          : 'bg-emerald-950 border border-emerald-500/40 text-emerald-400'
                      }`}
                      title={`${msgCoachName} (${isHeadCoachSender ? 'Faculty Head' : 'Faculty Coach'})`}
                    >
                      {coachInitials}
                    </div>
                  ) : (
                    <OratorAvatar
                      src={activeClient.avatar}
                      name={activeClient.name}
                      className="h-7 w-7 rounded-xl text-[10px] shrink-0 self-end"
                    />
                  )}

                  <div className={`space-y-1 ${isCoach ? 'items-end' : 'items-start'} max-w-full`}>
                    {/* WhatsApp Message Bubble */}
                    <div 
                      onClick={() => setActiveReactionMenuId(activeReactionMenuId === msg.id ? null : msg.id)}
                      className={`relative px-4 py-3 rounded-2xl shadow-sm cursor-pointer ${
                      isCoach 
                        ? 'bg-emerald-950/80 border border-emerald-500/40 text-slate-100 rounded-br-xs'
                        : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-xs'
                    }`}>
                      {/* Faculty Author Attribution Header */}
                      {isCoach && (
                        <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-emerald-500/20">
                          <span className={`text-[11px] font-semibold tracking-tight ${
                            isHeadCoachSender ? 'text-brand-gold' : 'text-emerald-300'
                          }`}>
                            {msgCoachName}
                          </span>
                          <span className={`text-[9px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded border ${
                            isHeadCoachSender
                              ? 'bg-[#C89630]/15 text-brand-gold border-[#C89630]/30'
                              : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {isHeadCoachSender ? 'Faculty Head' : 'Faculty Coach'}
                          </span>
                        </div>
                      )}

                      {/* Quoted Message Card (WhatsApp Quote-Reply Preview) */}
                      {replyTo && (() => {
                        const replyCoach = replyTo.sender === 'coach' ? (
                          (replyTo.coachId && coaches.find(c => c.id === replyTo.coachId)) ||
                          (replyTo.coachId === 'coach-1' ? { name: 'Head Coach Qassim' } : null) ||
                          currentCoachUser
                        ) : null;
                        const replyAuthor = replyTo.senderName || (replyTo.sender === 'coach' ? (replyCoach?.name || 'Faculty Coach') : activeClient.name);
                        return (
                          <div 
                            onClick={() => scrollToMessage(replyTo.id)}
                            className={`mb-2 p-2 rounded-xl text-[11px] border-l-4 cursor-pointer transition-colors ${
                              isCoach 
                                ? 'bg-black/30 border-emerald-400 text-slate-200 hover:bg-black/40' 
                                : 'bg-slate-950/70 border-slate-600 text-slate-300 hover:bg-slate-950'
                            }`}
                          >
                            <div className="font-bold text-[10px] text-emerald-400">
                              {replyAuthor}
                            </div>
                            <p className="truncate line-clamp-1 opacity-80 mt-0.5">{replyTo.text}</p>
                          </div>
                        );
                      })()}

                      {/* Message Text Content */}
                      {(!isVoiceNote(msg) || (msg.text && !msg.text.startsWith('🎙️') && !msg.text.includes('Voice critique') && !msg.text.includes('Voice Rehearsal'))) && (
                        <p className="leading-relaxed text-xs break-words text-slate-100 font-medium">{msg.text || (msg as any).content}</p>
                      )}

                      {/* Workout Assignment Card Attachment */}
                      {msg.messageType === 'workout_assignment' && msg.attachmentData && (
                        <div className="mt-2.5 p-3 rounded-xl bg-black/50 border border-emerald-500/30 space-y-2">
                          <div className="flex items-center gap-2 text-emerald-300 font-bold">
                            <BookOpen className="h-4 w-4 shrink-0" />
                            <span className="truncate">{msg.attachmentData.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-300">Tap below to view full curriculum structure & log rehearsals.</p>
                          <button
                            onClick={() => setActiveTab('calendar')}
                            className="w-full py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] hover:bg-emerald-400 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Open Rehearsal Calendar</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      {/* Form Check Review Attachment Card */}
                      {msg.messageType === 'form_check' && msg.attachmentData && (
                        <div className="mt-2.5 p-3 rounded-xl bg-black/50 border border-cyan-500/30 space-y-2">
                          <div className="relative h-32 rounded-lg overflow-hidden bg-slate-950">
                            <img
                              src={msg.attachmentData.videoUrl || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=400&q=80'}
                              alt="Speech Delivery Video Preview"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="h-10 w-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg">
                                <Play className="h-4 w-4 ml-0.5 fill-current" />
                              </div>
                            </div>
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[9px] font-bold text-white">
                              {msg.attachmentData.exerciseName}
                            </span>
                          </div>
                          <div className="text-[10px] text-emerald-300 font-bold">
                            Coach Delivery Rating: ★★★★★ (4.8/5)
                          </div>
                        </div>
                      )}

                      {/* Interactive Group Chamber Call Card */}
                      {(msg.messageType === 'group_call' || msg.attachment?.type === 'group_call' || msg.attachmentData?.type === 'group_call') && (
                        <div className="p-3 my-1 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-left space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                              <Radio className="w-4 h-4 animate-pulse" />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-white">Live Rehearsal Chamber Active</div>
                              <div className="text-[10px] font-mono text-cyan-300">
                                {(msg.attachment?.chamberRoomId || msg.attachmentData?.chamberRoomId) ? `Room: ${msg.attachment?.chamberRoomId || msg.attachmentData?.chamberRoomId}` : 'Syndicate Call'}
                              </div>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-300">
                            {msg.text || (msg as any).content || 'A group rehearsal chamber is live.'}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomChamberRoomId(msg.attachment?.chamberRoomId || msg.attachmentData?.chamberRoomId || 'syndicate-room');
                              setIsLiveRoomOpen(true);
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Live Chamber</span>
                          </button>
                        </div>
                      )}

                      {/* Document File Attachment Card */}
                      {msg.attachment?.fileName && (
                        <div className="mt-2 p-2.5 rounded-xl bg-black/40 border border-slate-700 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-[11px] text-white truncate">{msg.attachment.fileName}</div>
                            <div className="text-[9px] font-mono text-slate-400">{msg.attachment.fileSize || 'PDF Document'}</div>
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
                              className="h-9 w-9 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer shadow-md"
                              title={isThisPlaying ? 'Pause Voice Memo' : 'Play Voice Memo'}
                            >
                              {isThisPlaying ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4 ml-0.5 fill-current" />
                              )}
                            </button>

                            {/* Animated / Scrubber Waveform Bars */}
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
                                        ? 'bg-emerald-300' 
                                        : isThisPlaying
                                          ? 'bg-emerald-500/40 animate-pulse'
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
                                className="px-1.5 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[9px] font-mono text-emerald-400 border border-slate-700 cursor-pointer transition-colors"
                                title="Toggle Playback Speed (1x, 1.5x, 2x)"
                              >
                                {audioSpeed}x
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Message Footer: Timestamp & WhatsApp Delivery Checkmarks */}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                        <span>{formatMessageTime(msg.timestamp)}</span>
                        {isCoach && (
                          <CheckCheck 
                            className={`h-3 w-3 ${msg.isRead ? 'text-cyan-400' : 'text-slate-400'}`}
                            title={msg.isRead ? 'Read by orator (WhatsApp Blue Ticks)' : 'Delivered to orator'}
                          />
                        )}
                      </div>
                    </div>

                    {/* Emoji Reactions Tray (WhatsApp-style chips) */}
                    {reactions.length > 0 && (
                      <div className={`flex flex-wrap gap-1 px-1 ${isCoach ? 'justify-end' : 'justify-start'}`}>
                        {reactions.map((r, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleToggleReaction(msg.id, r.emoji)}
                            className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 hover:border-emerald-500/50 text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-sm"
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
            })}
            {/* Real-time Typing Indicator */}
            {activeClient?.id && typingUsers?.[activeClient.id] && (
              <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-slate-950/80 border border-slate-800 max-w-fit animate-fadeIn">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                  {activeClient.name || 'Orator'} is composing...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Rhetoric & Debate Cues Bar */}
          <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 shrink-0 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              QUICK CUES:
            </span>
            {quickSnippets.map((snippet, idx) => (
              <button
                key={idx}
                onClick={() => handleSendText(snippet)}
                className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 whitespace-nowrap transition-colors truncate max-w-xs cursor-pointer"
              >
                {snippet}
              </button>
            ))}
          </div>

          {/* Input & Voice Note Composer */}
          <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 relative">
            {/* Attachment Menu Popup */}
            {showAttachmentMenu && (
              <div className="absolute bottom-16 left-4 p-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-1 text-xs animate-in slide-in-from-bottom-2 z-30">
                <button
                  onClick={handleSendWorkoutAttachment}
                  className="w-full px-3 py-2 rounded-xl text-left font-bold text-slate-200 hover:bg-slate-800 hover:text-emerald-400 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <BookOpen className="h-4 w-4 text-emerald-400" />
                  <span>Attach Training Protocol</span>
                </button>
                <button
                  onClick={handleSendFormCheckReview}
                  className="w-full px-3 py-2 rounded-xl text-left font-bold text-slate-200 hover:bg-slate-800 hover:text-cyan-400 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Video className="h-4 w-4 text-cyan-400" />
                  <span>Attach Delivery Critique</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2 rounded-xl text-left font-bold text-slate-200 hover:bg-slate-800 hover:text-amber-400 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-amber-400" />
                  <span>Upload Speech Transcript / PDF</span>
                </button>
              </div>
            )}

            {/* Quoted Reply Banner above Composer */}
            {replyingToMessage && (
              <div className="mb-2 p-2.5 rounded-xl bg-slate-900 border-l-4 border-emerald-500 flex items-center justify-between gap-2 animate-in fade-in">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[10px] text-emerald-400">
                    Replying to {replyingToMessage.sender === 'coach' ? 'Yourself' : activeClient.name}
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
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>Send Voice Memo</span>
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
                <button
                  type="button"
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    showAttachmentMenu 
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Attach Protocol, Critique or Document"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                <input
                  type="text"
                  placeholder={`Message ${activeClient.name}...`}
                  value={inputMessage}
                  onChange={handleInputChange}
                  onBlur={() => {
                    if (sendTypingIndicator && activeClient?.id) {
                      sendTypingIndicator(activeClient.id, false);
                    }
                  }}
                  className="flex-1 h-10 px-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
                />

                {/* Voice Note Record Button */}
                <button
                  type="button"
                  onClick={startRecording}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  title="Record Voice Note"
                >
                  <Mic className="h-4 w-4" />
                </button>

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <span>{isSending ? 'Sending...' : 'Send'}</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Embedded Live Rehearsal Studio Modal */}
          <LiveRehearsalRoom
            isOpen={isLiveRoomOpen}
            onClose={() => {
              setIsLiveRoomOpen(false);
              setCustomChamberRoomId(undefined);
            }}
            roomTitle={`Live Rehearsal: ${activeClient.name}`}
            speakerName={activeClient.name}
            speakerId={activeClient.id}
            userRole="coach"
            branch={activeClient.branch || 'Academy'}
            customRoomId={customChamberRoomId}
            onSaveFeedback={({ wpm, score, notes, durationSeconds }) => {
              const durMin = Math.max(1, Math.round(durationSeconds / 60));
              addCoachNote(activeClient.id, `Live Rehearsal (${durMin} min, ${wpm} WPM, Score: ${score}/10): ${notes}`);
              addMetricEntry({
                clientId: activeClient.id,
                date: localDateString(),
                weightKg: wpm,
                bodyFatPercentage: score * 10,
                notes: `Live Room Rehearsal (${durMin} min): ${notes}`
              });
            }}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
          Select a speaker or debater on the left to start messaging.
        </div>
      )}
    </div>
  );
};
