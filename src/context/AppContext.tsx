import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  AppRole, 
  Language, 
  Job, 
  WorkerProfile, 
  CustomerProfile, 
  AdminProfile, 
  VerificationRequest, 
  DisputeItem, 
  TradeType, 
  CallSession, 
  GpsCoordinates,
  CityInfo,
  ChatNotificationItem,
  HyperlocalMatchResult
} from '../types';
import { playSound, speakText } from '../utils/audio';
import { 
  matchHyperlocalWorkers, 
  getTop5Shortlist 
} from '../utils/aiMatching';
import { 
  calculateDistanceKm, 
  calculateBearing, 
  getCoordinatesForArea,
  SUPPORTED_CITIES,
  detectCityFromCoords,
  reverseGeocodeLocation,
  ResolvedAddress
} from '../utils/geo';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  COLLECTIONS, 
  syncWorkerToFirestore, 
  syncJobToFirestore, 
  syncVerificationToFirestore, 
  syncDisputeToFirestore,
  handleFirestoreError,
  OperationType 
} from '../lib/firestoreSync';
import { sendOtpToGmail } from '../lib/gmailService';

export interface UserAccount {
  id: string; // login identifier e.g. 'ramesh' or '9810155678'
  phone: string;
  password: string;
  name: string;
  role: 'worker' | 'customer' | 'admin';
  extraData?: any;
}

interface AppContextType {
  currentRole: AppRole;
  setCurrentRole: (role: AppRole) => void;
  currentLanguage: Language;
  setCurrentLanguage: (lang: Language) => void;

  // City & Live Geolocation
  currentCity: CityInfo;
  setCurrentCity: (city: CityInfo) => void;
  supportedCities: CityInfo[];
  detectAndSetLiveLocation: () => Promise<boolean>;
  snapToRealWorldAddress: () => Promise<ResolvedAddress | null>;
  currentResolvedAddress: ResolvedAddress | null;
  isLocating: boolean;
  
  // Platform collections - start at zero
  workers: WorkerProfile[];
  jobs: Job[];
  verifications: VerificationRequest[];
  disputes: DisputeItem[];

  // Logged in user states
  currentWorker: WorkerProfile | null;
  currentCustomer: CustomerProfile | null;
  currentAdmin: AdminProfile | null;

  // Real-time Calling State
  activeCall: CallSession | null;
  startCall: (
    caller: { name: string; role: 'worker' | 'customer' | 'admin'; phone: string },
    receiver: { name: string; role: 'worker' | 'customer' | 'admin'; phone: string },
    jobTitle?: string
  ) => void;
  endCall: () => void;

  // Active GPS Radar modal trigger
  activeGpsJob: Job | null;
  openGpsRadar: (job: Job) => void;
  closeGpsRadar: () => void;

  // Active UPI QR modal trigger
  activeUpiPaymentJob: Job | null;
  openUpiPayment: (job: Job) => void;
  closeUpiPayment: () => void;

  // Active Multi-Channel Alert modal trigger
  activeMultiChannelJob: Job | null;
  activeMultiChannelWorker: WorkerProfile | null;
  openMultiChannelModal: (job: Job, worker?: WorkerProfile) => void;
  closeMultiChannelModal: () => void;

  // Active Top-5 Shortlist & Automated Job Matching Engine
  activeShortlistJob: Job | null;
  openTop5Shortlist: (job: Job) => void;
  closeTop5Shortlist: () => void;
  latestMatchedJob: Job | null;
  latestTop5Matches: HyperlocalMatchResult[];
  getTop5WorkersForJob: (jobOrCriteria: Job | { trade: TradeType; jobGps?: GpsCoordinates; lat?: number; lng?: number; area?: string; dailyWage?: number; maxRadiusKm?: number }) => HyperlocalMatchResult[];
  matchJobWithWorkers: (job: Job) => { matches: HyperlocalMatchResult[]; totalEligible: number; topMatch: HyperlocalMatchResult | null };
  clearMatchedSuggestions: () => void;

  // Real-time Chat Notifications & Global Chat Modal
  chatNotifications: ChatNotificationItem[];
  triggerChatNotification: (item: ChatNotificationItem) => void;
  dismissChatNotification: (id: string) => void;
  activeGlobalChat: { isOpen: boolean; job?: Job | null; targetPerson?: any; role?: 'worker' | 'customer' | 'admin' } | null;
  openGlobalChat: (job?: Job | null, targetPerson?: any, role?: 'worker' | 'customer' | 'admin') => void;
  closeGlobalChat: () => void;

  // Worker Auth & Actions
  loginWorkerWithAuth: (userIdOrPhone: string, password: string) => { success: boolean; error?: string };
  registerWorkerWithAuth: (data: {
    userId: string;
    password: string;
    name: string;
    phone: string;
    email?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    primaryTrade: TradeType;
    dailyRate: number;
    experienceYears: number;
    area: string;
    aadhaarNumber: string;
    upiId?: string;
  }) => void;
  loginWorker: (data: {
    name: string;
    phone: string;
    email?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    primaryTrade: TradeType;
    dailyRate: number;
    experienceYears: number;
    area: string;
    aadhaarNumber: string;
    upiId?: string;
  }) => void;
  logoutWorker: () => void;
  toggleWorkerStatus: () => void;
  updateWorkerUpi: (upiId: string, bankName?: string, ifscCode?: string) => void;
  updateWorkerGps: (coords: Partial<GpsCoordinates>) => void;
  updateWorkerAvatar: (avatarUrl: string) => void;
  updateWorkerProfile: (updates: Partial<WorkerProfile>) => void;
  acceptJobByWorker: (jobId: string) => void;
  startJobWithOtp: (jobId: string, otp: string) => boolean;
  completeJobByWorker: (jobId: string) => void;
  withdrawWorkerEarnings: (customUpi?: string) => void;

  // Customer Auth & Actions
  loginCustomerWithAuth: (userIdOrPhone: string, password: string) => { success: boolean; error?: string };
  registerCustomerWithAuth: (data: {
    userId: string;
    password: string;
    name: string;
    phone: string;
    email?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    area: string;
    address: string;
    upiId?: string;
  }) => void;
  loginCustomer: (data: {
    name: string;
    phone: string;
    email?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    area: string;
    address: string;
    upiId?: string;
  }) => void;
  logoutCustomer: () => void;
  updateCustomerGps: (coords: Partial<GpsCoordinates>) => void;
  refreshCustomerGpsLocation: () => void;
  postJob: (jobData: {
    title: string;
    trade: TradeType;
    description: string;
    customerName: string;
    customerPhone: string;
    locationAddress: string;
    area: string;
    dailyWage: number;
    durationDays: number;
  }) => Job;
  dispatchJobStartOtp: (job: Job, targetEmail?: string, targetPhone?: string) => Promise<boolean>;
  releasePaymentByCustomer: (
    jobId: string, 
    rating: number, 
    review: string, 
    paidVia?: 'UPI_QR' | 'UPI_DIRECT' | 'ESCROW_WALLET' | 'CASH',
    txnRef?: string,
    tags?: string[]
  ) => void;
  rateWorkerJob: (jobId: string, rating: number, review: string, tags?: string[]) => void;

  // Admin Auth & Actions
  loginAdminWithAuth: (adminIdOrEmail: string, password: string) => { success: boolean; error?: string };
  loginAdmin: (data: { name: string; email: string }) => void;
  logoutAdmin: () => void;
  verifyWorkerByAdmin: (id: string, status: 'approved' | 'rejected') => void;
  verifyWorkerDirectly: (workerId: string, status?: 'approved' | 'rejected') => void;
  verifyCurrentWorker: (status?: 'approved' | 'rejected') => void;
  submitWorkerKyc: (data: {
    workerName: string;
    trade: TradeType;
    phone: string;
    aadhaarNumber: string;
    experienceYears: number;
  }) => void;
  seedMoreWorkersForVerification: () => void;
  refreshWorkerGpsLocation: () => void;
  resolveDispute: (id: string) => void;

