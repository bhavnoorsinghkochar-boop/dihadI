import React from "react";
import {
  Users,
  MapPin,
  Plus,
  Building2,
  HelpCircle,
  Map as MapIcon,
  Radio,
} from "lucide-react";
import { playSound } from "../../utils/audio";

interface CustomerMobileBottomNavProps {
  activeTab: "find_workers" | "my_bookings" | "support";
  setActiveTab: (tab: "find_workers" | "my_bookings" | "support") => void;
  workerViewMode: "list" | "map" | "radar";
  setWorkerViewMode: (mode: "list" | "map" | "radar") => void;
  onPostJobClick: () => void;
  activeBookingsCount: number;
}

export const CustomerMobileBottomNav: React.FC<CustomerMobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  workerViewMode,
  setWorkerViewMode,
  onPostJobClick,
  activeBookingsCount,
}) => {
  return (
    <nav
      aria-label="Customer Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur-lg border-t border-slate-200 dark:border-[#383838] px-2 pt-1 pb-safe shadow-[0_-6px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-6px_25px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Tab 1: Find Workers */}
        <button
          onClick={() => {
            setActiveTab("find_workers");
            if (workerViewMode !== "list") setWorkerViewMode("list");
            playSound("click");
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] min-h-[48px] ${
            activeTab === "find_workers" && workerViewMode === "list"
              ? "text-amber-600 dark:text-[#FCD33F]"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            {activeTab === "find_workers" && workerViewMode === "list" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-[#FCD33F]" />
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-tight">
            Workers
          </span>
        </button>

        {/* Tab 2: Map & Radar */}
        <button
          onClick={() => {
            setActiveTab("find_workers");
            // Toggle between map and radar
            setWorkerViewMode(workerViewMode === "map" ? "radar" : "map");
            playSound("click");
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] min-h-[48px] ${
            activeTab === "find_workers" &&
            (workerViewMode === "map" || workerViewMode === "radar")
              ? "text-amber-600 dark:text-[#FCD33F]"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            {workerViewMode === "radar" ? (
              <Radio className="w-5 h-5 text-amber-500 animate-pulse" />
            ) : (
              <MapIcon className="w-5 h-5" />
            )}
            {activeTab === "find_workers" &&
              (workerViewMode === "map" || workerViewMode === "radar") && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-[#FCD33F]" />
              )}
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-tight">
            {workerViewMode === "radar" ? "Radar" : "10km Map"}
          </span>
        </button>

        {/* Center: Post Job FAB Button */}
        <div className="relative -top-4 flex flex-col items-center shrink-0 px-1">
          <button
            onClick={() => {
              onPostJobClick();
              playSound("click");
            }}
            aria-label="Post a new job requirement"
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-amber-500/40 border-3 border-white dark:border-[#1E1E1E] transform active:scale-95 transition-all hover:scale-105"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
          <span className="text-[10px] font-black text-amber-600 dark:text-[#FFE57F] mt-0.5 tracking-tight">
            Post Job
          </span>
        </div>

        {/* Tab 3: My Bookings */}
        <button
          onClick={() => {
            setActiveTab("my_bookings");
            playSound("click");
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] min-h-[48px] ${
            activeTab === "my_bookings"
              ? "text-amber-600 dark:text-[#FCD33F]"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Building2 className="w-5 h-5" />
            {activeBookingsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full min-w-[16px] text-center shadow-xs">
                {activeBookingsCount}
              </span>
            )}
            {activeTab === "my_bookings" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-[#FCD33F]" />
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-tight">
            Bookings
          </span>
        </button>

        {/* Tab 4: Support */}
        <button
          onClick={() => {
            setActiveTab("support");
            playSound("click");
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] min-h-[48px] ${
            activeTab === "support"
              ? "text-amber-600 dark:text-[#FCD33F]"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <HelpCircle className="w-5 h-5" />
            {activeTab === "support" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-[#FCD33F]" />
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-tight">
            Support
          </span>
        </button>
      </div>
    </nav>
  );
};
