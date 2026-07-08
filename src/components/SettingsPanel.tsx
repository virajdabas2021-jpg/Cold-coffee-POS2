import React, { useState, useEffect } from "react";
import { Sliders, Sun, Moon, Sparkles, BookOpen, LogOut, Check, Leaf, Flame, Waves, Database, Cloud, AlertTriangle, RefreshCw, Server } from "lucide-react";
import { getSupabaseStatus, forceSyncSupabase } from "../lib/api";

interface SettingsPanelProps {
  fontSize: string;
  setFontSize: (size: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  onLogout: () => void;
  currentStaff: any;
}

export default function SettingsPanel({
  fontSize,
  setFontSize,
  theme,
  setTheme,
  onLogout,
  currentStaff
}: SettingsPanelProps) {
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchStatus = async () => {
    try {
      const status = await getSupabaseStatus();
      setDbStatus(status);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleForceSync = async () => {
    setSyncing(true);
    try {
      const status = await forceSyncSupabase();
      setDbStatus(status);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  return (

    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-8 shadow-xs max-w-4xl mx-auto" id="settings-panel">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          Terminal Settings
        </h2>
        <p className="text-xs text-gray-400 mt-1">Configure appearance, typography, and profile session details.</p>
      </div>

      {/* Font Size Settings */}
      <div className="space-y-3" id="settings-font-size-section">
        <h3 className="text-sm font-bold text-gray-800">Typography (Font Size)</h3>
        <p className="text-xs text-gray-400">Scale the user interface text size for better readability.</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "sm", label: "Small (Compact)", desc: "13px base" },
            { id: "md", label: "Medium (Default)", desc: "15px base" },
            { id: "lg", label: "Large (Readable)", desc: "17px base" }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFontSize(opt.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                fontSize === opt.id
                  ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/15 font-semibold"
                  : "border-gray-200 hover:border-gray-300 bg-gray-50/20"
              }`}
              id={`btn-font-size-${opt.id}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-gray-800">{opt.label}</span>
                {fontSize === opt.id && <Check className="w-4 h-4 text-indigo-600" />}
              </div>
              <span className="text-[10px] text-gray-400 mt-0.5 block">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Theme Settings */}
      <div className="space-y-3" id="settings-theme-section">
        <h3 className="text-sm font-bold text-gray-800">Visual Theme</h3>
        <p className="text-xs text-gray-400">Choose a high-contrast visual theme for your terminal workspace. Sidebars and layouts adjust instantly.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { id: "light", label: "Classic Light", icon: Sun, color: "bg-slate-50 border-slate-200 text-amber-500" },
            { id: "dark", label: "Slate Dark", icon: Moon, color: "bg-slate-950 border-slate-800 text-indigo-400" },
            { id: "midnight", label: "Midnight Pitch", icon: Sparkles, color: "bg-black border-zinc-900 text-zinc-100" },
            { id: "warm", label: "Warm Sepia", icon: BookOpen, color: "bg-[#faf6ee] border-[#ede0c8] text-[#8c6239]" },
            { id: "forest", label: "Forest Emerald", icon: Leaf, color: "bg-[#0b251a] border-[#133c2a] text-emerald-400" },
            { id: "cyberpunk", label: "Cyber Neon", icon: Flame, color: "bg-[#0c0f1d] border-[#1d2345] text-pink-500" },
            { id: "ocean", label: "Ocean Breeze", icon: Waves, color: "bg-[#021526] border-[#072e54] text-sky-400" }
          ].map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-28 cursor-pointer ${
                  theme === opt.id
                    ? "border-indigo-600 ring-2 ring-indigo-500/15"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                id={`btn-theme-${opt.id}`}
              >
                <div className="flex justify-between items-center w-full">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${opt.color} border shadow-3xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {theme === opt.id && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <div>
                  <span className="font-bold text-xs text-gray-800 block mt-2">{opt.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Database Connection Status */}
      <div className="border-t border-gray-100 pt-6 space-y-4" id="settings-database-section">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" />
          Cloud Database Persistence
        </h3>
        <p className="text-xs text-gray-400">
          Your Cafe POS terminal is integrated with **Supabase PostgreSQL** for real-time cloud data storage and cross-device persistence.
        </p>

        <div className="bg-gray-50/70 border border-gray-200 rounded-2xl p-4 space-y-4" id="db-status-container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dbStatus?.connected ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                {dbStatus?.connected ? <Cloud className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <span className="font-extrabold text-xs block text-gray-800">
                  Status: {dbStatus?.connected ? "Connected to Cloud" : "Offline / Local Mode"}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5 max-w-lg">
                  {dbStatus?.message || "Sync status is being fetched..."}
                </span>
              </div>
            </div>

            <button
              onClick={handleForceSync}
              disabled={syncing}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-700 font-bold rounded-xl text-[11px] transition cursor-pointer border border-indigo-100 shrink-0"
              id="btn-force-sync"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync Database"}
            </button>
          </div>

          {/* If there is a missing table error, provide helpful instructions on how to create the tables */}
          {dbStatus && !dbStatus.connected && (
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 space-y-2.5 text-[11px] text-amber-800 animate-fade-in" id="db-sql-instructions">
              <p className="font-bold flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                SQL Tables Setup in Supabase
              </p>
              <p className="text-gray-500 leading-relaxed text-[10px]">
                To complete the cloud backup connection, please open your Supabase project <b>{dbStatus.project_id}</b>, navigate to the <b>SQL Editor</b>, and paste and run the queries below to create the structured tables:
              </p>
              <pre className="bg-amber-950 text-amber-100 font-mono text-[9px] p-2.5 rounded-lg overflow-y-auto select-all leading-normal max-h-48">
{`CREATE TABLE menu (
  id TEXT PRIMARY KEY,
  name TEXT,
  price NUMERIC,
  category TEXT,
  description TEXT,
  image TEXT,
  available BOOLEAN,
  ingredients JSONB
);

CREATE TABLE inventory (
  id TEXT PRIMARY KEY,
  name TEXT,
  "currentStock" NUMERIC,
  unit TEXT,
  "reorderLevel" NUMERIC,
  "lastUpdated" TEXT
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  "orderNumber" NUMERIC,
  items JSONB,
  subtotal NUMERIC,
  "discountAmount" NUMERIC,
  "couponCode" TEXT,
  total NUMERIC,
  "paymentMethod" TEXT,
  "paymentStatus" TEXT,
  "staffId" TEXT,
  "staffName" TEXT,
  "customerId" TEXT,
  "customerName" TEXT,
  "customerPhone" TEXT,
  "createdAt" TEXT
);

CREATE TABLE coupons (
  id TEXT PRIMARY KEY,
  code TEXT,
  type TEXT,
  value NUMERIC,
  "minOrderValue" NUMERIC,
  active BOOLEAN
);

CREATE TABLE staff (
  id TEXT PRIMARY KEY,
  name TEXT,
  pin TEXT,
  role TEXT,
  active BOOLEAN
);

CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  email TEXT,
  "totalOrders" NUMERIC,
  "totalSpent" NUMERIC,
  "createdAt" TEXT
);`}
              </pre>
              <p className="text-[9px] text-gray-400">
                Tip: Run this setup SQL block in your Supabase SQL Editor and click "Sync Database" to instantly sync all datasets!
              </p>
            </div>
          )}

          {/* Database Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-gray-200/50 text-[11px]">
            <div>
              <span className="text-gray-400 block">Supabase Project ID</span>
              <span className="font-bold text-gray-800 block mt-0.5 font-mono">{dbStatus?.project_id || "luoggwvjvxbvprqhvehu"}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Target Tables</span>
              <span className="font-bold text-gray-800 block mt-0.5 font-mono text-[10px]">6 Structured Tables</span>
            </div>
            <div className="col-span-2 md:col-span-1">
              <span className="text-gray-400 block">Last Cloud Sync</span>
              <span className="font-bold text-gray-800 block mt-0.5 font-mono">
                {dbStatus?.lastSynced ? new Date(dbStatus.lastSynced).toLocaleTimeString() : "Pending connection"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile & Logout Settings */}
      <div className="border-t border-gray-100 pt-6 space-y-4" id="settings-profile-section">
        <h3 className="text-sm font-bold text-gray-800">Active Shift Session</h3>
        <div className="bg-gray-50/70 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white font-extrabold rounded-full flex items-center justify-center text-sm">
              {currentStaff?.name?.charAt(0)}
            </div>
            <div>
              <span className="font-extrabold text-sm text-gray-900 block">{currentStaff?.name}</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">Role: {currentStaff?.role} • Logged in via Terminal Security</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-xs transition cursor-pointer border border-rose-100"
            id="btn-settings-logout"
          >
            <LogOut className="w-4 h-4" />
            Lock Terminal & Logout
          </button>
        </div>
      </div>
    </div>
  );
}
