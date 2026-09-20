import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Play, 
  Pause, 
  CheckCheck, 
  Search, 
  Video, 
  Zap, 
  Mic, 
  X, 
  Reply,
  FileText, 
  Trash2, 
  Award,
  Users,
  Plus,
  ArrowLeft,
  PhoneCall,
  UserCheck,
  Radio,
  Hash
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatMessage, Client, ChatGroup, DirectoryOrator } from '../../types';
import { RecordingResponse } from '../../services/apiClient';
import { LiveRehearsalRoom } from '../live/LiveRehearsalRoom';
import { OratorAvatar } from '../common/OratorAvatar';

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

type ConversationType = 'coach' | 'group' | 'orator';

interface ConversationItem {
  id: string;
  rawId: string;
  type: ConversationType;
  title: string;
  subtitle: string;
  avatar?: string;
  initials: string;
  badge?: string;
  isOnline?: boolean;
  unreadCount?: number;
  lastMessage?: string;
  lastTimestamp?: string;
  data?: any;
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
    onlineUserIds = [],
    onlineClientIds = [],
    coaches = [],
    groups = [],
    oratorDirectory = [],
    createGroup,
    startGroupCall,
    typingUsers = {},
    sendTypingIndicator,
    showToast
  } = useApp();

  // Active view & conversation state
  const [selectedConversationId, setSelectedConversationId] = useState<string>('assigned-coach');
  const [activeTab, setActiveTab] = useState<'all' | 'groups' | 'coaches' | 'orators'>('all');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [mobileView, setMobileView] = useState<'roster' | 'thread'>('thread');

  // Chat stream controls
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

  // Group Syndicate Creation Modal
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Live Rehearsal Chamber Modal State
  const [isLiveRoomOpen, setIsLiveRoomOpen] = useState(false);
  const [chamberCustomRoomId, setChamberCustomRoomId] = useState<string | undefined>(undefined);
  const [chamberTitle, setChamberTitle] = useState<string>('Live Rehearsal Chamber');

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
  const typingDebounceTimeoutRef = useRef<any>(null);

  // Helper: check if coach is Head Coach Qassim
  const isHeadCoachUser = (coach?: any, coachId?: string) => {
    const id = coach?.id || coachId;
    const email = coach?.email?.toLowerCase();
    const name = coach?.name?.toLowerCase();
    return Boolean(
      id === 'coach-1' ||
      id === 'coach-test-admin' ||
      id?.includes('head') ||
      email === 'kassimmusa322@gmail.com' ||
      email === 'coach@globalorators.com' ||
      name?.includes('head coach')
    );
  };

  // Helper: resolve author coach entity for any message
  const resolveMsgCoach = (msgCoachId?: string) => {
    if (!msgCoachId) {
      return assignedCoach || { 
        id: 'coach-1', 
        name: 'Head Coach Qassim', 
        title: 'Head Speech & Debate Coach',
        email: 'kassimmusa322@gmail.com',
        role: 'Head Coach'
      };
    }
    const matched = coaches.find(c => c.id === msgCoachId);
    if (matched) return matched;
    if (isHeadCoachUser(null, msgCoachId)) {
      return { 
        id: msgCoachId, 
        name: 'Head Coach Qassim', 
        title: 'Head Speech & Debate Coach',
        email: 'kassimmusa322@gmail.com',
        role: 'Head Coach'
      };
    }
    if (assignedCoach?.id === msgCoachId) return assignedCoach;
    return { 
      id: msgCoachId, 
      name: 'Faculty Coach', 
      title: 'Faculty Speech & Debate Coach', 
      role: 'coach' 
    };
  };

  // Helper: format initials for coach
  const getCoachInitials = (coach: any) => {
    if (isHeadCoachUser(coach)) return 'HQ';
    const name = coach?.name || '';
    const clean = name.trim();
    const parts = clean.split(/\s+/);
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase() || 'FC';
  };

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

  // Primary Coach Information
  const coachName = assignedCoach?.name || 'Head Coach Qassim';
  const coachTitle = assignedCoach?.title || 'Faculty Speech & Debate Coach';
  const coachInitials = isHeadCoachUser(assignedCoach) 
    ? 'HQ' 
    : (coachName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'HQ');

  // Check if primary coach is online
  const isCoachOnline = useMemo(() => {
    if (!onlineUserIds || onlineUserIds.length === 0) return false;
    if (assignedCoach?.id || assignedCoach?.email) {
      const matchId = Boolean(assignedCoach?.id && onlineUserIds.includes(assignedCoach.id));
      const matchEmail = Boolean(assignedCoach?.email && onlineUserIds.includes(assignedCoach.email));
      return matchId || matchEmail;
    }
    return onlineUserIds.some(id => id.includes('coach') || id === 'coach-1');
  }, [onlineUserIds, assignedCoach]);

  // Build full roster of conversation options
  const conversationList = useMemo<ConversationItem[]>(() => {
    const list: ConversationItem[] = [];

    // 1. Primary Assigned Coach / Faculty Desk
    const primaryClientMsgs = pairedClient?.id ? messages.filter(m => m.clientId === pairedClient.id) : [];
    const lastPrimaryMsg = primaryClientMsgs[primaryClientMsgs.length - 1];
    const unreadPrimaryCount = primaryClientMsgs.filter(m => m.sender === 'coach' && !m.isRead).length;

    list.push({
      id: 'assigned-coach',
      rawId: assignedCoach?.id || 'coach-1',
      type: 'coach',
      title: coachName,
      subtitle: coachTitle,
      initials: coachInitials,
      badge: isHeadCoachUser(assignedCoach) ? 'Head Coach' : 'Assigned Coach',
      isOnline: isCoachOnline,
      unreadCount: unreadPrimaryCount,
      lastMessage: lastPrimaryMsg ? (lastPrimaryMsg.text || (lastPrimaryMsg as any).content || 'Voice critique recorded') : 'Faculty advisory & live chamber consultations',
      lastTimestamp: lastPrimaryMsg ? (lastPrimaryMsg.timestamp?.split('T')[1]?.substring(0, 5) || lastPrimaryMsg.timestamp) : '09:00 AM'
    });

    // 2. Syndicate Groups
    groups.forEach(g => {
      const gMsgs = messages.filter(m => m.clientId === g.id);
      const lastGMsg = gMsgs[gMsgs.length - 1];
      const unreadCount = gMsgs.filter(m => m.sender !== 'client' && !m.isRead).length;

      list.push({
        id: `group:${g.id}`,
        rawId: g.id,
        type: 'group',
        title: g.name,
        subtitle: `${g.member_ids?.length || 0} Members · Syndicate`,
        initials: g.name.slice(0, 2).toUpperCase(),
        badge: 'Syndicate',
        unreadCount,
        lastMessage: lastGMsg ? (lastGMsg.text || (lastGMsg as any).content) : (g.description || 'Active syndicate rehearsal room'),
        lastTimestamp: lastGMsg ? (lastGMsg.timestamp?.split('T')[1]?.substring(0, 5) || lastGMsg.timestamp) : 'Today',
        data: g
      });
    });

    // 3. Other Faculty Coaches (excluding assigned if already added)
    coaches.forEach(c => {
      if (assignedCoach && c.id === assignedCoach.id) return;
      if (c.id === 'coach-1' && !assignedCoach) return; // avoid duplicate of default

      const cOnline = onlineUserIds.includes(c.id) || (c.email && onlineUserIds.includes(c.email));
      list.push({
        id: `coach:${c.id}`,
        rawId: c.id,
        type: 'coach',
        title: c.name,
        subtitle: c.title || 'Faculty Speech Coach',
        initials: getCoachInitials(c),
        badge: isHeadCoachUser(c) ? 'Faculty Head' : 'Faculty Coach',
        isOnline: Boolean(cOnline),
        lastMessage: 'Direct consultation thread',
        lastTimestamp: '',
        data: c
      });
    });

    // 4. Enrolled Orator Peers
    oratorDirectory.forEach(orator => {
      if (pairedClient && (orator.id === pairedClient.id || orator.email === pairedClient.email)) return;
      const oratorOnline = onlineClientIds.includes(orator.id) || onlineUserIds.includes(orator.email);

      const peerKey = [pairedClient?.id || 'spk', orator.id].sort().join('--');
      const peerMsgs = messages.filter(m => m.clientId === `peer-${peerKey}` || m.clientId === `peer-${orator.id}`);
      const lastPeerMsg = peerMsgs[peerMsgs.length - 1];

      list.push({
        id: `orator:${orator.id}`,
        rawId: orator.id,
        type: 'orator',
        title: orator.name,
        subtitle: `${orator.track || 'Executive'} Orator`,
        avatar: orator.avatar,
        initials: orator.name.slice(0, 2).toUpperCase(),
        badge: 'Orator',
        isOnline: Boolean(oratorOnline),
        lastMessage: lastPeerMsg ? (lastPeerMsg.text || (lastPeerMsg as any).content) : (orator.current_program || 'Fellow Orator'),
        lastTimestamp: lastPeerMsg ? (lastPeerMsg.timestamp?.split('T')[1]?.substring(0, 5) || lastPeerMsg.timestamp) : '',
        data: orator
      });
    });

    return list;
  }, [
    assignedCoach, 
    coachName, 
    coachTitle, 
    coachInitials, 
    isCoachOnline, 
    groups, 
    coaches, 
    oratorDirectory, 
    pairedClient, 
    messages, 
    onlineUserIds, 
    onlineClientIds
  ]);

  // Filtered conversation items for the sidebar
  const filteredConversations = useMemo(() => {
    return conversationList.filter(item => {
      if (activeTab === 'groups' && item.type !== 'group') return false;
      if (activeTab === 'coaches' && item.type !== 'coach') return false;
      if (activeTab === 'orators' && item.type !== 'orator') return false;

      if (!sidebarSearch.trim()) return true;
      const query = sidebarSearch.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        (item.lastMessage && item.lastMessage.toLowerCase().includes(query))
      );
    });
  }, [conversationList, activeTab, sidebarSearch]);

  // Currently active conversation item
  const activeConversation = useMemo<ConversationItem>(() => {
    return conversationList.find(c => c.id === selectedConversationId) || conversationList[0];
  }, [conversationList, selectedConversationId]);

  // Messages stream for the active conversation
  const activeMessages = useMemo(() => {
    if (!activeConversation) return [];

    if (activeConversation.id === 'assigned-coach') {
      // Primary coach thread — return all client messages
      if (!pairedClient?.id) return messages.filter(m => !m.clientId.startsWith('group-') && !m.clientId.startsWith('peer-'));
      return messages.filter(m => m.clientId === pairedClient.id);
    }

    if (activeConversation.type === 'group') {
      // Syndicate group messages
      return messages.filter(m => m.clientId === activeConversation.rawId);
    }

    if (activeConversation.type === 'orator') {
      // Peer orator messages
      const peerKey = [pairedClient?.id || 'spk', activeConversation.rawId].sort().join('--');
      return messages.filter(m => m.clientId === `peer-${peerKey}` || m.clientId === `peer-${activeConversation.rawId}`);
    }

    if (activeConversation.type === 'coach') {
      // Direct coach consultation
      if (pairedClient?.id) {
        return messages.filter(m => m.clientId === pairedClient.id && (m.coachId === activeConversation.rawId || m.sender === 'client'));
      }
      return messages.filter(m => m.coachId === activeConversation.rawId);
    }

    return [];
  }, [activeConversation, messages, pairedClient?.id]);

  // Search-filtered messages inside the active thread
  const displayedMessages = useMemo(() => {
    if (!inChatSearch.trim()) return activeMessages;
    const query = inChatSearch.toLowerCase();
    return activeMessages.filter(m => 
      m.text?.toLowerCase().includes(query) ||
      m.attachment?.title?.toLowerCase().includes(query) ||
      m.attachment?.replyTo?.text?.toLowerCase().includes(query) ||
      (m as any).content?.toLowerCase().includes(query)
    );
  }, [activeMessages, inChatSearch]);

  // Helper to determine destination clientId
  const destinationClientId = useMemo((): string => {
    if (activeConversation?.type === 'group') {
      return activeConversation.rawId;
    }
    if (activeConversation?.type === 'orator') {
      const peerKey = [pairedClient?.id || 'spk', activeConversation.rawId].sort().join('--');
      return `peer-${peerKey}`;
    }
    return pairedClient?.id || 'client-1';
  }, [activeConversation?.type, activeConversation?.rawId, pairedClient?.id]);

  const getDestinationClientId = useCallback((): string => {
    return destinationClientId;
  }, [destinationClientId]);

  // Mark messages as read on view
  useEffect(() => {
    if (destinationClientId && markMessagesRead) {
      markMessagesRead(destinationClientId);
    }
  }, [destinationClientId, activeMessages.length, markMessagesRead]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [displayedMessages.length]);

  // Cleanup timers & audio on unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      clearInterval(playbackTimerRef.current);
      clearInterval(recordingTimerRef.current);
    };
  }, []);

  // Voice note recording
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
    const targetClientId = getDestinationClientId();
    const durSec = forcedDurationSec && forcedDurationSec > 0 ? forcedDurationSec : (recordingDurationRef.current > 0 ? recordingDurationRef.current : 15);
    const minutes = Math.floor(durSec / 60);
    const seconds = durSec % 60;
    const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    sendMessage({
      clientId: targetClientId,
      sender: 'client',
      messageType: 'audio',
      content: `🎙️ Voice Rehearsal Note (${durationStr})`,
      attachmentData: {
        type: 'voice',
        title: `Voice Rehearsal Memo (${durationStr})`,
        duration: durationStr,
        durationSeconds: durSec,
        waveform: [14, 28, 18, 32, 16, 24, 36, 20, 30, 18, 22, 28, 14, 20, 26, 12],
        senderName: profile.fullName || pairedClient?.name || 'Speaker',
        senderRole: 'client'
      }
    });
    setIsRecordingAudio(false);
    setRecordingDuration(0);
    recordingDurationRef.current = 0;
    clearInterval(recordingTimerRef.current);
  };

  const sendVoiceNote = (audioUrl: string, durationSec: number) => {
    const targetClientId = getDestinationClientId();
    const safeSec = durationSec > 0 ? durationSec : 15;
    const minutes = Math.floor(safeSec / 60);
    const seconds = safeSec % 60;
    const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    sendMessage({
      clientId: targetClientId,
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
        waveform: [12, 24, 18, 28, 14, 20, 32, 16, 26, 12, 18, 22, 10, 24, 18, 14],
        senderName: profile.fullName || pairedClient?.name || 'Speaker',
        senderRole: 'client'
      }
    });
  };

  // Playback control
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMessage(val);
    const targetClientId = getDestinationClientId();
    if (!targetClientId || !sendTypingIndicator) return;

    if (val.trim()) {
      sendTypingIndicator(targetClientId, true);
      if (typingDebounceTimeoutRef.current) {
        clearTimeout(typingDebounceTimeoutRef.current);
      }
      typingDebounceTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(targetClientId, false);
      }, 3000);
    } else {
      if (typingDebounceTimeoutRef.current) {
        clearTimeout(typingDebounceTimeoutRef.current);
      }
      sendTypingIndicator(targetClientId, false);
    }
  };

  // Text message send
  const handleSendText = async (textToSend?: string) => {
    if (isSending) return;
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const targetClientId = getDestinationClientId();
    if (typingDebounceTimeoutRef.current) {
      clearTimeout(typingDebounceTimeoutRef.current);
    }
    if (sendTypingIndicator) {
      sendTypingIndicator(targetClientId, false);
    }

    setIsSending(true);
    setInputMessage('');
    setReplyingToMessage(null);
    setShowAttachmentMenu(false);

    let attachmentData: any = {
      senderName: profile.fullName || pairedClient?.name || 'Speaker',
      senderRole: 'client',
      senderId: pairedClient?.id || 'speaker'
    };

    if (replyingToMessage) {
      const replyingCoach = replyingToMessage.sender !== 'client' 
        ? resolveMsgCoach(replyingToMessage.coachId) 
        : null;
      attachmentData.replyTo = {
        id: replyingToMessage.id,
        coachId: replyingToMessage.coachId,
        text: replyingToMessage.text,
        sender: replyingToMessage.sender,
        senderName: replyingToMessage.sender === 'client' 
          ? (profile.fullName || 'Speaker') 
          : (replyingCoach?.name || coachName)
      };
    }

    try {
      await sendMessage({
        clientId: targetClientId,
        sender: 'client',
        text,
        content: text,
        attachmentData
      });
    } finally {
      setIsSending(false);
    }
  };

  // Attach saved rehearsal drill recording
  const handleAttachRecording = (rec: RecordingResponse) => {
    const targetClientId = getDestinationClientId();
    const durationMin = Math.floor(rec.duration_seconds / 60);
    const durationSec = rec.duration_seconds % 60;
    const durationStr = `${durationMin}:${durationSec < 10 ? '0' : ''}${durationSec}`;

    sendMessage({
      clientId: targetClientId,
      sender: 'client',
      messageType: 'audio',
      content: `Attached saved rehearsal recording: "${rec.title}" (${durationStr})`,
      attachmentData: {
        type: 'voice',
        title: rec.title,
        url: rec.file_url,
        duration: durationStr,
        durationSeconds: rec.duration_seconds,
        waveform: [16, 28, 22, 34, 18, 26, 30, 24, 32, 20, 26, 18, 14, 22, 28, 16],
        senderName: profile.fullName || pairedClient?.name || 'Speaker',
        senderRole: 'client'
      }
    });
    setShowRecordingsPicker(false);
    setShowAttachmentMenu(false);
  };

  // Attach document file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const targetClientId = getDestinationClientId();

    sendMessage({
      clientId: targetClientId,
      sender: 'client',
      messageType: 'document',
      content: `Attached speech document: ${file.name}`,
      attachmentData: {
        type: 'document',
        title: file.name,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        senderName: profile.fullName || pairedClient?.name || 'Speaker',
        senderRole: 'client'
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

  // Group Syndicate Call Handler
  const handleInitiateGroupCall = async (groupId: string) => {
    try {
      const callData = await startGroupCall(groupId);
      if (callData?.chamberRoomId) {
        setChamberCustomRoomId(callData.chamberRoomId);
        setChamberTitle(`Syndicate Chamber: ${callData.groupName}`);
        setIsLiveRoomOpen(true);
      }
    } catch (err) {
      console.error('Failed to start syndicate call:', err);
    }
  };

  // Join Call from In-Stream Card
  const handleJoinChamberCall = (roomId: string, title?: string) => {
    setChamberCustomRoomId(roomId);
    setChamberTitle(title || 'Syndicate Live Chamber');
    setIsLiveRoomOpen(true);
  };

  // Create Syndicate Group Form Submit
  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      showToast('Please enter a syndicate name.');
      return;
    }
    setIsCreatingGroup(true);
    try {
      const created = await createGroup(newGroupName.trim(), newGroupDescription.trim(), selectedMemberIds);
      if (created) {
        setSelectedConversationId(`group:${created.id}`);
        setMobileView('thread');
        setIsCreateGroupOpen(false);
        setNewGroupName('');
        setNewGroupDescription('');
        setSelectedMemberIds([]);
      }
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Quick Rhetoric & Practice Cues
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

  const activeRecipientName = activeConversation?.title || coachName;

  return (
    <div className="flex-1 min-h-0 flex flex-col md:flex-row rounded-3xl bg-slate-900/95 border border-slate-800 overflow-hidden shadow-2xl animate-fadeIn">
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".pdf,.doc,.docx,.txt,.mp3,.wav,.webm" 
      />

      {/* LEFT COLUMN: WhatsApp-Style Conversation Roster */}
      <div className={`w-full md:w-80 border-r border-slate-800 flex flex-col bg-slate-950/70 shrink-0 ${
        mobileView === 'thread' ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Sidebar Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <span>Messenger</span>
            </h3>
            <button
              onClick={() => setIsCreateGroupOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
              title="Create New Orator Syndicate Group"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Group</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations, groups, orators..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono uppercase tracking-wider">
            {(['all', 'groups', 'coaches', 'orators'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1 rounded-lg transition-colors capitalize ${
                  activeTab === tab 
                    ? 'bg-slate-800 text-white font-bold shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List Stream */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map(conv => {
              const isSelected = conv.id === activeConversation?.id;
              const isConvTyping = (() => {
                if (conv.type === 'group') {
                  return Boolean(typingUsers[conv.rawId]);
                }
                if (conv.type === 'orator') {
                  const peerKey = [pairedClient?.id || 'spk', conv.rawId].sort().join('--');
                  return Boolean(typingUsers[`peer-${peerKey}`] || typingUsers[`peer-${conv.rawId}`]);
                }
                if (conv.type === 'coach') {
                  return Boolean(pairedClient?.id && typingUsers[pairedClient.id]);
                }
                return false;
              })();

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversationId(conv.id);
                    setMobileView('thread');
                  }}
                  className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-slate-800/90 border border-slate-700 shadow-md' 
                      : 'hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    {conv.avatar ? (
                      <img 
                        src={conv.avatar} 
                        alt={conv.title} 
                        className="h-10 w-10 rounded-xl object-cover border border-slate-700" 
                      />
                    ) : (
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs border ${
                        conv.type === 'group'
                          ? 'bg-cyan-950 border-cyan-500/40 text-cyan-400'
                          : conv.type === 'coach'
                            ? (conv.badge === 'Head Coach' ? 'bg-[#C89630]/20 border-[#C89630]/60 text-[#C89630]' : 'bg-emerald-950 border-emerald-500/40 text-emerald-400')
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}>
                        {conv.initials}
                      </div>
                    )}
                    {conv.isOnline !== undefined && (
                      <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-950 ${
                        conv.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                      }`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                        {conv.type === 'coach' && !conv.title.startsWith('Head Coach') && !conv.title.startsWith('Coach')
                          ? `Coach ${conv.title}`
                          : conv.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        {conv.lastTimestamp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      {isConvTyping ? (
                        <p className="text-[11px] text-cyan-400 font-mono italic animate-pulse">
                          typing...
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {conv.lastMessage ? `Recent: ${conv.lastMessage}` : ''}
                        </p>
                      )}
                      {conv.unreadCount !== undefined && conv.unreadCount > 0 && (
                        <span className="h-4 min-w-[16px] px-1 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Chat Stream Container */}
      <div className={`flex-1 flex flex-col bg-slate-900/50 min-w-0 ${
        mobileView === 'roster' ? 'hidden md:flex' : 'flex'
      }`}>
        {/* WhatsApp Modern Chat Header */}
        <div className="p-3.5 sm:p-4 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Back to roster on mobile */}
            <button
              onClick={() => setMobileView('roster')}
              className="md:hidden p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
              title="Back to Conversation List"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="relative shrink-0">
              {activeConversation?.type === 'group' ? (
                <div className="h-11 w-11 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-bold text-sm shadow-md">
                  <Users className="w-6 h-6" />
                </div>
              ) : activeConversation?.avatar ? (
                <OratorAvatar src={activeConversation.avatar} name={activeRecipientName} className="h-11 w-11 rounded-2xl" />
              ) : (
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center font-bold text-slate-950 text-sm shadow-md border ${
                  isExecutive ? 'bg-[#C89630] border-[#C89630]' : 'bg-emerald-500 border-emerald-400'
                }`}>
                  {activeConversation?.initials || coachInitials}
                </div>
              )}

              {activeConversation?.isOnline !== undefined && (
                <span 
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 ${
                    activeConversation.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                  }`}
                  title={activeConversation.isOnline ? 'Recipient is currently online' : 'Recipient is offline'}
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white truncate">{activeRecipientName}</h3>
                <span className={`hidden sm:inline text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  activeConversation?.type === 'group'
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    : isExecutive 
                      ? 'bg-[#C89630]/10 text-[#C89630] border-[#C89630]/30' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  {activeConversation?.type === 'group' 
                    ? 'ORATOR SYNDICATE' 
                    : activeConversation?.subtitle || coachTitle}
                </span>
              </div>
              
              {/* Online Presence & Syndicate Status */}
              <div className="text-[10px] font-mono tracking-wider flex items-center gap-2 mt-0.5">
                {activeConversation?.type === 'group' ? (
                  <span className="text-cyan-400 font-bold">
                    {activeConversation.data?.member_ids?.length || 0} MEMBERS · ENCRYPTED SYNDICATE
                  </span>
                ) : (
                  <span className={activeConversation?.isOnline ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {activeConversation?.isOnline ? 'ONLINE • SSE ACTIVE' : 'OFFLINE • DIRECT FACULTY THREAD'}
                  </span>
                )}
                <span className="text-slate-600 hidden sm:inline">|</span>
                <span className="text-slate-400 hidden sm:inline truncate">
                  {profile.branch || 'Executive'} Scholar Protocol
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons in Header */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search conversation toggle */}
            <button
              onClick={() => {
                setIsSearchingInChat(!isSearchingInChat);
                if (isSearchingInChat) setInChatSearch('');
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isSearchingInChat 
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Search conversation messages"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Group Call / Live Chamber Button */}
            {activeConversation?.type === 'group' ? (
              <button
                onClick={() => handleInitiateGroupCall(activeConversation.rawId)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer bg-cyan-400 hover:bg-cyan-300 shadow-cyan-500/20"
                title="Start Syndicate Chamber Call"
              >
                <PhoneCall className="w-4 h-4" />
                <span className="hidden sm:inline">Group Chamber</span>
              </button>
            ) : (
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
            )}
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
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Messages Stream Container */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-3.5 text-xs">
          {/* Thread Header pill */}
          <div className="flex justify-center my-2">
            <span className="px-3 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-widest shadow-inner">
              TODAY · {activeConversation?.type === 'group' ? 'SYNDICATE FORUM' : 'FACULTY THREAD'}
            </span>
          </div>

          {displayedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center space-y-3 p-6 text-slate-400">
              <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Start Consultation with {activeRecipientName}</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Send a question, record a voice rehearsal memo, or attach a practice recording for review.
                </p>
              </div>
            </div>
          ) : (
            displayedMessages.map((msg) => {
              const isSpeaker = (() => {
                if (activeConversation?.type === 'coach') {
                  return msg.sender === 'client';
                }
                const senderId = msg.attachment?.senderId;
                if (senderId) {
                  const myIds = [
                    pairedClient?.id,
                    profile?.id,
                    profile?.email?.toLowerCase(),
                    pairedClient?.email?.toLowerCase()
                  ].filter(Boolean);
                  return myIds.includes(senderId) || myIds.includes(senderId.toLowerCase());
                }
                if (msg.attachment?.senderName && (profile?.fullName || pairedClient?.name)) {
                  const myName = (profile?.fullName || pairedClient?.name || '').trim().toLowerCase();
                  if (msg.attachment.senderName.trim().toLowerCase() === myName) {
                    return true;
                  }
                }
                return msg.sender === 'client';
              })();
              const isHovered = hoveredMessageId === msg.id;
              const isReactionMenuOpen = activeReactionMenuId === msg.id;
              const reactions = msg.attachment?.reactions || [];
              const replyTo = msg.attachment?.replyTo;

              // Resolve author attribution for incoming messages
              const msgCoach = !isSpeaker ? resolveMsgCoach(msg.coachId) : null;
              const isHeadCoachSender = !isSpeaker && isHeadCoachUser(msgCoach, msg.coachId);
              const senderDisplayName = msg.attachment?.senderName || msgCoach?.name || 'Faculty Coach';
              const msgCoachInitials = isHeadCoachSender ? 'HQ' : getCoachInitials(msgCoach);

              // Interactive Syndicate Call Card
              const isGroupCallMsg = msg.messageType === 'group_call' || msg.attachment?.type === 'group_call';

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
                  {/* Floating Action Bar on Hover */}
                  {(isHovered || isReactionMenuOpen) && (
                    <div className={`absolute -top-7 ${isSpeaker ? 'right-0' : 'left-0'} z-20 flex items-center gap-1 p-1 rounded-full bg-slate-950 border border-slate-700 shadow-xl backdrop-blur-md`}>
                      {WHATSAPP_REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleToggleReaction(msg.id, emoji)}
                          className="h-6 w-6 rounded-full hover:bg-slate-800 flex items-center justify-center text-xs transition-transform hover:scale-125 cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}

                      <button
                        onClick={() => setReplyingToMessage(msg)}
                        className="h-6 w-6 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ml-0.5"
                        title="Quote / Reply"
                      >
                        <Reply className="w-3 h-3" />
                      </button>

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
                    <div 
                      className={`h-7 w-7 rounded-xl flex items-center justify-center font-bold text-[10px] shrink-0 self-end border transition-colors ${
                        isHeadCoachSender
                          ? 'bg-[#C89630]/20 border-[#C89630]/70 text-[#C89630] shadow-sm'
                          : 'bg-slate-800 border-slate-700 text-slate-200'
                      }`}
                      title={`${senderDisplayName} (${isHeadCoachSender ? 'Faculty Head' : 'Faculty Coach'})`}
                    >
                      {msgCoachInitials}
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
                      {/* Author Attribution Header */}
                      {!isSpeaker && (
                        <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-800">
                          <span className={`text-[11px] font-semibold tracking-tight ${
                            isHeadCoachSender ? 'text-[#C89630]' : 'text-slate-300'
                          }`}>
                            {senderDisplayName}
                          </span>
                          <span className={`text-[9px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded border ${
                            isHeadCoachSender
                              ? 'bg-[#C89630]/15 text-[#C89630] border-[#C89630]/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {activeConversation?.type === 'group' || activeConversation?.type === 'orator'
                              ? (msg.sender === 'coach' ? (isHeadCoachSender ? 'Faculty Head' : 'Faculty Coach') : 'Orator')
                              : (isHeadCoachSender ? 'Faculty Head' : (msgCoach?.id === assignedCoach?.id ? 'Assigned Coach' : 'Faculty Coach'))}
                          </span>
                        </div>
                      )}

                      {/* Quoted Message Card */}
                      {replyTo && (() => {
                        const replyCoach = replyTo.sender !== 'client' ? resolveMsgCoach(replyTo.coachId) : null;
                        const replySenderName = replyTo.senderName || (
                          replyTo.sender === 'client' 
                            ? (profile.fullName || 'Speaker') 
                            : (replyCoach?.name || coachName)
                        );
                        return (
                          <div 
                            onClick={() => scrollToMessage(replyTo.id)}
                            className={`mb-2 p-2 rounded-xl text-[11px] border-l-4 cursor-pointer transition-colors ${
                              isSpeaker 
                                ? 'bg-black/30 border-[#C89630] text-slate-200 hover:bg-black/40' 
                                : 'bg-slate-950/70 border-slate-600 text-slate-300 hover:bg-slate-950'
                            }`}
                          >
                            <div className="font-bold text-[10px] text-amber-400">
                              {replySenderName}
                            </div>
                            <p className="truncate line-clamp-1 opacity-80 mt-0.5">{replyTo.text}</p>
                          </div>
                        );
                      })()}

                      {/* Interactive Group Chamber Call Card */}
                      {isGroupCallMsg ? (
                        <div className="p-3 my-1 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-left space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                              <Radio className="w-4 h-4 animate-pulse" />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-white">Live Rehearsal Chamber Active</div>
                              <div className="text-[10px] font-mono text-cyan-300">
                                {msg.attachment?.chamberRoomId ? `Room: ${msg.attachment.chamberRoomId}` : 'Syndicate Call'}
                              </div>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-300">
                            {msg.text || (msg as any).content || 'A syndicate member launched a live rehearsal room.'}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinChamberCall(msg.attachment?.chamberRoomId || 'syndicate-room', 'Syndicate Chamber Session');
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Live Chamber</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Standard Message Text */}
                          {(!isVoiceNote(msg) || (msg.text && !msg.text.startsWith('🎙️') && !msg.text.includes('Voice Rehearsal') && !msg.text.includes('Voice critique'))) && (
                            <p className="leading-relaxed text-xs break-words text-slate-100 font-medium">{msg.text || (msg as any).content}</p>
                          )}
                        </>
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

                      {/* Voice Note Audio Bubble */}
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

                            {/* Duration & Speed Multiplier */}
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

                      {/* Message Footer: Timestamp & Delivery Status */}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                        <span>{msg.timestamp?.split('T')[1]?.substring(0, 5) || msg.timestamp || '12:00'}</span>
                        {isSpeaker && (
                          <CheckCheck 
                            className={`h-3 w-3 ${msg.isRead ? 'text-cyan-400' : 'text-slate-400'}`}
                            title={msg.isRead ? (activeConversation?.type === 'coach' ? 'Read by Coach' : 'Read') : 'Delivered'}
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
          {/* Active Typing Indicator in Chat Stream */}
          {(() => {
            const destId = getDestinationClientId();
            const activeTypingUser = typingUsers?.[destId];
            if (!activeTypingUser) return null;
            return (
              <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-slate-950/80 border border-slate-800 max-w-fit animate-fadeIn">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                  {activeTypingUser.userName || 'Orator'} is composing...
                </span>
              </div>
            );
          })()}
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
                <button onClick={() => setShowRecordingsPicker(false)} className="text-slate-400 hover:text-white cursor-pointer">
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
          {replyingToMessage && (() => {
            const replyingCoach = replyingToMessage.sender !== 'client' 
              ? resolveMsgCoach(replyingToMessage.coachId) 
              : null;
            const replyingAuthor = replyingToMessage.sender === 'client' 
              ? 'Yourself' 
              : (replyingCoach?.name || coachName);
            return (
              <div className="mb-2 p-2.5 rounded-xl bg-slate-900 border-l-4 border-amber-500 flex items-center justify-between gap-2 animate-in fade-in">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[10px] text-amber-400">
                    Replying to {replyingAuthor}
                  </div>
                  <div className="text-[11px] text-slate-300 truncate">
                    {replyingToMessage.text || (replyingToMessage as any).content}
                  </div>
                </div>
                <button
                  onClick={() => setReplyingToMessage(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })()}

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
              <button
                type="button"
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Attach Rehearsal or Document"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={handleInputChange}
                onBlur={() => {
                  if (sendTypingIndicator) {
                    sendTypingIndicator(getDestinationClientId(), false);
                  }
                }}
                placeholder={`Message ${activeRecipientName} about your presentation, speech delivery, or pacing...`}
                className="flex-1 h-10 px-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#C89630]"
              />

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

      {/* MODAL: Establish Orator Syndicate (Group Creation) */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Establish Orator Syndicate</h3>
              </div>
              <button
                onClick={() => setIsCreateGroupOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Syndicate Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Boardroom Pitch Syndicate"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Mission / Topic (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Peer sparring on cross-examination & keynote flow"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Select Members ({selectedMemberIds.length} chosen)
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400">Coaches & Orators</span>
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/60 rounded-xl bg-slate-900/80 border border-slate-800 p-2 space-y-1">
                  {/* Faculty Coaches */}
                  <div className="px-2 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider">Faculty Coaches</div>
                  {coaches.map(c => {
                    const isChecked = selectedMemberIds.includes(c.id);
                    return (
                      <label 
                        key={c.id} 
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMemberIds(prev => [...prev, c.id]);
                              } else {
                                setSelectedMemberIds(prev => prev.filter(id => id !== c.id));
                              }
                            }}
                            className="rounded-sm border-slate-700 text-emerald-500 focus:ring-0"
                          />
                          <span className="text-white font-medium">{c.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{c.role || 'Coach'}</span>
                      </label>
                    );
                  })}

                  {/* Enrolled Orators */}
                  <div className="px-2 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-2">Enrolled Orators</div>
                  {oratorDirectory.map(o => {
                    const isChecked = selectedMemberIds.includes(o.id);
                    return (
                      <label 
                        key={o.id} 
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMemberIds(prev => [...prev, o.id]);
                              } else {
                                setSelectedMemberIds(prev => prev.filter(id => id !== o.id));
                              }
                            }}
                            className="rounded-sm border-slate-700 text-emerald-500 focus:ring-0"
                          />
                          <span className="text-white font-medium">{o.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{o.track || 'Orator'}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGroup || !newGroupName.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  {isCreatingGroup ? 'Creating...' : 'Establish Syndicate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Live Rehearsal Chamber Modal for Group or P2P Calls */}
      <LiveRehearsalRoom
        isOpen={isLiveRoomOpen}
        onClose={() => {
          setIsLiveRoomOpen(false);
          setChamberCustomRoomId(undefined);
        }}
        roomTitle={chamberTitle}
        speakerName={profile.fullName || pairedClient?.name || 'Speaker'}
        speakerId={pairedClient?.id || 'speaker'}
        userRole="speaker"
        branch={profile.branch || 'Executive'}
        customRoomId={chamberCustomRoomId}
      />
    </div>
  );
};
