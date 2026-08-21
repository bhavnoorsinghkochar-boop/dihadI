import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../utils/translations';
import { Job, TradeType } from '../../types';
import { 
  CheckCircle2, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Volume2, 
  Power,
  Sparkles,
  ArrowLeft,
  LogOut,
  HardHat,
  CreditCard,
  Edit2,
  Save,
  Radio,
  Lock,
  User,
  Check,
  AlertCircle,
  LocateFixed,
  Crosshair,
  Navigation,
  ShieldAlert,
  Compass,
  ExternalLink
} from 'lucide-react';
import { playSound } from '../../utils/audio';
import { getGoogleMapsDirectionsUrl, calculateDistanceKm } from '../../utils/geo';

interface WorkerAppProps {
  isEmbedded?: boolean;
}

export const WorkerApp: React.FC<WorkerAppProps> = ({ isEmbedded = false }) => {
  const {
    currentWorker,
    currentCity,
    supportedCities,
    setCurrentCity,
    detectAndSetLiveLocation,
    snapToRealWorldAddress,
    isLocating,
    loginWorkerWithAuth,
    registerWorkerWithAuth,
    loginWorker,
    logoutWorker,
    jobs,
    toggleWorkerStatus,
    updateWorkerUpi,
    acceptJobByWorker,
    startJobWithOtp,
    completeJobByWorker,
    withdrawWorkerEarnings,
    submitWorkerKyc,
    verifyCurrentWorker,
    refreshWorkerGpsLocation,
    setCurrentRole,
    currentLanguage,
    speak,
    startCall,
    openGpsRadar,
  } = useApp();

  // Auth Mode: 'login' or 'register'
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginId, setLoginId] = useState('ramesh');
  const [loginPassword, setLoginPassword] = useState('123');
  const [authError, setAuthError] = useState<string | null>(null);

  // Registration form state
  const [regUserId, setRegUserId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+91 98101 55678');
  const [regTrade, setRegTrade] = useState<TradeType>('Mason');
  const [regDailyRate, setRegDailyRate] = useState<number>(850);
  const [regExperienceYears, setRegExperienceYears] = useState<number>(5);
  const [regArea, setRegArea] = useState(() => `${currentCity?.defaultArea || 'Model Town'}, ${currentCity?.name || 'Ludhiana'}`);
  const [regAadhaarNumber, setRegAadhaarNumber] = useState('7829-4412-9901');
  const [regUpiId, setRegUpiId] = useState('ramesh.mason@okaxis');

  useEffect(() => {
    if (currentCity) {
      setRegArea(`${currentCity.defaultArea}, ${currentCity.name}`);
    }
  }, [currentCity]);

  // Dashboard states
  const [activeTab, setActiveTab] = useState<'jobs' | 'history' | 'profile'>('jobs');
  const [otpInput, setOtpInput] = useState<{ [jobId: string]: string }>({});
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [tempUpi, setTempUpi] = useState('');
  const [showKycModal, setShowKycModal] = useState(false);
  const [customAadhaar, setCustomAadhaar] = useState('7829-4412-9901');

  // Handle Login with credentials
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!loginId.trim()) {
      setAuthError(getT(currentLanguage, 'auth_error_invalid'));
      return;
    }
    const result = loginWorkerWithAuth(loginId, loginPassword);
    if (!result.success) {
      setAuthError(result.error || getT(currentLanguage, 'auth_error_invalid'));
    }
  };

  // Handle Register with credentials
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!regName.trim()) {
      setAuthError('Please enter your full name');
      return;
    }
    registerWorkerWithAuth({
      userId: regUserId || regPhone.replace(/[^0-9]/g, ''),
      password: regPassword || '123',
      name: regName,
      phone: regPhone,
      primaryTrade: regTrade,
      dailyRate: Number(regDailyRate) || 850,
      experienceYears: Number(regExperienceYears) || 3,
      area: regArea || 'Delhi NCR',
      aadhaarNumber: regAadhaarNumber || '7829-4412-9901',
      upiId: regUpiId || `${regName.toLowerCase().replace(/\s+/g, '.')}@upi`,
    });
  };

  const handleQuickDemoLogin = (userId: string, pass: string) => {
    setLoginId(userId);
    setLoginPassword(pass);
    setAuthError(null);
    loginWorkerWithAuth(userId, pass);
  };

  const getTradeName = (t: TradeType) => {
    if (currentLanguage === 'hi') {
      const map: Record<string, string> = {
        'Mason': 'राजमिस्त्री',
        'Painter': 'पेंटर',
        'Plumber': 'प्लंबर',
        'Carpenter': 'बढ़ई',
        'Electrician': 'इलेक्ट्रीशियन',
        'Construction Helper': 'हेल्पर',
        'Tile Worker': 'टाइल मिस्त्री',
        'Welder': 'वेल्डर',
        'Loader/Mover': 'लोडर',
      };
      return map[t] || t;
    }
    if (currentLanguage === 'pa') {
      const map: Record<string, string> = {
        'Mason': 'ਰਾਜਮਿਸਤਰੀ',
        'Painter': 'ਪੇਂਟਰ',
        'Plumber': 'ਪਲੰਬਰ',
        'Carpenter': 'ਤਰਖਾਣ',
        'Electrician': 'ਇਲੈਕਟ੍ਰੀਸ਼ੀਅਨ',
        'Construction Helper': 'ਹੈਲਪਰ',
        'Tile Worker': 'ਟਾਈਲ ਮਿਸਤਰੀ',
        'Welder': 'ਵੈਲਡਰ',
        'Loader/Mover': 'ਲੋਡਰ',
      };
      return map[t] || t;
    }
    return t;
  };

  // IF NOT LOGGED IN: Show Login / Registration
  if (!currentWorker) {
    return (
      <div className={`bg-white flex flex-col h-full overflow-y-auto select-none ${isEmbedded ? 'w-full' : 'max-w-md mx-auto rounded-3xl border border-slate-200 shadow-xl'}`}>
        {/* Header */}
        <div className="p-5 bg-[#0F172A] text-white shrink-0 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentRole('select_role')}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                title={getT(currentLanguage, 'back_to_role_selection')}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                  <HardHat className="w-5 h-5 text-amber-500" />
                  {getT(currentLanguage, 'role_worker_title')}
                </h3>
                <p className="text-xs text-slate-400">
                  {authTab === 'login' ? getT(currentLanguage, 'auth_tab_login') : getT(currentLanguage, 'auth_tab_register')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4 flex-1">
          {/* Auth Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => { setAuthTab('login'); setAuthError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                authTab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {getT(currentLanguage, 'auth_sign_in')}
            </button>
            <button
              onClick={() => { setAuthTab('register'); setAuthError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                authTab === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {getT(currentLanguage, 'auth_register')}
            </button>
          </div>

          {authError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authTab === 'login' ? (
            /* Login Form */
            <div className="space-y-4">
              {/* Quick 1-Tap Demo Logins */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {getT(currentLanguage, 'demo_quick_login')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('ramesh', '123')}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-lg text-[11px] font-bold border border-amber-200 transition"
                  >
                    Ramesh Kumar (Mason)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('sunil', '123')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold border border-slate-200 transition"
                  >
                    Sunil Sharma (Painter)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('deepak', '123')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold border border-slate-200 transition"
                  >
                    Deepak (Plumber)
                  </button>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {getT(currentLanguage, 'auth_user_id_label')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. ramesh or 9810155678"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-blue-600 pl-8"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {getT(currentLanguage, 'auth_password_label')}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-blue-600 pl-8"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-2xl shadow-md text-xs transition flex items-center justify-center gap-2 mt-4"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{getT(currentLanguage, 'auth_login_btn')}</span>
                </button>
              </form>
            </div>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">User ID</label>
                  <input
                    type="text"
                    placeholder="e.g. ramesh"
                    value={regUserId}
                    onChange={(e) => setRegUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="e.g. 123"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-blue-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">{getT(currentLanguage, 'worker_trade_label')}</label>
                  <select
                    value={regTrade}
                    onChange={(e) => setRegTrade(e.target.value as TradeType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-blue-600"
                  >
                    <option value="Mason">{getTradeName('Mason')}</option>
                    <option value="Painter">{getTradeName('Painter')}</option>
                    <option value="Plumber">{getTradeName('Plumber')}</option>
                    <option value="Carpenter">{getTradeName('Carpenter')}</option>
                    <option value="Electrician">{getTradeName('Electrician')}</option>
                    <option value="Tile Worker">{getTradeName('Tile Worker')}</option>
                    <option value="Welder">{getTradeName('Welder')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{getT(currentLanguage, 'worker_daily_rate_label')}</label>
                  <input
                    type="number"
                    value={regDailyRate}
                    onChange={(e) => setRegDailyRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{getT(currentLanguage, 'worker_exp_label')}</label>
                  <input
                    type="number"
                    value={regExperienceYears}
                    onChange={(e) => setRegExperienceYears(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{getT(currentLanguage, 'worker_upi_label')}</label>
                <input
                  type="text"
                  value={regUpiId}
                  onChange={(e) => setRegUpiId(e.target.value)}
                  placeholder="e.g. 9810155678@paytm"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-950 focus:outline-blue-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 block">Area / City</label>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await snapToRealWorldAddress();
                      if (res) {
                        setRegArea(`${res.sublocality || res.street || currentCity.defaultArea}, ${res.city}`);
                      }
                    }}
                    disabled={isLocating}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 transition disabled:opacity-50"
                    title="Detect and snap to exact street address via GPS"
                  >
                    <Crosshair className="w-3 h-3 text-amber-600" />
                    <span>{isLocating ? 'Resolving...' : 'Snap Real-World Address'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={regArea}
                  onChange={(e) => setRegArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{getT(currentLanguage, 'worker_aadhaar_label')}</label>
                <input
                  type="text"
                  value={regAadhaarNumber}
                  onChange={(e) => setRegAadhaarNumber(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-2xl shadow-md text-xs transition flex items-center justify-center gap-2 mt-3"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{getT(currentLanguage, 'auth_register_btn')}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // LOGGED IN WORKER VIEW
  const myAssignedJobs = jobs.filter(
    (j) => j.assignedWorkerId === currentWorker.id && j.status !== 'paid_and_closed'
  );

  const workerLat = currentWorker.gpsLocation?.lat || 30.8926;
  const workerLng = currentWorker.gpsLocation?.lng || 75.8415;

  // STRICT 10KM HYPERLOCAL ENFORCEMENT: Filter and calculate real distance
  const allBroadcastJobs = jobs.filter((j) => j.status === 'broadcast');
  
  const broadcastJobsWithDist = allBroadcastJobs.map((j) => {
    const jobLat = j.jobGps?.lat || workerLat;
    const jobLng = j.jobGps?.lng || workerLng;
    const computedDist = calculateDistanceKm(workerLat, workerLng, jobLat, jobLng);
    return {
      ...j,
      distanceKm: computedDist,
    };
  });

  // Block any job outside the strict 10.0km radius
  const broadcastJobs = broadcastJobsWithDist.filter((j) => j.distanceKm <= 10.0);
  const blockedDistantJobsCount = allBroadcastJobs.length - broadcastJobs.length;

  const completedJobs = jobs.filter(
    (j) => j.assignedWorkerId === currentWorker.id && j.status === 'paid_and_closed'
  );

  const handleOtpSubmit = (jobId: string) => {
    const code = otpInput[jobId] || '';
    if (!code || code.length !== 4) {
      alert('Please enter 4-digit start OTP provided by employer');
      return;
    }
    const success = startJobWithOtp(jobId, code);
    if (success) {
      setOtpInput({ ...otpInput, [jobId]: '' });
    }
  };

  const handleSpeakJob = (job: Job) => {
    if (currentLanguage === 'hi') {
      speak(`नया काम: ${getTradeName(job.trade)}, ₹${job.dailyWage} प्रतिदिन, ${job.area}। दूरी लगभग ${job.distanceKm} किलोमीटर। 10 किलोमीटर के दायरे में।`);
    } else if (currentLanguage === 'pa') {
      speak(`ਨਵਾਂ ਕੰਮ: ${getTradeName(job.trade)}, ₹${job.dailyWage} ਦਿਹਾੜੀ, ${job.area}। ਦੂਰੀ ${job.distanceKm} ਕਿਲੋਮੀਟਰ। 10 ਕਿਲੋਮੀਟਰ ਦੇ ਦਾਇਰੇ ਵਿੱਚ।`);
    } else {
      speak(`New job: ${job.trade}, ₹${job.dailyWage} daily wage, ${job.area}. Distance ${job.distanceKm} kilometers, within strict 10km zone.`);
    }
  };

  const handleSaveUpi = () => {
    if (tempUpi.trim()) {
      updateWorkerUpi(tempUpi.trim());
      setIsEditingUpi(false);
    }
  };

  return (
    <div className={`bg-white flex flex-col h-full overflow-hidden select-none ${isEmbedded ? 'w-full' : 'max-w-md mx-auto rounded-3xl border border-slate-200 shadow-xl'}`}>
      {/* Top Header Card */}
      <div className="bg-[#0F172A] text-white p-3.5 sm:p-4 space-y-2.5 shrink-0 border-b border-slate-800 rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-black text-lg border-2 border-amber-500">
                {currentWorker.name.charAt(0)}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                currentWorker.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
              }`} />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-300">
                  {getT(currentLanguage, 'worker_welcome')}
                </span>
                <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded border flex items-center gap-1 ${
                  currentWorker.isVerified
                    ? 'bg-blue-500/30 text-blue-300 border-blue-400/30'
                    : 'bg-amber-500/30 text-amber-300 border-amber-400/30'
                }`}>
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  {currentWorker.isVerified ? getT(currentLanguage, 'worker_verified_badge') : getT(currentLanguage, 'worker_kyc_pending')}
                </span>
              </div>
              <p className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                {currentWorker.name}
                <span className="text-xs font-normal text-amber-400">({getTradeName(currentWorker.primaryTrade)})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleWorkerStatus}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${
                currentWorker.isOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
              }`}
              title={getT(currentLanguage, 'worker_status_toggle')}
            >
              <Power className="w-3 h-3" />
              {currentWorker.isOnline ? getT(currentLanguage, 'worker_status_online') : getT(currentLanguage, 'worker_status_offline')}
            </button>

            <button
              onClick={logoutWorker}
              className="p-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 rounded-lg transition"
              title={getT(currentLanguage, 'auth_logout_btn')}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* UPI ID & Wallet Bar */}
        <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 flex justify-between items-center border border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              {getT(currentLanguage, 'worker_wallet_balance')}
            </span>
            <span className="text-xl font-black text-amber-400">₹{currentWorker.walletBalance}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {getT(currentLanguage, 'worker_upi_label')}
              </span>
              <span className="text-xs font-mono font-bold text-slate-200">
                {currentWorker.upiId || 'Not set'}
              </span>
            </div>

            <button
              onClick={() => withdrawWorkerEarnings()}
              disabled={currentWorker.walletBalance <= 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 ${
                currentWorker.walletBalance > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{getT(currentLanguage, 'worker_withdraw')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold shrink-0">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 py-2.5 text-center transition border-b-2 ${
            activeTab === 'jobs'
              ? 'border-amber-500 text-amber-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          {getT(currentLanguage, 'worker_tab_jobs')} ({myAssignedJobs.length + broadcastJobs.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 text-center transition border-b-2 ${
            activeTab === 'history'
              ? 'border-amber-500 text-amber-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          {getT(currentLanguage, 'worker_tab_wallet')} ({completedJobs.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2.5 text-center transition border-b-2 ${
            activeTab === 'profile'
              ? 'border-amber-500 text-amber-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          {getT(currentLanguage, 'worker_tab_profile')}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Real-time GPS Connectivity & Radar Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 border border-slate-800 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <LocateFixed className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live GPS Location</span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{currentWorker.gpsLocation?.area || currentWorker.location.area}, {currentWorker.gpsLocation?.city || currentWorker.location.city}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">({currentWorker.gpsLocation.lat.toFixed(4)}, {currentWorker.gpsLocation.lng.toFixed(4)})</span>
                </span>
              </div>
            </div>

            <button
              onClick={refreshWorkerGpsLocation}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
              title="Calibrate GPS Location with device"
            >
              <Compass className="w-3 h-3" />
              <span>Calibrate GPS</span>
            </button>
          </div>

          <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-1.5 font-mono">
            <span>Accuracy: ±{currentWorker.gpsLocation.accuracyMeters || 4}m</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live radar broadcasting to employers
            </span>
          </div>
        </div>

        {/* Aadhaar KYC Review Notification Banner */}
        {!currentWorker.isVerified ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Aadhaar KYC Verification Pending</h4>
                  <p className="text-[11px] text-slate-600">
                    Aadhaar: {currentWorker.aadhaarNumberMasked} • Awaiting Admin KYC Approval
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md text-[10px] font-bold">
                Under Review
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-amber-500/20">
              <button
                onClick={() => verifyCurrentWorker('approved')}
                className="flex-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1"
                title="Instantly approve KYC status for this worker profile"
              >
                <Check className="w-3.5 h-3.5" />
                <span>1-Click Verify (Instant)</span>
              </button>

              <button
                onClick={() => {
                  submitWorkerKyc({
                    workerName: currentWorker.name,
                    trade: currentWorker.primaryTrade,
                    phone: currentWorker.phone,
                    aadhaarNumber: currentWorker.aadhaarNumberMasked.replace(/X/g, '9') || '7829-4412-9901',
                    experienceYears: currentWorker.experienceYears || 4,
                  });
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Resubmit</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Govt. Aadhaar Verified Worker</span>
                <span className="text-[10px] text-emerald-700 font-mono">UIDAI Validated • 100% Trusted Badge</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold">
              ✓ Active Badge
            </span>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {/* Active / In-Progress Jobs */}
            {myAssignedJobs.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                  Active Work Assignment
                </span>
                {myAssignedJobs.map((job) => (
                  <div key={job.id} className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 space-y-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-md">
                          {job.status === 'accepted' ? 'Pending OTP Start' : 'In Progress'}
                        </span>
                        <h4 className="font-black text-slate-900 text-sm mt-1">{job.title}</h4>
                        <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {job.locationAddress}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-emerald-700">₹{job.workerPayout}</span>
                        <span className="text-[10px] text-slate-500 block">Daily Payout</span>
                      </div>
                    </div>

                    {/* Employer Contact Bar */}
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{job.customerName}</p>
                        <p className="text-[11px] text-slate-500">{job.customerPhone}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openGpsRadar(job)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-blue-200"
                          title="Open GPS Radar & Map"
                        >
                          <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                          <span>GPS Radar</span>
                        </button>
                        <a
                          href={getGoogleMapsDirectionsUrl(
                            currentWorker.gpsLocation.lat,
                            currentWorker.gpsLocation.lng,
                            job.jobGps?.lat || (currentWorker.gpsLocation.lat + 0.008),
                            job.jobGps?.lng || (currentWorker.gpsLocation.lng + 0.008)
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition flex items-center"
                          title="Open Google Maps Directions"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                        </a>
                        <button
                          onClick={() => startCall(
                            { name: currentWorker.name, role: 'worker', phone: currentWorker.phone },
                            { name: job.customerName, role: 'customer', phone: job.customerPhone },
                            job.title
                          )}
                          className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs transition"
                          title="Call Employer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    {job.status === 'accepted' ? (
                      <div className="space-y-2">
                        <p className="text-[11px] text-amber-900 font-medium">
                          Ask customer for 4-digit start OTP to begin work:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={getT(currentLanguage, 'worker_enter_otp_placeholder')}
                            value={otpInput[job.id] || ''}
                            onChange={(e) => setOtpInput({ ...otpInput, [job.id]: e.target.value })}
                            className="bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 flex-1 focus:outline-amber-500"
                            maxLength={4}
                          />
                          <button
                            onClick={() => handleOtpSubmit(job.id)}
                            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition"
                          >
                            {getT(currentLanguage, 'worker_verify_otp_btn')}
                          </button>
                        </div>
                      </div>
                    ) : job.status === 'in_progress' ? (
                      <button
                        onClick={() => completeJobByWorker(job.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>{getT(currentLanguage, 'worker_mark_done')}</span>
                      </button>
                    ) : (
                      <div className="bg-amber-100/70 p-2.5 rounded-xl text-center text-xs font-bold text-amber-900">
                        {getT(currentLanguage, 'worker_waiting_pay')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Broadcast / Nearby Jobs */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block">
                    {getT(currentLanguage, 'worker_nearby_jobs')}
                  </span>
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md flex items-center gap-0.5 border border-emerald-300">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                    Strict &lt; 10km
                  </span>
                </div>

                {blockedDistantJobsCount > 0 && (
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-medium">
                    {blockedDistantJobsCount} job(s) &gt; 10km blocked
                  </span>
                )}
              </div>

              {broadcastJobs.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-2">
                  <HardHat className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-700 font-bold">
                    {getT(currentLanguage, 'worker_no_nearby_jobs')}
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Only jobs within your strict 10km live radius are displayed. Jobs outside 10km are blocked to prevent long travel times.
                  </p>
                </div>
              ) : (
                broadcastJobs.map((job) => (
                  <div key={job.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-amber-400 transition shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                            {getTradeName(job.trade)}
                          </span>
                          <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[9px] font-bold rounded flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                            10km Hyperlocal Match
                          </span>
                          <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded border border-emerald-200">
                            WhatsApp / Voice Sent
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{job.title}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {job.area} ({job.distanceKm} km)
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-emerald-600">₹{job.workerPayout}</span>
                        <span className="text-[10px] text-slate-400 block">Daily Payout</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{job.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSpeakJob(job)}
                          className="p-2 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-50 transition"
                          title="Listen Job Details"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openGpsRadar(job)}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-blue-200"
                          title="Preview GPS Location"
                        >
                          <Radio className="w-3.5 h-3.5 text-blue-600" />
                          <span>GPS Route</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => acceptJobByWorker(job.id)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow-xs"
                        >
                          {getT(currentLanguage, 'worker_accept')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* History / Wallet Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                UPI Direct Settlement Engine
              </span>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs text-slate-400">Withdrawable Balance</span>
                  <p className="text-2xl font-black text-amber-400">₹{currentWorker.walletBalance}</p>
                </div>
                <button
                  onClick={() => withdrawWorkerEarnings()}
                  disabled={currentWorker.walletBalance <= 0}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black rounded-xl text-xs transition"
                >
                  Withdraw via UPI
                </button>
              </div>
              <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
                <span>Linked UPI: {currentWorker.upiId}</span>
                <span>Instant 0-Fee Transfer</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                Completed Jobs History ({completedJobs.length})
              </span>
              {completedJobs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                  No completed jobs yet. Accept a job to earn daily wages!
                </div>
              ) : (
                completedJobs.map((job) => (
                  <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">{job.title}</h5>
                      <p className="text-[11px] text-slate-500">{job.area} • Paid via {job.paymentMethod || 'UPI'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-600">+₹{job.workerPayout}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Credited</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4 text-xs">
            {/* Aadhaar Verification & Trust Badge Card */}
            <div className={`rounded-2xl p-4 border space-y-3 ${
              currentWorker.isVerified
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                    currentWorker.isVerified
                      ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-600 border-amber-500/30'
                  }`}>
                    {currentWorker.isVerified ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <ShieldAlert className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Govt. Aadhaar Verification</h4>
                    <p className="text-[11px] text-slate-600">
                      {currentWorker.isVerified
                        ? '100% Verified Daily Professional • Active Badge'
                        : 'Verification Pending in Admin KYC Queue'}
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 ${
                  currentWorker.isVerified
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 text-slate-950'
                }`}>
                  {currentWorker.isVerified ? '✓ Verified' : '⏳ Under Review'}
                </span>
              </div>

              <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Masked Aadhaar UID</span>
                  <span className="font-mono font-bold text-slate-900">{currentWorker.aadhaarNumberMasked}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Verification Authority</span>
                  <span className="font-bold text-slate-800">
                    {currentWorker.isVerified ? 'UIDAI + Dihadi HQ Approved' : 'Awaiting Admin Action'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              {!currentWorker.isVerified ? (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => verifyCurrentWorker('approved')}
                    className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>1-Click Verify (Instant Test)</span>
                  </button>

                  <button
                    onClick={() => {
                      submitWorkerKyc({
                        workerName: currentWorker.name,
                        trade: currentWorker.primaryTrade,
                        phone: currentWorker.phone,
                        aadhaarNumber: currentWorker.aadhaarNumberMasked.replace(/X/g, '9') || '7829-4412-9901',
                        experienceYears: currentWorker.experienceYears || 4,
                      });
                    }}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Resubmit</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-emerald-800 pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Prioritized on Employer GPS Radars & Zero-Hold Payouts
                  </span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">UPI Payout Handle</span>
                {!isEditingUpi && (
                  <button
                    onClick={() => { setIsEditingUpi(true); setTempUpi(currentWorker.upiId); }}
                    className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>

              {isEditingUpi ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempUpi}
                    onChange={(e) => setTempUpi(e.target.value)}
                    className="bg-white border border-blue-400 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 flex-1"
                  />
                  <button
                    onClick={handleSaveUpi}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    Save
                  </button>
                </div>
              ) : (
                <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono font-bold text-slate-800 flex items-center justify-between">
                  <span>{currentWorker.upiId}</span>
                  <CreditCard className="w-4 h-4 text-slate-400" />
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Registered Phone</span>
                <span className="font-bold text-slate-900">{currentWorker.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Primary Trade</span>
                <span className="font-bold text-slate-900">{getTradeName(currentWorker.primaryTrade)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Daily Rate Expectation</span>
                <span className="font-bold text-slate-900">₹{currentWorker.dailyRate}/day</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Operating Area</span>
                <span className="font-bold text-slate-900">{currentWorker.location.area}, {currentWorker.location.city}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
