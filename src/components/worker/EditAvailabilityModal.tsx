import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Power, 
  Radio, 
  MapPin, 
  Check, 
  Calendar, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  DollarSign, 
  Bell
} from 'lucide-react';
import { WorkerProfile } from '../../types';
import { playSound } from '../../utils/audio';

interface EditAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker?: WorkerProfile | null;
  toggleWorkerStatus: () => void;
  showNotification?: (title: string, message: string) => void;
}

export const EditAvailabilityModal: React.FC<EditAvailabilityModalProps> = ({
  isOpen,
  onClose,
  worker,
  toggleWorkerStatus,
  showNotification,
}) => {
  const [isOnline, setIsOnline] = useState(worker?.isOnline ?? true);
  const [selectedShift, setSelectedShift] = useState<'full_day' | 'morning' | 'evening' | 'flexible'>('full_day');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(10);
  const [minExpectedWage, setMinExpectedWage] = useState<number>(worker?.dailyRate || 850);
  const [emergencyReady, setEmergencyReady] = useState<boolean>(true);
  const [customNote, setCustomNote] = useState('Available immediately with own professional tools & masonry equipment.');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
    playSound('click');
  };

  const handleSave = () => {
    if (isOnline !== worker.isOnline) {
      toggleWorkerStatus();
    }
    setIsSaved(true);
    playSound('success');
    if (showNotification) {
      showNotification('Availability Saved', 'Your work schedule and 10km GPS radar settings have been updated.');
    }
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-[#0F172A] text-white p-5 relative shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xl shadow-md border-2 ${
                isOnline ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Edit Availability & Radar</h3>
                <p className="text-xs text-slate-400">
                  Control when employers can discover you on the 10km map
                </p>
              </div>
            </div>

            <button
              onClick={() => { onClose(); playSound('click'); }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-slate-800 text-xs">
          
          {/* 1. Live Radar Broadcasting Switch */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isOnline 
              ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Live GPS Broadcast</span>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Radio className={`w-4 h-4 ${isOnline ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
                  <span>{isOnline ? 'Online • Ready for Direct Jobs' : 'Offline • Invisible to Employers'}</span>
                </h4>
                <p className="text-[11px] text-slate-600">
                  {isOnline 
                    ? 'Your profile is broadcasting live within a 10km radius of your location.' 
                    : 'Turn online to start receiving instant job alerts and calls.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => { setIsOnline(!isOnline); playSound('click'); }}
                className={`p-3 rounded-2xl border font-bold text-xs transition flex items-center gap-1.5 shadow-sm ${
                  isOnline 
                    ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-500' 
                    : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{isOnline ? 'Active' : 'Offline'}</span>
              </button>
            </div>
          </div>

          {/* 2. Preferred Daily Shift */}
          <div className="space-y-2">
            <label className="font-black text-slate-900 uppercase tracking-wider text-[11px] block">
              Preferred Work Shift Hours
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setSelectedShift('full_day'); playSound('click'); }}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedShift === 'full_day'
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400 text-slate-900 font-bold'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <p className="text-xs font-black">Full Day Shift</p>
                <p className="text-[10px] text-slate-500 mt-0.5">8:00 AM - 6:00 PM</p>
              </button>

              <button
                type="button"
                onClick={() => { setSelectedShift('morning'); playSound('click'); }}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedShift === 'morning'
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400 text-slate-900 font-bold'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <p className="text-xs font-black">Morning Shift</p>
                <p className="text-[10px] text-slate-500 mt-0.5">7:00 AM - 1:00 PM</p>
              </button>

              <button
                type="button"
                onClick={() => { setSelectedShift('evening'); playSound('click'); }}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedShift === 'evening'
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400 text-slate-900 font-bold'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <p className="text-xs font-black">Afternoon / Evening</p>
                <p className="text-[10px] text-slate-500 mt-0.5">1:00 PM - 8:00 PM</p>
              </button>

              <button
                type="button"
                onClick={() => { setSelectedShift('flexible'); playSound('click'); }}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedShift === 'flexible'
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400 text-slate-900 font-bold'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <p className="text-xs font-black">Flexible / Any Hours</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Open to custom hours</p>
              </button>
            </div>
          </div>

          {/* 3. Working Days of Week */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                Available Days of Week
              </label>
              <span className="text-[10px] text-slate-500">{selectedDays.length} days active</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {daysList.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`flex-1 min-w-[42px] py-2 rounded-xl text-center font-bold text-xs transition border ${
                      isSelected
                        ? 'bg-[#0F172A] text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Max Operating Distance & Minimum Daily Wage */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Max Radar Radius</label>
              <select
                value={maxRadiusKm}
                onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-blue-600"
              >
                <option value={2}>Within 2 km (Walking)</option>
                <option value={5}>Within 5 km (Bicycle)</option>
                <option value={8}>Within 8 km (Scooter)</option>
                <option value={10}>Strict 10 km (Max Radius)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Min Daily Wage (₹)</label>
              <input
                type="number"
                value={minExpectedWage}
                onChange={(e) => setMinExpectedWage(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-blue-600"
              />
            </div>
          </div>

          {/* 5. Emergency Dispatch Toggle */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">Urgent Emergency Dispatch</p>
                <p className="text-[10px] text-slate-600">Accept express high-wage urgent job callouts</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={emergencyReady}
              onChange={(e) => setEmergencyReady(e.target.checked)}
              className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
            />
          </div>

          {/* 6. Custom Note for Employers */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Direct Note / Readiness for Employers</label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Equipped with tools, ready for immediate work"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-blue-600 resize-none font-medium"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => { onClose(); playSound('click'); }}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>{isSaved ? 'Saved Successfully!' : 'Save Availability'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
