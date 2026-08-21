import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../utils/translations';
import { TradeType, Job, WorkerProfile } from '../../types';
import { calculateDistanceKm, calculateBearing, getCoordinatesForArea } from '../../utils/geo';
import { 
  Plus, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  X, 
  CheckCircle,
  HardHat,
  ArrowLeft,
  LogOut,
  Building2,
  Users,
  CreditCard,
  QrCode,
  Radio,
  Lock,
  User,
  AlertCircle,
  LocateFixed,
  Navigation,
  Compass,
  Crosshair
} from 'lucide-react';
import { playSound } from '../../utils/audio';

interface CustomerAppProps {
  isEmbedded?: boolean;
}

export const CustomerApp: React.FC<CustomerAppProps> = ({ isEmbedded = false }) => {
  const {
    currentCustomer,
    currentCity,
    supportedCities,
    setCurrentCity,
    detectAndSetLiveLocation,
    snapToRealWorldAddress,
    isLocating,
    loginCustomerWithAuth,
    registerCustomerWithAuth,
    loginCustomer,
    logoutCustomer,
    updateCustomerGps,
    refreshCustomerGpsLocation,
    jobs,
    workers,
    postJob,
    releasePaymentByCustomer,
    setCurrentRole,
    currentLanguage,
    startCall,
    openGpsRadar,
    openUpiPayment,
    openMultiChannelModal,
    openTop5Shortlist,
  } = useApp();

  // Auth Tab Mode: 'login' | 'register'
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [workerViewMode, setWorkerViewMode] = useState<'list' | 'radar'>('list');
  const [selectedRadarWorker, setSelectedRadarWorker] = useState<WorkerProfile | null>(null);

  // Login form states
  const [loginId, setLoginId] = useState('pooja');
  const [loginPassword, setLoginPassword] = useState('123');
  const [authError, setAuthError] = useState<string | null>(null);

  // Registration form states
  const [regName, setRegName] = useState('');
  const [regUserId, setRegUserId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('+91 99100 88221');
  const [regArea, setRegArea] = useState(() => currentCity?.defaultArea || 'Model Town');
  const [regAddress, setRegAddress] = useState(() => `House 142, ${currentCity?.defaultArea || 'Model Town'}, ${currentCity?.name || 'Ludhiana'}, ${currentCity?.state || 'Punjab'}`);
  const [regUpi, setRegUpi] = useState('pooja.verma@okhdfcbank');

  useEffect(() => {
    if (currentCity) {
      setRegArea(currentCity.defaultArea);
      setRegAddress(`House 142, ${currentCity.defaultArea}, ${currentCity.name}, ${currentCity.state}`);
    }
  }, [currentCity]);

  // Job Posting modal state
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedTradeFilter, setSelectedTradeFilter] = useState<string>('All');

  // Form State for Post Job
  const [title, setTitle] = useState('');
  const [trade, setTrade] = useState<TradeType>('Mason');
  const [description, setDescription] = useState('');
  const [dailyWage, setDailyWage] = useState<number>(850);
  const [durationDays, setDurationDays] = useState<number>(1);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!loginId.trim()) {
      setAuthError(getT(currentLanguage, 'auth_error_invalid'));
      return;
    }
    const result = loginCustomerWithAuth(loginId, loginPassword);
    if (!result.success) {
      setAuthError(result.error || getT(currentLanguage, 'auth_error_invalid'));
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!regName.trim()) {
      setAuthError('Please enter your full name');
      return;
    }
    registerCustomerWithAuth({
      userId: regUserId || regPhone.replace(/[^0-9]/g, ''),
      password: regPassword || '123',
      name: regName,
      phone: regPhone,
      area: regArea,
      address: regAddress,
      upiId: regUpi || `${regName.toLowerCase().replace(/\s+/g, '.')}@upi`,
    });
  };

  const handleQuickDemoLogin = (userId: string, pass: string) => {
    setLoginId(userId);
    setLoginPassword(pass);
    setAuthError(null);
    loginCustomerWithAuth(userId, pass);
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

  const handlePostJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;
    if (!title.trim()) {
      alert('Please specify the work needed');
      return;
    }

    postJob({
      title,
      trade,
      description: description || `Need verified ${trade} for daily work.`,
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.phone,
      locationAddress: currentCustomer.address,
      area: currentCustomer.area,
      dailyWage: Number(dailyWage) || 850,
      durationDays: Number(durationDays) || 1,
    });

    setTitle('');
    setDescription('');
    setShowPostModal(false);
  };

  // IF NOT LOGGED IN: Show Customer Login
  if (!currentCustomer) {
    return (
      <div className={`bg-white flex flex-col h-full overflow-y-auto select-none ${isEmbedded ? 'w-full' : 'max-w-md mx-auto rounded-3xl border border-slate-200 shadow-xl'}`}>
        {/* Header */}
        <div className="p-5 bg-blue-600 text-white shrink-0 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentRole('select_role')}
                className="p-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition"
                title={getT(currentLanguage, 'back_to_role_selection')}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                  <Building2 className="w-5 h-5 text-blue-200" />
                  {getT(currentLanguage, 'role_customer_title')}
                </h3>
                <p className="text-xs text-blue-100">
                  {authTab === 'login' ? getT(currentLanguage, 'auth_tab_login') : getT(currentLanguage, 'auth_tab_register')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4 flex-1">
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => { setAuthTab('login'); setAuthError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                authTab === 'login' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {getT(currentLanguage, 'auth_sign_in')}
            </button>
            <button
              onClick={() => { setAuthTab('register'); setAuthError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                authTab === 'register' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
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
            /* Customer Login Form */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {getT(currentLanguage, 'demo_quick_login')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('pooja', '123')}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-950 rounded-lg text-[11px] font-bold border border-blue-200 transition"
                  >
                    Pooja Verma (Model Town)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('vikram', '123')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold border border-slate-200 transition"
                  >
                    Vikram Sethi (Sarabha Nagar)
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
                      placeholder="e.g. pooja or 9910088221"
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
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-2xl shadow-md text-xs transition flex items-center justify-center gap-2 mt-4"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{getT(currentLanguage, 'auth_login_btn')}</span>
                </button>
              </form>
            </div>
          ) : (
            /* Customer Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {getT(currentLanguage, 'employer_full_name_label')}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pooja Verma"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">User ID</label>
                  <input
                    type="text"
                    placeholder="e.g. pooja"
                    value={regUserId}
                    onChange={(e) => setRegUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-blue-600"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {getT(currentLanguage, 'employer_phone_label')}
                </label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-blue-600"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 block text-xs">
                  {getT(currentLanguage, 'employer_area_label')} & Address
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await snapToRealWorldAddress();
                    if (res) {
                      setRegArea(res.sublocality || res.street || currentCity.defaultArea);
                      setRegAddress(res.formattedAddress);
                    }
                  }}
                  disabled={isLocating}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 transition disabled:opacity-50"
                  title="Detect and snap to exact street address via GPS"
                >
                  <Crosshair className="w-3 h-3 text-blue-600" />
                  <span>{isLocating ? 'Resolving Address...' : 'Snap Real-World Address'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {getT(currentLanguage, 'employer_area_label')}
                  </label>
                  <input
                    type="text"
                    value={regArea}
                    onChange={(e) => setRegArea(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {getT(currentLanguage, 'employer_upi_label')}
                  </label>
                  <input
                    type="text"
                    value={regUpi}
                    onChange={(e) => setRegUpi(e.target.value)}
                    placeholder="e.g. name@okhdfc"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {getT(currentLanguage, 'employer_address_label')}
                </label>
                <textarea
                  rows={2}
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="Street / House No., Area, City, State"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-2xl shadow-md text-xs transition flex items-center justify-center gap-2 mt-3"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{getT(currentLanguage, 'auth_register_btn')}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // LOGGED IN CUSTOMER VIEW
  const myCustomerJobs = jobs.filter((j) => j.customerName === currentCustomer.name || true);
  const activeRequests = myCustomerJobs.filter((j) => j.status !== 'paid_and_closed');
  const pastPaidJobs = myCustomerJobs.filter((j) => j.status === 'paid_and_closed');

  const custLat = currentCustomer.gpsLocation?.lat || 30.8926;
  const custLng = currentCustomer.gpsLocation?.lng || 75.8415;

  const totalAvailableWorkers = workers.filter((w) => {
    if (selectedTradeFilter === 'All') return true;
    return w.primaryTrade === selectedTradeFilter;
  });

  // STRICT 10KM HYPERLOCAL ENFORCEMENT: Filter and block any worker beyond 10.0km
  const filteredWorkers = totalAvailableWorkers.filter((w) => {
    const workerLat = w.gpsLocation?.lat || custLat;
    const workerLng = w.gpsLocation?.lng || custLng;
    const distance = calculateDistanceKm(custLat, custLng, workerLat, workerLng);
    return distance <= 10.0;
  });

  const blockedDistantWorkersCount = totalAvailableWorkers.length - filteredWorkers.length;

  return (
    <div className={`bg-white flex flex-col h-full overflow-hidden select-none ${isEmbedded ? 'w-full' : 'max-w-md mx-auto rounded-3xl border border-slate-200 shadow-xl'}`}>
      {/* Top Header Card */}
      <div className="bg-blue-600 text-white p-4 shrink-0 rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center font-black text-lg border border-white/30">
              {currentCustomer.name.charAt(0)}
            </div>
            <div>
              <span className="text-[11px] text-blue-100 font-medium block">
                {getT(currentLanguage, 'employer_welcome')}
              </span>
              <p className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                {currentCustomer.name}
                <span className="text-xs font-normal text-blue-200">({currentCustomer.area})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowPostModal(true)}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{getT(currentLanguage, 'employer_post_daily_job')}</span>
            </button>

            <button
              onClick={logoutCustomer}
              className="p-1.5 bg-blue-700 hover:bg-blue-800 text-blue-100 rounded-lg transition"
              title={getT(currentLanguage, 'auth_logout_btn')}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Hyperlocal AI Matching & 10km Engine Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-4 border border-indigo-500/30 shadow-lg space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.2 bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase rounded-full border border-amber-400/30">
                    AI Matching Active
                  </span>
                  <span className="text-[10px] text-indigo-200">Strict 10km Radius</span>
                </div>
                <h4 className="text-xs font-black text-white">Hyperlocal Auto-Dispatch & Shortlisting</h4>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              100% Hyperlocal
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Instantly match nearest trades within 10km and trigger automated alerts across <b>WhatsApp</b>, <b>IVR Voice Call</b>, <b>SMS</b>, and <b>App Push</b>.
          </p>

          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={() => {
                const sampleJob = activeRequests[0] || jobs[0] || {
                  id: `job_quick_${Date.now()}`,
                  title: `Masonry & Brickwork at ${currentCustomer.area}`,
                  trade: 'Mason' as TradeType,
                  customerName: currentCustomer.name,
                  customerPhone: currentCustomer.phone,
                  locationAddress: currentCustomer.address,
                  area: currentCustomer.area,
                  dailyWage: 850,
                  workerPayout: 680,
                  platformFee: 170,
                  distanceKm: 0.9,
                  status: 'open',
                  otpCode: '3341',
                  postedAt: 'Just now',
                  durationDays: 1,
                  isPaid: false,
                  jobGps: currentCustomer.gpsLocation,
                };
                openTop5Shortlist(sampleJob);
              }}
              className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md"
            >
              <Users className="w-3.5 h-3.5" />
              <span>View Top-5 AI Matches</span>
            </button>

            <button
              onClick={() => {
                const sampleJob = activeRequests[0] || jobs[0] || {
                  id: `job_quick_${Date.now()}`,
                  title: `Painting Work at ${currentCustomer.area}`,
                  trade: 'Painter' as TradeType,
                  customerName: currentCustomer.name,
                  customerPhone: currentCustomer.phone,
                  locationAddress: currentCustomer.address,
                  area: currentCustomer.area,
                  dailyWage: 900,
                  workerPayout: 720,
                  platformFee: 180,
                  distanceKm: 1.2,
                  status: 'open',
                  otpCode: '9921',
                  postedAt: 'Just now',
                  durationDays: 1,
                  isPaid: false,
                  jobGps: currentCustomer.gpsLocation,
                };
                openMultiChannelModal(sampleJob, workers[0]);
              }}
              className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1 shadow-md"
              title="Test 4-channel alert simulation"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>4-Channel Alert</span>
            </button>
          </div>
        </div>

        {/* Active Requests Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              {getT(currentLanguage, 'employer_active_requests')} ({activeRequests.length})
            </h3>
          </div>

          {activeRequests.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-2">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                {getT(currentLanguage, 'employer_no_jobs')}
              </p>
              <button
                onClick={() => setShowPostModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1 mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{getT(currentLanguage, 'employer_post_daily_job')}</span>
              </button>
            </div>
          ) : (
            activeRequests.map((job) => (
              <div key={job.id} className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">
                      {getTradeName(job.trade)}
                    </span>
                    <h4 className="font-black text-slate-900 text-sm mt-1">{job.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {job.locationAddress}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-slate-900">₹{job.dailyWage}</span>
                    <span className="text-[10px] text-slate-500 block">Total Wage</span>
                  </div>
                </div>

                {/* Quick Hyperlocal Top-5 and 4-Channel Action Row for each Job */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <button
                    onClick={() => openTop5Shortlist(job)}
                    className="py-1.5 px-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 rounded-xl font-bold transition flex items-center justify-center gap-1 border border-indigo-300"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Top-5 Shortlist</span>
                  </button>

                  <button
                    onClick={() => openMultiChannelModal(job)}
                    className="py-1.5 px-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold transition flex items-center justify-center gap-1 border border-amber-300"
                  >
                    <Radio className="w-3.5 h-3.5 text-amber-600" />
                    <span>4-Channel Alert</span>
                  </button>
                </div>

                {/* Worker Status Box */}
                <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center">
                        {job.assignedWorkerName ? job.assignedWorkerName.charAt(0) : 'W'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {job.assignedWorkerName || 'Waiting for Worker to Accept'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {job.assignedWorkerPhone || 'Broadcasting on live radar...'}
                        </p>
                      </div>
                    </div>

                    {job.assignedWorkerName && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openGpsRadar(job)}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-blue-200"
                        >
                          <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
                          <span>Radar</span>
                        </button>
                        <button
                          onClick={() => startCall(
                            { name: currentCustomer.name, role: 'customer', phone: currentCustomer.phone },
                            { name: job.assignedWorkerName || 'Worker', role: 'worker', phone: job.assignedWorkerPhone || '+91 98101 55678' },
                            job.title
                          )}
                          className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs transition"
                          title="Call Worker"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* OTP and Payment release actions */}
                  {job.status === 'accepted' && (
                    <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center justify-between text-xs">
                      <span className="text-amber-900 font-medium">
                        {getT(currentLanguage, 'employer_share_otp')}
                      </span>
                      <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-mono font-black text-sm rounded-md shadow-xs">
                        {job.otpCode}
                      </span>
                    </div>
                  )}

                  {job.status === 'completed_pending_payment' && (
                    <button
                      onClick={() => openUpiPayment(job)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{getT(currentLanguage, 'employer_mark_done')} (₹{job.workerPayout})</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Verified Workers Directory with GPS Radar & List Toggle */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                {getT(currentLanguage, 'employer_verified_workers')}
              </h3>
              <span className="text-[10px] text-slate-500">Live GPS & Instant Connect</span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setWorkerViewMode('list')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  workerViewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                📋 List ({workers.length})
              </button>
              <button
                type="button"
                onClick={() => setWorkerViewMode('radar')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                  workerViewMode === 'radar'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Radio className="w-3 h-3 animate-pulse text-amber-300" />
                <span>📡 GPS Radar</span>
              </button>
            </div>
          </div>

          {/* Trade Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {['All', 'Mason', 'Painter', 'Plumber', 'Carpenter', 'Electrician', 'Construction Helper'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTradeFilter(t)}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition text-[11px] ${
                  selectedTradeFilter === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {t === 'All' ? 'All Trades' : getTradeName(t as TradeType)}
              </button>
            ))}
          </div>

          {/* RADAR VIEW MODE */}
          {workerViewMode === 'radar' && (
            <div className="bg-slate-950 text-white rounded-3xl p-4 border border-slate-800 space-y-3 relative overflow-hidden shadow-xl">
              {/* Radar Screen Header */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <LocateFixed className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>LIVE RADAR • {currentCustomer.area}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({currentCustomer.gpsLocation.lat.toFixed(4)}, {currentCustomer.gpsLocation.lng.toFixed(4)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={refreshCustomerGpsLocation}
                    className="px-2 py-0.5 bg-emerald-600/80 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1"
                    title="Calibrate employer device GPS"
                  >
                    <Compass className="w-3 h-3" />
                    <span>Calibrate GPS</span>
                  </button>
                  <span className="text-[10px] text-emerald-300 font-mono">Range: Strict 10.0 KM</span>
                </div>
              </div>

              {/* Interactive Radar Display Canvas */}
              <div className="relative w-full aspect-square max-h-[300px] mx-auto bg-radial from-slate-900 to-slate-950 rounded-full border-2 border-emerald-500/30 flex items-center justify-center overflow-hidden">
                {/* Distance Rings */}
                <div className="absolute inset-[15%] rounded-full border border-emerald-500/20" />
                <div className="absolute inset-[32%] rounded-full border border-emerald-500/20" />
                <div className="absolute inset-[50%] rounded-full border border-emerald-500/20" />
                <div className="absolute inset-[70%] rounded-full border border-emerald-500/20" />

                {/* Crosshairs */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-[1px] bg-emerald-500/20" />
                  <div className="h-full w-[1px] bg-emerald-500/20 absolute" />
                </div>

                {/* Radar Sweep Effect */}
                <div className="absolute inset-0 bg-conic-gradient from-emerald-500/20 via-transparent to-transparent animate-spin rounded-full pointer-events-none" style={{ animationDuration: '4s' }} />

                {/* Center / Employer Marker */}
                <div className="relative z-10 w-8 h-8 rounded-full bg-blue-600 text-white border-2 border-white shadow-lg flex items-center justify-center text-xs font-black">
                  YOU
                </div>

                {/* Worker Blips on Radar using real GPS & Haversine distance */}
                {filteredWorkers.map((w) => {
                  const custLat = currentCustomer.gpsLocation.lat || 30.8926;
                  const custLng = currentCustomer.gpsLocation.lng || 75.8415;
                  const workerLat = w.gpsLocation?.lat || 30.8926;
                  const workerLng = w.gpsLocation?.lng || 75.8415;

                  const distanceKm = calculateDistanceKm(custLat, custLng, workerLat, workerLng);
                  const bearingDeg = calculateBearing(custLat, custLng, workerLat, workerLng);

                  // Map distance (0 to 10km) to radius percentage (0% to 42% radius)
                  const radiusPercent = Math.min(42, Math.max(12, (distanceKm / 10.0) * 42));
                  const rad = ((bearingDeg - 90) * Math.PI) / 180;
                  const x = 50 + radiusPercent * Math.cos(rad);
                  const y = 50 + radiusPercent * Math.sin(rad);
                  const isSelected = selectedRadarWorker?.id === w.id;

                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        setSelectedRadarWorker(w);
                        playSound('click');
                      }}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 group z-20 transition-transform ${
                        isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                      }`}
                      title={`${w.name} (${w.primaryTrade}) - ${distanceKm} km away`}
                    >
                      <div className="relative">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-white ring-2 ring-amber-400'
                            : 'bg-slate-900 text-amber-300 border-emerald-400/80 shadow-md'
                        }`}>
                          {w.name.charAt(0)}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900 animate-pulse" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Worker Connect Sheet */}
              {selectedRadarWorker ? (
                (() => {
                  const custLat = currentCustomer.gpsLocation.lat || 30.8926;
                  const custLng = currentCustomer.gpsLocation.lng || 75.8415;
                  const workerLat = selectedRadarWorker.gpsLocation?.lat || 30.8926;
                  const workerLng = selectedRadarWorker.gpsLocation?.lng || 75.8415;
                  const trueDist = calculateDistanceKm(custLat, custLng, workerLat, workerLng);

                  return (
                    <div className="bg-slate-900 p-3 rounded-2xl border border-slate-700 space-y-2.5 animate-in slide-in-from-bottom-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-base">
                            {selectedRadarWorker.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                              {selectedRadarWorker.name}
                              {selectedRadarWorker.isVerified && (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              {getTradeName(selectedRadarWorker.primaryTrade)} • {selectedRadarWorker.phone}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-400">₹{selectedRadarWorker.dailyRate}/day</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{trueDist} km away</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        <button
                          onClick={() => startCall(
                            { name: currentCustomer.name, role: 'customer', phone: currentCustomer.phone },
                            { name: selectedRadarWorker.name, role: 'worker', phone: selectedRadarWorker.phone },
                            `Hiring ${selectedRadarWorker.primaryTrade}`
                          )}
                          className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-1 transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </button>

                        <button
                          onClick={() => openGpsRadar({
                            id: `job_quick_${Date.now()}`,
                            title: `Work for ${selectedRadarWorker.primaryTrade}`,
                            customerName: currentCustomer.name,
                            customerPhone: currentCustomer.phone,
                            assignedWorkerId: selectedRadarWorker.id,
                            assignedWorkerName: selectedRadarWorker.name,
                            assignedWorkerPhone: selectedRadarWorker.phone,
                            trade: selectedRadarWorker.primaryTrade,
                            locationAddress: currentCustomer.address,
                            distanceKm: trueDist,
                            dailyWage: selectedRadarWorker.dailyRate,
                            workerPayout: Math.round(selectedRadarWorker.dailyRate * 0.8),
                            platformFee: Math.round(selectedRadarWorker.dailyRate * 0.2),
                            status: 'accepted',
                            otpCode: '4412',
                            postedAt: 'Just now',
                            isPaid: false,
                            jobGps: currentCustomer.gpsLocation,
                            workerGps: selectedRadarWorker.gpsLocation,
                          })}
                          className="py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-1 transition"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>GPS Track</span>
                        </button>

                        <button
                          onClick={() => {
                            setTitle(`Need ${selectedRadarWorker.primaryTrade} at ${currentCustomer.area}`);
                            setTrade(selectedRadarWorker.primaryTrade);
                            setDailyWage(selectedRadarWorker.dailyRate);
                            setShowPostModal(true);
                          }}
                          className="py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl flex items-center justify-center gap-1 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Hire</span>
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <p className="text-center text-[11px] text-slate-400 py-1">
                  Tap any worker marker on the radar to view distance & connect instantly.
                </p>
              )}
            </div>
          )}

          {/* LIST VIEW MODE */}
          {workerViewMode === 'list' && (
            <div className="space-y-2">
              {blockedDistantWorkersCount > 0 && (
                <div className="flex items-center justify-between text-[11px] px-1 text-amber-700">
                  <span className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Strict 10km Perimeter ({filteredWorkers.length} available)
                  </span>
                  <span className="bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {blockedDistantWorkersCount} worker(s) &gt; 10km blocked
                  </span>
                </div>
              )}

              {filteredWorkers.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1 text-slate-500">
                  <HardHat className="w-7 h-7 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No workers available within 10 km</p>
                  <p className="text-[11px] text-slate-500">Workers beyond the strict 10km hyperlocal radius are blocked.</p>
                </div>
              ) : (
                filteredWorkers.map((worker) => {
                  const workerLat = worker.gpsLocation?.lat || custLat;
                  const workerLng = worker.gpsLocation?.lng || custLng;
                  const wDist = calculateDistanceKm(custLat, custLng, workerLat, workerLng);

                  return (
                    <div key={worker.id} className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between shadow-xs hover:border-blue-300 transition">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-sm">
                          {worker.name.charAt(0)}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1">
                            {worker.name}
                            {worker.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />}
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            {getTradeName(worker.primaryTrade)} • ₹{worker.dailyRate}/day • {worker.location.area} ({wDist} km away)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openGpsRadar({
                            id: `job_direct_${worker.id}`,
                            title: `Hire ${worker.primaryTrade}`,
                            customerName: currentCustomer.name,
                            customerPhone: currentCustomer.phone,
                            assignedWorkerId: worker.id,
                            assignedWorkerName: worker.name,
                            assignedWorkerPhone: worker.phone,
                            trade: worker.primaryTrade,
                            locationAddress: currentCustomer.address,
                            distanceKm: wDist,
                            dailyWage: worker.dailyRate,
                            workerPayout: Math.round(worker.dailyRate * 0.8),
                            platformFee: Math.round(worker.dailyRate * 0.2),
                            status: 'accepted',
                            otpCode: '5821',
                            createdAt: new Date().toISOString(),
                            jobGps: currentCustomer.gpsLocation,
                            workerGps: worker.gpsLocation,
                          })}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition border border-blue-200 flex items-center gap-1"
                          title="GPS Radar Preview"
                        >
                          <Radio className="w-3.5 h-3.5 text-blue-600" />
                          <span className="hidden sm:inline">Radar</span>
                        </button>

                        <button
                          onClick={() => {
                            setTitle(`Need ${worker.primaryTrade} in ${currentCustomer.area}`);
                            setTrade(worker.primaryTrade);
                            setDailyWage(worker.dailyRate);
                            setShowPostModal(true);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
                        >
                          {getT(currentLanguage, 'employer_direct_hire')}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Daily Job Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" />
                {getT(currentLanguage, 'employer_post_daily_job')}
              </h4>
              <button
                onClick={() => setShowPostModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostJobSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{getT(currentLanguage, 'employer_job_title_label')}</label>
                <input
                  type="text"
                  placeholder="e.g. Boundary wall plastering & brickwork"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{getT(currentLanguage, 'employer_trade_required')}</label>
                  <select
                    value={trade}
                    onChange={(e) => setTrade(e.target.value as TradeType)}
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

                <div>
                  <label className="font-bold text-slate-700 block mb-1">{getT(currentLanguage, 'employer_daily_wage_label')}</label>
                  <input
                    type="number"
                    value={dailyWage}
                    onChange={(e) => setDailyWage(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{getT(currentLanguage, 'employer_address_label')}</label>
                <input
                  type="text"
                  value={currentCustomer.address}
                  readOnly
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-600"
                />
              </div>

              {/* Economic Calculation Breakdown */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Job Wage</span>
                  <span className="font-bold font-mono">₹{dailyWage}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Operations (20%)</span>
                  <span className="font-mono text-amber-700">₹{Math.round(dailyWage * 0.20)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                  <span>Direct Worker Payout</span>
                  <span className="font-mono text-emerald-700">₹{dailyWage - Math.round(dailyWage * 0.20)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-2xl text-xs transition flex items-center justify-center gap-2 mt-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Broadcast Job on Live Radar</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
