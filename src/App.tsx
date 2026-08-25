import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { MainPlatform } from './components/MainPlatform';
import { PitchDeckViewer } from './components/deck/PitchDeckViewer';
import { CallModal } from './components/common/CallModal';
import { GpsRadarModal } from './components/common/GpsRadarModal';
import { UpiQrPaymentModal } from './components/common/UpiQrPaymentModal';
import { MultiChannelAlertModal } from './components/common/MultiChannelAlertModal';
import { Top5ShortlistModal } from './components/customer/Top5ShortlistModal';
import { ChatNotificationToast } from './components/common/ChatNotificationToast';
import { QuickChatModal } from './components/common/QuickChatModal';
import { SubscriptionPromoModal } from './components/common/SubscriptionPromoModal';
import { AppProtectionGuaranteeModal } from './components/common/AppProtectionGuaranteeModal';
import { Bell } from 'lucide-react';

import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainLayout: React.FC = () => {
  const { 
    currentRole, 
    notification, 
    setNotification,
    activeCall,
    startCall,
    endCall,
    activeGpsJob,
    closeGpsRadar,
    activeUpiPaymentJob,
    closeUpiPayment,
    activeMultiChannelJob,
    activeMultiChannelWorker,
    closeMultiChannelModal,
    openMultiChannelModal,
    openGpsRadar,
    activeShortlistJob,
    closeTop5Shortlist,
    acceptJobByWorker,
    releasePaymentByCustomer,
    currentWorker,
    currentCustomer,
    workers,
    chatNotifications,
    dismissChatNotification,
    activeGlobalChat,
    openGlobalChat,
    closeGlobalChat,
    isSubscriptionPromoOpen,
    promoInitialRole,
    closeSubscriptionPromo,
    isProtectionModalOpen,
    protectionModalData,
    closeProtectionModal,
  } = useApp();

  return (
    <div className="w-full min-h-screen bg-[#F1F5F9] flex flex-col font-sans text-slate-800">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="bg-slate-900 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md sticky top-0 z-50 border-b border-slate-700 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
            <Bell className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Real-Time Floating Chat Notifications (Pop-ups for Incoming messages on Opposite side) */}
      <ChatNotificationToast
        notifications={chatNotifications}
        onDismiss={dismissChatNotification}
        onOpenChat={(item) => {
          dismissChatNotification(item.id);
          openGlobalChat(
            item.job || null,
            item.targetPerson || {
              name: item.senderName,
              phone: item.senderPhone,
              role: item.senderRole,
            },
            currentRole === 'worker' ? 'worker' : 'customer'
          );
        }}
      />

      {/* Main Header */}
      <Header />

      {/* Main Container - Exactly 2 Pages: Main Platform & Pitch Deck */}
      <main className="flex-1 flex flex-col">
        {currentRole === 'pitch_deck' ? (
          <div className="p-3 sm:p-6 lg:p-8 flex items-center justify-center flex-1">
            <PitchDeckViewer />
          </div>
        ) : (
          <MainPlatform />
        )}
      </main>

      {/* Global In-App Voice Call Simulator Modal */}
      <CallModal
        callSession={activeCall}
        onEndCall={endCall}
      />

      {/* Global Real-Time Quick Chat Modal */}
      {activeGlobalChat?.isOpen && (
        <QuickChatModal
          isOpen={activeGlobalChat.isOpen}
          onClose={closeGlobalChat}
          job={activeGlobalChat.job}
          targetPerson={activeGlobalChat.targetPerson}
          currentUserRole={activeGlobalChat.role || (currentRole === 'worker' ? 'worker' : 'customer')}
          currentUserName={
            (activeGlobalChat.role || currentRole) === 'worker'
              ? currentWorker?.name || 'Worker'
              : currentCustomer?.name || 'Employer'
          }
          currentUserPhone={
            (activeGlobalChat.role || currentRole) === 'worker'
              ? currentWorker?.phone || '+91 98101 55678'
              : currentCustomer?.phone || '+91 99100 88221'
          }
          onStartCall={
            activeGlobalChat.targetPerson?.phone
              ? () => {
                  startCall(
                    {
                      name: currentRole === 'worker' ? currentWorker?.name || 'Worker' : currentCustomer?.name || 'Employer',
                      role: currentRole === 'worker' ? 'worker' : 'customer',
                      phone: currentRole === 'worker' ? currentWorker?.phone || '' : currentCustomer?.phone || '',
                    },
                    {
                      name: activeGlobalChat.targetPerson.name || 'Contact',
                      role: activeGlobalChat.role === 'worker' ? 'customer' : 'worker',
                      phone: activeGlobalChat.targetPerson.phone || '',
                    },
                    activeGlobalChat.job?.title || 'Dihadi Direct Work Chat'
                  );
                }
              : undefined
          }
          onOpenRadar={
            activeGlobalChat.job
              ? () => {
                  openGpsRadar(activeGlobalChat.job!);
                }
              : undefined
          }
        />
      )}

      {/* Global Live GPS Radar & Route Tracking Modal */}
      {activeGpsJob && (() => {
        const assignedWorker = workers.find(
          (w) => w.id === activeGpsJob.assignedWorkerId || w.name === activeGpsJob.assignedWorkerName
        );
        const resolvedWorkerGps = assignedWorker?.gpsLocation || activeGpsJob.workerGps || currentWorker?.gpsLocation;
        const resolvedJobGps = activeGpsJob.jobGps || currentCustomer?.gpsLocation;

        return (
          <GpsRadarModal
            isOpen={!!activeGpsJob}
            onClose={closeGpsRadar}
            workerName={activeGpsJob.assignedWorkerName || assignedWorker?.name || currentWorker?.name || 'Ramesh Kumar'}
            workerTrade={activeGpsJob.trade}
            jobTitle={activeGpsJob.title}
            jobAddress={activeGpsJob.locationAddress}
            workerGps={resolvedWorkerGps}
            jobGps={resolvedJobGps}
            initialDistanceKm={activeGpsJob.distanceKm || 1.2}
            isWorkerPerspective={currentRole === 'worker'}
          />
        );
      })()}

      {/* Global UPI QR & POS Barcode Payment Modal */}
      {activeUpiPaymentJob && (
        <UpiQrPaymentModal
          isOpen={!!activeUpiPaymentJob}
          onClose={closeUpiPayment}
          amount={activeUpiPaymentJob.workerPayout}
          totalWage={activeUpiPaymentJob.dailyWage}
          platformFee={activeUpiPaymentJob.platformFee}
          workerName={activeUpiPaymentJob.assignedWorkerName || 'Ramesh Kumar'}
          workerTrade={activeUpiPaymentJob.trade}
          workerUpiId={activeUpiPaymentJob.assignedWorkerUpi || 'ramesh.mason@okaxis'}
          workerPhone={activeUpiPaymentJob.assignedWorkerPhone || '+91 98101 55678'}
          jobTitle={activeUpiPaymentJob.title}
          onPaymentSuccess={(method, ref, rating, review, tags) => {
            const finalRating = typeof rating === 'number' && rating >= 1 ? rating : 5;
            const finalReview = review || `Rated ${finalRating} stars for work on ${activeUpiPaymentJob.title || 'Job'}`;
            releasePaymentByCustomer(
              activeUpiPaymentJob.id,
              finalRating,
              finalReview,
              method as any,
              ref,
              tags
            );
            closeUpiPayment();
          }}
        />
      )}

      {/* Global Multi-Channel Job Alert Simulator Modal (WhatsApp, IVR Voice Call, SMS, Push) */}
      {activeMultiChannelJob && (
        <MultiChannelAlertModal
          isOpen={!!activeMultiChannelJob}
          onClose={closeMultiChannelModal}
          job={activeMultiChannelJob}
          targetWorker={activeMultiChannelWorker}
          onAcceptJob={(jobId) => {
            acceptJobByWorker(jobId);
            closeMultiChannelModal();
          }}
        />
      )}

      {/* Global Top-5 AI Shortlist Modal */}
      {activeShortlistJob && (
        <Top5ShortlistModal
          isOpen={!!activeShortlistJob}
          onClose={closeTop5Shortlist}
          job={activeShortlistJob}
          onOpenMultiChannel={(job, worker) => {
            closeTop5Shortlist();
            openMultiChannelModal(job, worker);
          }}
          onOpenRadar={(job) => {
            openGpsRadar(job);
          }}
        />
      )}

      {/* Global YouTube-Style Subscription Promo Ad Interstitial Modal */}
      {isSubscriptionPromoOpen && (
        <SubscriptionPromoModal
          isOpen={isSubscriptionPromoOpen}
          onClose={closeSubscriptionPromo}
          initialRole={promoInitialRole || (currentRole === 'worker' ? 'worker' : 'customer')}
          allowRoleSwitch={false}
        />
      )}

      {/* Global Safety, Direct Work Warning & 100% Protection Guarantee Modal */}
      {isProtectionModalOpen && (
        <AppProtectionGuaranteeModal
          isOpen={isProtectionModalOpen}
          onClose={closeProtectionModal}
          variant={protectionModalData?.variant || 'post_rating'}
          workerName={protectionModalData?.workerName}
          workerTrade={protectionModalData?.workerTrade}
          workerAadhaarMasked={protectionModalData?.workerAadhaarMasked}
          refundAmount={protectionModalData?.refundAmount}
        />
      )}

      {/* Footer */}
      <footer className="h-12 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between px-6 lg:px-8 text-[11px] text-slate-500 font-medium shrink-0 gap-1 sm:gap-0">
        <p>© 2026 Kaamzo Technologies Pvt. Ltd. | Empowering Bharat's Local Workforce</p>
        <p className="text-slate-400">
          SDG 8 & 10 Aligned • 20% Fair Commission • Verified Masons, Painters & Daily Trades
        </p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}
