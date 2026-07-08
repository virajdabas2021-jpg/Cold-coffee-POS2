import React, { useState, useEffect } from "react";
import { MenuItem, InventoryItem, Order, Coupon, Staff, Customer } from "./types";
import { fetchFullDB, getSupabaseStatus } from "./lib/api";

// Modular separate page components imports
import Dashboard from "./components/Dashboard";
import OrderSystem from "./components/OrderSystem";
import MenuManagement from "./components/MenuManagement";
import InventoryManagement from "./components/InventoryManagement";
import Reports from "./components/Reports";
import CustomerHistory from "./components/CustomerHistory";
import StaffManagement from "./components/StaffManagement";
import CouponManagement from "./components/CouponManagement";
import SettingsPanel from "./components/SettingsPanel";

// Lucide Icons
import { Coffee, Shield, LogOut, Key, Grid, ShoppingBag, BookOpen, RefreshCw, Layers, Users, Tag, BarChart2, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Database States
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Orchestrator status states
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string } | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getSupabaseStatus();
        setDbStatus(status);
      } catch (e) {
        console.error("Error fetching db status", e);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Staff Session Security States
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [enteredPin, setEnteredPin] = useState("");
  const [authError, setAuthError] = useState("");

  // Navigation state
  const [activeTab, setActiveTab] = useState("dashboard");

  // Appearance & Theme States
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("pos-font-size") || "md");
  const [theme, setTheme] = useState(() => localStorage.getItem("pos-theme") || "light");

  useEffect(() => {
    localStorage.setItem("pos-font-size", fontSize);
    const htmlEl = document.documentElement;
    if (fontSize === "sm") {
      htmlEl.style.fontSize = "13px";
    } else if (fontSize === "lg") {
      htmlEl.style.fontSize = "17px";
    } else {
      htmlEl.style.fontSize = "15px";
    }
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("pos-theme", theme);
  }, [theme]);

  // Load database state on launch
  const loadDatabaseState = async () => {
    try {
      setIsLoading(true);
      const db = await fetchFullDB();
      setMenu(db.menu);
      setInventory(db.inventory);
      setOrders(db.orders);
      setCoupons(db.coupons);
      setStaff(db.staff);
      setCustomers(db.customers);
      setErrorMsg("");
    } catch (err) {
      console.error("Database connection failure", err);
      setErrorMsg("Failed to synchronize with Ramsas Coffee Cafe. Retrying in 5 seconds...");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseState();
  }, []);

  // PIN Keypad Handlers
  const handleKeypadPress = (val: string) => {
    setAuthError("");
    if (enteredPin.length < 4) {
      setEnteredPin(prev => prev + val);
    }
  };

  const handleKeypadClear = () => {
    setEnteredPin("");
    setAuthError("");
  };

  const handlePinSubmit = () => {
    if (enteredPin.length !== 4) {
      setAuthError("PIN must be exactly 4 digits.");
      return;
    }

    // Authenticate Pin
    const match = staff.find(s => s.pin === enteredPin);
    if (match) {
      if (!match.active) {
        setAuthError("This employee's terminal privileges are revoked.");
        setEnteredPin("");
        return;
      }
      setCurrentStaff(match);
      setEnteredPin("");
      setAuthError("");
      setActiveTab("dashboard");
    } else {
      setAuthError("Incorrect PIN. Please re-enter.");
      setEnteredPin("");
    }
  };

  // Auto-submit pin once 4 digits are typed
  useEffect(() => {
    if (enteredPin.length === 4) {
      handlePinSubmit();
    }
  }, [enteredPin]);

  const handleLogout = () => {
    setCurrentStaff(null);
    setEnteredPin("");
    setAuthError("");
    setActiveTab("dashboard");
  };

  // Loading Indicator
  if (isLoading && staff.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4" id="app-loading-screen">
        <Coffee className="w-16 h-16 text-indigo-500 animate-bounce" />
        <h3 className="font-bold text-lg tracking-wider">Syncing Ramsas Coffee Cafe Database...</h3>
        <p className="text-xs text-slate-400">Directly communicating with Supabase Cloud.</p>
      </div>
    );
  }

  // Connection Error Notification Banner
  if (errorMsg) {
    return (
      <div className="min-h-screen bg-rose-950 flex flex-col items-center justify-center text-white p-6 text-center space-y-4" id="app-error-screen">
        <Shield className="w-16 h-16 text-rose-500" />
        <h3 className="font-extrabold text-xl">Operational Disconnection</h3>
        <p className="text-sm text-rose-200 max-w-md">{errorMsg}</p>
        <button 
          onClick={loadDatabaseState} 
          className="bg-rose-700 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-rose-800 transition shadow-md"
          id="btn-retry-connection"
        >
          Re-establish Connection
        </button>
      </div>
    );
  }

  // --- SCREEN 1: Secure Terminal PIN Lockscreen ---
  if (!currentStaff) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative" id="terminal-lockscreen">
        
        {/* Background Coffee watermark elements */}
        <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none"></div>

        <div className="max-w-md w-full space-y-6 text-center z-10" id="lockscreen-box">
          {/* Logo & Header */}
          <div className="space-y-2">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl border border-indigo-500">
              <Coffee className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider">Ramsas Coffee Cafe</h1>
            <p className="text-xs text-slate-400">Terminal Authentication • PIN Locked</p>
          </div>

          {/* Keypad Terminal Container */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 border border-slate-700/50 shadow-2xl space-y-5" id="pincode-card">
            
            {/* PIN Dots Entry Display */}
            <div className="space-y-2">
              <div className="flex justify-center space-x-4 py-2" id="pin-dots-display">
                {[0, 1, 2, 3].map(idx => (
                  <div 
                    key={idx} 
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                      enteredPin.length > idx 
                        ? "bg-indigo-500 border-indigo-400 scale-110" 
                        : "border-slate-600 bg-slate-700"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Enter your 4-digit staff PIN to unlock</p>
            </div>

            {/* Numeric Keypad Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto" id="lockscreen-keypad-grid">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  className="w-16 h-16 bg-slate-700/50 hover:bg-slate-700 text-white font-extrabold text-xl rounded-2xl flex items-center justify-center transition active:scale-95 cursor-pointer border border-slate-600/30 shadow-xs"
                >
                  {num}
                </button>
              ))}
              {/* Clear button */}
              <button
                type="button"
                onClick={handleKeypadClear}
                className="w-16 h-16 bg-slate-800 text-rose-400 font-bold text-sm rounded-2xl flex items-center justify-center transition active:scale-95 cursor-pointer border border-slate-700 hover:bg-slate-700"
              >
                Clear
              </button>
              {/* Zero */}
              <button
                type="button"
                onClick={() => handleKeypadPress("0")}
                className="w-16 h-16 bg-slate-700/50 hover:bg-slate-700 text-white font-extrabold text-xl rounded-2xl flex items-center justify-center transition active:scale-95 cursor-pointer border border-slate-600/30"
              >
                0
              </button>
              {/* Enter Check */}
              <button
                type="button"
                onClick={handlePinSubmit}
                className="w-16 h-16 bg-indigo-600 text-white font-black text-sm rounded-2xl flex items-center justify-center transition active:scale-95 cursor-pointer border border-indigo-500 hover:bg-indigo-500 shadow-md"
              >
                Enter
              </button>
            </div>

            {/* Error notifications */}
            {authError && (
              <p className="text-xs text-rose-400 font-bold bg-rose-500/10 py-2 rounded-xl border border-rose-500/20" id="auth-error-alert">
                {authError}
              </p>
            )}
          </div>

          {/* Seed demo PIN accounts helpful info panel */}
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4 text-left max-w-sm mx-auto space-y-2 shadow-2xs" id="seed-pincodes-hint">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Terminal Accounts</span>
            <ul className="text-slate-400 text-xs space-y-1 font-medium">
              <li className="flex justify-between">
                <span>👤 Akki Manager (Admin Role)</span>
                <span className="font-mono text-indigo-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700"></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
          
          
  }

  // --- SCREEN 2: Main Terminal User Interface ---

  // Determine available tabs based on logged-in staff role (Staff Login & Role-Based Access control)
  const isManager = currentStaff.role === "Admin";
  
  const navTabs = [
    { id: "dashboard", label: "Dashboard", icon: Grid, show: true },
    { id: "register", label: "Order Here", icon: ShoppingBag, show: true },
    { id: "customers", label: "Customer History", icon: Users, show: true },
    { id: "menu", label: "Menu Management", icon: BookOpen, show: isManager },
    { id: "inventory", label: "Raw Materials", icon: Layers, show: isManager },
    { id: "coupons", label: "Discounts & Promos", icon: Tag, show: isManager },
    { id: "staff", label: "Staff Management", icon: Users, show: isManager },
    { id: "reports", label: "Sales Board", icon: BarChart2, show: isManager },
    { id: "settings", label: "Settings", icon: Settings, show: true },
  ].filter(tab => tab.show);

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 theme-${theme}`} id="main-terminal-layout">
      
      {/* SIDEBAR NAVIGATION (Collapsible or full desktop strip) */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800" id="terminal-sidebar">
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950" id="sidebar-brand">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-sm tracking-wide uppercase block">Ramsas Coffee Cafe</span>
              <span className="text-[10px] text-indigo-400 uppercase tracking-widest block font-bold">Terminal v1.2</span>
            </div>
          </div>
          <button 
            onClick={loadDatabaseState} 
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition cursor-pointer"
            title="Force Database Synchronize"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Current logged-in Shift Profile */}
        <div className="p-4 bg-slate-800/40 border-b border-slate-800/60 flex items-center justify-between" id="sidebar-staff-profile">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-slate-700 text-slate-300 rounded-full flex items-center justify-center font-bold text-xs uppercase">
              {currentStaff.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs truncate block text-slate-200">{currentStaff.name}</span>
              <span className="text-[9px] bg-indigo-600/30 text-indigo-400 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider block w-max mt-0.5">
                {currentStaff.role}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition cursor-pointer"
            title="Lock terminal shift"
            id="btn-lock-terminal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Navigation Tabs */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto" id="sidebar-tabs-list">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? "bg-indigo-700 text-white shadow-md border-l-4 border-indigo-500"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
                id={`sidebar-tab-trigger-${tab.id}`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
        
        {/* Footer Credit line */}
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 text-center uppercase tracking-widest bg-slate-950 font-semibold no-print">
          Cold Brew Cafe POS
        </div>
      </aside>

      {/* MAIN VIEWPORT BODY (Right side) */}
      <main className="flex-1 flex flex-col min-w-0" id="terminal-main-viewport">
        
        {/* Top Navbar Header */}
        <header className="bg-white border-b border-gray-100 p-4 flex justify-between items-center shrink-0 no-print" id="top-navbar">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-xs font-semibold capitalize">Operations /</span>
            <span className="text-indigo-600 text-xs font-bold capitalize tracking-wider">
              {navTabs.find(t => t.id === activeTab)?.label}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs font-bold text-gray-500">
            <span className="flex items-center gap-1.5">
              {dbStatus?.connected ? (
                <>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                  <span className="text-emerald-600">Cloud Sync Active</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  <span className="text-amber-600">Local Mode (Offline)</span>
                </>
              )}
            </span>
            <span className="border-l border-gray-200 h-4"></span>
            <span>{new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}</span>
          </div>
        </header>

        {/* Screen View Area */}
        <div className="flex-1 p-6 overflow-y-auto" id="viewport-content-frame">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {activeTab === "dashboard" && (
                <Dashboard
                  orders={orders}
                  menu={menu}
                  inventory={inventory}
                  staff={staff}
                  currentStaff={currentStaff}
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === "register" && (
                <OrderSystem
                  menu={menu}
                  coupons={coupons}
                  customers={customers}
                  currentStaff={currentStaff}
                  onOrderPlaced={loadDatabaseState}
                />
              )}

              {activeTab === "customers" && (
                <CustomerHistory
                  customers={customers}
                  orders={orders}
                />
              )}

              {activeTab === "menu" && (
                <MenuManagement
                  menu={menu}
                  inventory={inventory}
                  onMenuUpdated={loadDatabaseState}
                />
              )}

              {activeTab === "inventory" && (
                <InventoryManagement
                  inventory={inventory}
                  onInventoryUpdated={loadDatabaseState}
                />
              )}

              {activeTab === "coupons" && (
                <CouponManagement
                  coupons={coupons}
                  onCouponsUpdated={loadDatabaseState}
                />
              )}

              {activeTab === "staff" && (
                <StaffManagement
                  staff={staff}
                  currentStaff={currentStaff}
                  onStaffUpdated={loadDatabaseState}
                />
              )}

              {activeTab === "reports" && (
                <Reports
                  orders={orders}
                  menu={menu}
                />
              )}

              {activeTab === "settings" && (
                <SettingsPanel
                  fontSize={fontSize}
                  setFontSize={setFontSize}
                  theme={theme}
                  setTheme={setTheme}
                  onLogout={handleLogout}
                  currentStaff={currentStaff}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

    </div>
  );
}
