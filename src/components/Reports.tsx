import React, { useState } from "react";
import { Order, MenuItem } from "../types";
import { Search, Calendar, FileText, Download, TrendingUp, AlertCircle, ShoppingBag, Check, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import ReceiptPrint from "./ReceiptPrint";

interface ReportsProps {
  orders: Order[];
  menu: MenuItem[];
}

type PeriodFilter = "Today" | "Weekly" | "Monthly" | "All-Time";

export default function Reports({ orders, menu }: ReportsProps) {
  const [period, setPeriod] = useState<PeriodFilter>("All-Time");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);

  // Helper date filters
  const filterOrdersByPeriod = (ordersList: Order[]) => {
    const now = new Date();
    
    return ordersList.filter(o => {
      const oDate = new Date(o.createdAt);
      
      if (period === "Today") {
        return oDate.toDateString() === now.toDateString();
      } else if (period === "Weekly") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return oDate >= oneWeekAgo;
      } else if (period === "Monthly") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return oDate >= oneMonthAgo;
      }
      return true; // All-time
    });
  };

  const activeOrders = filterOrdersByPeriod(orders);

  // Stats
  const revenue = activeOrders.reduce((s, o) => s + o.total, 0);
  const totalOrders = activeOrders.length;
  const avgTicket = totalOrders > 0 ? parseFloat((revenue / totalOrders).toFixed(2)) : 0;
  const totalDiscount = activeOrders.reduce((s, o) => s + o.discountAmount, 0);

  // Search filter for transactions list
  const searchedOrders = activeOrders.filter(o => {
    const searchLower = searchQuery.toLowerCase();
    const matchesNum = o.orderNumber.toString().includes(searchLower);
    const matchesCustomer = o.customerPhone?.includes(searchLower) || o.customerName?.toLowerCase().includes(searchLower);
    const matchesStaff = o.staffName.toLowerCase().includes(searchLower);
    const matchesMethod = o.paymentMethod.toLowerCase().includes(searchLower);
    return matchesNum || matchesCustomer || matchesStaff || matchesMethod;
  });

  // Recharts: category distribution calculations
  const categorySalesMap: Record<string, number> = {};
  activeOrders.forEach(o => {
    o.items.forEach(item => {
      categorySalesMap[item.category] = (categorySalesMap[item.category] || 0) + item.price * item.quantity;
    });
  });

  const categoryChartData = Object.entries(categorySalesMap).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ["#4f46e5", "#4338ca", "#3730a3", "#312e81", "#6366f1", "#818cf8"];

  // Recharts: daily transaction chart for bar chart
  const getPeriodBarData = () => {
    const days = period === "Today" ? 1 : period === "Weekly" ? 7 : period === "Monthly" ? 30 : 15;
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toDateString();
      const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });

      const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === key);
      const dayRev = dayOrders.reduce((s, o) => s + o.total, 0);

      data.push({
        name: label,
        sales: dayRev
      });
    }
    return data;
  };

  const salesTrendData = getPeriodBarData();

  return (
    <div className="space-y-6" id="reports-and-analytics-tab">
      
      {/* Page Header and Filtering controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4" id="reports-header">
        <div>
          <h3 className="font-bold text-gray-800 text-xl">POS Sales Ledgers & Reports</h3>
          <p className="text-xs text-gray-400">Review business metrics, payment statistics, and export transaction audit trails</p>
        </div>

        {/* Tab strip period filters */}
        <div className="flex bg-gray-100 p-1 rounded-xl" id="reports-period-tabs">
          {(["Today", "Weekly", "Monthly", "All-Time"] as PeriodFilter[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                period === p ? "bg-white text-indigo-950 shadow-xs" : "text-gray-500 hover:text-gray-800"
              }`}
              id={`report-filter-${p.toLowerCase()}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="reports-kpi-grid">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
          <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider">Gross Revenue</p>
          <h4 className="text-xl font-black text-indigo-600 mt-1">₹{revenue.toLocaleString("en-IN")}</h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
          <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider">Net Sales Volumes</p>
          <h4 className="text-xl font-black text-gray-800 mt-1">{totalOrders} orders</h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
          <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider">Avg Cart Ticket</p>
          <h4 className="text-xl font-black text-gray-800 mt-1">₹{avgTicket}</h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
          <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider">Promo Discounts given</p>
          <h4 className="text-xl font-black text-emerald-700 mt-1">₹{totalDiscount}</h4>
        </div>
      </div>

      {/* Visual Charts section */}
      {totalOrders > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="reports-charts-row">
          
          {/* Sales velocity trend */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs" id="reports-sales-trend-chart">
            <h4 className="font-bold text-gray-800 text-sm mb-4">Revenue Trend Line</h4>
            <div className="h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "11px" }} />
                  <Bar dataKey="sales" name="Sales (₹)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Product category volume */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between" id="reports-category-pie-chart">
            <h4 className="font-bold text-gray-800 text-sm mb-2">Revenue Share by Category</h4>
            
            {categoryChartData.length > 0 ? (
              <>
                <div className="h-44 flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Category Legend list */}
                <div className="space-y-1.5 pt-3 border-t border-gray-50 text-xs text-gray-500">
                  {categoryChartData.map((entry, index) => (
                    <div key={entry.name} className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        {entry.name}
                      </span>
                      <span className="font-semibold text-gray-800">₹{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-400 py-16 text-xs">No categoric sales logs available.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50/50 p-8 rounded-xl border border-gray-100 text-center text-gray-400 text-xs" id="reports-charts-fallback">
          No data entries for this time range to display graphs. Place order transactions to view trendlines.
        </div>
      )}

      {/* Audit ledger of transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs" id="reports-ledger-card">
        
        {/* Ledger header and search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5" id="reports-ledger-controls">
          <div>
            <h4 className="font-bold text-gray-800 text-base">Transactions Ledger Log</h4>
            <p className="text-xs text-gray-400">Search by order #, cashier name, customer, or payment methods</p>
          </div>

          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-9 pr-4 text-xs text-gray-700 focus:outline-none"
              id="ledger-search-input"
            />
          </div>
        </div>

        {/* Ledger Table listing */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs" id="reports-ledger-table">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-3">
                <th className="py-2.5 px-3">Order No</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Beverages Punched</th>
                <th className="py-2.5 px-3">Customer Details</th>
                <th className="py-2.5 px-3">Punched by</th>
                <th className="py-2.5 px-3">Pay Mode</th>
                <th className="py-2.5 px-3 text-right">Net Bill</th>
                <th className="py-2.5 px-3 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
              {searchedOrders.length > 0 ? (
                searchedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors" id={`row-ledger-${order.id}`}>
                    {/* Order no */}
                    <td className="py-3 px-3 font-bold text-black">
                      #{order.orderNumber}
                    </td>
                    {/* Time */}
                    <td className="py-3 px-3 text-gray-400">
                      {new Date(order.createdAt).toLocaleString("en-IN")}
                    </td>
                    {/* Items brief */}
                    <td className="py-3 px-3 max-w-[180px]">
                      {(() => {
                        const dispItems = order.items && order.items.length > 0 
                          ? order.items 
                          : [{ name: "Custom POS Sale Item", quantity: 1 }];
                        const titleText = dispItems.map(i => `${i.name} (x${i.quantity})`).join(", ");
                        return (
                          <div className="truncate" title={titleText}>
                            {titleText}
                          </div>
                        );
                      })()}
                    </td>
                    {/* Customer */}
                    <td className="py-3 px-3">
                      {order.customerPhone ? (
                        <div>
                          <span className="font-semibold block text-gray-800">{order.customerName || "Member"}</span>
                          <span className="text-[10px] text-gray-400 block">{order.customerPhone}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Walk-In</span>
                      )}
                    </td>
                    {/* Staff name */}
                    <td className="py-3 px-3 font-semibold text-gray-600">
                      {order.staffName}
                    </td>
                    {/* Pay method */}
                    <td className="py-3 px-3">
                      <span className="bg-indigo-50 text-indigo-800 font-bold px-2 py-0.5 rounded-md text-[10px] border border-indigo-100">
                        {order.paymentMethod}
                      </span>
                    </td>
                    {/* Net Total */}
                    <td className="py-3 px-3 text-right font-extrabold text-black">
                      ₹{order.total}
                    </td>
                    {/* Print Invoice Action */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedOrderForPrint(order)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded text-[10px] inline-flex items-center gap-1 cursor-pointer border border-indigo-100"
                        title="Print Customer Bill"
                        id={`btn-print-ledger-${order.id}`}
                      >
                        <Printer className="w-3 h-3" />
                        Print Bill
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400">
                    No matching audit trails. Check keywords or periods.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render Printer / Print Receipt Modal */}
      {selectedOrderForPrint && (
        <ReceiptPrint
          order={selectedOrderForPrint}
          onClose={() => {
            setSelectedOrderForPrint(null);
          }}
        />
      )}

    </div>
  );
}
