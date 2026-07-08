import React from "react";
import { MenuItem, InventoryItem, Order, Staff } from "../types";
import { Coffee, TrendingUp, AlertTriangle, ShoppingBag, DollarSign, Users, Award } from "lucide-react";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area, CartesianGrid } from "recharts";
import { motion } from "motion/react";

interface DashboardProps {
  orders: Order[];
  menu: MenuItem[];
  inventory: InventoryItem[];
  staff: Staff[];
  currentStaff: Staff;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ orders, menu, inventory, staff, currentStaff, onNavigate }: DashboardProps) {
  // Filter orders for the current day (local time)
  const todayOrders = orders.filter(o => {
    const oDate = new Date(o.createdAt);
    return oDate.toDateString() === new Date().toDateString();
  });

  // Calculations (Today Only)
  const totalRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = todayOrders.length;
  const avgOrderValue = totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0;
  
  // Low Stock Items
  const lowStockItems = inventory.filter(item => item.currentStock <= item.reorderLevel);

  // Top Selling Items Calculation
  const itemSalesMap: Record<string, { name: string; count: number; revenue: number }> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!itemSalesMap[item.menuItemId]) {
        itemSalesMap[item.menuItemId] = { name: item.name, count: 0, revenue: 0 };
      }
      itemSalesMap[item.menuItemId].count += item.quantity;
      itemSalesMap[item.menuItemId].revenue += item.price * item.quantity;
    });
  });

  const topSellingItems = Object.entries(itemSalesMap)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Recharts Sales Trend (Past 7 days)
  const getPast7DaysData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
      const dateKey = d.toDateString();

      // Filter orders on that day
      const dailyOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === dateKey;
      });

      const revenue = dailyOrders.reduce((sum, o) => sum + o.total, 0);
      const salesCount = dailyOrders.length;

      data.push({
        name: dateStr,
        revenue: revenue,
        orders: salesCount,
      });
    }
    return data;
  };

  const chartData = getPast7DaysData();

  return (
    <div className="space-y-6" id="dashboard-tab-content">
      {/* Header and User Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden" id="dashboard-banner">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/12">
          <Coffee className="w-96 h-96" />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="bg-indigo-500/50 text-indigo-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Active Shift
          </span>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {currentStaff.name}!
          </h2>
          <p className="text-indigo-100 max-w-xl text-sm">
            Logged in as <strong className="text-white">{currentStaff.role}</strong>. Ready to serve the perfect cold brew! Check your stock metrics and live cafe sales below.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-kpi-grid">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4"
          id="kpi-revenue"
        >
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Today's Sales</p>
            <h3 className="text-2xl font-bold text-gray-800">₹{totalRevenue.toLocaleString("en-IN")}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4"
          id="kpi-orders"
        >
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Today's Orders</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalOrders}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4"
          id="kpi-avg-value"
        >
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Today's Avg Ticket</p>
            <h3 className="text-2xl font-bold text-gray-800">₹{avgOrderValue}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-indigo-200 transition-colors"
          onClick={() => onNavigate("inventory")}
          id="kpi-stock-alerts"
        >
          <div className={`p-3.5 rounded-xl ${lowStockItems.length > 0 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-gray-50 text-gray-400"}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Stock Alerts</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {lowStockItems.length > 0 ? `${lowStockItems.length} Low` : "All Safe"}
            </h3>
          </div>
        </motion.div>
      </div>

      {/* Main Row: Revenue Graph and Low Stock / Leaders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-grid-main">
        {/* Recharts Revenue velocity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4" id="dashboard-chart-card">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-gray-800 text-lg">Sales Speed</h4>
              <p className="text-xs text-gray-400">Total revenue generated over the past 7 days</p>
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> 
              ₹{chartData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString("en-IN")} Weekly Run-rate
            </span>
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #f3f4f6", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}
                  labelStyle={{ fontWeight: "bold", color: "#1f2937" }}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top-Selling Items Leaderboard */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5" id="dashboard-leaderboard-card">
          <div>
            <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Leaderboard
            </h4>
            <p className="text-xs text-gray-400">Best performing beverage products sold</p>
          </div>

          <div className="space-y-4">
            {topSellingItems.length > 0 ? (
              topSellingItems.map((item, index) => {
                const maxSales = Math.max(...topSellingItems.map(i => i.count));
                const percentage = maxSales > 0 ? (item.count / maxSales) * 100 : 0;
                
                return (
                  <div key={item.id} className="space-y-1.5" id={`leader-${item.id}`}>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-700 flex items-center gap-2">
                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                          index === 0 ? "bg-indigo-100 text-indigo-800" :
                          index === 1 ? "bg-slate-100 text-slate-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {index + 1}
                        </span>
                        {item.name}
                      </span>
                      <span className="text-gray-500 font-medium">{item.count} sold</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-400 space-y-2">
                <Coffee className="w-12 h-12 mx-auto text-gray-300 stroke-1" />
                <p className="text-xs">No transactions recorded yet to generate leaders.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Warnings list */}
      {lowStockItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xs" id="dashboard-stock-warning-alert">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-rose-800 text-sm md:text-base">Low Stock Alert!</h5>
              <p className="text-rose-700 text-xs md:text-sm mt-0.5">
                The following raw ingredients are running low and may affect drink production:{" "}
                <strong className="text-rose-900">
                  {lowStockItems.map(item => `${item.name} (${item.currentStock} ${item.unit})`).join(", ")}
                </strong>
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate("inventory")}
            className="bg-rose-600 text-white font-semibold text-xs px-4 py-2 rounded-xl hover:bg-rose-700 transition shadow-xs shrink-0"
            id="btn-restock-now"
          >
            Restock Now
          </button>
        </div>
      )}
    </div>
  );
}
