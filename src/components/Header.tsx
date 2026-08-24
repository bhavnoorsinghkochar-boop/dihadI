import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Language, CityInfo } from '../types';
import { getT } from '../utils/translations';
import { 
  Presentation, 
  Volume2, 
  RotateCcw, 
  ArrowLeftRight, 
  HardHat, 
  Briefcase, 
  Shield, 
  Sparkles,
  LayoutGrid,
  MapPin,
  Compass,
  Loader2,
  ChevronDown
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    currentLanguage,
    setCurrentLanguage,
    currentCity,
    setCurrentCity,
    supportedCities,
    detectAndSetLiveLocation,
    isLocating,
    resetToZero,
    speak,
    jobs,
    workers,
    currentWorker,
    currentCustomer,
    currentAdmin,
  } = useApp();

  const [showCityMenu, setShowCityMenu] = useState(false);

  const handleLangChange = (lang: Language) => {
    setCurrentLanguage(lang);
    if (lang === 'hi') {
      speak('भाषा बदलकर हिंदी कर दी गई है');
    } else if (lang === 'pa') {
      speak('ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲੀ ਗਈ ਹੈ');
    } else {
      speak('Language changed to English');
    }
  };

  const getRoleLabel = () => {
    if (currentRole === 'worker') return getT(currentLanguage, 'role_worker_title');
    if (currentRole === 'customer') return getT(currentLanguage, 'role_customer_title');
    if (currentRole === 'admin') return getT(currentLanguage, 'role_admin_title');
    if (currentRole === 'pitch_deck') return getT(currentLanguage, 'role_deck_title');
    return getT(currentLanguage, 'select_role');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 lg:px-8 shadow-xs shrink-0 z-30 sticky top-0">
      {/* Brand & Active Role Status */}
      <div className="flex items-center gap-3">
        <div 
          onClick={() => setCurrentRole('select_role')}
          className="w-10 h-10 bg-[#0F172A] hover:bg-slate-800 transition rounded-xl flex items-center justify-center text-white font-black italic text-xl cursor-pointer shadow-xs select-none shrink-0"
          title="Return to Role Selection"
        >
          K
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 
              onClick={() => setCurrentRole('select_role')}
              className="text-base sm:text-lg font-black text-slate-900 tracking-tight cursor-pointer flex items-center gap-1"
            >
              Kaam<span className="text-amber-500 font-extrabold">zo</span>
            </h1>

            {/* Active Role Tag */}
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md border border-slate-200 flex items-center gap-1">
              {currentRole === 'worker' && <HardHat className="w-3 h-3 text-amber-600" />}
              {currentRole === 'customer' && <Briefcase className="w-3 h-3 text-blue-600" />}
              {currentRole === 'admin' && <Shield className="w-3 h-3 text-indigo-600" />}
              {currentRole === 'pitch_deck' && <Presentation className="w-3 h-3 text-amber-600" />}
              {currentRole === 'select_role' && <LayoutGrid className="w-3 h-3 text-slate-500" />}
              <span>{getRoleLabel()}</span>
            </span>
          </div>

          <p className="hidden md:block text-[11px] text-slate-500 font-medium leading-none">
            {getT(currentLanguage, 'brand_tagline')}
          </p>
        </div>
      </div>

      {/* Navigation Controls & City Location Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* City Location Dropdown & Calibrate GPS */}
        <div className="relative">
          <div className="flex items-center bg-emerald-50 border border-emerald-200/80 rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => setShowCityMenu(!showCityMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-emerald-900 hover:bg-emerald-100/70 rounded-lg text-xs font-bold transition"
              title="Change active operating city"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="max-w-[90px] sm:max-w-[120px] truncate">{currentCity ? currentCity.name : 'Ludhiana'}</span>
              <ChevronDown className="w-3 h-3 text-emerald-600 opacity-70" />
            </button>

            <button
              onClick={() => detectAndSetLiveLocation()}
              disabled={isLocating}
              className="p-1 px-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition disabled:opacity-50"
              title="Calibrate live GPS from your device"
            >
              {isLocating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Compass className="w-3 h-3" />
              )}
              <span className="hidden lg:inline">{isLocating ? 'Locating...' : 'GPS'}</span>
            </button>
          </div>

          {/* City Selection Dropdown Menu */}
          {showCityMenu && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select City</span>
                <span className="text-[10px] text-emerald-600 font-bold">5 Active Hubs</span>
              </div>
              {supportedCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    setCurrentCity(city);
                    setShowCityMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition ${
                    currentCity?.id === city.id
                      ? 'bg-emerald-50 text-emerald-950 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-3.5 h-3.5 ${currentCity?.id === city.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <p className="leading-tight">{city.name}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{city.state} • {city.defaultArea}</p>
                    </div>
                  </div>
                  {currentCity?.id === city.id && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Switch Role Button */}
        {currentRole !== 'select_role' && (
          <button
            onClick={() => setCurrentRole('select_role')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200"
            title="Switch to another role"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">{getT(currentLanguage, 'switch_role')}</span>
          </button>
        )}

        {/* Pitch Deck Button */}
        <button
          onClick={() => setCurrentRole(currentRole === 'pitch_deck' ? 'select_role' : 'pitch_deck')}
          className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
            currentRole === 'pitch_deck'
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
              : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200'
          }`}
          title="Open Pitch Deck & Story"
        >
          <Presentation className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{getT(currentLanguage, 'role_deck_btn')}</span>
        </button>

        {/* Reset State Button */}
        <button
          onClick={resetToZero}
          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200 text-xs font-semibold flex items-center gap-1"
          title="Reset all data to zero"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-[11px] font-bold">{getT(currentLanguage, 'reset_button')}</span>
        </button>

        {/* Audio Helper Button */}
        <button
          onClick={() => {
            if (currentLanguage === 'en') speak('Kaamzo platform: Connecting daily wage workers with customers.');
            else if (currentLanguage === 'hi') speak('कामज़ो: श्रमिकों को सीधे काम और सही मजदूरी देने का मंच।');
            else if (currentLanguage === 'pa') speak('ਕਾਮਜ਼ੋ: ਕਾਮਿਆਂ ਨੂੰ ਸਿੱਧਾ ਕੰਮ ਅਤੇ ਪੱਕੀ ਦਿਹਾੜੀ ਦੇਣ ਵਾਲਾ ਮੰਚ।');
          }}
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
          title="Voice Assistant"
        >
          <Volume2 className="w-4 h-4" />
        </button>

        {/* Language Pill Switcher - Strict Pure Strings */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => handleLangChange('en')}
            className={`px-2 py-1 rounded-lg transition ${
              currentLanguage === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => handleLangChange('hi')}
            className={`px-2 py-1 rounded-lg transition ${
              currentLanguage === 'hi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => handleLangChange('pa')}
            className={`px-2 py-1 rounded-lg transition ${
              currentLanguage === 'pa' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ਪੰਜਾਬੀ
          </button>
        </div>
      </div>
    </header>
  );
};