  // Global Controls & Firebase State
  isFirebaseConnected: boolean;
  connectedCluster: {
    connectUrl: string;
    controlUrl: string;
    workUrl: string;
  };
  resetToZero: () => void;
  seedSampleData: () => void;
  speak: (text: string) => void;
  notification: string | null;
  setNotification: (msg: string | null) => void;
  showNotification: (msgOrTitle: string, maybeMessage?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Default initial workers in Ludhiana, Punjab
const DEFAULT_INITIAL_WORKERS: WorkerProfile[] = [
  {
    id: 'w-ramesh',
    name: 'Ramesh Kumar',
    phone: '+91 98101 55678',
    avatar: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=150&auto=format&fit=crop&q=80',
    primaryTrade: 'Mason',
    secondaryTrades: ['Tile Worker'],
    dailyRate: 850,
    experienceYears: 6,
    rating: 5.0,
    reviewCount: 3,
    completedJobsCount: 14,
    isOnline: true,
    location: { area: 'Model Town', city: 'Ludhiana', distanceKm: 0.6 },
    gpsLocation: {
      lat: 30.8926,
      lng: 75.8415,
      area: 'Model Town',
      city: 'Ludhiana',
      accuracyMeters: 4,
      heading: 45,
      speedKmh: 0,
      lastUpdated: 'Just now',
    },
    isSharingLiveGps: true,
    aadhaarNumberMasked: 'XXXX-XXXX-9901',
    isVerified: false, // Pending in verification queue
    todayEarnings: 0,
    totalEarnings: 0,
    walletBalance: 0,
    badge: 'Aadhaar Pending',
    upiId: 'ramesh.mason@okaxis',
    bankName: 'State Bank of India',
    accountNumberMasked: '•••• •••• 5678',
    ifscCode: 'SBIN0004921',
  },
  {
    id: 'w-sunil',
    name: 'Sunil Sharma',
    phone: '+91 98101 22334',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    primaryTrade: 'Painter',
    secondaryTrades: ['Construction Helper'],
    dailyRate: 900,
    experienceYears: 4,
    rating: 4.9,
    reviewCount: 2,
    completedJobsCount: 9,
    isOnline: true,
    location: { area: 'Sarabha Nagar', city: 'Ludhiana', distanceKm: 1.4 },
    gpsLocation: {
      lat: 30.8872,
      lng: 75.8193,
      area: 'Sarabha Nagar',
      city: 'Ludhiana',
      accuracyMeters: 5,
      heading: 90,
      speedKmh: 0,
      lastUpdated: 'Just now',
    },
    isSharingLiveGps: true,
    aadhaarNumberMasked: 'XXXX-XXXX-4412',
    isVerified: false,
    todayEarnings: 0,
    totalEarnings: 0,
    walletBalance: 0,
    badge: 'Aadhaar Pending',
    upiId: 'sunil.painter@paytm',
    bankName: 'Punjab National Bank',
    accountNumberMasked: '•••• •••• 2334',
    ifscCode: 'PUNB0123400',
  },
  {
    id: 'w-deepak',
    name: 'Deepak Kumar',
    phone: '+91 98101 99887',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    primaryTrade: 'Plumber',
    secondaryTrades: ['Welder'],
    dailyRate: 850,
    experienceYears: 5,
    rating: 4.8,
    reviewCount: 4,
    completedJobsCount: 12,
    isOnline: true,
    location: { area: 'Civil Lines', city: 'Ludhiana', distanceKm: 2.1 },
    gpsLocation: {
      lat: 30.9075,
      lng: 75.8360,
      area: 'Civil Lines',
      city: 'Ludhiana',
      accuracyMeters: 6,
      heading: 180,
      speedKmh: 0,
      lastUpdated: 'Just now',
    },
    isSharingLiveGps: true,
    aadhaarNumberMasked: 'XXXX-XXXX-5567',
    isVerified: false,
    todayEarnings: 0,
    totalEarnings: 0,
    walletBalance: 0,
    badge: 'Aadhaar Pending',
    upiId: 'deepak.plumber@okaxis',
    bankName: 'HDFC Bank',
    accountNumberMasked: '•••• •••• 9887',
    ifscCode: 'HDFC0001024',
  },
  {
    id: 'w-manpreet',
    name: 'Manpreet Singh',
    phone: '+91 98101 33445',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    primaryTrade: 'Carpenter',
    secondaryTrades: ['Construction Helper'],
    dailyRate: 950,
    experienceYears: 7,
    rating: 5.0,
    reviewCount: 5,
    completedJobsCount: 18,
    isOnline: true,
    location: { area: 'Gill Road', city: 'Ludhiana', distanceKm: 1.8 },
    gpsLocation: {
      lat: 30.8850,
      lng: 75.8560,
      area: 'Gill Road',
      city: 'Ludhiana',
      accuracyMeters: 4,
      heading: 30,
      speedKmh: 0,
      lastUpdated: 'Just now',
    },
    isSharingLiveGps: true,
    aadhaarNumberMasked: 'XXXX-XXXX-1123',
    isVerified: false,
    todayEarnings: 0,
    totalEarnings: 0,
    walletBalance: 0,
    badge: 'Aadhaar Pending',
    upiId: 'manpreet.carpenter@okaxis',
    bankName: 'Axis Bank',
    accountNumberMasked: '•••• •••• 3445',
    ifscCode: 'UTIB0000214',
  },
  {
    id: 'w-asif',
    name: 'Jaspreet Singh',
    phone: '+91 98101 77665',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    primaryTrade: 'Electrician',
    secondaryTrades: ['Welder'],
    dailyRate: 900,
    experienceYears: 5,
    rating: 4.9,
    reviewCount: 3,
    completedJobsCount: 11,
    isOnline: true,
    location: { area: 'Focal Point Phase 5', city: 'Ludhiana', distanceKm: 0.9 },
    gpsLocation: {
      lat: 30.8845,
      lng: 75.9120,
      area: 'Focal Point Phase 5',
      city: 'Ludhiana',
      accuracyMeters: 3,
      heading: 120,
      speedKmh: 0,
      lastUpdated: 'Just now',
    },
    isSharingLiveGps: true,
    aadhaarNumberMasked: 'XXXX-XXXX-7766',
    isVerified: false,
    todayEarnings: 0,
    totalEarnings: 0,
    walletBalance: 0,
    badge: 'Aadhaar Pending',
    upiId: 'jaspreet.electrician@paytm',
    bankName: 'ICICI Bank',
    accountNumberMasked: '•••• •••• 7665',
    ifscCode: 'ICIC0000007',
  }
];

const DEFAULT_INITIAL_VERIFICATIONS: VerificationRequest[] = [
  {
    id: 'v-101',
    workerName: 'Ramesh Kumar',
    trade: 'Mason',
    phone: '+91 98101 55678',
    aadhaarNumber: '7829-4412-9901',
    experienceYears: 6,
    submittedAt: 'Just now',
    status: 'pending',
  },
  {
    id: 'v-102',
    workerName: 'Sunil Sharma',
    trade: 'Painter',
    phone: '+91 98101 22334',
    aadhaarNumber: '6612-9901-4412',
    experienceYears: 4,
    submittedAt: '5 mins ago',
    status: 'pending',
  },
  {
    id: 'v-103',
    workerName: 'Deepak Kumar',
    trade: 'Plumber',
    phone: '+91 98101 99887',
    aadhaarNumber: '8821-3312-5567',
    experienceYears: 5,
    submittedAt: '12 mins ago',
    status: 'pending',
  },
  {
    id: 'v-104',
    workerName: 'Manpreet Singh',
    trade: 'Carpenter',
    phone: '+91 98101 33445',
    aadhaarNumber: '5521-8890-1123',
    experienceYears: 7,
    submittedAt: '30 mins ago',
    status: 'pending',
  },
  {
    id: 'v-105',
    workerName: 'Asif Ali',
    trade: 'Electrician',
    phone: '+91 98101 77665',
    aadhaarNumber: '4412-5567-7766',
    experienceYears: 5,
    submittedAt: '45 mins ago',
    status: 'pending',
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<AppRole>('select_role');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  
  // Platform collections
  const [workers, setWorkers] = useState<WorkerProfile[]>(() => {
    const saved = localStorage.getItem('dihadi_workers_zero_v6');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return DEFAULT_INITIAL_WORKERS;
  });

  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('dihadi_jobs_zero_v6');
    return saved ? JSON.parse(saved) : [];
  });

  const [verifications, setVerifications] = useState<VerificationRequest[]>(() => {
    const saved = localStorage.getItem('dihadi_verifications_zero_v6');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return DEFAULT_INITIAL_VERIFICATIONS;
  });

  const [disputes, setDisputes] = useState<DisputeItem[]>(() => {
    const saved = localStorage.getItem('dihadi_disputes_zero_v6');
    return saved ? JSON.parse(saved) : [];
  });

  // Current Logged-in Entities
  const [currentWorker, setCurrentWorker] = useState<WorkerProfile | null>(() => {
    const saved = localStorage.getItem('dihadi_current_worker_v6');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentCustomer, setCurrentCustomer] = useState<CustomerProfile | null>(() => {
    const saved = localStorage.getItem('dihadi_current_customer_v6');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentAdmin, setCurrentAdmin] = useState<AdminProfile | null>(() => {
    const saved = localStorage.getItem('dihadi_current_admin_v6');
    return saved ? JSON.parse(saved) : null;
  });

  // Registered credentials database
  const [workerAccounts, setWorkerAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('dihadi_worker_accounts_v6');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'ramesh', phone: '9810155678', password: '123', name: 'Ramesh Kumar', role: 'worker', extraData: { trade: 'Mason', rate: 850, area: 'Model Town, Ludhiana', aadhaar: '7829-4412-9901', upi: 'ramesh.mason@okaxis' } },
      { id: 'sunil', phone: '9810122334', password: '123', name: 'Sunil Sharma', role: 'worker', extraData: { trade: 'Painter', rate: 900, area: 'Sarabha Nagar, Ludhiana', aadhaar: '6612-9901-4412', upi: 'sunil.painter@paytm' } },
      { id: 'deepak', phone: '9810199887', password: '123', name: 'Deepak Kumar', role: 'worker', extraData: { trade: 'Plumber', rate: 850, area: 'Civil Lines, Ludhiana', aadhaar: '8821-3312-5567', upi: 'deepak.plumber@okaxis' } }
    ];
  });

