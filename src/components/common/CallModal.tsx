import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Sparkles, 
  User, 
  ExternalLink,
  Radio,
  MessageSquareQuote
} from 'lucide-react';
import { CallSession } from '../../types';
import { playSound, speakText } from '../../utils/audio';

interface CallModalProps {
  callSession: CallSession | null;
  onEndCall: () => void;
  onAnswerCall?: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  callSession,
  onEndCall,
  onAnswerCall,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [subtitledMessage, setSubtitledMessage] = useState<string | null>(null);

  // Auto connect after 2 rings
  useEffect(() => {
    if (!callSession) return;
    setStatus('ringing');
    setSeconds(0);
    setSubtitledMessage(null);

    // Play ringing sound
    playSound('ring');
    const ringInterval = setInterval(() => {
      playSound('ring');
    }, 2000);

    // Auto connect after 2.8 seconds
    const connectTimer = setTimeout(() => {
      clearInterval(ringInterval);
      setStatus('connected');
      playSound('call_connect');
      
      // Auto voice greeting
      const greeting = callSession.callerRole === 'customer'
        ? `हाँ जी नमस्ते! मैं ${callSession.receiverName} बोल रहा हूँ। काम की लोकेशन पर पहुँच रहा हूँ।`
        : `नमस्ते! मैं काम की जगह पर हूँ, आप कहाँ तक पहुँचे?`;
      
      setSubtitledMessage(greeting);
      speakText(greeting, 'hi');
    }, 2800);

    return () => {
      clearInterval(ringInterval);
      clearTimeout(connectTimer);
    };
  }, [callSession?.id]);

  // Call duration counter
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (status === 'connected') {
      timer = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status]);

  if (!callSession) return null;

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEnd = () => {
    playSound('call_end');
    setStatus('ended');
    setTimeout(() => {
      onEndCall();
    }, 300);
  };

  const handleSpeakSample = (phrase: string) => {
    setSubtitledMessage(phrase);
    speakText(phrase, 'hi');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-700 flex flex-col items-center justify-between p-6 h-[580px] relative">
        {/* Top Status Bar */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-300">Dihadi Direct VoIP</span>
          </div>
          <div className="font-mono font-bold text-slate-300 text-xs">
            {status === 'ringing' ? 'Ringing...' : formatTimer(seconds)}
          </div>
        </div>

        {/* Center Caller / Receiver Profile */}
        <div className="flex flex-col items-center space-y-3 my-auto">
          {/* Animated Avatar Waves */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-amber-500 shadow-2xl flex items-center justify-center text-3xl font-black text-white relative z-10">
              {callSession.receiverName.charAt(0)}
            </div>

            {/* Ripple Circles when ringing or connected */}
            {status === 'ringing' && (
              <>
                <div className="absolute -inset-3 rounded-full border-2 border-amber-400 animate-ping opacity-40"></div>
                <div className="absolute -inset-6 rounded-full border border-amber-500 animate-pulse opacity-30"></div>
              </>
            )}

            {status === 'connected' && (
              <div className="absolute -inset-2 rounded-full border border-emerald-400 animate-pulse opacity-60"></div>
            )}
          </div>

          {/* Name & Role */}
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black text-white tracking-tight">
              {callSession.receiverName}
            </h3>
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              {callSession.receiverRole === 'worker' ? '🔨 Verified Worker' : '🏢 Employer / Client'}
            </p>
            <p className="text-xs text-slate-400 font-mono">
              {callSession.receiverPhone}
            </p>
            {callSession.jobTitle && (
              <p className="text-[11px] text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                Job: {callSession.jobTitle}
              </p>
            )}
          </div>

          {/* Live Audio Subtitle / Speech Bubble */}
          {status === 'connected' && subtitledMessage && (
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3 max-w-[280px] text-center space-y-1 animate-in fade-in slide-in-from-bottom-2 shadow-lg">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-400">
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>Live Audio Transcript</span>
              </div>
              <p className="text-xs text-slate-200 font-medium italic leading-relaxed">
                "{subtitledMessage}"
              </p>
            </div>
          )}

          {/* Quick Voice Phrases (Interactive Simulation) */}
          {status === 'connected' && (
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              <button
                onClick={() => handleSpeakSample('मैं 5 मिनट में पहुँच रहा हूँ')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-semibold border border-slate-700 transition"
              >
                "5 min me aa raha hu"
              </button>
              <button
                onClick={() => handleSpeakSample('स्टार्ट OTP 4829 है')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-semibold border border-slate-700 transition"
              >
                "OTP is 4829"
              </button>
            </div>
          )}
        </div>

        {/* Bottom Call Controls */}
        <div className="w-full space-y-4">
          <div className="flex items-center justify-center gap-5">
            {/* Mute Button */}
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                playSound('click');
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                isMuted
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* End Call Button */}
            <button
              onClick={handleEnd}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-900/50 transition"
              title="End Call"
            >
              <PhoneOff className="w-7 h-7" />
            </button>

            {/* Speaker Button */}
            <button
              onClick={() => {
                setIsSpeaker(!isSpeaker);
                playSound('click');
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                isSpeaker
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title={isSpeaker ? 'Speaker On' : 'Speaker Off'}
            >
              {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          {/* Cellular Fallback Link */}
          <div className="text-center">
            <a
              href={`tel:${callSession.receiverPhone}`}
              className="text-[11px] text-slate-400 hover:text-white underline inline-flex items-center gap-1 font-semibold"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Or make direct cellular phone call ({callSession.receiverPhone})</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
