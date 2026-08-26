import React, { useState, useEffect, useMemo } from 'react';
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
  Crosshair,
  Star,
  Mail,
  ThumbsUp,
  MessageSquare,
  Search,
  Paintbrush,
  Wrench,
  Zap,
  Hammer,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  HelpCircle,
  Bell,
  ArrowRight,
  KeyRound,
  Copy,
  ExternalLink,
  MessageCircle,
  Check,
  Crown,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { playSound } from '../../utils/audio';
import { SecurityVerificationModal, GmailOtpVerificationModal, GmailOtpVerificationSection } from '../common/SecurityVerificationModal';
import { RateEmployeeModal } from '../common/RateEmployeeModal';
import { QuickChatModal, ChatTarget } from '../common/QuickChatModal';
import { CustomerSubscriptionModal } from './CustomerSubscriptionModal';
import { UpiQrPaymentModal } from '../common/UpiQrPaymentModal';

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
    customerAccounts,
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
    subscribeCustomerPremium,
    rateWorkerJob,
    setCurrentRole,
    currentLanguage,
    startCall,
    openGpsRadar,
    openUpiPayment,
    openMultiChannelModal,
    openTop5Shortlist,
    showNotification,
    acceptJobByWorker,
    approveWorker,
    rejectWorker,
    dispatchJobStartOtp,
    latestTop5Matches,
    latestMatchedJob,
    getTop5WorkersForJob,
    matchJobWithWorkers,
    openProtectionModal,
    refundEscrowToCustomer,
    raiseJobComplaint,
    openSubscriptionPromo,
  } = useApp();

  // Subscription Modal State
  const [showCustomerSubscriptionModal, setShowCustomerSubscriptionModal] = useState(false);

  // Dispute & Complaint Modal State
  const [complaintJob, setComplaintJob] = useState<Job | null>(null);
  const [complaintReason, setComplaintReason] = useState<string>('Worker did not arrive at site / Absent');
  const [complaintDetails, setComplaintDetails] = useState<string>('');
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState<boolean>(false);

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintJob) return;
    setIsSubmittingComplaint(true);
    setTimeout(() => {
      setIsSubmittingComplaint(false);
      raiseJobComplaint(complaintJob.id, complaintReason, complaintDetails);
      setComplaintJob(null);
      setComplaintReason('Worker did not arrive at site / Absent');
      setComplaintDetails('');
    }, 350);
  };

  // Navigation Sub-Tabs: 'find_workers' | 'my_bookings' | 'support'
  const [activeTab, setActiveTab] = useState<'find_workers' | 'my_bookings' | 'support'>('find_workers');

  // Auth Tab Mode: 'login' | 'register'
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [workerViewMode, setWorkerViewMode] = useState<'list' | 'radar'>('list');
  const [selectedRadarWorker, setSelectedRadarWorker] = useState<WorkerProfile | null>(null);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTradeFilter, setSelectedTradeFilter] = useState<string>('All');
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(1.0);
  const [minWage, setMinWage] = useState<string>('');
  const [maxWage, setMaxWage] = useState<string>('');
  const [strict10kmOnly, setStrict10kmOnly] = useState<boolean>(true);

  // Direct Worker Booking Modal State
  const [bookingWorker, setBookingWorker] = useState<WorkerProfile | null>(null);
  const [directJobTitle, setDirectJobTitle] = useState<string>('');
  const [directJobDuration, setDirectJobDuration] = useState<number>(1);
  const [directJobDescription, setDirectJobDescription] = useState<string>('');

  const [prepayBooking, setPrepayBooking] = useState<{
    type: 'direct' | 'broadcast' | 'approve_escrow'; jobId?: string;
    amount: number;
    workerName: string;
  } | null>(null);

  // Login form states
  const [loginId, setLoginId] = useState('pooja');
  const [loginPassword, setLoginPassword] = useState('123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Registration form states
  const [regName, setRegName] = useState('');
  const [regUserId, setRegUserId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPhone, setRegPhone] = useState('+91 99100 88221');
  const [regEmail, setRegEmail] = useState('bhavnoorsinghkochar@gmail.com');
  const [regArea, setRegArea] = useState(() => currentCity?.defaultArea || 'Model Town');
  const [regAddress, setRegAddress] = useState(() => `House 142, ${currentCity?.defaultArea || 'Model Town'}, ${currentCity?.name || 'Ludhiana'}, ${currentCity?.state || 'Punjab'}`);
  const [regUpi, setRegUpi] = useState('pooja.verma@okhdfcbank');

  // Security Verification Modal State
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showGmailVerifyModal, setShowGmailVerifyModal] = useState(false);

  // Rating Modal State
  const [ratingJob, setRatingJob] = useState<Job | null>(null);

  // Quick Chat Modal State
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeChatJob, setActiveChatJob] = useState<Job | null>(null);
  const [activeChatTarget, setActiveChatTarget] = useState<ChatTarget | null>(null);

  // OTP Dispatch & Copy State
  const [copiedOtpJobId, setCopiedOtpJobId] = useState<string | null>(null);
  const [dispatchedEmailOtpJobs, setDispatchedEmailOtpJobs] = useState<Record<string, boolean>>({});
  const [isDispatchingOtp, setIsDispatchingOtp] = useState<Record<string, boolean>>({});

  const handleSendOtpEmail = async (job: Job) => {
    setIsDispatchingOtp(prev => ({ ...prev, [job.id]: true }));
    try {
      const email = currentCustomer?.email || 'bhavnoorsinghkochar@gmail.com';
      const success = await dispatchJobStartOtp(job, email);
      setDispatchedEmailOtpJobs(prev => ({ ...prev, [job.id]: true }));
      if (success) {
        playSound('success');
      }
    } finally {
      setIsDispatchingOtp(prev => ({ ...prev, [job.id]: false }));
    }
  };

  const handleSendOtpSms = (job: Job) => {
    const targetPhone = (job.assignedWorkerPhone || currentCustomer?.phone || '+919910088221').replace(/[^0-9]/g, '');
    const body = encodeURIComponent(`🔑 Dihadi Start-of-Work Passcode: ${job.otpCode} for "${job.title}". Enter this 4-digit code in your app upon arrival to start work.`);
    window.location.href = `sms:${targetPhone}?body=${body}`;
  };

  const handleShareOtpWhatsApp = (job: Job) => {
    const targetPhone = (job.assignedWorkerPhone || currentCustomer?.phone || '9910088221').replace(/[^0-9]/g, '');
    const phoneWithCountry = targetPhone.length === 10 ? `91${targetPhone}` : targetPhone;
    const msg = encodeURIComponent(
      `*🔑 DIHADI WORKER START OTP*\n\nJob: *${job.title}*\nStart Passcode: *${job.otpCode}*\nAgreed Daily Wage: ₹${job.dailyWage}\n\nEnter this 4-digit code in your Dihadi app upon arrival to start the work clock!`
    );
    window.open(`https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${msg}`, '_blank');
  };

  const handleCopyOtp = (job: Job) => {
    navigator.clipboard?.writeText(job.otpCode);
    setCopiedOtpJobId(job.id);
    playSound('click');
    showNotification(`Copied Start OTP: ${job.otpCode}`);
    setTimeout(() => setCopiedOtpJobId(null), 2500);
  };

  // Job Posting modal state
  const [showPostModal, setShowPostModal] = useState(false);

  // Form State for Post Job
  const [title, setTitle] = useState('');
  const [trade, setTrade] = useState<TradeType>('Mason');
  const [description, setDescription] = useState('');
  const [dailyWage, setDailyWage] = useState<number>(850);
  const [durationDays, setDurationDays] = useState<number>(1);

  useEffect(() => {
    if (currentCity) {
      setRegArea(currentCity.defaultArea);
      setRegAddress(`House 142, ${currentCity.defaultArea}, ${currentCity.name}, ${currentCity.state}`);
      if (!locationQuery) {
        setLocationQuery(currentCity.name);
      }
    }
  }, [currentCity]);

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
    if (!regPassword.trim()) {
      setAuthError('Please enter a password');
      return;
    }

    const chosenId = regUserId.trim() || regPhone.replace(/[^0-9]/g, '') || regName.trim().toLowerCase().replace(/\s+/g, '_');
    registerCustomerWithAuth({
      userId: chosenId,
      password: regPassword.trim(),
      name: regName.trim(),
      phone: regPhone.trim() || '+91 99100 88221',
      email: regEmail.trim() || undefined,
      isPhoneVerified: true,
      isEmailVerified: !!regEmail.trim(),
      area: regArea || currentCity?.defaultArea || 'Model Town',
      address: regAddress || `House 142, ${currentCity?.defaultArea || 'Model Town'}, ${currentCity?.name || 'Ludhiana'}`,
      upiId: regUpi || `${chosenId}@upi`,
    });
  };

  const handleVerificationSuccess = (verifiedData: {
    verifiedPhone: string;
    verifiedEmail?: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
  }) => {
    setShowSecurityModal(false);
    const chosenId = regUserId.trim() || (verifiedData.verifiedPhone || regPhone).replace(/[^0-9]/g, '');
    registerCustomerWithAuth({
      userId: chosenId,
      password: regPassword.trim() || '123',
      name: regName.trim(),
      phone: verifiedData.verifiedPhone || regPhone,
      email: verifiedData.verifiedEmail || regEmail,
      isPhoneVerified: verifiedData.isPhoneVerified,
      isEmailVerified: verifiedData.isEmailVerified,
      area: regArea || currentCity?.defaultArea || 'Model Town',
      address: regAddress || `House 142, ${currentCity?.defaultArea || 'Model Town'}, ${currentCity?.name || 'Ludhiana'}`,
      upiId: regUpi || `${chosenId}@upi`,
    });
  };

  const handleQuickDemoLogin = (userId: string, pass: string) => {
    setLoginId(userId);
    setLoginPassword(pass);
    setAuthError(null);
    loginCustomerWithAuth(userId, pass);
  };

  const getTradeName = (t: TradeType | string) => {
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

  const processPrepaidBooking = () => {
    if (!prepayBooking || !currentCustomer) return;
    if (prepayBooking.type === 'approve_escrow' && prepayBooking.jobId) {
      approveAndFundEscrow(prepayBooking.jobId);
    }
    setPrepayBooking(null);
  };


  const handlePostJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;
    if (!title.trim()) {
      showNotification("Missing Details", "Please specify the work needed for this job.");
      playSound("click");
      return;
    }
    const createdJob = postJob({
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
    if (createdJob) {
      setShowPostModal(false);
      setActiveTab("my_bookings");
    }
  };

  const handleConfirmDirectBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer || !bookingWorker) return;

    const workerTrade = bookingWorker.primaryTrade;
    const workerDailyWage = bookingWorker.dailyRate;
    const jobTitle = directJobTitle.trim() || `Hired ${bookingWorker.name} for ${workerTrade}`;

    const createdJob = postJob({
      title: jobTitle,
      trade: workerTrade,
      description: directJobDescription || `Direct booking for ${bookingWorker.name} (${workerTrade}).`,
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.phone,
      locationAddress: currentCustomer.address,
      area: currentCustomer.area,
      dailyWage: Number(workerDailyWage) || 850,
      durationDays: Number(directJobDuration) || 1,
    });

    if (createdJob) {
      acceptJobByWorker(createdJob.id, bookingWorker);
      playSound("success");
      showNotification(`Booked ${bookingWorker.name}! Proceed to approve and pay.`);
    }
    setBookingWorker(null);
    setDirectJobTitle("");
    setDirectJobDescription("");
    setActiveTab("my_bookings");
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTradeFilter('All');
    setLocationQuery('');
    setMinRating(1.0);
    setMinWage('');
    setMaxWage('');
    setStrict10kmOnly(true);
  };

  const custLat = currentCustomer?.gpsLocation?.lat || 30.8926;
  const custLng = currentCustomer?.gpsLocation?.lng || 75.8415;

  // Filter workers based on query, selected trade, rating, price, and strict 10km radar (Must be before any conditional early return!)
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const workerLat = w.gpsLocation?.lat || custLat;
      const workerLng = w.gpsLocation?.lng || custLng;
      const distance = calculateDistanceKm(custLat, custLng, workerLat, workerLng);

      // Strict 10km hyperlocal constraint
      if (strict10kmOnly && distance > 10.0) {
        return false;
      }

      // Trade filter
      if (selectedTradeFilter !== 'All' && w.primaryTrade !== selectedTradeFilter) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTrade = (w.primaryTrade || '').toLowerCase().includes(q);
        const matchesName = (w.name || '').toLowerCase().includes(q);
        const workerSkills = (w as any).skills || w.secondaryTrades || [];
        const matchesSkills = Array.isArray(workerSkills) && workerSkills.some((s: string) => (s || '').toLowerCase().includes(q));
        const matchesArea = (w.location?.area || '').toLowerCase().includes(q);
        if (!matchesTrade && !matchesName && !matchesSkills && !matchesArea) {
          return false;
        }
      }

      // Location query filter
      if (locationQuery.trim()) {
        const loc = locationQuery.toLowerCase().trim();
        const matchesCity = (w.location?.city || '').toLowerCase().includes(loc);
        const matchesArea = (w.location?.area || '').toLowerCase().includes(loc);
        if (!matchesCity && !matchesArea) {
          // If searching for distance/radar, keep within radius
        }
      }

      // Min Rating
      if (w.rating < minRating) {
        return false;
      }

      // Price filter
      if (minWage && w.dailyRate < Number(minWage)) {
        return false;
      }
      if (maxWage && w.dailyRate > Number(maxWage)) {
        return false;
      }

      return true;
    });
  }, [workers, selectedTradeFilter, searchQuery, locationQuery, minRating, minWage, maxWage, strict10kmOnly, custLat, custLng]);

  // IF NOT LOGGED IN: Show Customer Login
  if (!currentCustomer) {
    return (
      <div className={`bg-white flex flex-col h-full overflow-y-auto select-none ${isEmbedded ? 'w-full' : 'max-w-md mx-auto rounded-3xl border border-slate-200 shadow-xl'}`}>
        {/* Header */}
        <div className="p-5 bg-amber-600 text-white shrink-0 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentRole('select_role')}
                className="p-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition"
                title={getT(currentLanguage, 'back_to_role_selection')}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                  <Building2 className="w-5 h-5 text-amber-200" />
                  {getT(currentLanguage, 'role_customer_title')}
                </h3>
                <p className="text-xs text-amber-100">
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
                authTab === 'login' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {getT(currentLanguage, 'auth_sign_in')}
            </button>
            <button
              onClick={() => { setAuthTab('register'); setAuthError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                authTab === 'register' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {getT(currentLanguage, 'auth_register')}
            </button>
          </div>

          {authError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authTab === 'login' ? (
            /* Customer Login Form */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {getT(currentLanguage, 'demo_quick_login')} / Saved Logins
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {customerAccounts && customerAccounts.length > 0 ? (
                    customerAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleQuickDemoLogin(acc.id, acc.password || '123')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 ${
                          acc.id === 'pooja' 
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-200' 
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
                        }`}
                      >
                        <User className="w-3 h-3" />
                        <span>{acc.name} ({acc.id})</span>
                      </button>
                    ))
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin('pooja', '123')}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-lg text-[11px] font-bold border border-amber-200 transition"
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
                    </>
                  )}
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {getT(currentLanguage, 'auth_user_id_label')} / Mobile / Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. pooja, bhavnoor, or 9910088221"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-amber-600 pl-8"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>{getT(currentLanguage, 'auth_password_label')}</span>
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 hover:underline"
                    >
                      {showLoginPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showLoginPassword ? 'Hide' : 'Show Password'}</span>
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-amber-600 pl-8 pr-9"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-3 rounded-2xl shadow-md text-xs transition flex items-center justify-center gap-2 mt-4"
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
                  placeholder="e.g. Pooja Verma or Bhavnoor Singh"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">User ID / Username</label>
                  <input
                    type="text"
                    placeholder="e.g. pooja"
                    value={regUserId}
                    onChange={(e) => setRegUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>Password</span>
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="text-[10px] text-amber-700 font-semibold"
                    >
                      {showRegPassword ? 'Hide' : 'Show'}
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="e.g. mypass123"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600 pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {getT(currentLanguage, 'employer_phone_label')}
                  </label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-amber-600"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>Gmail / Email</span>
                    <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">Security OTP</span>
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-amber-600"
                    required
                  />
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setRegEmail('bhavnoorsinghkochar@gmail.com')}
                      className="text-[10px] text-amber-700 bg-amber-50 hover:bg-amber-100 font-semibold px-2 py-0.5 rounded-md border border-amber-200"
                    >
                      Use bhavnoorsinghkochar@gmail.com
                    </button>
                  </div>
                </div>
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
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 transition disabled:opacity-50"
                  title="Detect and snap to exact street address via GPS"
                >
                  <Crosshair className="w-3 h-3 text-amber-600" />
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">UPI ID for Payouts</label>
                  <input
                    type="text"
                    value={regUpi}
                    onChange={(e) => setRegUpi(e.target.value)}
                    placeholder="e.g. name@okhdfcbank"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-amber-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Delivery / Site Address</label>
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-2xl shadow-md text-xs transition flex items-center justify-center gap-2 mt-3"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Verify Gmail / SMS & Register</span>
              </button>
            </form>
          )}
        </div>

        {/* Security Verification Modal for registration */}
        <SecurityVerificationModal
          isOpen={showSecurityModal}
          onClose={() => setShowSecurityModal(false)}
          targetName={regName}
          email={regEmail}
          phone={regPhone}
          role="customer"
          onVerificationComplete={handleVerificationSuccess}
        />
      </div>
    );
  }

  // LOGGED IN CUSTOMER VIEW
  const myCustomerJobs = jobs.filter((j) => j.customerName === currentCustomer.name || true);
  const activeRequests = myCustomerJobs.filter((j) => j.status !== 'paid_and_closed');
  const pastPaidJobs = myCustomerJobs.filter((j) => j.status === 'paid_and_closed');

  const popularServiceCategories = [
    { trade: 'Mason' as TradeType, label: 'Mason', iconName: 'Building2', subtitle: 'Architecture & Brickwork' },
    { trade: 'Painter' as TradeType, label: 'Painter', iconName: 'Paintbrush', subtitle: 'Wall & Texture Paint' },
    { trade: 'Plumber' as TradeType, label: 'Plumber', iconName: 'Wrench', subtitle: 'Pipes, Taps & Motors' },
    { trade: 'Electrician' as TradeType, label: 'Electrician', iconName: 'Zap', subtitle: 'Wiring & Appliances' },
    { trade: 'Carpenter' as TradeType, label: 'Carpenter', iconName: 'Hammer', subtitle: 'Woodwork & Furniture' },
    { trade: 'Construction Helper' as TradeType, label: 'Cleaner', iconName: 'Sparkles', subtitle: 'Site Cleaning & Help' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans select-none rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
      {/* 1. Customer Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-6 sm:gap-8">
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('find_workers')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg italic shadow-xs group-hover:scale-105 transition">
              K
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              Kaam<span className="text-amber-500">zo</span>
            </span>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('find_workers')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'find_workers'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Find Workers</span>
            </button>

            <button
              onClick={() => setActiveTab('my_bookings')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'my_bookings'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>My Bookings</span>
              {activeRequests.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'my_bookings' ? 'bg-amber-400 text-slate-950' : 'bg-amber-600 text-white'
                }`}>
                  {activeRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'support'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Support</span>
            </button>
          </div>
        </div>

        {/* Right User & Quick Post Job Actions */}
        <div className="flex items-center gap-3">
          {/* Gold Club Membership Button */}
          <button
            onClick={() => {
              playSound('click');
              setShowCustomerSubscriptionModal(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
              currentCustomer?.isPremiumCustomer
                ? 'bg-amber-500/20 text-amber-800 border border-amber-400 hover:bg-amber-500/30'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:opacity-90'
            }`}
            title="Dihadi Gold: 1 Month Free Service"
          >
            <Crown className="w-3.5 h-3.5 shrink-0" />
            <span>
              {currentCustomer?.isPremiumCustomer
                ? 'Gold Member (1 Mo Free)'
                : 'Dihadi Gold (1 Mo Free)'}
            </span>
          </button>

          <button
            onClick={() => setShowPostModal(true)}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post a Job</span>
          </button>

          <button
            id="header-verify-gmail-btn"
            onClick={() => setShowGmailVerifyModal(true)}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-amber-200 cursor-pointer"
            title="Verify Gmail with 6-digit OTP"
          >
            <Mail className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Verify Gmail</span>
          </button>

          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden md:block">
              <p className="text-xs font-black text-slate-900 uppercase">{currentCustomer.name}</p>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md border border-amber-100">
                Customer ({currentCustomer.area})
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center border border-slate-700">
              {currentCustomer.name.charAt(0)}
            </div>

            <button
              onClick={logoutCustomer}
              className="px-2.5 py-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-slate-200"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Main Content Area */}
      {activeTab === 'find_workers' && (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
          {/* A. Hero Search Banner (As shown in screenshot) */}
          <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Background Decorative Rings */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl space-y-5 z-10">
              {/* Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Verified Local Daily Wage Workforce</span>
              </div>

              {/* Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Find Trusted Workers.<br />
                <span className="text-amber-400">Get The Job Done With Dignity.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Connect directly with verified electricians, plumbers, carpenters, painters, and masons for daily wage or project work.
              </p>

              {/* Large Search Input & Action Bar */}
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-2">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search trade or skill (e.g. Electrician, Plumbing)..."
                    className="w-full bg-white text-slate-900 pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-md placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => playSound('click')}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-sm transition shadow-lg flex items-center justify-center gap-2 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPostModal(true)}
                  className="px-5 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl text-sm transition shadow-lg flex items-center justify-center gap-2 shrink-0 border border-amber-400/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post a Job</span>
                </button>
              </div>
            </div>

            {/* Right Hero Image / Illustration */}
            <div className="relative z-10 shrink-0 w-full sm:w-80 lg:w-96">
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/60 shadow-2xl bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
                  alt="Dihadi Verified Worker"
                  className="w-full h-56 sm:h-64 object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="flex items-center gap-1.5 bg-amber-950/80 border border-amber-500/50 px-2.5 py-1 rounded-lg text-amber-300 font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    Strict 10km GPS Radar
                  </span>
                  <span className="bg-slate-900/80 px-2 py-1 rounded-lg font-mono text-[11px] text-slate-300">
                    Aadhaar KYC Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dihadi Gold Club Callout Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border-2 border-amber-400/70 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
                <Crown className="w-7 h-7" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 text-amber-300 px-2.5 py-0.5 rounded-full">
                    Customer Gold Pass
                  </span>
                  {currentCustomer?.isPremiumCustomer && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-700 text-white px-2 py-0.5 rounded-full">
                      Active: 1 Month Free Service
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Dihadi Gold: Get 1 Month 100% Free Service & ₹0 Booking Fees
                </h3>
                <p className="text-xs text-slate-600">
                  Plan fee: <strong>₹1,500</strong> for 30 days of unlimited 0% platform surcharge bookings, priority radar dispatch & free KYC dossiers!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playSound('click');
                setShowCustomerSubscriptionModal(true);
              }}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-2xl transition shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>
                {currentCustomer?.isPremiumCustomer
                  ? 'Manage Gold Membership'
                  : 'Get 1 Month Free Pass (₹1,500)'}
              </span>
            </button>
          </div>

          {/* B. Popular Services Category Chips (As shown in screenshot) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                <span>Popular Services</span>
              </h3>
              {selectedTradeFilter !== 'All' && (
                <button
                  onClick={() => setSelectedTradeFilter('All')}
                  className="text-xs text-amber-600 font-bold hover:underline"
                >
                  Clear Selection (Show All)
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {popularServiceCategories.map((cat) => {
                const isSelected = selectedTradeFilter === cat.trade;
                return (
                  <button
                    key={cat.trade}
                    onClick={() => {
                      setSelectedTradeFilter(isSelected ? 'All' : cat.trade);
                      playSound('click');
                    }}
                    className={`p-4 rounded-2xl border transition text-center flex flex-col items-center justify-center gap-2 group ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400 shadow-md'
                        : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base transition ${
                      isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                    }`}>
                      {cat.trade === 'Mason' && <Building2 className="w-6 h-6" />}
                      {cat.trade === 'Painter' && <Paintbrush className="w-6 h-6" />}
                      {cat.trade === 'Plumber' && <Wrench className="w-6 h-6" />}
                      {cat.trade === 'Electrician' && <Zap className="w-6 h-6" />}
                      {cat.trade === 'Carpenter' && <Hammer className="w-6 h-6" />}
                      {cat.trade === 'Construction Helper' && <Sparkles className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">{cat.label}</p>
                      <span className="text-[10px] text-slate-500 block truncate">{getTradeName(cat.trade)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* C. 2-Column Catalog Layout: Left Filters, Right Workers Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left Column: Filters Sidebar */}
            <div className="lg:col-span-1 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                  <span>Filters</span>
                </h4>
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-amber-600 hover:text-amber-800 transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Service Trade Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Service Trade</label>
                <select
                  value={selectedTradeFilter}
                  onChange={(e) => setSelectedTradeFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-amber-600"
                >
                  <option value="All">All Services & Trades</option>
                  <option value="Mason">Mason (राजमिस्त्री)</option>
                  <option value="Painter">Painter (पेंटर)</option>
                  <option value="Plumber">Plumber (प्लंबर)</option>
                  <option value="Electrician">Electrician (इलेक्ट्रीशियन)</option>
                  <option value="Carpenter">Carpenter (बढ़ई)</option>
                  <option value="Construction Helper">Helper / Cleaner (हेल्पर)</option>
                  <option value="Tile Worker">Tile Worker (टाइल मिस्त्री)</option>
                  <option value="Welder">Welder (वेल्डर)</option>
                  <option value="Loader/Mover">Loader / Mover (लोडर)</option>
                </select>
              </div>

              {/* Location Input & GPS Snap */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Location / Region</label>
                  <button
                    type="button"
                    onClick={refreshCustomerGpsLocation}
                    className="text-[10px] font-bold text-amber-600 hover:text-amber-800 flex items-center gap-0.5"
                    title="Refresh GPS location"
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>Live GPS</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="e.g. Ludhiana or Delhi NCR"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold pl-8 focus:outline-amber-600"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Strict 10km Radar Toggle */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    Strict 10km Radar
                  </span>
                  <input
                    type="checkbox"
                    checked={strict10kmOnly}
                    onChange={(e) => setStrict10kmOnly(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-amber-800 leading-tight">
                  Guarantees all shown workers are within 10 km of your live GPS coordinates.
                </p>
              </div>

              {/* Min Rating Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Min Rating</span>
                  <span className="font-black text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {minRating.toFixed(1)}+ Stars
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Daily Rate (₹) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Daily Rate (₹)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={minWage}
                    onChange={(e) => setMinWage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-amber-600"
                  />
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={maxWage}
                    onChange={(e) => setMaxWage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-amber-600"
                  />
                </div>
              </div>

              {/* Sidebar Quick Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const sampleJob: Job = activeRequests[0] || jobs[0] || {
                      id: `job_ai_${Date.now()}`,
                      title: `Work for ${selectedTradeFilter !== 'All' ? selectedTradeFilter : 'Mason'} in ${currentCustomer.area}`,
                      trade: (selectedTradeFilter !== 'All' ? selectedTradeFilter : 'Mason') as TradeType,
                      description: 'On-demand trade task in local radius',
                      customerName: currentCustomer.name,
                      customerPhone: currentCustomer.phone,
                      locationAddress: currentCustomer.address,
                      area: currentCustomer.area,
                      dailyWage: 850,
                      workerPayout: 680,
                      platformFee: 170,
                      distanceKm: 0.9,
                      status: 'broadcast',
                      otpCode: '4481',
                      postedAt: 'Just now',
                      durationDays: 1,
                      isPaid: false,
                      jobGps: currentCustomer.gpsLocation,
                    };
                    openTop5Shortlist(sampleJob);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Top-5 AI Shortlist</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPostModal(true)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Broadcast New Job</span>
                </button>
              </div>
            </div>

            {/* Right Column: Worker Catalog Grid & View Toggles */}
            <div className="lg:col-span-3 space-y-4">
              {/* Header Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Showing <span className="text-amber-600">{filteredWorkers.length}</span> available workers
                  </h4>
                  <p className="text-xs text-slate-500">
                    {strict10kmOnly ? 'All workers filtered within strict 10km GPS radius' : 'Showing all matched workers'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
                    <button
                      onClick={() => setWorkerViewMode('list')}
                      className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                        workerViewMode === 'list'
                          ? 'bg-white text-amber-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Grid View</span>
                    </button>
                    <button
                      onClick={() => setWorkerViewMode('radar')}
                      className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                        workerViewMode === 'radar'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                      <span>10km GPS Radar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* View 1: 10km GPS Radar View */}
              {workerViewMode === 'radar' && (
                <div className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                      <LocateFixed className="w-4 h-4 animate-spin text-amber-400" />
                      <span>LIVE HYPERLOCAL RADAR • {currentCustomer.area}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({currentCustomer.gpsLocation.lat.toFixed(4)}, {currentCustomer.gpsLocation.lng.toFixed(4)})
                      </span>
                    </div>
                    <span className="text-xs text-amber-300 font-mono bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/40">
                      Range: Strict 10.0 KM
                    </span>
                  </div>

                  {/* Circular Radar Sweep Display */}
                  <div className="relative w-full aspect-square max-h-[380px] mx-auto bg-radial from-slate-900 to-slate-950 rounded-full border-2 border-amber-500/30 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-[15%] rounded-full border border-amber-500/20" />
                    <div className="absolute inset-[32%] rounded-full border border-amber-500/20" />
                    <div className="absolute inset-[50%] rounded-full border border-amber-500/20" />
                    <div className="absolute inset-[70%] rounded-full border border-amber-500/20" />

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-full h-[1px] bg-amber-500/20" />
                      <div className="h-full w-[1px] bg-amber-500/20 absolute" />
                    </div>

                    <div className="absolute inset-0 bg-conic-gradient from-amber-500/20 via-transparent to-transparent animate-spin rounded-full pointer-events-none" style={{ animationDuration: '4s' }} />

                    {/* Center Customer Marker */}
                    <div className="relative z-10 w-9 h-9 rounded-full bg-amber-600 text-white border-2 border-white shadow-lg flex items-center justify-center text-xs font-black">
                      YOU
                    </div>

                    {/* Worker Blips */}
                    {filteredWorkers.map((w) => {
                      const workerLat = w.gpsLocation?.lat || custLat;
                      const workerLng = w.gpsLocation?.lng || custLng;
                      const distanceKm = calculateDistanceKm(custLat, custLng, workerLat, workerLng);
                      const bearingDeg = calculateBearing(custLat, custLng, workerLat, workerLng);

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
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 border-white ring-2 ring-amber-400'
                                : 'bg-slate-900 text-amber-300 border-amber-400/80 shadow-md'
                            }`}>
                              {w.name.charAt(0)}
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900 animate-pulse" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Worker Panel */}
                  {selectedRadarWorker ? (
                    (() => {
                      const workerLat = selectedRadarWorker.gpsLocation?.lat || custLat;
                      const workerLng = selectedRadarWorker.gpsLocation?.lng || custLng;
                      const trueDist = calculateDistanceKm(custLat, custLng, workerLat, workerLng);

                      return (
                        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-3 animate-in slide-in-from-bottom-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-lg">
                                {selectedRadarWorker.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                                  {selectedRadarWorker.name}
                                  {selectedRadarWorker.isVerified && (
                                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                                  )}
                                </h4>
                                <p className="text-xs text-slate-400">
                                  {getTradeName(selectedRadarWorker.primaryTrade)} • {selectedRadarWorker.phone}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-base font-black text-amber-400">₹{selectedRadarWorker.dailyRate}/day</span>
                              <span className="text-xs text-slate-400 block font-mono">{trueDist} km away</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <button
                              onClick={() => startCall(
                                { name: currentCustomer.name, role: 'customer', phone: currentCustomer.phone },
                                { name: selectedRadarWorker.name, role: 'worker', phone: selectedRadarWorker.phone },
                                `Hiring ${selectedRadarWorker.primaryTrade}`
                              )}
                              className="py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                            >
                              <Phone className="w-4 h-4" />
                              <span>Call</span>
                            </button>

                            <button
                              onClick={() => openGpsRadar({
                                id: `job_quick_${Date.now()}`,
                                title: `Work for ${selectedRadarWorker.primaryTrade}`,
                                description: `Direct assignment for ${selectedRadarWorker.primaryTrade}`,
                                customerName: currentCustomer.name,
                                customerPhone: currentCustomer.phone,
                                assignedWorkerId: selectedRadarWorker.id,
                                assignedWorkerName: selectedRadarWorker.name,
                                assignedWorkerPhone: selectedRadarWorker.phone,
                                trade: selectedRadarWorker.primaryTrade,
                                locationAddress: currentCustomer.address,
                                area: currentCustomer.area,
                                distanceKm: trueDist,
                                dailyWage: selectedRadarWorker.dailyRate,
                                workerPayout: Math.round(selectedRadarWorker.dailyRate * 0.8),
                                platformFee: Math.round(selectedRadarWorker.dailyRate * 0.2),
                                status: 'accepted',
                                otpCode: '4412',
                                postedAt: 'Just now',
                                durationDays: 1,
                                isPaid: false,
                                jobGps: currentCustomer.gpsLocation,
                                workerGps: selectedRadarWorker.gpsLocation,
                              })}
                              className="py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                            >
                              <Navigation className="w-4 h-4" />
                              <span>GPS Track</span>
                            </button>

                            <button
                              onClick={() => setBookingWorker(selectedRadarWorker)}
                              className="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl flex items-center justify-center gap-1.5 transition"
                            >
                              <Sparkles className="w-4 h-4" />
                              <span>Book Now</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-center text-xs text-slate-400 py-2">
                      Tap any blip on the 10km radar to inspect distance, initiate calls, or book directly.
                    </p>
                  )}
                </div>
              )}

              {/* View 2: Worker Cards Grid (As shown in screenshot) */}
              {workerViewMode === 'list' && (
                <div>
                  {filteredWorkers.length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 text-center space-y-3 border border-slate-200 shadow-sm">
                      <HardHat className="w-12 h-12 text-slate-300 mx-auto" />
                      <h4 className="text-base font-black text-slate-800">No Workers Found Matching Filter</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        There are no workers matching your criteria within the strict 10km radar. Try resetting filters or broadcast a custom job.
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={resetFilters}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition"
                        >
                          Reset Filters
                        </button>
                        <button
                          onClick={() => setShowPostModal(true)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition"
                        >
                          Post a Job Broadcast
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredWorkers.map((worker) => {
                        const workerLat = worker.gpsLocation?.lat || custLat;
                        const workerLng = worker.gpsLocation?.lng || custLng;
                        const distanceKm = calculateDistanceKm(custLat, custLng, workerLat, workerLng);

                        return (
                          <div
                            key={worker.id}
                            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-300 transition flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-3">
                              {/* Top Row: Avatar + Name + Verified Badge */}
                              <div className="flex items-start gap-3">
                                <div className="w-11 h-11 rounded-full bg-slate-800 text-amber-400 font-black flex items-center justify-center text-base shrink-0 border border-slate-700 shadow-xs">
                                  {worker.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <h5 className="text-sm font-black text-slate-900 truncate">
                                      {worker.name}
                                    </h5>
                                    {worker.isVerified && (
                                      <span className="inline-flex items-center gap-0.5 text-amber-600 font-bold text-[11px] shrink-0">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>verified</span>
                                      </span>
                                    )}
                                  </div>

                                  {/* Rating & Jobs Count */}
                                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                      {worker.rating.toFixed(1)}
                                    </span>
                                    <span>({worker.completedJobsCount} jobs)</span>
                                  </div>

                                  {/* Location with Radar Distance */}
                                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{worker.location.city || currentCity.name}</span>
                                    <span className="text-[10px] text-amber-600 font-semibold">({distanceKm} km away)</span>
                                  </p>
                                </div>
                              </div>

                              {/* Trade / Skill Tags */}
                              <div className="flex flex-wrap gap-1.5">
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[10px] font-bold border border-amber-100 uppercase tracking-wide">
                                  {worker.primaryTrade}
                                </span>
                                {(((worker as any).skills || worker.secondaryTrades || []) as string[]).slice(0, 2).map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Bottom Row: Rate + Book Now Button */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Daily Rate</span>
                                <span className="text-sm font-black text-slate-900">
                                  ₹{worker.dailyRate} <span className="text-[10px] font-normal text-slate-500">/ day</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveChatJob(null);
                                    setActiveChatTarget({
                                      name: worker.name,
                                      role: 'worker',
                                      phone: worker.phone,
                                      trade: worker.primaryTrade,
                                      dailyRate: worker.dailyRate,
                                      area: worker.location.area,
                                    });
                                    setShowChatModal(true);
                                    playSound('click');
                                  }}
                                  className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition shadow-2xs flex items-center justify-center cursor-pointer"
                                  title={`Chat with ${worker.name}`}
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => startCall(
                                    { name: currentCustomer.name, role: 'customer', phone: currentCustomer.phone },
                                    { name: worker.name, role: 'worker', phone: worker.phone },
                                    `Hire ${worker.primaryTrade}`
                                  )}
                                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                                  title="Voice Call Worker"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setBookingWorker(worker)}
                                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs transition flex items-center gap-1 shadow-sm"
                                >
                                  <span>Book Now</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. My Bookings Tab */}
      {activeTab === 'my_bookings' && (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900">My Bookings & Active Work Orders</h3>
              <p className="text-xs text-slate-500">
                Track assigned workers, verify start OTPs, monitor 10km GPS routes, and release UPI payments.
              </p>
            </div>
            <button
              onClick={() => setShowPostModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Job</span>
            </button>
          </div>

          {activeRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-200 shadow-sm">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-black text-slate-800">No Active Bookings</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You haven&apos;t posted any job or booked a worker yet. Browse available workers or post a requirement.
              </p>
              <button
                onClick={() => setActiveTab('find_workers')}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition inline-flex items-center gap-1.5"
              >
                <Users className="w-4 h-4" />
                <span>Find Workers Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeRequests.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-amber-600 text-white text-[11px] font-bold rounded-md uppercase">
                          {getTradeName(job.trade)}
                        </span>
                        <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md ${
                          job.status === 'broadcast' ? 'bg-amber-100 text-amber-800' :
                          job.status === 'accepted' ? 'bg-amber-100 text-amber-800' :
                          job.status === 'completed_pending_payment' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {job.status === 'broadcast' ? 'Broadcasting to 10km Radar' :
                           job.status === 'accepted' ? 'Worker Assigned (Share Start OTP)' :
                           job.status === 'completed_pending_payment' ? 'Work Completed (Payment Due)' :
                           job.status}
                        </span>

                        <span className="px-2 py-0.5 bg-amber-50 border border-amber-300 text-amber-800 text-[11px] font-bold rounded-md flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-amber-600" />
                          <span>Prepaid Escrow Protected</span>
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 mt-1.5">{job.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.locationAddress}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">₹{job.dailyWage}</span>
                      {job.escrowStatus === 'pending' ? (
                        <span className="text-[10px] text-red-600 font-bold block">Payment Pending</span>
                      ) : (
                        <span className="text-[10px] text-amber-700 font-bold block">100% Escrow Held</span>
                      )}
                      {job.status !== 'paid_and_closed' && job.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Worker did not arrive or wish to cancel? You will receive an immediate 100% refund.')) {
                              refundEscrowToCustomer(job.id);
                            }
                          }}
                          className="mt-1 text-[10px] text-red-600 hover:text-red-700 font-bold underline cursor-pointer"
                        >
                          Worker Absent? Claim Refund
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Worker Assignment Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center">
                        {job.assignedWorkerName ? job.assignedWorkerName.charAt(0) : 'W'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {job.assignedWorkerName || 'Waiting for Nearest Worker to Accept'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {job.assignedWorkerPhone || 'Broadcasting across strict 10km radius...'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openTop5Shortlist(job)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg text-xs transition border border-amber-200 flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Top-5 Shortlist</span>
                      </button>
                    </div>
                  </div>

                                    {/* Start-of-Work OTP Verification Hub or Payment Escrow */}
                  {job.status === 'accepted' ? (
                    <div className="bg-amber-100 p-4 rounded-2xl border border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-black text-slate-900 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-600" /> Worker Assigned</h4>
                        <p className="text-xs text-slate-600 mt-1">Please pay the prepaid amount into escrow to approve this worker and release the start OTP.</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => rejectWorker(job.id)} className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-slate-700 font-black rounded-xl text-xs transition shadow-sm whitespace-nowrap cursor-pointer">
                          Reject
                        </button>
                        <button type="button" onClick={() => setPrepayBooking({ type: 'approve_escrow', jobId: job.id, amount: job.dailyWage * job.durationDays, workerName: job.assignedWorkerName || 'Worker' })} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-sm whitespace-nowrap cursor-pointer">
                          Pay ₹{job.dailyWage * job.durationDays} to Approve
                        </button>
                      </div>
                    </div>
                  ) : (job.status === 'approved' || job.status === 'broadcast' || job.status === 'in_progress') ? (
                    <div className="bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent p-4 rounded-2xl border border-amber-300/80 shadow-xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <KeyRound className="w-4 h-4 text-amber-700" />
                            <span className="text-xs font-black text-slate-950 uppercase tracking-wide">
                              Worker Verification Start-Passcode (OTP)
                            </span>
                            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-full text-[10px] uppercase">
                              {job.status === 'in_progress' ? 'Verified & In-Progress' : 'Ready to Share'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            Share this 4-digit code with the worker upon doorstep arrival. The worker enters it to begin the verified work clock.
                          </p>
                        </div>

                        {/* Large High-Contrast 4-Digit Display */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950 text-amber-400 px-4 py-2 rounded-xl shadow-md border border-slate-800">
                          {job.otpCode.split('').map((digit, i) => (
                            <span key={i} className="font-mono font-black text-lg tracking-widest px-1">
                              {digit}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Multi-Channel 1-Tap OTP Dispatch Controls */}
                      <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                        <button
                          type="button"
                          onClick={() => handleSendOtpEmail(job)}
                          disabled={isDispatchingOtp[job.id]}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl border border-slate-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-60"
                          title="Dispatch OTP confirmation to your registered email"
                        >
                          {isDispatchingOtp[job.id] ? (
                            <span className="w-3.5 h-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                          ) : dispatchedEmailOtpJobs[job.id] ? (
                            <Check className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <Mail className="w-3.5 h-3.5 text-amber-600" />
                          )}
                          <span>
                            {dispatchedEmailOtpJobs[job.id] ? 'Sent to Email (Gmail)' : 'Send to my Email'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShareOtpWhatsApp(job)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl border border-amber-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title="Share OTP directly via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Share on WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSendOtpSms(job)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl border border-amber-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title="Send OTP via SMS text"
                        >
                          <Phone className="w-3.5 h-3.5 text-amber-600" />
                          <span>Send via SMS</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveChatJob(job);
                            setActiveChatTarget(null);
                            setShowChatModal(true);
                            playSound('click');
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title="Open In-App Chat & Send OTP"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat & Share OTP</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyOtp(job)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer ml-auto"
                          title="Copy 4-digit code"
                        >
                          {copiedOtpJobId === job.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-amber-700 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy Passcode</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Raise Complaint Action Banner for Active Jobs */}
                  {(job.status === 'accepted' || job.status === 'in_progress' || job.status === 'broadcast') && (
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs mt-4">
                      <span className="text-[11px] text-slate-600 font-medium">Worker not arrived or left site?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setComplaintJob(job);
                          playSound('click');
                        }}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 text-[11px] transition flex items-center gap-1 cursor-pointer"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Raise Complaint for Refund</span>
                      </button>
                    </div>
                  )}

                  {/* Disputed Job Status Banner */}
                  {job.status === 'disputed' && (
                    <div className="bg-amber-50/90 border-2 border-amber-400 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-700" />
                          <span className="text-xs font-black text-amber-950 uppercase tracking-wide">
                            Complaint Registered for Admin Review (#{job.disputeId || 'DISP'})
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase">
                          Escrow Locked
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 leading-snug">
                        Reported issue: <strong>{job.disputeReason || 'Worker absent / site non-arrival'}</strong>.
                      </p>
                      <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200 text-[11px] text-slate-700 space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span>Protected Escrow Amount:</span>
                          <span className="font-mono text-slate-900">₹{job.escrowPrepaidAmount || ((job.dailyWage || 850) * (job.durationDays || 1))}</span>
                        </div>
                        <p className="text-[10px] text-slate-600">
                          Admin Operations is auditing worker GPS timestamps & proof. Upon verification, 100% of your escrow will be refunded or wage appropriately adjusted. No direct 1-click refund allows fraudulent claims.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Raise Complaint Action Banner for Active Jobs */}
                  {(job.status === 'accepted' || job.status === 'in_progress' || job.status === 'broadcast') && (
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <span className="text-[11px] text-slate-600 font-medium">Worker not arrived or left site?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setComplaintJob(job);
                          playSound('click');
                        }}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 text-[11px] transition flex items-center gap-1 cursor-pointer"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Raise Complaint for Refund</span>
                      </button>
                    </div>
                  )}

                  {job.status === 'completed_pending_payment' && (
                    currentCustomer?.isPremiumCustomer ? (
                      <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-amber-500/10 p-4 rounded-2xl border-2 border-amber-300 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                            <h5 className="text-xs font-black text-slate-950">Work Completed • Covered by Gold Membership</h5>
                          </div>
                          <p className="text-[11px] text-slate-700 mt-0.5">
                            Worker wage of ₹{job.workerPayout} will be disbursed directly from Admin Treasury. <strong>₹0 charged to your account.</strong><br/>
                            <strong className="text-amber-800">The worker has completed the job. Please leave a rating and review for your experience!</strong>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setComplaintJob(job);
                              playSound('click');
                            }}
                            className="px-3 py-2 bg-white hover:bg-amber-50 text-amber-700 font-bold rounded-xl border border-amber-300 text-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Raise Dispute</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRatingJob(job)}
                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirm & Release (₹0 Free)</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h5 className="text-xs font-black text-amber-950">Work Completed Successfully!</h5>
                          <p className="text-[11px] text-amber-800 font-bold mt-1">The worker has completed the job. Please leave a rating and review for your experience!</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setComplaintJob(job);
                              playSound('click');
                            }}
                            className="px-3 py-2 bg-white hover:bg-amber-50 text-amber-700 font-bold rounded-xl border border-amber-300 text-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Raise Dispute</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRatingJob(job)}
                            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirm Work & Release Escrow</span>
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Support Tab */}
      {activeTab === 'support' && (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-900">Kaamzo Customer Support & Safety Hub</h3>
              <p className="text-xs text-slate-500 mt-1">
                24/7 dedicated support, dispute resolution, and hyperlocal safety assistance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-slate-900">IVR Voice Helpline</h4>
                <p className="text-[11px] text-slate-500">Toll-free voice assistance available in Hindi, Punjabi & English.</p>
                <p className="text-xs font-mono font-bold text-amber-600">1800-DIHADI-HELP</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-slate-900">100% Aadhaar KYC Guarantee</h4>
                <p className="text-[11px] text-slate-500">Every worker in the 10km radius is verified with physical trade proof.</p>
                <span className="text-[10px] font-bold text-amber-600">Active Protection</span>
              </div>
            </div>

            {/* Embedded Gmail OTP Verification Section */}
            <div className="pt-2">
              <GmailOtpVerificationSection 
                initialEmail={currentCustomer?.email || 'bhavnoorsinghkochar@gmail.com'}
                onVerified={(verifiedEmail) => {
                  showNotification('Gmail Verified', `✓ Gmail (${verifiedEmail}) verified successfully!`);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Direct Worker Booking Modal */}
      {bookingWorker && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm">
                  {bookingWorker.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Book {bookingWorker.name}</h4>
                  <p className="text-[11px] text-slate-500">{bookingWorker.primaryTrade} • ₹{bookingWorker.dailyRate}/day</p>
                </div>
              </div>
              <button
                onClick={() => setBookingWorker(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDirectBooking} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Work Requirement / Title</label>
                <input
                  type="text"
                  placeholder={`e.g. Need ${bookingWorker.primaryTrade} for 1 day work`}
                  value={directJobTitle}
                  onChange={(e) => setDirectJobTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={directJobDuration}
                    onChange={(e) => setDirectJobDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Daily Wage (₹)</label>
                  <input
                    type="number"
                    value={bookingWorker.dailyRate}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Work Address / Instructions</label>
                <textarea
                  rows={2}
                  value={directJobDescription}
                  onChange={(e) => setDirectJobDescription(e.target.value)}
                  placeholder="e.g. Bring standard tools, reach location by 9:00 AM."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600 font-medium"
                />
              </div>

              {/* Upfront Prepaid Escrow Breakdown */}
              {currentCustomer.isPremiumCustomer ? (
                <div className="p-3.5 bg-gradient-to-r from-amber-500/20 to-amber-500/10 border-2 border-amber-400 rounded-2xl space-y-2 text-slate-900">
                  <div className="flex items-center justify-between pb-1.5 border-b border-amber-300">
                    <span className="text-[11px] font-black text-slate-950 flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                      <span>Dihadi Gold Plan Active (Covered by ₹15,000)</span>
                    </span>
                    <span className="text-xs font-mono font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                      ₹0 (Free Service)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-800 leading-snug">
                    👑 <strong>Unlimited Free Booking:</strong> Worker daily wage of ₹{Number(bookingWorker.dailyRate) * (Number(directJobDuration) || 1)} is covered by your Gold Subscription and will be disbursed directly from Admin Treasury upon confirmation.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50/80 border-2 border-amber-300 rounded-2xl space-y-2 text-slate-800">
                  <div className="flex items-center justify-between pb-1.5 border-b border-amber-200">
                    <span className="text-[11px] font-black text-amber-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Upfront Prepaid Escrow (Before Work)</span>
                    </span>
                    <span className="text-xs font-mono font-black text-amber-800">
                      ₹{Number(bookingWorker.dailyRate) * (Number(directJobDuration) || 1)}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-snug">
                    🛡️ <strong>100% Protected:</strong> Employer prepays wage before work starts. Funds remain locked in the Dihadi Escrow Vault and are only released when you confirm satisfactory work completion. <strong>100% refundable upon complaint review if worker is absent.</strong>
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBookingWorker(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                {currentCustomer.isPremiumCustomer ? (
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Use My Subscription (₹0 Free) & Book</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Prepay ₹{Number(bookingWorker.dailyRate) * (Number(directJobDuration) || 1)} & Book</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post a Job Broadcast Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Post Daily Wage Requirement</h4>
                  <p className="text-xs text-slate-500">Auto-broadcasts to all verified workers within 10 km.</p>
                </div>
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostJobSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">What work do you need done?</label>
                <input
                  type="text"
                  placeholder="e.g. Electrical rewiring for 3-BHK or Mason for wall repair"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trade Category</label>
                  <select
                    value={trade}
                    onChange={(e) => setTrade(e.target.value as TradeType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-amber-600"
                  >
                    <option value="Mason">Mason (राजमिस्त्री)</option>
                    <option value="Painter">Painter (पेंटर)</option>
                    <option value="Plumber">Plumber (प्लंबर)</option>
                    <option value="Electrician">Electrician (इलेक्ट्रीशियन)</option>
                    <option value="Carpenter">Carpenter (बढ़ई)</option>
                    <option value="Construction Helper">Helper (हेल्पर)</option>
                    <option value="Tile Worker">Tile Worker (टाइल मिस्त्री)</option>
                    <option value="Welder">Welder (वेल्डर)</option>
                    <option value="Loader/Mover">Loader / Mover (लोडर)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Daily Wage Budget (₹)</label>
                  <input
                    type="number"
                    min="400"
                    step="50"
                    value={dailyWage}
                    onChange={(e) => setDailyWage(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-amber-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Work Location Area</label>
                  <input
                    type="text"
                    value={currentCustomer.area}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Work Details & Site Instructions</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Need worker on site by 8:30 AM. Cement and materials provided."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600"
                />
              </div>

              {/* Upfront Prepaid Escrow Breakdown for Broadcast Job */}
              {currentCustomer.isPremiumCustomer ? (
                <div className="p-3.5 bg-gradient-to-r from-amber-500/20 to-amber-500/10 border-2 border-amber-400 rounded-2xl space-y-2 text-slate-900">
                  <div className="flex items-center justify-between pb-1.5 border-b border-amber-300">
                    <span className="text-[11px] font-black text-slate-950 flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                      <span>Dihadi Gold Plan Active (Covered by ₹15,000)</span>
                    </span>
                    <span className="text-xs font-mono font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                      ₹0 (Free Service)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-800 leading-snug">
                    👑 <strong>Unlimited Free Broadcast:</strong> Job wage of ₹{(Number(dailyWage) || 850) * (Number(durationDays) || 1)} is covered by your Gold Subscription and will be disbursed directly from Admin Treasury to the worker upon your work approval.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50/80 border-2 border-amber-300 rounded-2xl space-y-2 text-slate-800">
                  <div className="flex items-center justify-between pb-1.5 border-b border-amber-200">
                    <span className="text-[11px] font-black text-amber-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Upfront Prepaid Escrow (Before Work Starts)</span>
                    </span>
                    <span className="text-xs font-mono font-black text-amber-800">
                      ₹{(Number(dailyWage) || 850) * (Number(durationDays) || 1)}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-snug">
                    🛡️ <strong>100% Escrow Guarantee:</strong> Employer prepays total wage into secure escrow vault before job broadcast. Funds are only disbursed when worker finishes work with your verified approval. <strong>100% refundable upon complaint review if worker is absent or leaves.</strong>
                  </p>
                </div>
              )}

              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Our AI engine will instantly rank and alert the Top 5 nearest workers within 10 km.</span>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                {currentCustomer.isPremiumCustomer ? (
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Use My Subscription (₹0 Free) & Broadcast</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Prepay ₹{(Number(dailyWage) || 850) * (Number(durationDays) || 1)} & Broadcast</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raise Dispute & Complaint Modal */}
      {complaintJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 font-black flex items-center justify-center text-sm shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Raise Complaint / Dispute</h4>
                  <p className="text-xs text-slate-500">Official review by Kaamzo Operations & Admin</p>
                </div>
              </div>
              <button
                onClick={() => setComplaintJob(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Job Summary Pill */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <p className="font-bold text-slate-900">{complaintJob.title}</p>
              <div className="flex items-center justify-between text-slate-600 text-[11px]">
                <span>Assigned Worker: <strong>{complaintJob.assignedWorkerName || 'Broadcasting'}</strong></span>
                <span className="font-mono text-amber-700 font-bold">Escrow: ₹{complaintJob.escrowPrepaidAmount || ((complaintJob.dailyWage || 850) * (complaintJob.durationDays || 1))}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Complaint</label>
                <select
                  value={complaintReason}
                  onChange={(e) => setComplaintReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-amber-600"
                  required
                >
                  <option value="Worker did not arrive at site / Absent">Worker did not arrive at site / Absent (ਗੈਰ-ਹਾਜ਼ਰ)</option>
                  <option value="Worker left site without completing work">Worker left site early without finishing work</option>
                  <option value="Severe quality defect or property damage">Substandard work / Quality defect / Damage</option>
                  <option value="Worker demanded unauthorized extra cash">Worker demanded unauthorized extra cash outside app</option>
                  <option value="Other complaint">Other grievance</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Additional Details (Optional)</label>
                <textarea
                  rows={3}
                  value={complaintDetails}
                  onChange={(e) => setComplaintDetails(e.target.value)}
                  placeholder="Provide any additional context, e.g. waited 2 hours, worker phone switched off, etc."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600"
                />
              </div>

              {/* Admin Verification Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Admin Fair Audit Guarantee</span>
                </div>
                <p className="text-amber-800">
                  To prevent fraudulent disputes, Kaamzo Admin will cross-verify worker GPS location logs and timestamps. <strong>100% of your escrow funds are held safely locked in escrow vault</strong> and will be refunded upon verification.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setComplaintJob(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingComplaint}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingComplaint ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>Submit for Admin Audit</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Chat Modal */}
      <QuickChatModal
        isOpen={showChatModal}
        onClose={() => { 
          setShowChatModal(false); 
          setActiveChatJob(null); 
          setActiveChatTarget(null);
        }}
        job={activeChatJob}
        targetPerson={activeChatTarget}
        currentUserRole="customer"
        currentUserName={currentCustomer.name}
        currentUserPhone={currentCustomer.phone}
        onStartCall={() => {
          if (activeChatJob) {
            startCall(
              { name: currentCustomer.name, role: 'customer', phone: currentCustomer.phone },
              { name: activeChatJob.assignedWorkerName || 'Worker', role: 'worker', phone: activeChatJob.assignedWorkerPhone || '+91 98101 55678' },
              activeChatJob.title
            );
          } else if (activeChatTarget) {
            startCall(
              { name: currentCustomer.name, role: 'customer', phone: currentCustomer.phone },
              { name: activeChatTarget.name, role: 'worker', phone: activeChatTarget.phone || '+91 98101 55678' },
              `Direct Call with ${activeChatTarget.name}`
            );
          }
        }}
        onOpenRadar={() => {
          if (activeChatJob) {
            openGpsRadar(activeChatJob);
          }
        }}
        currentLanguage={currentLanguage}
      />

      {/* Rating & Review Modal */}
      {ratingJob && (
        <RateEmployeeModal
          isOpen={!!ratingJob}
          onClose={() => setRatingJob(null)}
          jobId={ratingJob.id}
          jobTitle={ratingJob.title}
          workerName={ratingJob.assignedWorkerName || 'Worker'}
          workerTrade={ratingJob.trade}
          existingRating={ratingJob.rating}
          existingReview={ratingJob.review}
          existingTags={ratingJob.ratingTags}
          onSubmitRating={(jobId, stars, review, tags) => {
            if (ratingJob.status === 'completed_pending_payment') {
              releasePaymentByCustomer(jobId, stars, review, 'ESCROW_WALLET', `ESCROW-${Date.now()}`, tags);
            } else {
              rateWorkerJob(jobId, stars, review, tags);
            }
            setRatingJob(null);
          }}
        />
      )}

      {/* Standalone Gmail OTP Verification Modal */}
      <GmailOtpVerificationModal
        isOpen={showGmailVerifyModal}
        onClose={() => setShowGmailVerifyModal(false)}
        initialEmail={currentCustomer?.email || 'bhavnoorsinghkochar@gmail.com'}
        targetName={currentCustomer?.name || 'Customer'}
        role="customer"
        onVerified={(verifiedEmail) => {
          showNotification('Gmail Verified', `✓ Gmail (${verifiedEmail}) verified successfully!`);
        }}
      />

      {/* Customer Gold Membership (1 Month Free Service) Modal */}
      {currentCustomer && (
        <CustomerSubscriptionModal
          isOpen={showCustomerSubscriptionModal}
          onClose={() => setShowCustomerSubscriptionModal(false)}
          customer={currentCustomer}
          onSubscribe={(method) => subscribeCustomerPremium(currentCustomer.id, method)}
        />
      )}

      {/* Prepay Escrow Payment Modal during booking */}
      {prepayBooking && (
        <UpiQrPaymentModal
          isOpen={!!prepayBooking}
          onClose={() => setPrepayBooking(null)}
          amount={prepayBooking.amount}
          totalWage={prepayBooking.amount}
          workerName={prepayBooking.workerName}
          workerTrade={prepayBooking.type === 'direct' && bookingWorker ? bookingWorker.primaryTrade : trade}
          isWorkerReceiving={false}
          isPrepaidEscrowPayment={true}
          isCustomerSubscriptionActive={currentCustomer?.isPremiumCustomer}
          jobTitle={prepayBooking.type === 'direct' ? directJobTitle : title}
          onPaymentSuccess={() => {
            processPrepaidBooking();
          }}
        />
      )}
    </div>
  );
};
