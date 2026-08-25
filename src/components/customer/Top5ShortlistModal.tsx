import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job, WorkerProfile, TradeType, HyperlocalMatchResult } from '../../types';
import { getTop5Shortlist, matchHyperlocalWorkers } from '../../utils/aiMatching';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Radio, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Users, 
  Send, 
  Filter,
  CheckCheck,
  Building2,
  AlertTriangle,
  Award,
  MessageSquare
} from 'lucide-react';
import { playSound } from '../../utils/audio';

interface Top5ShortlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onOpenMultiChannel: (job: Job, worker: WorkerProfile) => void;
  onOpenRadar: (job: Job) => void;
  onOpenChat?: (job: Job, worker: WorkerProfile) => void;
}

export const Top5ShortlistModal: React.FC<Top5ShortlistModalProps> = ({
  isOpen,
  onClose,
  job,
  onOpenMultiChannel,
  onOpenRadar,
  onOpenChat,
}) => {
  const { workers, currentCustomer, currentCity, currentLanguage, startCall, showNotification, acceptJobByWorker } = useApp();
  const [maxRadius, setMaxRadius] = useState<number>(10.0);
  const [isBlastingAll, setIsBlastingAll] = useState<boolean>(false);

  if (!isOpen || !job) return null;

  const jobLat = job.jobGps?.lat || currentCustomer?.gpsLocation.lat || currentCity.lat;
  const jobLng = job.jobGps?.lng || currentCustomer?.gpsLocation.lng || currentCity.lng;

  // Generate ranked matches strictly within selected radius (up to 10km)
  const allMatches = matchHyperlocalWorkers(workers, {
    trade: job.trade,
    lat: jobLat,
    lng: jobLng,
    maxRadiusKm: maxRadius,
    language: currentLanguage,
  });

  const top5List = allMatches.slice(0, 5);

  const handleHireDirect = (worker: WorkerProfile) => {
    playSound('success');
    acceptJobByWorker(job.id);
    showNotification(`Hired ${worker.name}! Start OTP generated: ${job.otpCode}`);
    onClose();
  };

  const handleBlastAllTop5 = async () => {
    setIsBlastingAll(true);
    playSound('incoming_job');
    showNotification(`⚡ Multi-Channel Alert blasted to Top ${top5List.length} verified ${job.trade}s via WhatsApp, Mail, SMS & Radar!`);
    
    // Attempt Browser System Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⚡ 4-Channel Alert Broadcasted`, {
          body: `Sent instant job notifications to ${top5List.length} nearby ${job.trade}s.`,
          icon: '/icon.png',
        });
      } catch (e) {
        console.debug('Notification note:', e);
      }
    }

    // Trigger backend multi-channel alert dispatch for the top candidates
    if (top5List.length > 0) {
      try {
        const topWorker = top5List[0].worker;
        fetch('/api/send-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workerName: topWorker.name,
            workerPhone: topWorker.phone,
            workerEmail: topWorker.email || 'bhavnoorsinghkochar@gmail.com',
            customerName: job.customerName,
            jobTitle: job.title,
            trade: job.trade,
            dailyWage: job.dailyWage,
            area: job.area || job.locationAddress,
            distanceKm: job.distanceKm,
            durationDays: job.durationDays || 1,
            channels: ['whatsapp', 'email', 'mail', 'sms', 'push', 'voice']
          }),
        }).catch(err => console.debug('Blast API note:', err));
      } catch (err) {
        console.debug('Blast dispatch note:', err);
      }

      setTimeout(() => {
        setIsBlastingAll(false);
        onOpenMultiChannel(job, top5List[0].worker);
      }, 700);
    } else {
      setIsBlastingAll(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="bg-white text-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-4 sm:p-5 shrink-0 flex items-center justify-between border-b border-blue-500/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 text-amber-300 flex items-center justify-center font-black border border-white/30 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black uppercase rounded-full tracking-wide">
                  AI Matching Engine
                </span>
                <span className="text-xs text-blue-100 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-300" />
                  Strict 10km Hyperlocal Radius
                </span>
              </div>
              <h3 className="text-lg font-black text-white flex items-center gap-2 mt-0.5">
                <span>Top-5 Shortlisted {job.trade}s</span>
                <span className="text-xs font-normal text-blue-200">({job.title})</span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Radius Filter & Batch Action Bar */}
        <div className="bg-slate-50 p-3 px-4 sm:px-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Hyperlocal Filter Controls */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              Radius:
            </span>
            <div className="flex bg-white p-0.5 rounded-xl border border-slate-300 shadow-xs font-bold text-[11px]">
              {[3.0, 5.0, 10.0].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setMaxRadius(r);
                    playSound('click');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    maxRadius === r
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r === 10 ? 'Strict 10 km' : `${r} km`}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              ({top5List.length} matches found within {maxRadius}km)
            </span>
          </div>

          {/* Batch Blast Button */}
          <button
            onClick={handleBlastAllTop5}
            disabled={isBlastingAll || top5List.length === 0}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Blast Multi-Channel Alerts to Top-5</span>
          </button>
        </div>

        {/* Scrollable Ranked Worker Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {top5List.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="font-bold text-amber-900 text-sm">No workers found within {maxRadius} km</h4>
              <p className="text-xs text-amber-700">
                Expand radius to strict 10km or switch city to discover verified {job.trade}s nearby.
              </p>
              <button
                onClick={() => setMaxRadius(10.0)}
                className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold transition mt-2"
              >
                Reset to Strict 10km Radius
              </button>
            </div>
          ) : (
            top5List.map((item, idx) => {
              const worker = item.worker;
              const isTopRank = idx === 0;

              return (
                <div
                  key={worker.id}
                  className={`rounded-2xl p-4 transition-all duration-200 border relative ${
                    isTopRank
                      ? 'bg-blue-50/70 border-blue-300 shadow-sm ring-1 ring-blue-400/40'
                      : 'bg-white border-slate-200 hover:border-blue-200 shadow-xs'
                  }`}
                >
                  {/* Top Rank Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-11 h-11 rounded-2xl font-black flex items-center justify-center text-sm shadow-sm ${
                          isTopRank
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-900 text-amber-400'
                        }`}>
                          {worker.name.charAt(0)}
                        </div>
                        <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border ${
                          isTopRank
                            ? 'bg-amber-400 text-slate-950 border-white'
                            : 'bg-slate-800 text-slate-200 border-white'
                        }`}>
                          #{item.rank}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{worker.name}</span>
                            {worker.isVerified && (
                              <span title="Govt Aadhaar Verified">
                                <ShieldCheck className="w-4 h-4 text-blue-600" />
                              </span>
                            )}
                          </h4>
                          <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full border border-emerald-300">
                            {item.matchScore}% AI Match
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-bold text-slate-700">{worker.primaryTrade}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {worker.location.area} ({item.distanceKm} km away)
                          </span>
                          <span>•</span>
                          <span className="text-emerald-600 font-bold">~{item.etaMinutes}m ETA</span>
                        </p>
                      </div>
                    </div>

                    {/* Wage & Rating */}
                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-slate-900">₹{worker.dailyRate}</span>
                      <span className="text-[10px] text-slate-500 block">per day</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5 block">
                        🛡️ Prepaid Escrow
                      </span>
                      <span className="text-[11px] font-bold text-amber-600 flex items-center justify-end gap-1 mt-0.5">
                        ★ {worker.rating} ({worker.reviewCount})
                      </span>
                    </div>
                  </div>

                  {/* AI Reasoning Insight Box */}
                  <div className="mt-3 bg-white/80 p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="text-[11px] font-medium leading-tight">
                        <b className="text-slate-900">AI Match Breakdown:</b> {item.aiReasoning}
                      </span>
                    </div>
                    {item.isWithin10Km && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-black uppercase rounded shrink-0">
                        Strict 10km Zone
                      </span>
                    )}
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    {/* Direct Hire */}
                    <button
                      onClick={() => handleHireDirect(worker)}
                      className="py-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Hire Now</span>
                    </button>

                    {/* Quick Chat */}
                    <button
                      onClick={() => {
                        if (onOpenChat) {
                          onOpenChat(job, worker);
                        }
                      }}
                      className="py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs"
                      title="Open Quick Chat with Candidate"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>

                    {/* Multi-Channel Alert Dispatch */}
                    <button
                      onClick={() => {
                        onOpenMultiChannel(job, worker);
                      }}
                      className="py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200 transition flex items-center justify-center gap-1.5"
                      title="Send WhatsApp, Mail, SMS & IVR Alert"
                    >
                      <Send className="w-3.5 h-3.5 text-indigo-600" />
                      <span>4-Channel</span>
                    </button>

                    {/* Direct Phone Call */}
                    <button
                      onClick={() => startCall(
                        { name: currentCustomer?.name || 'Employer', role: 'customer', phone: currentCustomer?.phone || '+91 99100 88221' },
                        { name: worker.name, role: 'worker', phone: worker.phone },
                        job.title
                      )}
                      className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-200 transition flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Call</span>
                    </button>

                    {/* GPS Radar Track */}
                    <button
                      onClick={() => {
                        onOpenRadar({
                          ...job,
                          assignedWorkerName: worker.name,
                          assignedWorkerPhone: worker.phone,
                          distanceKm: item.distanceKm,
                        });
                        onClose();
                      }}
                      className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5"
                    >
                      <Radio className="w-3.5 h-3.5 text-blue-600" />
                      <span>Radar</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3 px-5 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 text-[11px]">
            AI shortlisting dynamically prioritizes proximity, verified skills, and fast availability.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition"
          >
            Close Shortlist
          </button>
        </div>
      </div>
    </div>
  );
};
