import React from 'react';
import { useApp } from '../context/AppContext';
import { getT } from '../utils/translations';
import { 
  HardHat, 
  Briefcase, 
  Shield, 
  Presentation, 
  RotateCcw, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  Lock,
  UserCheck,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { playSound } from '../utils/audio';

export const RoleSelectScreen: React.FC = () => {
  const {
    setCurrentRole,
    currentLanguage,
    jobs,
    workers,
    verifications,
    currentWorker,
    currentCustomer,
    currentAdmin,
    resetToZero,
    seedSampleData,
    speak,
  } = useApp();

  const handleSelectRole = (role: 'worker' | 'customer' | 'admin' | 'pitch_deck') => {
    playSound('click');
    setCurrentRole(role);
    if (role === 'worker') {
      if (currentLanguage === 'en') speak('Opening Worker Portal. Please login or register.');
      else if (currentLanguage === 'hi') speak('श्रमिक पोर्टल खुल रहा है। कृपया लॉगिन या पंजीकरण करें।');
      else if (currentLanguage === 'pa') speak('ਕਾਮਾ ਪੋਰਟਲ ਖੁੱਲ੍ਹ ਰਿਹਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਲਾਗਇਨ ਜਾਂ ਰਜਿਸਟਰ ਕਰੋ।');
    } else if (role === 'customer') {
      if (currentLanguage === 'en') speak('Opening Employer Portal. Post daily jobs and hire verified workers.');
      else if (currentLanguage === 'hi') speak('नियोक्ता पोर्टल खुल रहा है। काम पोस्ट करें और कारीगर खोजें।');
      else if (currentLanguage === 'pa') speak('ਮਾਲਕ ਪੋਰਟਲ ਖੁੱਲ੍ਹ ਰਿਹਾ ਹੈ। ਨਵਾਂ ਕੰਮ ਪੋਸਟ ਕਰੋ ਅਤੇ ਕਾਮਾ ਬੁੱਕ ਕਰੋ।');
    } else if (role === 'admin') {
      if (currentLanguage === 'en') speak('Opening Platform Admin Headquarters.');
      else if (currentLanguage === 'hi') speak('एडमिन मुख्यालय खुल रहा है।');
      else if (currentLanguage === 'pa') speak('ਐਡਮਿਨ ਮੁੱਖ ਦਫ਼ਤਰ ਖੁੱਲ੍ਹ ਰਿਹਾ ਹੈ।');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center space-y-8 select-none">
      {/* Top Banner / Hero */}
      <div className="text-center space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-100/90 border border-amber-300 text-amber-900 rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
          <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
          {getT(currentLanguage, 'sdg_alignment')}
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Kaam<span className="text-amber-500">zo</span>
          <span className="block text-xl sm:text-2xl font-bold text-slate-700 mt-2">
            {getT(currentLanguage, 'choose_portal_title')}
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          {getT(currentLanguage, 'choose_portal_sub')}
        </p>
      </div>

      {/* 3 Main Role Selection Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Worker Portal */}
        <div 
          onClick={() => handleSelectRole('worker')}
          className="group bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-amber-500 hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-5"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-200 group-hover:scale-105 transition">
              <HardHat className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition">
                  {getT(currentLanguage, 'role_worker_title')}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                  {getT(currentLanguage, 'role_worker_badge')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
                {getT(currentLanguage, 'role_worker_desc')}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {currentWorker ? (
                    <strong className="text-emerald-700">{currentWorker.name} ({currentWorker.primaryTrade})</strong>
                  ) : (
                    <span>{getT(currentLanguage, 'feature_id_pass_login')}</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{getT(currentLanguage, 'feature_gps_upi_wallet')}</span>
              </div>
            </div>
          </div>

          <button className="w-full bg-slate-900 group-hover:bg-amber-500 group-hover:text-slate-950 text-white py-3 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm">
            <UserCheck className="w-4 h-4" />
            <span>{getT(currentLanguage, 'role_worker_btn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 2: Customer / Employer Portal */}
        <div 
          onClick={() => handleSelectRole('customer')}
          className="group bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-blue-600 hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-5"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-200 group-hover:scale-105 transition">
              <Briefcase className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition">
                  {getT(currentLanguage, 'role_customer_title')}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                  {getT(currentLanguage, 'role_customer_badge')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
                {getT(currentLanguage, 'role_customer_desc')}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {currentCustomer ? (
                    <strong className="text-blue-700">{currentCustomer.name} ({currentCustomer.area})</strong>
                  ) : (
                    <span>{getT(currentLanguage, 'feature_id_pass_login')}</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{getT(currentLanguage, 'feature_upi_escrow')}</span>
              </div>
            </div>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm shadow-blue-200">
            <Building2 className="w-4 h-4" />
            <span>{getT(currentLanguage, 'role_customer_btn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 3: Admin Portal */}
        <div 
          onClick={() => handleSelectRole('admin')}
          className="group bg-slate-900 rounded-3xl p-6 border-2 border-slate-800 hover:border-slate-600 hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-5 text-white"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-blue-400 border border-slate-700 group-hover:scale-105 transition">
              <Shield className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition">
                  {getT(currentLanguage, 'role_admin_title')}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  {getT(currentLanguage, 'role_admin_badge')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-medium">
                {getT(currentLanguage, 'role_admin_desc')}
              </p>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{getT(currentLanguage, 'feature_kyc_queue')}: {verifications.filter(v => v.status === 'pending').length}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {currentAdmin ? <strong className="text-blue-300">{currentAdmin.name}</strong> : getT(currentLanguage, 'feature_admin_protected')}
                </span>
              </div>
            </div>
          </div>

          <button className="w-full bg-slate-800 group-hover:bg-blue-600 text-white py-3 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm">
            <Lock className="w-4 h-4" />
            <span>{getT(currentLanguage, 'role_admin_btn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pitch Deck Banner */}
      <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">
              {getT(currentLanguage, 'role_deck_title')}
            </p>
            <p className="text-[11px] text-slate-500">
              {getT(currentLanguage, 'role_deck_sub')}
            </p>
          </div>
        </div>

        <button
          onClick={() => handleSelectRole('pitch_deck')}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-amber-500/20 shrink-0"
        >
          <Presentation className="w-3.5 h-3.5" />
          <span>{getT(currentLanguage, 'role_deck_btn')}</span>
        </button>
      </div>

      {/* Platform State & Zero Control */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 bg-slate-200/60 px-4 py-2.5 rounded-xl border border-slate-300/60 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">{getT(currentLanguage, 'platform_status_label')}</span>
          <span>
            {jobs.length === 0 && workers.length === 0
              ? getT(currentLanguage, 'zero_state_label')
              : `${workers.length} ${getT(currentLanguage, 'workers_count_label')} • ${jobs.length} ${getT(currentLanguage, 'jobs_count_label')}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToZero}
            className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-slate-300 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
            title="Clear all data and reset to zero"
          >
            <RotateCcw className="w-3 h-3" />
            {getT(currentLanguage, 'reset_button')}
          </button>

          <button
            onClick={seedSampleData}
            className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-900 border border-slate-300 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
            title="Create sample test environment"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            {getT(currentLanguage, 'demo_env_button')}
          </button>
        </div>
      </div>
    </div>
  );
};
