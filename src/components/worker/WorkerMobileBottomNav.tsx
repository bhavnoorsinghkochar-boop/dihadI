import React from "react";
import {
  Search,
  Clock,
  Radio,
  CreditCard,
  User,
  CheckCircle2,
  Power,
} from "lucide-react";
import { playSound } from "../../utils/audio";

interface WorkerMobileBottomNavProps {
  activeTab:
    | "discovery"
    | "radar"
    | "active_work"
    | "history"
    | "wallet"
    | "profile"
    | "support";
  setActiveTab: (
    tab:
      | "discovery"
      | "radar"
      | "active_work"
      | "history"
      | "wallet"
      | "profile"
      | "support",
  ) => void;
  availableJobsCount: number;
  activeJobsCount: number;
  walletBalance: number;
  isOnline: boolean;
  onToggleOnline: () => void;
}

export const WorkerMobileBottomNav: React.FC<WorkerMobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  availableJobsCount,
  activeJobsCount,
  walletBalance,
  isOnline,
  onToggleOnline,
}) => {
  return (
    <>
      {/* Quick Mobile Floating Status Pill (Online / Offline Toggle) */}
      <div className="fixed bottom-16 right-3 z-30 md:hidden animate-in fade-in slide-in-from-bottom-2">
        <button
          onClick={() => {
            onToggleOnline();
            playSound("click");
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 border transition-all ${
            isOnline
              ? "bg-emerald-500 text-slate-950 border-emerald-300 shadow-emerald-500/20"
              : "bg-slate-800 text-slate-300 border-slate-700 shadow-slate-900/40"
          }`}
          title="Tap to toggle availability for instant job alerts"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-slate-950 animate-ping" : "bg-slate-500"
            }`}
          />
          <span>{isOnline ? "Available" : "Offline"}</span>
        </button>
      </div>

      {/* Main Worker Bottom Navigation */}
      <nav
        aria-label="Worker Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-2 pt-1 pb-safe shadow-[0_-6px_25px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Tab 1: Discovery / Jobs */}
          <button
            onClick={() => {
              setActiveTab("discovery");
              playSound("click");
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] min-h-[48px] ${
              activeTab === "discovery"
                ? "text-amber-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <div className="relative">
              <Search className="w-5 h-5" />
              {availableJobsCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full min-w-[16px] text-center shadow-xs">
                  {availableJobsCount}
                </span>
              )}
              {activeTab === "discovery" && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
            <span className="text-[10px] font-bold mt-1 tracking-tight">
              Jobs
            </span>
          </button>

          {/* Tab 2: Active Work */}
          <button
            onClick={() => {
              setActiveTab("active_work");
              playSound("click");
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] min-h-[48px] ${
              activeTab === "active_work"
                ? "text-amber-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <div className="relative">
              <Clock className="w-5 h-5" />
              {activeJobsCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full min-w-[16px] text-center animate-bounce shadow-xs">
                  {activeJobsCount}
                </span>
              )}
              {activeTab === "active_work" && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
            <span className="text-[10px] font-bold mt-1 tracking-tight">
              Active
            </span>
          </button>

          {/* Tab 3: GPS Radar */}
          <button
            onClick={() => {
              setActiveTab("radar");
              playSound("click");
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] min-h-[48px] ${
              activeTab === "radar"
                ? "text-amber-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <div className="relative">
              <Radio
                className={`w-5 h-5 ${
                  activeTab === "radar" ? "animate-pulse text-amber-400" : ""
                }`}
              />
              {activeTab === "radar" && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
            <span className="text-[10px] font-bold mt-1 tracking-tight">
              10km Radar
            </span>
          </button>

          {/* Tab 4: Wallet & UPI */}
          <button
            onClick={() => {
              setActiveTab("wallet");
              playSound("click");
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] min-h-[48px] ${
              activeTab === "wallet"
                ? "text-amber-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <div className="relative">
              <CreditCard className="w-5 h-5" />
              {activeTab === "wallet" && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
            <span className="text-[10px] font-bold mt-1 tracking-tight">
              {walletBalance > 0 ? `₹${walletBalance}` : "Wallet"}
            </span>
          </button>

          {/* Tab 5: Profile & KYC */}
          <button
            onClick={() => {
              setActiveTab("profile");
              playSound("click");
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] min-h-[48px] ${
              activeTab === "profile"
                ? "text-amber-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <div className="relative">
              <User className="w-5 h-5" />
              {activeTab === "profile" && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
            <span className="text-[10px] font-bold mt-1 tracking-tight">
              Profile
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
