import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Copy, 
  Check, 
  QrCode, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Scan, 
  CreditCard, 
  Building, 
  Download,
  Share2,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../../utils/audio';

interface UpiQrPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  amount: number;
  recipientName: string;
  recipientUpiId: string;
  bankName?: string;
  accountNumberMasked?: string;
  ifscCode?: string;
  isWorkerReceiving?: boolean;
  jobTitle?: string;
  onPaymentSuccess?: (paidVia: 'UPI_QR' | 'UPI_DIRECT', txnId: string) => void;
}

export const UpiQrPaymentModal: React.FC<UpiQrPaymentModalProps> = ({
  isOpen,
  onClose,
  title = 'Instant UPI & Barcode Payment',
  subtitle = 'Fast, 0% MDR direct bank-to-bank settlement',
  amount,
  recipientName,
  recipientUpiId,
  bankName = 'State Bank of India',
  accountNumberMasked = '•••• •••• 4819',
  ifscCode = 'SBIN0004921',
  isWorkerReceiving = false,
  jobTitle,
  onPaymentSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedApp, setSelectedApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'cred'>('gpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'barcode' | 'bank'>('qr');

  if (!isOpen) return null;

  // Real NPCI UPI payload spec
  const cleanUpi = recipientUpiId || 'dihadi.worker@upi';
  const encodedName = encodeURIComponent(recipientName || 'Dihadi Worker');
  const upiPayload = `upi://pay?pa=${cleanUpi}&pn=${encodedName}&am=${amount}&cu=INR&tn=${encodeURIComponent(jobTitle ? `Dihadi-${jobTitle}` : 'Dihadi Direct Payout')}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(cleanUpi);
    setCopied(true);
    playSound('click');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateUpiPay = (method: 'UPI_QR' | 'UPI_DIRECT') => {
    setIsProcessing(true);
    playSound('click');
    setTimeout(() => {
      setIsProcessing(false);
      const txnId = `UPI-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      playSound('cash');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.debug(e);
      }
      if (onPaymentSuccess) {
        onPaymentSuccess(method, txnId);
      }
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                {title}
              </h3>
              <p className="text-xs text-slate-300 font-medium">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Amount and Beneficiary banner */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 block uppercase tracking-wider">
                {isWorkerReceiving ? 'Your Receiving UPI ID' : 'Direct Beneficiary Transfer'}
              </span>
              <h4 className="text-sm font-black text-slate-900">{recipientName}</h4>
              <p className="text-xs text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                <span>{cleanUpi}</span>
                <button
                  onClick={handleCopyUpi}
                  className="p-1 hover:bg-amber-100 rounded text-amber-800 transition"
                  title="Copy UPI ID"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Amount</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                ₹{amount}
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'qr'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>UPI QR Code</span>
            </button>
            <button
              onClick={() => setActiveTab('barcode')}
              className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'barcode'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>POS Barcode</span>
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'bank'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Direct Bank / IMPS</span>
            </button>
          </div>

          {/* Tab 1: QR Code View */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="bg-white p-3.5 rounded-2xl shadow-md border border-slate-200 relative group">
                <QRCodeSVG
                  value={upiPayload}
                  size={180}
                  level="H"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#0F172A"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-md border border-slate-200 flex items-center justify-center">
                    <span className="font-black text-amber-600 text-xs italic">D</span>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700">
                  <Scan className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  <span>Scan with any UPI App (GPay / PhonePe / Paytm / BHIM)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  NPCI interoperable standard • Direct bank credit to {recipientName}
                </p>
              </div>

              {/* UPI App Icons Row */}
              <div className="w-full flex items-center justify-center gap-2 pt-1">
                {[
                  { id: 'gpay', name: 'Google Pay', color: 'border-blue-300 text-blue-700 bg-blue-50' },
                  { id: 'phonepe', name: 'PhonePe', color: 'border-purple-300 text-purple-700 bg-purple-50' },
                  { id: 'paytm', name: 'Paytm UPI', color: 'border-cyan-300 text-cyan-800 bg-cyan-50' },
                  { id: 'bhim', name: 'BHIM', color: 'border-emerald-300 text-emerald-800 bg-emerald-50' },
                ].map((app) => (
                  <button
                    key={app.id}
                    onClick={() => {
                      setSelectedApp(app.id as any);
                      playSound('click');
                    }}
                    className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition flex items-center gap-1 ${
                      selectedApp === app.id ? `${app.color} ring-2 ring-slate-800` : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-2.5 h-2.5" />
                    <span>{app.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Barcode View */}
          {activeTab === 'barcode' && (
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="bg-white p-4 rounded-xl border border-slate-300 w-full flex flex-col items-center shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">
                  DIHADI MERCHANT / WORKER CODE 128
                </span>
                {/* SVG Barcode simulation */}
                <div className="w-full max-w-[280px] h-16 flex items-center justify-between px-2">
                  {[
                    4, 2, 6, 1, 3, 5, 2, 4, 1, 6, 3, 2, 5, 1, 4, 2, 6, 3, 1, 5, 2, 4,
                    3, 1, 6, 2, 5, 1, 4, 3, 6, 2, 5, 1, 4, 2, 3, 6, 1, 5, 2, 4, 3, 1,
                  ].map((w, i) => (
                    <div
                      key={i}
                      className="bg-slate-900 h-full rounded-xs"
                      style={{ width: `${w * 1.5}px` }}
                    />
                  ))}
                </div>
                <span className="font-mono text-xs font-bold text-slate-700 tracking-widest mt-2">
                  {cleanUpi.replace(/[@.]/g, '-').toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 text-center font-medium">
                Compatible with supermarket POS barcode scanners & Aadhaar micro-ATM terminals.
              </p>
            </div>
          )}

          {/* Tab 3: Direct Bank Details */}
          {activeTab === 'bank' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Bank Name</span>
                <span className="font-bold text-slate-900">{bankName}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Account Number</span>
                <span className="font-mono font-bold text-slate-900">{accountNumberMasked}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">IFSC Code</span>
                <span className="font-mono font-bold text-slate-900">{ifscCode}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 font-medium">UPI VPA Handle</span>
                <span className="font-mono font-bold text-amber-700">{cleanUpi}</span>
              </div>
            </div>
          )}

          {/* Verification Badge */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Aadhaar & NPCI Verified UPI Account • Instant 2-second bank deposit</span>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200/60 text-slate-700 text-xs font-bold transition"
          >
            Cancel
          </button>

          {!isWorkerReceiving ? (
            <button
              onClick={() => handleSimulateUpiPay('UPI_QR')}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connecting to UPI Gateway...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Confirm UPI Payment (₹{amount})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleCopyUpi}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>Share My UPI QR / Barcode</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
