import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MultiChannelAlertPayload, Job, WorkerProfile } from '../../types';
import { 
  X, 
  PhoneCall, 
  MessageSquare, 
  Smartphone, 
  Bell, 
  CheckCheck, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Radio, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { playSound, speakText, stopSpeech } from '../../utils/audio';

interface MultiChannelAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  targetWorker: WorkerProfile | null;
  onAcceptJob?: (jobId: string, workerId: string) => void;
}

export const MultiChannelAlertModal: React.FC<MultiChannelAlertModalProps> = ({
  isOpen,
  onClose,
  job,
  targetWorker,
  onAcceptJob,
}) => {
  const { currentLanguage, showNotification, acceptJobByWorker } = useApp();
  const [activeChannelTab, setActiveChannelTab] = useState<'all' | 'whatsapp' | 'voice' | 'sms' | 'push'>('all');
  
  // Voice call simulator states
  const [callState, setCallState] = useState<'idle' | 'dialing' | 'ringing' | 'connected' | 'ended'>('idle');
  const [callSeconds, setCallSeconds] = useState(0);
  const [isSpeakingPrompt, setIsSpeakingPrompt] = useState(false);
  const [keypadPressed, setKeypadPressed] = useState<string | null>(null);

  // WhatsApp simulation state
  const [waRead, setWaRead] = useState(false);
  const [waAccepted, setWaAccepted] = useState(false);

  // SMS status
  const [smsDelivered, setSmsDelivered] = useState(false);

  // Push status
  const [pushTapped, setPushTapped] = useState(false);

  // Initialize simulation sequence when opened
  useEffect(() => {
    if (isOpen && job && targetWorker) {
      playSound('incoming_job');
      setCallState('dialing');
      setCallSeconds(0);
      setKeypadPressed(null);
      setWaRead(false);
      setWaAccepted(false);
      setSmsDelivered(false);
      setPushTapped(false);

      // Automated progression sequence
      const t1 = setTimeout(() => {
        setCallState('ringing');
        playSound('ring');
        setSmsDelivered(true);
      }, 1200);

      const t2 = setTimeout(() => {
        setCallState('connected');
        playSound('call_connect');
        setWaRead(true);
        // Trigger automated audio speech
        playIvrAudioPrompt();
      }, 3500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        stopSpeech();
      };
    }
  }, [isOpen, job?.id, targetWorker?.id]);

  // Call timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  if (!isOpen || !job || !targetWorker) return null;

  const getLanguagePrompt = () => {
    if (currentLanguage === 'pa') {
      return `ਨਮਸਕਾਰ ${targetWorker.name} ਜੀ! ਦਿਹਾੜੀ ਵੱਲੋਂ ਤੁਹਾਡੇ ਲਈ ${job.area} ਵਿੱਚ ${job.trade} ਦਾ ਨਵਾਂ ਕੰਮ ਹੈ। ਰੋਜ਼ਾਨਾ ਦਿਹਾੜੀ ₹${job.dailyWage} ਹੈ। ਕੰਮ ਸਵੀਕਾਰ ਕਰਨ ਲਈ 1 ਦਬਾਓ।`;
    } else if (currentLanguage === 'hi') {
      return `नमस्ते ${targetWorker.name} जी! दिहाड़ी की तरफ से आपके लिए ${job.area} में ${job.trade} का नया काम उपलब्ध है। दैनिक मजदूरी ₹${job.dailyWage} है। काम स्वीकार करने के लिए 1 दबाएं।`;
    }
    return `Hello ${targetWorker.name}! Dihadi has an instant ${job.trade} job for you at ${job.area}. Daily wage is ₹${job.dailyWage}. Press 1 to accept this job.`;
  };

  const playIvrAudioPrompt = () => {
    const text = getLanguagePrompt();
    setIsSpeakingPrompt(true);
    speakText(text, currentLanguage);
  };

  const handleKeypadPress = (key: string) => {
    setKeypadPressed(key);
    playSound('click');
    if (key === '1') {
      playSound('success');
      showNotification(`IVR Voice Call: ${targetWorker.name} pressed 1 (ACCEPTED JOB)!`);
      if (onAcceptJob) {
        onAcceptJob(job.id, targetWorker.id);
      }
      setTimeout(() => {
        setCallState('ended');
        stopSpeech();
        setIsSpeakingPrompt(false);
      }, 1500);
    } else if (key === '2') {
      playSound('alert');
      showNotification(`IVR Voice Call: ${targetWorker.name} pressed 2 (Declined).`);
      setCallState('ended');
      stopSpeech();
      setIsSpeakingPrompt(false);
    }
  };

  const handleWhatsAppAccept = () => {
    setWaAccepted(true);
    playSound('success');
    showNotification(`WhatsApp Alert: ${targetWorker.name} tapped ACCEPT!`);
    if (onAcceptJob) {
      onAcceptJob(job.id, targetWorker.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 text-white w-full max-w-2xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-4 shrink-0 flex items-center justify-between text-white border-b border-indigo-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 text-amber-300">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] uppercase rounded-full">
                  Multi-Channel AI Alert
                </span>
                <span className="text-xs text-blue-200 font-medium">Auto-Dispatch Active</span>
              </div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5 mt-0.5">
                <span>Broadcasting to {targetWorker.name}</span>
                <span className="text-xs font-normal text-indigo-200">({targetWorker.phone})</span>
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Job Brief Bar */}
        <div className="bg-slate-950 p-3 px-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-600/80 text-white font-bold rounded-md">
              {job.trade}
            </span>
            <span className="font-bold text-slate-200">{job.title}</span>
            <span className="text-slate-400">• {job.area || job.locationAddress}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-emerald-400 font-bold">₹{job.dailyWage}/day</span>
            <span className="text-slate-400 font-mono">Distance: {job.distanceKm} km</span>
          </div>
        </div>

        {/* Channel Navigation Pills */}
        <div className="bg-slate-900/80 p-2 px-3 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs font-bold no-scrollbar">
          <button
            onClick={() => setActiveChannelTab('all')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeChannelTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>All 4 Channels</span>
          </button>

          <button
            onClick={() => setActiveChannelTab('whatsapp')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeChannelTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Alert</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>

          <button
            onClick={() => setActiveChannelTab('voice')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeChannelTab === 'voice'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
            <span>IVR Voice Call (TTS)</span>
            {callState === 'connected' && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />}
          </button>

          <button
            onClick={() => setActiveChannelTab('sms')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeChannelTab === 'sms'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Feature Phone SMS</span>
          </button>

          <button
            onClick={() => setActiveChannelTab('push')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeChannelTab === 'push'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-purple-400" />
            <span>App Push</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB: ALL CHANNELS GRID OVERVIEW */}
          {(activeChannelTab === 'all' || activeChannelTab === 'whatsapp') && (
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>WhatsApp Business Notification</span>
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] rounded border border-emerald-500/40">
                        {waAccepted ? 'Accepted' : waRead ? 'Read (Double Blue Tick)' : 'Delivered'}
                      </span>
                    </h4>
                    <span className="text-[10px] text-slate-400">Sent to {targetWorker.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-emerald-400 text-xs">
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-mono">Delivered</span>
                </div>
              </div>

              {/* WhatsApp Message Preview */}
              <div className="bg-[#0b141a] p-3 rounded-xl border border-emerald-900/40 text-xs text-slate-200 font-sans space-y-2 relative">
                <div className="bg-[#005c4b] p-3 rounded-xl text-white space-y-1.5 shadow-md max-w-md">
                  <p className="font-bold text-amber-300 flex items-center gap-1">
                    <span>⚡ Dihadi Instant Job Alert!</span>
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    🛠 <b>Role:</b> {job.trade} ({job.title})<br/>
                    📍 <b>Location:</b> {job.area || job.locationAddress}<br/>
                    💰 <b>Wage:</b> ₹{job.dailyWage}/day ({job.durationDays} day)<br/>
                    📏 <b>Distance:</b> ~{job.distanceKm} km away<br/>
                    👤 <b>Employer:</b> {job.customerName}
                  </p>
                  <div className="flex justify-end items-center gap-1 text-[9px] text-emerald-200 pt-1">
                    <span>Just now</span>
                    <CheckCheck className="w-3 h-3 text-emerald-300" />
                  </div>
                </div>

                {/* WhatsApp Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleWhatsAppAccept}
                    disabled={waAccepted}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                      waAccepted 
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{waAccepted ? 'Job Accepted via WhatsApp' : 'Simulate Worker Tapping [Accept Job]'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VOICE CALL / IVR AUTOMATION */}
          {(activeChannelTab === 'all' || activeChannelTab === 'voice') && (
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Automated Voice Call (IVR with Audio TTS)</span>
                      <span className={`px-1.5 py-0.2 text-[10px] rounded border ${
                        callState === 'connected'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : callState === 'ringing'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {callState === 'connected' ? `Connected (${callSeconds}s)` : callState}
                      </span>
                    </h4>
                    <span className="text-[10px] text-slate-400">Accommodates workers without smartphones</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={playIvrAudioPrompt}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                    title="Play synthesized voice audio"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Replay Audio</span>
                  </button>
                </div>
              </div>

              {/* Voice Call UI Simulator */}
              <div className="bg-slate-900 p-3.5 rounded-xl border border-indigo-900/40 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="text-slate-400 text-[11px]">IVR Spoken Prompt ({currentLanguage.toUpperCase()}):</p>
                    <p className="text-slate-100 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] leading-relaxed">
                      "{getLanguagePrompt()}"
                    </p>
                  </div>
                </div>

                {/* Keypad Response Simulator */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Simulate Worker Dialpad Input:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleKeypadPress('1')}
                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">1</span>
                      <span>Press [1] Accept Work</span>
                    </button>

                    <button
                      onClick={() => handleKeypadPress('2')}
                      className="py-2 px-3 bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border border-slate-700"
                    >
                      <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-black">2</span>
                      <span>Press [2] Decline</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GSM FEATURE PHONE SMS */}
          {(activeChannelTab === 'all' || activeChannelTab === 'sms') && (
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>GSM SMS (Basic Feature Phones)</span>
                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded border border-amber-500/40">
                        {smsDelivered ? 'Delivered to SIM' : 'Queued'}
                      </span>
                    </h4>
                    <span className="text-[10px] text-slate-400">Carrier GSM Network • 160 Chars</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-amber-400">SIM Slot 1</span>
              </div>

              {/* Feature Phone SMS UI Box */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-1">
                  <span>From: DIHADI-GOVT</span>
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-slate-100 leading-relaxed py-1">
                  [DIHADI ALERT] Naya Kaam: {job.trade} at {job.area || job.locationAddress}. Dihadi Rs.{job.dailyWage}/day. Reply YES to accept or open app.
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                  <span>Status: Delivered via SMS Gateway</span>
                  <button
                    onClick={() => {
                      playSound('success');
                      showNotification(`SMS Response: ${targetWorker.name} replied YES via SMS!`);
                      if (onAcceptJob) onAcceptJob(job.id, targetWorker.id);
                    }}
                    className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded font-bold transition"
                  >
                    Simulate SMS Reply "YES"
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: APP PUSH NOTIFICATION */}
          {(activeChannelTab === 'all' || activeChannelTab === 'push') && (
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-purple-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Smartphone App Push Banner</span>
                      <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 text-[10px] rounded border border-purple-500/40">
                        High Priority
                      </span>
                    </h4>
                    <span className="text-[10px] text-slate-400">Instant sound & lock screen banner</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-purple-400">FCM Push</span>
              </div>

              {/* Push Banner Simulator */}
              <div className="bg-slate-900/90 p-3 rounded-2xl border border-purple-900/50 shadow-lg space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-purple-300 font-bold">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                      D
                    </div>
                    <span>Dihadi Worker Radar • Now</span>
                  </div>
                  <span className="text-slate-500">Just now</span>
                </div>
                <h5 className="font-bold text-white text-xs">
                  ⚡ New Hyperlocal Job: {job.trade} (₹{job.dailyWage}/day)
                </h5>
                <p className="text-[11px] text-slate-300">
                  {job.customerName} needs a verified {job.trade} in {job.area || job.locationAddress} ({job.distanceKm} km away). Tap to accept.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-3.5 px-4 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
          <div className="text-slate-400 text-[11px]">
            <span>Active across WhatsApp, IVR Voice Call, SMS & App</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                stopSpeech();
                onClose();
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition"
            >
              Close Dispatcher
            </button>
            <button
              onClick={() => {
                if (onAcceptJob) onAcceptJob(job.id, targetWorker.id);
                playSound('success');
                showNotification(`Job successfully assigned to ${targetWorker.name}!`);
                stopSpeech();
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition flex items-center gap-1.5 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Direct Assign to Worker</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
