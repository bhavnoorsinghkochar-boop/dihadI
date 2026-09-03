import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm hover:bg-amber-400 transition ml-2"
      >
        <Download className="w-4 h-4" />
        Install App
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm hover:bg-amber-400 transition ml-2"
        >
          <Download className="w-4 h-4" />
          Install App
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl border border-slate-200 text-center animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Install Dihadi</h3>
              <p className="mt-2 text-sm text-slate-600 mb-6 font-medium">
                Install this app on your iPhone or iPad for the best experience.
              </p>
              
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left space-y-3 mb-6">
                <p className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="font-bold text-slate-900">1.</span> 
                  <span>Tap the <strong>Share</strong> button in your Safari toolbar at the bottom.</span>
                </p>
                <p className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="font-bold text-slate-900">2.</span> 
                  <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                </p>
              </div>
              
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-800 hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