  const [customerAccounts, setCustomerAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('dihadi_customer_accounts_v6');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'pooja', phone: '9910088221', password: '123', name: 'Pooja Verma', role: 'customer', extraData: { area: 'Model Town', address: 'House 142, Model Town, Ludhiana, Punjab', upi: 'pooja.verma@okhdfcbank' } },
      { id: 'vikram', phone: '9910077665', password: '123', name: 'Vikram Sethi', role: 'customer', extraData: { area: 'Sarabha Nagar', address: 'House 18, Block B, Sarabha Nagar, Ludhiana, Punjab', upi: 'vikram.sethi@okicici' } }
    ];
  });

  // City & Live Geolocation State
  const [currentCity, setCurrentCityState] = useState<CityInfo>(() => {
    const saved = localStorage.getItem('dihadi_current_city_v6');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      } catch (e) {}
    }
    return SUPPORTED_CITIES[0]; // Ludhiana, Punjab
  });

  const [currentResolvedAddress, setCurrentResolvedAddress] = useState<ResolvedAddress | null>(() => {
    const saved = localStorage.getItem('dihadi_resolved_address_v6');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLocating, setIsLocating] = useState(false);

  const setCurrentCity = (city: CityInfo) => {
    setCurrentCityState(city);
    localStorage.setItem('dihadi_current_city_v6', JSON.stringify(city));
    playSound('gps_ping');
    showNotification(`City set to ${city.name}, ${city.state}`);

    // Synchronize current worker location & GPS to new city
    if (currentWorker) {
      const areaCoords = getCoordinatesForArea(city.defaultArea, city.name);
      const updatedGps: GpsCoordinates = {
        ...currentWorker.gpsLocation,
        lat: areaCoords.lat,
        lng: areaCoords.lng,
        city: city.name,
        area: city.defaultArea,
        lastUpdated: 'Just now',
      };
      const updated: WorkerProfile = {
        ...currentWorker,
        location: {
          ...currentWorker.location,
          city: city.name,
          area: city.defaultArea,
        },
        gpsLocation: updatedGps,
      };
      setCurrentWorker(updated);
      setWorkers((prev) => prev.map((w) => (w.id === currentWorker.id ? updated : w)));
    }

    // Synchronize current customer location & GPS to new city
    if (currentCustomer) {
      const areaCoords = getCoordinatesForArea(city.defaultArea, city.name);
      const updatedCustomer: CustomerProfile = {
        ...currentCustomer,
        city: city.name,
        area: city.defaultArea,
        address: `${city.defaultArea}, ${city.name}, ${city.state}`,
        gpsLocation: {
          ...currentCustomer.gpsLocation,
          lat: areaCoords.lat,
          lng: areaCoords.lng,
          city: city.name,
          area: city.defaultArea,
          address: `${city.defaultArea}, ${city.name}, ${city.state}`,
          lastUpdated: 'Just now',
        },
      };
      setCurrentCustomer(updatedCustomer);
    }
  };

  /**
   * Snap to Real-World Address:
   * Combines HTML5 Geolocation with Reverse Geocoding API to pinpoint
   * exact street-level coordinates and update active city & profiles.
   */
  const snapToRealWorldAddress = async (): Promise<ResolvedAddress | null> => {
    if (!('geolocation' in navigator)) {
      showNotification('Geolocation is not supported by your browser.');
      return null;
    }

    setIsLocating(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = +pos.coords.latitude.toFixed(6);
          const lng = +pos.coords.longitude.toFixed(6);
          const accuracy = Math.round(pos.coords.accuracy) || 4;

          try {
            const resolved = await reverseGeocodeLocation(lat, lng, accuracy);
            setCurrentResolvedAddress(resolved);
            localStorage.setItem('dihadi_resolved_address_v6', JSON.stringify(resolved));

            const detectedCity = detectCityFromCoords(lat, lng);
            const activeCityInfo: CityInfo = {
              id: detectedCity.id,
              name: resolved.city || detectedCity.name,
              state: resolved.state || detectedCity.state,
              lat,
              lng,
              defaultArea: resolved.sublocality || detectedCity.defaultArea,
            };

            setCurrentCityState(activeCityInfo);
            localStorage.setItem('dihadi_current_city_v6', JSON.stringify(activeCityInfo));

            if (currentWorker) {
              updateWorkerGps({
                lat,
                lng,
                city: activeCityInfo.name,
                area: resolved.sublocality || activeCityInfo.defaultArea,
                accuracyMeters: accuracy,
                heading: pos.coords.heading ? Math.round(pos.coords.heading) : 45,
                lastUpdated: 'Just now',
              });
            }

            if (currentCustomer) {
              updateCustomerGps({
                lat,
                lng,
                city: activeCityInfo.name,
                area: resolved.sublocality || activeCityInfo.defaultArea,
                address: resolved.formattedAddress,
                accuracyMeters: accuracy,
                lastUpdated: 'Just now',
              });
            }

            setIsLocating(false);
            playSound('gps_ping');
            showNotification(`📍 Snapped to: ${resolved.formattedAddress}`);
            resolve(resolved);
          } catch (err) {
            console.error('Reverse geocode resolution failed:', err);
            setIsLocating(false);
            resolve(null);
          }
        },
        (err) => {
          console.debug('Geolocation request error or permission denied:', err);
          setIsLocating(false);
          // Fallback to active city coordinates without throwing error
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  };

  const detectAndSetLiveLocation = async (): Promise<boolean> => {
    const res = await snapToRealWorldAddress();
    return !!res;
  };

  useEffect(() => {
    detectAndSetLiveLocation();
  }, []);

  // Calling & Modal states
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [activeGpsJob, setActiveGpsJob] = useState<Job | null>(null);
  const [activeUpiPaymentJob, setActiveUpiPaymentJob] = useState<Job | null>(null);
  const [activeMultiChannelJob, setActiveMultiChannelJob] = useState<Job | null>(null);
  const [activeMultiChannelWorker, setActiveMultiChannelWorker] = useState<WorkerProfile | null>(null);
  const [activeShortlistJob, setActiveShortlistJob] = useState<Job | null>(null);
  
  // Automated Job Matching Engine state
  const [latestMatchedJob, setLatestMatchedJob] = useState<Job | null>(null);
  const [latestTop5Matches, setLatestTop5Matches] = useState<HyperlocalMatchResult[]>([]);

  const [chatNotifications, setChatNotifications] = useState<ChatNotificationItem[]>([]);
  const [pendingRoleNotifications, setPendingRoleNotifications] = useState<ChatNotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('dihadi_pending_chat_notifs_v1');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeGlobalChat, setActiveGlobalChat] = useState<{
    isOpen: boolean;
    job?: Job | null;
    targetPerson?: any;
    role?: 'worker' | 'customer' | 'admin';
  } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  const connectedCluster = {
    connectUrl: 'https://dihadi-connect.vercel.app/',
    controlUrl: 'https://dihadi-control.vercel.app/',
    workUrl: 'https://dihadi-work.vercel.app/',
  };

  // 1. Real-time Firestore synchronization for Workers
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, COLLECTIONS.WORKERS), (snapshot) => {
        if (!snapshot.empty) {
          const remoteWorkers: WorkerProfile[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as WorkerProfile;
            if (data && data.id) {
              remoteWorkers.push(data);
            }
          });
          if (remoteWorkers.length > 0) {
            setWorkers(remoteWorkers);
            setIsFirebaseConnected(true);
          }
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, COLLECTIONS.WORKERS);
      });
      return () => unsub();
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, COLLECTIONS.WORKERS);
    }
  }, []);

  // 2. Real-time Firestore synchronization for Jobs
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, COLLECTIONS.JOBS), (snapshot) => {
        if (!snapshot.empty) {
          const remoteJobs: Job[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Job;
            if (data && data.id) {
              remoteJobs.push(data);
            }
          });
          setJobs(remoteJobs);
          setIsFirebaseConnected(true);
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, COLLECTIONS.JOBS);
      });
      return () => unsub();
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, COLLECTIONS.JOBS);
    }
  }, []);

  // 3. Real-time Firestore synchronization for KYC Verifications
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, COLLECTIONS.VERIFICATIONS), (snapshot) => {
        if (!snapshot.empty) {
          const remoteVerifs: VerificationRequest[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as VerificationRequest;
            if (data && data.id) {
              remoteVerifs.push(data);
            }
          });
          setVerifications(remoteVerifs);
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, COLLECTIONS.VERIFICATIONS);
      });
      return () => unsub();
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, COLLECTIONS.VERIFICATIONS);
    }
  }, []);

  // 4. Real-time Firestore synchronization for Disputes
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, COLLECTIONS.DISPUTES), (snapshot) => {
        if (!snapshot.empty) {
          const remoteDisputes: DisputeItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as DisputeItem;
            if (data && data.id) {
              remoteDisputes.push(data);
            }
          });
          setDisputes(remoteDisputes);
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, COLLECTIONS.DISPUTES);
      });
      return () => unsub();
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, COLLECTIONS.DISPUTES);
    }
  }, []);

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem('dihadi_workers_zero_v6', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('dihadi_jobs_zero_v6', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('dihadi_verifications_zero_v6', JSON.stringify(verifications));
  }, [verifications]);

  useEffect(() => {
    localStorage.setItem('dihadi_disputes_zero_v6', JSON.stringify(disputes));
  }, [disputes]);

  useEffect(() => {
    localStorage.setItem('dihadi_worker_accounts_v6', JSON.stringify(workerAccounts));
  }, [workerAccounts]);

  useEffect(() => {
    localStorage.setItem('dihadi_customer_accounts_v6', JSON.stringify(customerAccounts));
  }, [customerAccounts]);

  useEffect(() => {
    if (currentWorker) {
      localStorage.setItem('dihadi_current_worker_v6', JSON.stringify(currentWorker));
    } else {
      localStorage.removeItem('dihadi_current_worker_v6');
    }
  }, [currentWorker]);

  // Keep currentWorker synchronized whenever workers list or verifications list updates
  useEffect(() => {
    if (!currentWorker) return;
    const cleanPhone = currentWorker.phone.replace(/[^0-9]/g, '').slice(-10);
    const cleanName = currentWorker.name.trim().toLowerCase();

    const matchedWorker = workers.find((w) => {
      if (w.id === currentWorker.id) return true;
      const wCleanPhone = w.phone.replace(/[^0-9]/g, '').slice(-10);
      return (wCleanPhone && cleanPhone && wCleanPhone === cleanPhone) ||
             w.name.trim().toLowerCase() === cleanName;
    });

    const matchedVerification = verifications.find((v) => {
      const vCleanPhone = v.phone.replace(/[^0-9]/g, '').slice(-10);
      return (vCleanPhone && cleanPhone && vCleanPhone === cleanPhone) ||
             v.workerName.trim().toLowerCase() === cleanName;
    });

    const isVerifiedNow = matchedWorker ? matchedWorker.isVerified : (matchedVerification?.status === 'approved');
    const targetBadge = isVerifiedNow ? 'Aadhaar Verified' : (matchedWorker?.badge || (matchedVerification?.status === 'pending' ? 'KYC Under Review' : 'Registered Worker'));

    if (currentWorker.isVerified !== isVerifiedNow || currentWorker.badge !== targetBadge) {
      setCurrentWorker((curr) => curr ? {
        ...curr,
        isVerified: isVerifiedNow,
        badge: targetBadge
      } : null);
    }
  }, [workers, verifications]);

  // Ensure worker & customer location stay strictly aligned with city & GPS
  useEffect(() => {
    if (currentWorker) {
      const lat = currentWorker.gpsLocation?.lat;
      const lng = currentWorker.gpsLocation?.lng;
      const currentCityName = currentCity?.name || 'Ludhiana';
      const isLudhiana = currentCityName.toLowerCase().includes('ludhiana');
      
      const isStaleDelhi = currentWorker.location?.city?.toLowerCase().includes('delhi') ||
                           currentWorker.location?.area?.toLowerCase().includes('okhla') ||
                           currentWorker.gpsLocation?.city?.toLowerCase().includes('delhi') ||
                           currentWorker.gpsLocation?.area?.toLowerCase().includes('okhla');

      if (isLudhiana && isStaleDelhi) {
        const area = currentCity.defaultArea || 'Model Town';
        const coords = getCoordinatesForArea(area, 'Ludhiana');
        const updatedGps: GpsCoordinates = {
          ...currentWorker.gpsLocation,
          lat: lat && lat > 30 && lat < 32 ? lat : coords.lat,
          lng: lng && lng > 74 && lng < 77 ? lng : coords.lng,
          city: 'Ludhiana',
          area: area,
          lastUpdated: 'Just now',
        };
        const updated: WorkerProfile = {
          ...currentWorker,
          location: {
            ...currentWorker.location,
            city: 'Ludhiana',
            area: area,
          },
          gpsLocation: updatedGps,
        };
        setCurrentWorker(updated);
        setWorkers((prev) => prev.map((w) => (w.id === currentWorker.id ? updated : w)));
      }
    }
  }, [currentCity]);

  useEffect(() => {
    if (currentCustomer) {
      localStorage.setItem('dihadi_current_customer_v6', JSON.stringify(currentCustomer));
    } else {
      localStorage.removeItem('dihadi_current_customer_v6');
    }
  }, [currentCustomer]);

  useEffect(() => {
    if (currentAdmin) {
      localStorage.setItem('dihadi_current_admin_v6', JSON.stringify(currentAdmin));
    } else {
      localStorage.removeItem('dihadi_current_admin_v6');
    }
  }, [currentAdmin]);

  const showNotification = (msgOrTitle: string, maybeMessage?: string) => {
    const formatted = maybeMessage ? `${msgOrTitle}: ${maybeMessage}` : msgOrTitle;
    setNotification(formatted);
    setTimeout(() => {
      setNotification((curr) => (curr === formatted ? null : curr));
    }, 4500);
  };

  const speak = (text: string) => {
    speakText(text, currentLanguage);
  };

  // Calling handlers
  const startCall = (
    caller: { name: string; role: 'worker' | 'customer' | 'admin'; phone: string },
    receiver: { name: string; role: 'worker' | 'customer' | 'admin'; phone: string },
    jobTitle?: string
  ) => {
    const session: CallSession = {
      id: `call-${Date.now().toString().slice(-4)}`,
      callerName: caller.name,
      callerRole: caller.role,
      callerPhone: caller.phone,
      receiverName: receiver.name,
      receiverRole: receiver.role,
      receiverPhone: receiver.phone,
      jobTitle,
      status: 'calling',
      startedAt: Date.now(),
      durationSeconds: 0,
      isMuted: false,
      isSpeaker: true,
    };
    setActiveCall(session);
    showNotification(`📞 Calling ${receiver.name}...`);
  };

  const endCall = () => {
    setActiveCall(null);
  };

  const openGpsRadar = (job: Job) => {
    setActiveGpsJob(job);
    playSound('gps_ping');
  };

  const closeGpsRadar = () => {
    setActiveGpsJob(null);
  };

  const openUpiPayment = (job: Job) => {
    setActiveUpiPaymentJob(job);
    playSound('click');
  };

  const closeUpiPayment = () => {
    setActiveUpiPaymentJob(null);
  };

  const openMultiChannelModal = (job: Job, worker?: WorkerProfile) => {
    setActiveMultiChannelJob(job);
    const target = worker || (job.assignedWorkerId ? workers.find(w => w.id === job.assignedWorkerId) : null) || workers[0] || currentWorker;
    setActiveMultiChannelWorker(target || null);
    playSound('incoming_job');
  };

  const closeMultiChannelModal = () => {
    setActiveMultiChannelJob(null);
    setActiveMultiChannelWorker(null);
  };

  const openTop5Shortlist = (job: Job) => {
    setActiveShortlistJob(job);
    playSound('click');
  };

  const closeTop5Shortlist = () => {
    setActiveShortlistJob(null);
  };

  // Automated Job Matching Engine Helpers
  const getTop5WorkersForJob = (jobOrCriteria: Job | { trade: TradeType; jobGps?: GpsCoordinates; lat?: number; lng?: number; area?: string; dailyWage?: number; maxRadiusKm?: number }): HyperlocalMatchResult[] => {
    const jobLat = (jobOrCriteria as Job).jobGps?.lat ?? (jobOrCriteria as any).lat ?? currentCustomer?.gpsLocation.lat ?? currentCity.lat;
    const jobLng = (jobOrCriteria as Job).jobGps?.lng ?? (jobOrCriteria as any).lng ?? currentCustomer?.gpsLocation.lng ?? currentCity.lng;
    const maxRadius = (jobOrCriteria as any).maxRadiusKm || 10.0;

    return getTop5Shortlist(workers, {
      trade: jobOrCriteria.trade,
      lat: jobLat,
      lng: jobLng,
      maxRadiusKm: maxRadius,
      budget: (jobOrCriteria as any).dailyWage,
      language: currentLanguage,
    });
  };

  const matchJobWithWorkers = (job: Job) => {
    const jobLat = job.jobGps?.lat || currentCustomer?.gpsLocation.lat || currentCity.lat;
    const jobLng = job.jobGps?.lng || currentCustomer?.gpsLocation.lng || currentCity.lng;

    const allMatches = matchHyperlocalWorkers(workers, {
      trade: job.trade,
      lat: jobLat,
      lng: jobLng,
      maxRadiusKm: 10.0,
      budget: job.dailyWage,
      language: currentLanguage,
    });

    const top5 = allMatches.slice(0, 5);
    return {
      matches: top5,
      totalEligible: allMatches.length,
      topMatch: top5.length > 0 ? top5[0] : null,
    };
  };

  const clearMatchedSuggestions = () => {
    setLatestMatchedJob(null);
    setLatestTop5Matches([]);
  };

  // Real-time Chat Notifications System
  const triggerChatNotification = (item: ChatNotificationItem) => {
    const targetRecipientRole = (item.recipientRole || 'customer').toLowerCase();
    const activeRole = (currentRole || '').toLowerCase();

    // Only display popup if the user is currently viewing the recipient's screen
    if (activeRole === targetRecipientRole) {
      setChatNotifications((prev) => {
        const filtered = prev.filter((p) => p.id !== item.id);
        return [item, ...filtered].slice(0, 3);
      });
      playSound('message');
    } else {
      // Otherwise store in pending queue so it pops up when the user switches to the recipient side!
      setPendingRoleNotifications((prev) => {
        const updated = [item, ...prev.filter((p) => p.id !== item.id)].slice(0, 10);
        try {
          localStorage.setItem('dihadi_pending_chat_notifs_v1', JSON.stringify(updated));
        } catch (err) {}
        return updated;
      });
    }
  };

  const dismissChatNotification = (id: string) => {
    setChatNotifications((prev) => prev.filter((item) => item.id !== id));
    setPendingRoleNotifications((prev) => {
      const remaining = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('dihadi_pending_chat_notifs_v1', JSON.stringify(remaining));
      } catch (err) {}
      return remaining;
    });
  };

  // Check and display pending notifications when the user switches role
  useEffect(() => {
    if (!currentRole || currentRole === 'select_role') return;
    const activeRole = currentRole.toLowerCase();

    setPendingRoleNotifications((prev) => {
      const matching = prev.filter(
        (item) => (item.recipientRole || '').toLowerCase() === activeRole
      );

      if (matching.length > 0) {
        setChatNotifications((curr) => {
          const combined = [...matching, ...curr];
          const unique = Array.from(new Map(combined.map((m) => [m.id, m])).values()).slice(0, 3);
          return unique;
        });
        playSound('message');

        const remaining = prev.filter(
          (item) => (item.recipientRole || '').toLowerCase() !== activeRole
        );
        try {
          localStorage.setItem('dihadi_pending_chat_notifs_v1', JSON.stringify(remaining));
        } catch (err) {}
        return remaining;
      }
      return prev;
    });
  }, [currentRole]);

  const openGlobalChat = (
    job?: Job | null,
    targetPerson?: any,
    role?: 'worker' | 'customer' | 'admin'
  ) => {
    setActiveGlobalChat({
      isOpen: true,
      job: job || null,
      targetPerson: targetPerson || null,
      role:
        role ||
        (currentRole === 'customer'
          ? 'customer'
          : currentRole === 'worker'
          ? 'worker'
          : 'customer'),
    });
    playSound('click');
  };

  const closeGlobalChat = () => {
    setActiveGlobalChat(null);
  };

  // Listen globally to all chat message dispatch events (worker, customer, or admin)
  useEffect(() => {
    const handleGlobalChatMsgEvent = (e: any) => {
      const detail = e.detail;
      if (!detail) return;

      const notifItem: ChatNotificationItem = {
        id: detail.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        senderRole: detail.senderRole || 'worker',
        senderName: detail.senderName || 'Contact',
        senderPhone: detail.senderPhone || '+91 98100 00000',
        recipientRole: detail.recipientRole || 'customer',
        recipientName: detail.recipientName || 'You',
        text: detail.text || 'New message received',
        timestamp: detail.timestamp || 'Just now',
        jobTitle: detail.jobTitle,
        jobId: detail.jobId,
        job: detail.job,
        targetPerson: detail.targetPerson,
        isSender: false,
      };

      triggerChatNotification(notifItem);
    };

    window.addEventListener('dihadi_chat_message_event', handleGlobalChatMsgEvent);
    return () => {
      window.removeEventListener('dihadi_chat_message_event', handleGlobalChatMsgEvent);
    };
  }, [currentRole]);

  // Completely Reset All Data to ZERO
  const resetToZero = () => {
    localStorage.clear();
    setWorkers([]);
    setJobs([]);
    setVerifications([]);
    setDisputes([]);
    setCurrentWorker(null);
    setCurrentCustomer(null);
    setCurrentAdmin(null);
    setActiveCall(null);
    setActiveGpsJob(null);
    setActiveUpiPaymentJob(null);
    setCurrentRole('select_role');
    playSound('click');
    showNotification('Platform reset: 0 workers, 0 customers, 0 jobs, 0 admins.');
  };

  // Seed sample demo data if explicitly requested
  const seedSampleData = () => {
    const demoWorker: WorkerProfile = {
      id: 'w-demo-1',
      name: 'Ramesh Kumar',
      phone: '+91 98101 55678',
      avatar: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=150&auto=format&fit=crop&q=80',
      primaryTrade: 'Mason',
      secondaryTrades: ['Tile Worker'],
      dailyRate: 850,
      experienceYears: 6,
      rating: 5.0,
      reviewCount: 1,
      completedJobsCount: 0,
      isOnline: true,
      location: {
        area: 'Model Town',
        city: 'Ludhiana',
        distanceKm: 1.2,
      },
      gpsLocation: {
        lat: 30.8926,
        lng: 75.8415,
        area: 'Model Town',
        city: 'Ludhiana',
        accuracyMeters: 4,
        heading: 45,
        speedKmh: 0,
        lastUpdated: 'Just now',
      },
      isSharingLiveGps: true,
      aadhaarNumberMasked: 'XXXX-XXXX-9901',
      isVerified: true,
      todayEarnings: 0,
      totalEarnings: 0,
      walletBalance: 0,
      badge: 'Verified Mason',
      upiId: 'ramesh.mason@okaxis',
      bankName: 'State Bank of India',
      accountNumberMasked: '•••• •••• 4819',
      ifscCode: 'SBIN0004921',
    };

    const demoCustomer: CustomerProfile = {
      id: 'c-demo-1',
      name: 'Pooja Verma',
      phone: '+91 99100 88221',
      area: 'Model Town',
      city: 'Ludhiana',
      address: 'House 142, Model Town, Ludhiana, Punjab',
      gpsLocation: {
        lat: 30.8950,
        lng: 75.8430,
        area: 'Model Town',
        city: 'Ludhiana',
        address: 'House 142, Model Town, Ludhiana, Punjab',
      },
      upiId: 'pooja.verma@okhdfcbank',
    };

    const demoAdmin: AdminProfile = {
      id: 'adm-demo-1',
      name: 'Dihadi Operations',
      email: 'ops@dihadi.co',
      role: 'Super Admin',
    };

    setWorkers([demoWorker]);
    setCurrentWorker(demoWorker);
    setCurrentCustomer(demoCustomer);
    setCurrentAdmin(demoAdmin);

    const demoJob: Job = {
      id: 'job-demo-101',
      title: 'Wall Plastering & Brick Repair',
      trade: 'Mason',
      description: 'Daily boundary wall brickwork and plastering.',
      customerName: 'Pooja Verma',
      customerPhone: '+91 99100 88221',
      locationAddress: 'House 142, Model Town, Ludhiana, Punjab',
      area: 'Model Town',
      distanceKm: 1.2,
      jobGps: {
        lat: 30.8950,
        lng: 75.8430,
        area: 'Model Town',
        city: 'Ludhiana',
        address: 'House 142, Model Town, Ludhiana, Punjab',
      },
      dailyWage: 850,
      durationDays: 1,
      status: 'broadcast',
      otpCode: '4829',
      postedAt: 'Just now',
      platformFee: 170,
      workerPayout: 680,
      isPaid: false,
      assignedWorkerUpi: 'ramesh.mason@okaxis',
    };

    setJobs([demoJob]);
    setVerifications([
      {
        id: 'v-demo-1',
        workerName: 'Ramesh Kumar',
        trade: 'Mason',
        phone: '+91 98101 55678',
        aadhaarNumber: '7829-4412-9901',
        experienceYears: 6,
        submittedAt: 'Just now',
        status: 'approved',
      },
    ]);

    playSound('success');
    showNotification('Demo test environment created with UPI & GPS active.');
  };

  // Worker Login with Auth (ID & Password)
  const loginWorkerWithAuth = (userIdOrPhone: string, password: string): { success: boolean; error?: string } => {
    const cleanInput = userIdOrPhone.trim().toLowerCase();
    const cleanNumeric = userIdOrPhone.replace(/[^0-9]/g, '');

    const found = workerAccounts.find((acc) => 
      acc.id.toLowerCase() === cleanInput || 
      acc.phone.replace(/[^0-9]/g, '') === cleanNumeric ||
      acc.phone === userIdOrPhone.trim()
    );

    if (!found) {
      // Auto-fallback demo match
      if (cleanInput === 'ramesh' || cleanNumeric.endsWith('55678')) {
        loginWorker({
          name: 'Ramesh Kumar',
          phone: '+91 98101 55678',
          primaryTrade: 'Mason',
          dailyRate: 850,
          experienceYears: 6,
          area: `${currentCity?.defaultArea || 'Model Town'}, ${currentCity?.name || 'Ludhiana'}`,
          aadhaarNumber: '7829-4412-9901',
          upiId: 'ramesh.mason@okaxis',
        });
        return { success: true };
      }
      return { success: false, error: 'Worker ID not found. Please register or check details.' };
    }

    if (found.password && found.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Login worker profile
    const extra = found.extraData || {};
    loginWorker({
      name: found.name,
      phone: found.phone,
      primaryTrade: extra.trade || 'Mason',
      dailyRate: extra.rate || 850,
      experienceYears: extra.exp || 4,
      area: extra.area || `${currentCity?.defaultArea || 'Model Town'}, ${currentCity?.name || 'Ludhiana'}`,
      aadhaarNumber: extra.aadhaar || '7829-4412-9901',
      upiId: extra.upi || `${found.id}@upi`,
    });

    return { success: true };
  };

  // Register Worker with Auth
  const registerWorkerWithAuth = (data: {
    userId: string;
    password: string;
    name: string;
    phone: string;
    email?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    primaryTrade: TradeType;
    dailyRate: number;
    experienceYears: number;
    area: string;
    aadhaarNumber: string;
    upiId?: string;
  }) => {
    const newAcc: UserAccount = {
      id: data.userId.trim().toLowerCase() || data.phone.replace(/[^0-9]/g, ''),
      password: data.password || '123',
      name: data.name,
      phone: data.phone,
      role: 'worker',
      extraData: {
        trade: data.primaryTrade,
        rate: data.dailyRate,
        exp: data.experienceYears,
        area: data.area,
        aadhaar: data.aadhaarNumber,
        upi: data.upiId,
        email: data.email,
        isPhoneVerified: data.isPhoneVerified,
        isEmailVerified: data.isEmailVerified,
      }
    };
    setWorkerAccounts((prev) => [...prev.filter(a => a.id !== newAcc.id), newAcc]);

    loginWorker({
      name: data.name,
      phone: data.phone,
      email: data.email,
      isPhoneVerified: data.isPhoneVerified,
      isEmailVerified: data.isEmailVerified,
      primaryTrade: data.primaryTrade,
      dailyRate: data.dailyRate,
      experienceYears: data.experienceYears,
      area: data.area,
      aadhaarNumber: data.aadhaarNumber,
      upiId: data.upiId,
    });
  };

  // Worker Login / Register helper
  const loginWorker = (data: {
    name: string;
    phone: string;
    email?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    primaryTrade: TradeType;
    dailyRate: number;
    experienceYears: number;
    area: string;
    aadhaarNumber: string;
    upiId?: string;
  }) => {
    const maskedAadhaar = `XXXX-XXXX-${data.aadhaarNumber.slice(-4) || '1234'}`;
    const cleanPhone = data.phone.replace(/[^0-9]/g, '').slice(-10) || '9810155678';
    const fallbackUpi = data.upiId || `${data.name.toLowerCase().replace(/\s+/g, '.') || 'worker'}@upi`;

    // Check if worker already exists in workers list
    const existingWorker = workers.find((w) => {
      const wClean = w.phone.replace(/[^0-9]/g, '').slice(-10);
      return (wClean && wClean === cleanPhone) || w.name.trim().toLowerCase() === data.name.trim().toLowerCase();
    });

    // Check if verification record already exists
    const existingVerification = verifications.find((v) => {
      const vClean = v.phone.replace(/[^0-9]/g, '').slice(-10);
      return (vClean && vClean === cleanPhone) || v.workerName.trim().toLowerCase() === data.name.trim().toLowerCase();
    });

    const isAlreadyVerified = existingWorker?.isVerified || existingVerification?.status === 'approved';
    const areaCoords = getCoordinatesForArea(data.area || currentCity?.defaultArea || 'Model Town', currentCity?.name);

    const activeWorker: WorkerProfile = {
      id: existingWorker?.id || `w-${Date.now().toString().slice(-4)}`,
      name: data.name,
      phone: data.phone,
      email: data.email || existingWorker?.email || `${data.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      isPhoneVerified: data.isPhoneVerified ?? (existingWorker?.isPhoneVerified ?? true),
      isEmailVerified: data.isEmailVerified ?? (existingWorker?.isEmailVerified ?? true),
      avatar: existingWorker?.avatar || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=150&auto=format&fit=crop&q=80',
      primaryTrade: data.primaryTrade,
      secondaryTrades: existingWorker?.secondaryTrades || ['Construction Helper'],
      dailyRate: data.dailyRate || existingWorker?.dailyRate || 850,
      experienceYears: data.experienceYears || existingWorker?.experienceYears || 3,
      rating: existingWorker ? existingWorker.rating : 0,
      reviewCount: existingWorker ? existingWorker.reviewCount : 0,
      completedJobsCount: existingWorker ? existingWorker.completedJobsCount : 0,
      isOnline: true,
      location: {
        area: data.area || existingWorker?.location.area || currentCity?.defaultArea || 'Model Town',
        city: currentCity?.name || 'Ludhiana',
        distanceKm: existingWorker?.location.distanceKm || 1.0,
      },
      gpsLocation: existingWorker?.gpsLocation || {
        lat: areaCoords.lat + (Math.random() - 0.5) * 0.01,
        lng: areaCoords.lng + (Math.random() - 0.5) * 0.01,
        area: data.area || areaCoords.area,
        city: currentCity?.name || 'Ludhiana',
        accuracyMeters: 4,
        heading: 60,
        speedKmh: 0,
        lastUpdated: 'Just now',
      },
      isSharingLiveGps: true,
      aadhaarNumberMasked: maskedAadhaar,
      isVerified: isAlreadyVerified,
      todayEarnings: existingWorker?.todayEarnings || 0,
      totalEarnings: existingWorker?.totalEarnings || 0,
      walletBalance: existingWorker?.walletBalance || 0,
      badge: isAlreadyVerified ? 'Aadhaar Verified' : 'Registered Worker',
      upiId: fallbackUpi,
      bankName: existingWorker?.bankName || 'State Bank of India',
      accountNumberMasked: existingWorker?.accountNumberMasked || `•••• •••• ${cleanPhone.slice(-4)}`,
      ifscCode: existingWorker?.ifscCode || 'SBIN0004921',
    };

    setCurrentWorker(activeWorker);
    setWorkers((prev) => [
      activeWorker,
      ...prev.filter((w) => {
        const wClean = w.phone.replace(/[^0-9]/g, '').slice(-10);
        return !(wClean && wClean === cleanPhone) && w.name.trim().toLowerCase() !== data.name.trim().toLowerCase();
      })
    ]);

    // Handle Admin Verification queue
    if (!existingVerification) {
      const newVerification: VerificationRequest = {
        id: `v-${Date.now().toString().slice(-4)}`,
        workerName: data.name,
        trade: data.primaryTrade,
        phone: data.phone,
        aadhaarNumber: data.aadhaarNumber || '7829-4412-9901',
        experienceYears: data.experienceYears || 3,
        submittedAt: 'Just now',
        status: isAlreadyVerified ? 'approved' : 'pending',
      };
      setVerifications((prev) => [newVerification, ...prev]);
      syncVerificationToFirestore(newVerification);
    }

    syncWorkerToFirestore(activeWorker);
    playSound('success');
    showNotification(`Welcome ${data.name}! Worker Portal Active.`);
  };

  const logoutWorker = () => {
    setCurrentWorker(null);
    playSound('click');
    showNotification('Worker logged out.');
  };

  // Update Worker UPI handle
  const updateWorkerUpi = (upiId: string, bankName?: string, ifscCode?: string) => {
    if (!currentWorker) return;
    const updated: WorkerProfile = {
      ...currentWorker,
      upiId: upiId.trim(),
      bankName: bankName || currentWorker.bankName,
      ifscCode: ifscCode || currentWorker.ifscCode,
    };
    setCurrentWorker(updated);
    setWorkers((prev) => prev.map((w) => (w.id === currentWorker.id ? updated : w)));
    syncWorkerToFirestore(updated);
    playSound('success');
    showNotification(`Worker UPI updated to: ${upiId}`);
  };

  // Update Worker GPS location
  const updateWorkerGps = (coords: Partial<GpsCoordinates>) => {
    if (!currentWorker) return;

    let resolvedCity = coords.city || currentWorker.gpsLocation?.city || currentWorker.location?.city || currentCity.name;
    let resolvedArea = coords.area || currentWorker.gpsLocation?.area || currentWorker.location?.area || currentCity.defaultArea;

    if (coords.lat && coords.lng) {
      const detectedCity = detectCityFromCoords(coords.lat, coords.lng);
      if (!coords.city || (resolvedCity.toLowerCase().includes('delhi') && detectedCity.id === 'ludhiana')) {
        resolvedCity = detectedCity.name;
        if (!coords.area || resolvedArea.toLowerCase().includes('okhla')) {
          resolvedArea = detectedCity.defaultArea;
        }
      }
    }

    const updatedGps: GpsCoordinates = {
      ...currentWorker.gpsLocation,
      ...coords,
      city: resolvedCity,
      area: resolvedArea,
      lastUpdated: 'Just now',
    };
    const updated: WorkerProfile = { 
      ...currentWorker, 
      location: {
        ...currentWorker.location,
        area: resolvedArea,
        city: resolvedCity,
      },
      gpsLocation: updatedGps 
    };
    setCurrentWorker(updated);
    setWorkers((prev) => prev.map((w) => (w.id === currentWorker.id ? updated : w)));
    syncWorkerToFirestore(updated);
  };

  // Toggle online/offline for current worker
  const toggleWorkerStatus = () => {
    if (!currentWorker) return;
    const nextState = !currentWorker.isOnline;
    const updated = { ...currentWorker, isOnline: nextState };
    setCurrentWorker(updated);
    setWorkers((prev) => prev.map((w) => (w.id === currentWorker.id ? updated : w)));
    syncWorkerToFirestore(updated);
    playSound('click');
    if (nextState) {
      showNotification(`${currentWorker.name} is ONLINE.`);
    } else {
      showNotification(`${currentWorker.name} is OFFLINE.`);
    }
  };

  // Update Worker Profile Photo / Avatar
  const updateWorkerAvatar = (avatarUrl: string) => {
    if (!currentWorker) return;
    const updated: WorkerProfile = {
      ...currentWorker,
      avatar: avatarUrl,
    };
    setCurrentWorker(updated);
    setWorkers((prev) => prev.map((w) => (w.id === currentWorker.id ? updated : w)));
    syncWorkerToFirestore(updated);
    playSound('success');
    showNotification('Worker profile photo updated successfully.');
  };

  // Update arbitrary Worker Profile properties
  const updateWorkerProfile = (updates: Partial<WorkerProfile>) => {
    if (!currentWorker) return;
    const updated: WorkerProfile = {
      ...currentWorker,
      ...updates,
    };
    setCurrentWorker(updated);
    setWorkers((prev) => prev.map((w) => (w.id === currentWorker.id ? updated : w)));
    syncWorkerToFirestore(updated);
    playSound('success');
  };

  // Customer Login with Auth (ID & Password)
  const loginCustomerWithAuth = (userIdOrPhone: string, password: string): { success: boolean; error?: string } => {
    const cleanInput = userIdOrPhone.trim().toLowerCase();
    const cleanNumeric = userIdOrPhone.replace(/[^0-9]/g, '');

    const found = customerAccounts.find((acc) => 
      acc.id.toLowerCase() === cleanInput || 
      acc.phone.replace(/[^0-9]/g, '') === cleanNumeric ||
      acc.phone === userIdOrPhone.trim()
    );

    if (!found) {
      if (cleanInput === 'pooja' || cleanNumeric.endsWith('88221')) {
        loginCustomer({
          name: 'Pooja Verma',
          phone: '+91 99100 88221',
          area: currentCity?.defaultArea || 'Model Town',
          address: `House 142, ${currentCity?.defaultArea || 'Model Town'}, ${currentCity?.name || 'Ludhiana'}, ${currentCity?.state || 'Punjab'}`,
          upiId: 'pooja.verma@okhdfcbank',
        });
        return { success: true };
      }
      return { success: false, error: 'Customer ID not found. Please register or check details.' };
    }

    if (found.password && found.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const extra = found.extraData || {};
    loginCustomer({
      name: found.name,
      phone: found.phone,
      area: extra.area || currentCity?.defaultArea || 'Model Town',
      address: extra.address || `${extra.area || currentCity?.defaultArea || 'Model Town'}, ${currentCity?.name || 'Ludhiana'}`,
      upiId: extra.upi || `${found.id}@upi`,
    });

    return { success: true };
  };

  // Register Customer with Auth
  const registerCustomerWithAuth = (data: {
    userId: string;
    password: string;
    name: string;
    phone: string;
    email?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    area: string;
    address: string;
    upiId?: string;
  }) => {
    const newAcc: UserAccount = {
      id: data.userId.trim().toLowerCase() || data.phone.replace(/[^0-9]/g, ''),
      password: data.password || '123',
      name: data.name,
      phone: data.phone,
      role: 'customer',
      extraData: {
        area: data.area,
        address: data.address,
        upi: data.upiId,
        email: data.email,
        isPhoneVerified: data.isPhoneVerified,
        isEmailVerified: data.isEmailVerified,
      }
    };
    setCustomerAccounts((prev) => [...prev.filter(a => a.id !== newAcc.id), newAcc]);

    loginCustomer({
      name: data.name,
      phone: data.phone,
      email: data.email,
      isPhoneVerified: data.isPhoneVerified,
      isEmailVerified: data.isEmailVerified,
      area: data.area,
      address: data.address,
      upiId: data.upiId,
    });
  };

  // Customer Login / Register helper
  const loginCustomer = (data: {
    name: string;
    phone: string;
    email?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    area: string;
    address: string;
    upiId?: string;
  }) => {
    const areaCoords = getCoordinatesForArea(data.area || data.address || currentCity?.defaultArea || 'Model Town', currentCity?.name);
    const customer: CustomerProfile = {
      id: `c-${Date.now().toString().slice(-4)}`,
      name: data.name,
      phone: data.phone,
      email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      isPhoneVerified: data.isPhoneVerified ?? true,
      isEmailVerified: data.isEmailVerified ?? true,
      area: data.area || currentCity?.defaultArea || 'Model Town',
      city: currentCity?.name || 'Ludhiana',
      address: data.address || `${data.area || currentCity?.defaultArea || 'Model Town'}, ${currentCity?.name || 'Ludhiana'}`,
      gpsLocation: {
        lat: areaCoords.lat,
        lng: areaCoords.lng,
        area: data.area || areaCoords.area,
        city: currentCity?.name || 'Ludhiana',
        address: data.address,
        accuracyMeters: 4,
        lastUpdated: 'Just now',
      },
      upiId: data.upiId || `${data.name.toLowerCase().replace(/\s+/g, '.')}@okhdfcbank`,
    };
    setCurrentCustomer(customer);
    playSound('success');
    showNotification(`Welcome ${data.name}! Employer Portal Active.`);
  };

  const logoutCustomer = () => {
    setCurrentCustomer(null);
    playSound('click');
    showNotification('Employer logged out.');
  };

  const updateCustomerGps = (coords: Partial<GpsCoordinates>) => {
    if (!currentCustomer) return;
    const updated: CustomerProfile = {
      ...currentCustomer,
      gpsLocation: {
        ...currentCustomer.gpsLocation,
        ...coords,
        lastUpdated: 'Just now',
      },
    };
    setCurrentCustomer(updated);
  };

  const refreshCustomerGpsLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateCustomerGps({
            lat: +pos.coords.latitude.toFixed(4),
            lng: +pos.coords.longitude.toFixed(4),
            accuracyMeters: Math.round(pos.coords.accuracy) || 4,
            lastUpdated: 'Just now',
          });
          playSound('gps_ping');
          showNotification('Employer GPS calibrated with live device coordinates!');
        },
        () => {
          if (currentCustomer) {
            const coords = getCoordinatesForArea(currentCustomer.area);
            updateCustomerGps({
              lat: coords.lat,
              lng: coords.lng,
              accuracyMeters: 4,
              lastUpdated: 'Just now',
            });
          }
          playSound('gps_ping');
          showNotification('GPS calibrated to local area coordinates.');
        },
        { enableHighAccuracy: true, timeout: 4000 }
      );
    }
  };

  // Admin Login with Auth
  const loginAdminWithAuth = (adminIdOrEmail: string, password: string): { success: boolean; error?: string } => {
    const clean = adminIdOrEmail.trim().toLowerCase();
    if (clean === 'admin' || clean === 'ops@dihadi.co' || clean === 'admin@dihadi.co' || clean.includes('ops')) {
      if (password && password !== 'admin' && password !== 'admin123' && password !== '123') {
        return { success: false, error: 'Incorrect Admin password.' };
      }
      loginAdmin({
        name: 'Dihadi Operations Admin',
        email: 'ops@dihadi.co',
      });
      return { success: true };
    }
    // Allow custom admin username with password
    loginAdmin({
      name: adminIdOrEmail,
      email: `${clean.replace(/\s+/g, '')}@dihadi.co`,
    });
    return { success: true };
  };

  // Admin Login helper
  const loginAdmin = (data: { name: string; email: string }) => {
    const admin: AdminProfile = {
      id: `adm-${Date.now().toString().slice(-4)}`,
      name: data.name || 'Dihadi Operations Admin',
      email: data.email || 'ops@dihadi.co',
      role: 'Operations Lead',
    };
    setCurrentAdmin(admin);
    playSound('success');
    showNotification('Admin logged in to Operations Dashboard.');
  };

  const logoutAdmin = () => {
    setCurrentAdmin(null);
    playSound('click');
    showNotification('Admin logged out.');
  };

  // Employer posts a job
  const postJob = (jobData: {
    title: string;
    trade: TradeType;
    description: string;
    customerName: string;
    customerPhone: string;
    locationAddress: string;
    area: string;
    dailyWage: number;
    durationDays: number;
  }) => {
    const daily = Number(jobData.dailyWage) || 850;
    const days = Number(jobData.durationDays) || 1;
    const totalGross = daily * days;
    const platformFee = Math.round(totalGross * 0.20);
    const workerPayout = totalGross - platformFee;

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const areaCoords = getCoordinatesForArea(jobData.area || jobData.locationAddress || currentCity?.defaultArea || 'Model Town', currentCity?.name);
    
    // Calculate realistic distance to current worker if present
    const workerGps = currentWorker?.gpsLocation || { lat: currentCity?.lat || 30.8926, lng: currentCity?.lng || 75.8415 };
    const calculatedDist = calculateDistanceKm(workerGps.lat, workerGps.lng, areaCoords.lat, areaCoords.lng);

    const newJob: Job = {
      id: `job-${Date.now().toString().slice(-4)}`,
      title: jobData.title,
      trade: jobData.trade,
      description: jobData.description,
      customerName: jobData.customerName,
      customerPhone: jobData.customerPhone,
      locationAddress: jobData.locationAddress,
      area: jobData.area,
      distanceKm: Math.max(0.4, calculatedDist),
      jobGps: {
        lat: areaCoords.lat,
        lng: areaCoords.lng,
        area: jobData.area || areaCoords.area,
        city: currentCity?.name || 'Ludhiana',
        address: jobData.locationAddress,
        accuracyMeters: 4,
        lastUpdated: 'Just now',
      },
      dailyWage: daily,
      durationDays: days,
      status: 'broadcast',
      otpCode,
      postedAt: 'Just now',
      platformFee,
      workerPayout,
      isPaid: false,
    };

    setJobs((prev) => [newJob, ...prev]);
    syncJobToFirestore(newJob);
    playSound('incoming_job');

    // === AUTOMATED JOB MATCHING ENGINE ===
    // Automatically match and suggest the top 5 most compatible workers based on Trade skills, 10km GPS Proximity, Rating, and Live Availability
    const matchResult = matchJobWithWorkers(newJob);
    const topMatches = matchResult.matches;
    setLatestMatchedJob(newJob);
    setLatestTop5Matches(topMatches);

    if (topMatches.length > 0) {
      const topPick = topMatches[0];
      showNotification(
        '🎯 Top 5 Matches Suggested!',
        `Matched ${topMatches.length} verified ${newJob.trade}s nearby. Top pick: ${topPick.worker.name} (${topPick.matchScore}% Match, ${topPick.distanceKm}km away, ${topPick.worker.rating}★)`
      );
      // Spoken voice assistant feedback
      speak(`New ${newJob.trade} job posted. Top 5 compatible workers suggested near ${newJob.area}.`);
    } else {
      showNotification(`New ${newJob.trade} job broadcasted. OTP: ${otpCode}`);
    }

    // Auto-dispatch Start OTP to customer email & phone
    dispatchJobStartOtp(newJob);
    return newJob;
  };

  // Dispatch Job Start OTP to Customer Email & Phone
  const dispatchJobStartOtp = async (job: Job, targetEmail?: string, targetPhone?: string): Promise<boolean> => {
    const email = targetEmail || currentCustomer?.email || 'bhavnoorsinghkochar@gmail.com';
    const phone = targetPhone || currentCustomer?.phone || '+91 99100 88221';

    playSound('gps_ping');

    // Trigger system notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('🔑 Worker Verification Start OTP', {
          body: `Start Passcode: ${job.otpCode} for ${job.title}. Share with worker upon arrival.`,
          icon: '/icon.png'
        });
      } catch (e) {}
    }

    try {
      const res = await sendOtpToGmail({
        recipient: email,
        code: job.otpCode,
        purpose: 'job_start_otp',
        jobTitle: job.title,
        trade: job.trade,
        workerName: job.assignedWorkerName || 'Assigned Worker',
        customerName: job.customerName || currentCustomer?.name || 'Customer',
        location: job.locationAddress || job.area,
        wage: job.dailyWage,
        role: 'customer',
      });

      if (res.method === 'gmail_api_oauth') {
        showNotification(`🔑 Start OTP #${job.otpCode} sent directly via Google Workspace to ${email}!`);
      } else {
        showNotification(`🔑 Start OTP #${job.otpCode} dispatched to Customer Email (${email})!`);
      }
      return true;
    } catch (err) {
      console.debug('OTP dispatch note:', err);
      showNotification(`🔑 Start OTP: ${job.otpCode} (Share with worker upon arrival)`);
      return false;
    }
  };

  // Worker accepts a broadcast job
  const acceptJobByWorker = (jobId: string) => {
    if (!currentWorker) return;

    const targetJob = jobs.find((j) => j.id === jobId);
    if (targetJob) {
      const wLat = currentWorker.gpsLocation?.lat || 30.8926;
      const wLng = currentWorker.gpsLocation?.lng || 75.8415;
      const jLat = targetJob.jobGps?.lat || wLat;
      const jLng = targetJob.jobGps?.lng || wLng;
      const dist = calculateDistanceKm(wLat, wLng, jLat, jLng);

      if (dist > 10.0) {
        playSound('alert');
        showNotification(`Job blocked: Location is ${dist} km away (exceeds strict 10km limit).`);
        return;
      }
    }

    let updatedAcceptedJob: Job | null = null;
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const updated = {
            ...job,
            status: 'accepted' as const,
            assignedWorkerId: currentWorker.id,
            assignedWorkerName: currentWorker.name,
            assignedWorkerPhone: currentWorker.phone,
            assignedWorkerTrade: currentWorker.primaryTrade,
            assignedWorkerUpi: currentWorker.upiId,
          };
          updatedAcceptedJob = updated;
          return updated;
        }
        return job;
      })
    );

    if (updatedAcceptedJob) {
      syncJobToFirestore(updatedAcceptedJob);
      dispatchJobStartOtp(updatedAcceptedJob);
    }

    playSound('success');
    showNotification(`Job accepted! Ask customer for 4-digit start OTP.`);
  };

  // Worker starts work by entering OTP
  const startJobWithOtp = (jobId: string, inputOtp: string): boolean => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return false;

    if (targetJob.otpCode === inputOtp.trim()) {
      const updated = { ...targetJob, status: 'in_progress' as const };
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? updated : j))
      );
      syncJobToFirestore(updated);
      playSound('success');
      showNotification('OTP Verified! Work status: In Progress.');
      return true;
    } else {
      playSound('alert');
      showNotification('Invalid OTP. Please check with employer.');
      return false;
    }
  };

  // Worker marks job finished
  const completeJobByWorker = (jobId: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    const updated = targetJob ? { ...targetJob, status: 'completed_pending_payment' as const } : null;

    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? (updated || { ...j, status: 'completed_pending_payment' }) : j))
    );
    if (updated) {
      syncJobToFirestore(updated);
    }
    playSound('success');
    showNotification('Job marked completed. Awaiting employer payout release.');
  };

    // Customer releases payment via UPI and rates worker
  const releasePaymentByCustomer = (
    jobId: string, 
    rating: number, 
    review: string, 
    paidVia: 'UPI_QR' | 'UPI_DIRECT' | 'ESCROW_WALLET' | 'CASH' = 'UPI_QR',
    txnRef?: string,
    tags?: string[]
  ) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const payout = job.workerPayout;

    const updatedJob: Job = {
      ...job,
      status: 'paid_and_closed',
      isPaid: true,
      rating: rating,
      review: review,
      customerRating: rating,
      customerReview: review,
      ratingTags: tags || ['⚡ Punctual & On-Time', '🛠️ Expert Craftsmanship'],
      ratedAt: new Date().toISOString(),
      paidVia: paidVia,
      transactionRef: txnRef || `UPI-DIHADI-${Date.now().toString().slice(-6)}`,
    };

    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? updatedJob : j))
    );
    syncJobToFirestore(updatedJob);

    // Update worker earnings, wallet, and compute dynamic average rating
    if (job.assignedWorkerId) {
      const targetWorker = workers.find((w) => w.id === job.assignedWorkerId);
      if (targetWorker) {
        const prevReviews = targetWorker.reviewCount || 0;
        const newCount = prevReviews + 1;
        const newRating = prevReviews === 0 ? rating : Number((((targetWorker.rating || rating) * prevReviews + rating) / newCount).toFixed(1));

        const updatedWorker: WorkerProfile = {
          ...targetWorker,
          todayEarnings: targetWorker.todayEarnings + payout,
          totalEarnings: targetWorker.totalEarnings + payout,
          walletBalance: targetWorker.walletBalance + payout,
          completedJobsCount: targetWorker.completedJobsCount + 1,
          reviewCount: newCount,
          rating: Math.min(5.0, Math.max(1.0, newRating)),
        };

        setWorkers((prev) => prev.map((w) => (w.id === updatedWorker.id ? updatedWorker : w)));
        syncWorkerToFirestore(updatedWorker);

        if (currentWorker && currentWorker.id === job.assignedWorkerId) {
          setCurrentWorker(updatedWorker);
        }
      }
    }

    playSound('cash');
    showNotification(`₹${payout} payment released & rated ${rating}★ for ${job.assignedWorkerName || 'Worker'}!`);
  };

  // Rate or update review for any completed job
  const rateWorkerJob = (jobId: string, rating: number, review: string, tags?: string[]) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const updatedJob: Job = {
      ...job,
      rating: rating,
      review: review,
      customerRating: rating,
      customerReview: review,
      ratingTags: tags || job.ratingTags,
      ratedAt: new Date().toISOString(),
    };

    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? updatedJob : j))
    );
    syncJobToFirestore(updatedJob);

    if (job.assignedWorkerId) {
      setWorkers((prev) =>
        prev.map((w) => {
          if (w.id === job.assignedWorkerId) {
            const count = Math.max(1, w.reviewCount || 1);
            const updatedRating = Number((((w.rating * count) - (job.rating || 5.0) + rating) / count).toFixed(1));
            const updatedW: WorkerProfile = {
              ...w,
              rating: Math.min(5.0, Math.max(1.0, updatedRating)),
            };
            syncWorkerToFirestore(updatedW);
            return updatedW;
          }
          return w;
        })
      );
    }

    playSound('success');
    showNotification(`Rating of ${rating}★ recorded successfully!`);
  };

  // Worker withdraws wallet balance to UPI bank account
  const withdrawWorkerEarnings = (customUpi?: string) => {
    if (!currentWorker || currentWorker.walletBalance <= 0) {
      showNotification('Wallet balance is ₹0.');
      return;
    }

    const amount = currentWorker.walletBalance;
    const targetUpi = customUpi || currentWorker.upiId || 'worker@upi';

    const updated = { ...currentWorker, walletBalance: 0 };
    setCurrentWorker(updated);
    setWorkers((prev) => prev.map((w) => (w.id === currentWorker.id ? updated : w)));

    playSound('cash');
    showNotification(`₹${amount} transferred to ${targetUpi}!`);
  };

  // Admin verifies a worker
  const verifyWorkerByAdmin = (id: string, status: 'approved' | 'rejected') => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v))
    );

    const vReq = verifications.find((v) => v.id === id);
    if (vReq) {
      const updatedV: VerificationRequest = { ...vReq, status };
      syncVerificationToFirestore(updatedV);

      const vReqCleanPhone = vReq.phone.replace(/[^0-9]/g, '').slice(-10);
      const vReqName = vReq.workerName.trim().toLowerCase();

      setWorkers((prev) =>
        prev.map((w) => {
          const wCleanPhone = w.phone.replace(/[^0-9]/g, '').slice(-10);
          const isMatch = (wCleanPhone && vReqCleanPhone && wCleanPhone === vReqCleanPhone) || 
                          w.name.trim().toLowerCase() === vReqName;
          if (isMatch) {
            const updatedW: WorkerProfile = {
              ...w,
              isVerified: status === 'approved',
              badge: status === 'approved' ? 'Aadhaar Verified' : 'Registered Worker',
            };
            syncWorkerToFirestore(updatedW);
            return updatedW;
          }
          return w;
        })
      );

      if (currentWorker) {
        const currCleanPhone = currentWorker.phone.replace(/[^0-9]/g, '').slice(-10);
        const isMatch = (currCleanPhone && vReqCleanPhone && currCleanPhone === vReqCleanPhone) || 
                        currentWorker.name.trim().toLowerCase() === vReqName;
        if (isMatch) {
          setCurrentWorker((curr) =>
            curr
              ? {
                  ...curr,
                  isVerified: status === 'approved',
                  badge: status === 'approved' ? 'Aadhaar Verified' : 'Registered Worker',
                }
              : null
          );
        }
      }
    }

    playSound('click');
    showNotification(`KYC verification for ${vReq?.workerName || 'worker'} marked ${status}.`);
  };

  // Direct verification from directory
  const verifyWorkerDirectly = (workerId: string, status: 'approved' | 'rejected' = 'approved') => {
    const targetWorker = workers.find((w) => w.id === workerId);
    if (!targetWorker) return;

    const targetPhoneClean = targetWorker.phone.replace(/[^0-9]/g, '').slice(-10);
    const targetName = targetWorker.name.trim().toLowerCase();

    const updatedWorker: WorkerProfile = {
      ...targetWorker,
      isVerified: status === 'approved',
      badge: status === 'approved' ? 'Aadhaar Verified' : 'Registered Worker',
    };
    syncWorkerToFirestore(updatedWorker);

    // Update workers
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === workerId || (targetPhoneClean && w.phone.replace(/[^0-9]/g, '').slice(-10) === targetPhoneClean) || w.name.trim().toLowerCase() === targetName
          ? updatedWorker
          : w
      )
    );

    if (currentWorker) {
      const currCleanPhone = currentWorker.phone.replace(/[^0-9]/g, '').slice(-10);
      const isMatch = (currentWorker.id === workerId) ||
                      (currCleanPhone && targetPhoneClean && currCleanPhone === targetPhoneClean) || 
                      currentWorker.name.trim().toLowerCase() === targetName;
      if (isMatch) {
        setCurrentWorker((curr) =>
          curr
            ? {
                ...curr,
                isVerified: status === 'approved',
                badge: status === 'approved' ? 'Aadhaar Verified' : 'Registered Worker',
              }
            : null
        );
      }
    }

    // Update or create verification request record
    setVerifications((prev) => {
      const match = prev.find((v) => {
        const vClean = v.phone.replace(/[^0-9]/g, '').slice(-10);
        return (vClean && targetPhoneClean && vClean === targetPhoneClean) || 
               v.workerName.trim().toLowerCase() === targetName;
      });
      if (match) {
        const updatedV: VerificationRequest = { ...match, status };
        syncVerificationToFirestore(updatedV);
        return prev.map((v) => (v.id === match.id ? updatedV : v));
      } else {
        const newV: VerificationRequest = {
          id: `v-${Date.now().toString().slice(-4)}`,
          workerName: targetWorker.name,
          trade: targetWorker.primaryTrade,
          phone: targetWorker.phone,
          aadhaarNumber: targetWorker.aadhaarNumberMasked || '7829-4412-9901',
          experienceYears: targetWorker.experienceYears || 3,
          submittedAt: 'Just now',
          status,
        };
        syncVerificationToFirestore(newV);
        return [newV, ...prev];
      }
    });

    playSound('click');
    showNotification(`Worker ${targetWorker.name} verification marked ${status}.`);
  };

  // Verify currently logged in worker directly
  const verifyCurrentWorker = (status: 'approved' | 'rejected' = 'approved') => {
    if (!currentWorker) return;
    verifyWorkerDirectly(currentWorker.id, status);
  };

  // Worker submits KYC for admin review
  const submitWorkerKyc = (data: {
    workerName: string;
    trade: TradeType;
    phone: string;
    aadhaarNumber: string;
    experienceYears: number;
  }) => {
    const cleanPhone = data.phone.replace(/[^0-9]/g, '').slice(-10);
    const maskedAadhaar = `XXXX-XXXX-${data.aadhaarNumber.replace(/[^0-9]/g, '').slice(-4) || '9901'}`;

    // Update in worker list
    setWorkers((prev) =>
      prev.map((w) => {
        const wClean = w.phone.replace(/[^0-9]/g, '').slice(-10);
        if ((wClean && cleanPhone && wClean === cleanPhone) || w.name.trim().toLowerCase() === data.workerName.trim().toLowerCase()) {
          return {
            ...w,
            primaryTrade: data.trade,
            experienceYears: data.experienceYears,
            aadhaarNumberMasked: maskedAadhaar,
            badge: 'KYC Under Review',
          };
        }
        return w;
      })
    );

    if (currentWorker) {
      setCurrentWorker((curr) =>
        curr
          ? {
              ...curr,
              primaryTrade: data.trade,
              experienceYears: data.experienceYears,
              aadhaarNumberMasked: maskedAadhaar,
              badge: 'KYC Under Review',
            }
          : null
      );
    }

    // Add or update verification in queue
    setVerifications((prev) => {
      const match = prev.find((v) => {
        const vClean = v.phone.replace(/[^0-9]/g, '').slice(-10);
        return (vClean && cleanPhone && vClean === cleanPhone) || v.workerName.trim().toLowerCase() === data.workerName.trim().toLowerCase();
      });

      if (match) {
        const updatedV: VerificationRequest = {
          ...match,
          workerName: data.workerName,
          trade: data.trade,
          phone: data.phone,
          aadhaarNumber: data.aadhaarNumber,
          experienceYears: data.experienceYears,
          submittedAt: 'Just now',
          status: 'pending',
        };
        syncVerificationToFirestore(updatedV);
        return prev.map((v) => (v.id === match.id ? updatedV : v));
      } else {
        const newV: VerificationRequest = {
          id: `v-${Date.now().toString().slice(-4)}`,
          workerName: data.workerName,
          trade: data.trade,
          phone: data.phone,
          aadhaarNumber: data.aadhaarNumber,
          experienceYears: data.experienceYears,
          submittedAt: 'Just now',
          status: 'pending',
        };
        syncVerificationToFirestore(newV);
        return [newV, ...prev];
      }
    });

    const targetW = workers.find((w) => {
      const wClean = w.phone.replace(/[^0-9]/g, '').slice(-10);
      return (wClean && cleanPhone && wClean === cleanPhone) || w.name.trim().toLowerCase() === data.workerName.trim().toLowerCase();
    });
    if (targetW) {
      syncWorkerToFirestore({
        ...targetW,
        primaryTrade: data.trade,
        experienceYears: data.experienceYears,
        aadhaarNumberMasked: maskedAadhaar,
        badge: 'KYC Under Review',
      });
    }

    playSound('success');
    showNotification(`Aadhaar KYC request for ${data.workerName} submitted to Admin queue!`);
  };

  // Seed more workers for verification queue
  const seedMoreWorkersForVerification = () => {
    const isLudhiana = !currentCity?.name || currentCity.name.toLowerCase().includes('ludhiana');
    const candidateNames = isLudhiana ? [
      { name: 'Kishan Lal', trade: 'Mason' as TradeType, rate: 850, exp: 5, area: 'Model Town', phone: '+91 98101 11223', aadhaar: '8912-3344-5566' },
      { name: 'Vijay Verma', trade: 'Electrician' as TradeType, rate: 900, exp: 6, area: 'Sarabha Nagar', phone: '+91 98101 44556', aadhaar: '7788-9900-1122' },
      { name: 'Balwant Singh', trade: 'Carpenter' as TradeType, rate: 950, exp: 8, area: 'Civil Lines', phone: '+91 98101 66778', aadhaar: '4433-2211-9988' },
      { name: 'Santosh Yadav', trade: 'Painter' as TradeType, rate: 850, exp: 4, area: 'Dugri Phase 1', phone: '+91 98101 88990', aadhaar: '6655-4433-2211' },
      { name: 'Mohd Imran', trade: 'Plumber' as TradeType, rate: 900, exp: 5, area: 'Gill Road', phone: '+91 98101 33221', aadhaar: '1122-3344-5566' },
    ] : [
      { name: 'Kishan Lal', trade: 'Mason' as TradeType, rate: 850, exp: 5, area: currentCity.defaultArea || 'Central Market', phone: '+91 98101 11223', aadhaar: '8912-3344-5566' },
      { name: 'Vijay Verma', trade: 'Electrician' as TradeType, rate: 900, exp: 6, area: currentCity.defaultArea || 'Main Road', phone: '+91 98101 44556', aadhaar: '7788-9900-1122' },
      { name: 'Balwant Singh', trade: 'Carpenter' as TradeType, rate: 950, exp: 8, area: currentCity.defaultArea || 'Market Block A', phone: '+91 98101 66778', aadhaar: '4433-2211-9988' },
      { name: 'Santosh Yadav', trade: 'Painter' as TradeType, rate: 850, exp: 4, area: currentCity.defaultArea || 'Sector 2', phone: '+91 98101 88990', aadhaar: '6655-4433-2211' },
      { name: 'Mohd Imran', trade: 'Plumber' as TradeType, rate: 900, exp: 5, area: currentCity.defaultArea || 'Civil Area', phone: '+91 98101 33221', aadhaar: '1122-3344-5566' },
    ];

    const randomPick = candidateNames[Math.floor(Math.random() * candidateNames.length)];
    const newWorkerId = `w-cand-${Date.now().toString().slice(-4)}`;
    const areaCoords = getCoordinatesForArea(randomPick.area, currentCity?.name || 'Ludhiana');

    const newWorker: WorkerProfile = {
      id: newWorkerId,
      name: randomPick.name,
      phone: randomPick.phone,
      avatar: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=150&auto=format&fit=crop&q=80',
      primaryTrade: randomPick.trade,
      secondaryTrades: ['Construction Helper'],
      dailyRate: randomPick.rate,
      experienceYears: randomPick.exp,
      rating: 5.0,
      reviewCount: 1,
      completedJobsCount: 0,
      isOnline: true,
      location: { area: randomPick.area, city: currentCity?.name || 'Ludhiana', distanceKm: +(0.5 + Math.random() * 2).toFixed(1) },
      gpsLocation: {
        lat: areaCoords.lat + (Math.random() - 0.5) * 0.02,
        lng: areaCoords.lng + (Math.random() - 0.5) * 0.02,
        area: randomPick.area,
        city: currentCity?.name || 'Ludhiana',
        accuracyMeters: 4,
        heading: Math.floor(Math.random() * 360),
        speedKmh: 0,
        lastUpdated: 'Just now',
      },
      isSharingLiveGps: true,
      aadhaarNumberMasked: `XXXX-XXXX-${randomPick.aadhaar.slice(-4)}`,
      isVerified: false,
      todayEarnings: 0,
      totalEarnings: 0,
      walletBalance: 0,
      badge: 'Aadhaar Pending',
      upiId: `${randomPick.name.toLowerCase().replace(/\s+/g, '.')}@upi`,
      bankName: 'State Bank of India',
      accountNumberMasked: '•••• •••• 9912',
      ifscCode: 'SBIN0001234',
    };

    const newV: VerificationRequest = {
      id: `v-${Date.now().toString().slice(-4)}`,
      workerName: randomPick.name,
      trade: randomPick.trade,
      phone: randomPick.phone,
      aadhaarNumber: randomPick.aadhaar,
      experienceYears: randomPick.exp,
      submittedAt: 'Just now',
      status: 'pending',
    };

    setWorkers((prev) => [newWorker, ...prev]);
    setVerifications((prev) => [newV, ...prev]);
    syncWorkerToFirestore(newWorker);
    syncVerificationToFirestore(newV);

    playSound('success');
    showNotification(`New worker ${randomPick.name} (${randomPick.trade}) submitted KYC for Admin review!`);
  };

  // Refresh Worker's real-time GPS location via navigator.geolocation and reverse geocoding
  const refreshWorkerGpsLocation = async () => {
    const res = await snapToRealWorldAddress();
    if (res) {
      playSound('gps_ping');
      showNotification(`📍 Live GPS calibrated: ${res.sublocality || res.street || res.city}!`);
    } else {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const detected = detectCityFromCoords(pos.coords.latitude, pos.coords.longitude);
            updateWorkerGps({
              lat: +pos.coords.latitude.toFixed(4),
              lng: +pos.coords.longitude.toFixed(4),
              city: detected.name,
              area: detected.defaultArea,
              accuracyMeters: Math.round(pos.coords.accuracy) || 4,
              heading: pos.coords.heading ? Math.round(pos.coords.heading) : 45,
              lastUpdated: 'Just now',
            });
            playSound('gps_ping');
            showNotification('Live GPS coordinates calibrated with high accuracy!');
          },
          () => {
            const defaultCoords = getCoordinatesForArea(currentCity.defaultArea, currentCity.name);
            updateWorkerGps({
              lat: defaultCoords.lat,
              lng: defaultCoords.lng,
              city: currentCity.name,
              area: currentCity.defaultArea,
              accuracyMeters: 4,
              lastUpdated: 'Just now',
            });
            playSound('gps_ping');
            showNotification(`Live GPS coordinates locked to ${currentCity.name}.`);
          }
        );
      }
    }
  };

  // Resolve a dispute
  const resolveDispute = (id: string) => {
    const dMatch = disputes.find((d) => d.id === id);
    if (dMatch) {
      const updatedD: DisputeItem = { ...dMatch, status: 'resolved' };
      syncDisputeToFirestore(updatedD);
    }
    setDisputes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'resolved' } : d))
    );
    playSound('click');
    showNotification('Dispute marked resolved.');
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentLanguage,
        setCurrentLanguage,
        currentCity,
        setCurrentCity,
        supportedCities: SUPPORTED_CITIES,
        detectAndSetLiveLocation,
        snapToRealWorldAddress,
        currentResolvedAddress,
        isLocating,
        workers,
        jobs,
        verifications,
        disputes,
        currentWorker,
        currentCustomer,
        currentAdmin,
        activeCall,
        startCall,
        endCall,
        activeGpsJob,
        openGpsRadar,
        closeGpsRadar,
        activeUpiPaymentJob,
        openUpiPayment,
        closeUpiPayment,
        activeMultiChannelJob,
        activeMultiChannelWorker,
        openMultiChannelModal,
        closeMultiChannelModal,
        activeShortlistJob,
        openTop5Shortlist,
        closeTop5Shortlist,
        latestMatchedJob,
        latestTop5Matches,
        getTop5WorkersForJob,
        matchJobWithWorkers,
        clearMatchedSuggestions,
        chatNotifications,
        triggerChatNotification,
        dismissChatNotification,
        activeGlobalChat,
        openGlobalChat,
        closeGlobalChat,
        loginWorkerWithAuth,
        registerWorkerWithAuth,
        loginWorker,
        logoutWorker,
        toggleWorkerStatus,
        updateWorkerUpi,
        updateWorkerGps,
        updateWorkerAvatar,
        updateWorkerProfile,
        acceptJobByWorker,
        startJobWithOtp,
        completeJobByWorker,
        withdrawWorkerEarnings,
        loginCustomerWithAuth,
        registerCustomerWithAuth,
        loginCustomer,
        logoutCustomer,
        updateCustomerGps,
        refreshCustomerGpsLocation,
        postJob,
        dispatchJobStartOtp,
        releasePaymentByCustomer,
        rateWorkerJob,
        loginAdminWithAuth,
        loginAdmin,
        logoutAdmin,
        verifyWorkerByAdmin,
        verifyWorkerDirectly,
        verifyCurrentWorker,
        submitWorkerKyc,
        seedMoreWorkersForVerification,
        refreshWorkerGpsLocation,
        resolveDispute,
        resetToZero,
        seedSampleData,
        isFirebaseConnected,
        connectedCluster,
        speak,
        notification,
        setNotification,
        showNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
