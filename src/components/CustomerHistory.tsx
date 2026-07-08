import React, { useState } from "react";
import { Customer, Order } from "../types";
import { Search, User, ShieldCheck, Heart, Sparkles, Coffee, Calendar, Printer } from "lucide-react";
import ReceiptPrint from "./ReceiptPrint";

interface CustomerHistoryProps {
  customers: Customer[];
  orders: Order[];
}

export default function CustomerHistory({ customers, orders }: CustomerHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);

  // Filter customers by search
  const filteredCustomers = customers.filter(c => {
    const query = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(query) || c.phone.includes(query);
  });

  // Get customer specific order history
  const getCustomerOrders = (phone: string) => {
    return orders.filter(o => o.customerPhone === phone).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const activeCustomerOrders = selectedCustomer ? getCustomerOrders(selectedCustomer.phone) : [];

  return (
    <div className="space-y-6" id="customer-history-tab">
      
      {/* Page Title */}
      <div id="customer-header">
        <h3 className="font-bold text-gray-800 text-xl">Customer Relationship & Lifetime History</h3>
        <p className="text-xs text-gray-400">Monitor customer visits, track individual purchase logs, and assess high-value loyalty profiles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="customer-grid-layout">
        
        {/* LEFT COLUMN: Customer Listing & Search (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col h-[520px]" id="customer-list-panel">
          
          {/* Lookup Input */}
          <div className="relative w-full mb-4" id="customer-search-container">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by name or mobile number..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs text-gray-700 focus:outline-none"
              id="customer-search-input"
            />
          </div>

          {/* Customers Table List */}
          <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin" id="customer-list-scroller">
            <table className="w-full text-left border-collapse text-xs" id="customers-list-table">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2">
                  <th className="py-2.5 px-3">Profile</th>
                  <th className="py-2.5 px-3">Visits</th>
                  <th className="py-2.5 px-3">Lifetime Value</th>
                  <th className="py-2.5 px-3 text-right">View details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map(c => {
                    const isSelected = selectedCustomer?.id === c.id;
                    const ordersCount = getCustomerOrders(c.phone).length;
                    const ordersSpent = getCustomerOrders(c.phone).reduce((sum, ord) => sum + ord.total, 0);

                    return (
                      <tr 
                        key={c.id} 
                        onClick={() => setSelectedCustomer(c)}
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-indigo-50/50 hover:bg-indigo-50" : "hover:bg-gray-50/50"}`}
                        id={`row-customer-${c.id}`}
                      >
                        {/* Profile Details */}
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-1.5 bg-gray-100 text-gray-500 rounded-lg">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-800 block">{c.name}</span>
                              <span className="text-[10px] text-gray-400 block">{c.phone}</span>
                            </div>
                          </div>
                        </td>
                        {/* Visits */}
                        <td className="py-3 px-3 font-semibold text-gray-700">
                          {ordersCount} checkouts
                        </td>
                        {/* Spent */}
                        <td className="py-3 px-3 font-extrabold text-black">
                          ₹{ordersSpent}
                        </td>
                        {/* CTA button */}
                        <td className="py-3 px-3 text-right">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition ${
                            isSelected ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
                          }`}>
                            Logs →
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400">
                      No matching loyalty profiles in registry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Customer Order History (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col h-[520px]" id="customer-profile-panel">
          {selectedCustomer ? (
            <div className="space-y-4 flex flex-col h-full" id={`customer-profile-${selectedCustomer.id}`}>
              {/* Profile Card Header */}
              <div className="border-b border-gray-100 pb-4 space-y-3 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-800 text-base flex items-center gap-1.5">
                      {selectedCustomer.name}
                      {activeCustomerOrders.length >= 3 && (
                        <span className="bg-indigo-100 text-indigo-800 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-wide">
                          <Heart className="w-2.5 h-2.5 fill-indigo-700 text-indigo-700" /> VIP Elite
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-400">{selectedCustomer.phone} • {selectedCustomer.email || "No Email listed"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">Total visits</span>
                    <span className="block font-bold text-gray-800 text-sm">{activeCustomerOrders.length} orders</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">Lifetime spent</span>
                    <span className="block font-black text-indigo-800 text-sm">₹{activeCustomerOrders.reduce((sum, o) => sum + o.total, 0)}</span>
                  </div>
                </div>
              </div>

              {/* Order visit timelines */}
              <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-2.5" id="customer-visit-scroller">
                <h5 className="font-bold text-gray-500 text-[10px] uppercase tracking-wider">Purchase Audit History</h5>
                {activeCustomerOrders.length > 0 ? (
                  activeCustomerOrders.map(order => (
                    <div key={order.id} className="bg-gray-50/50 border border-gray-100 rounded-xl p-3 space-y-2" id={`customer-visit-ord-${order.id}`}>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-black">Order #{order.orderNumber}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      
                      {/* Products punched list */}
                      <div className="text-[11px] text-gray-600 border-t border-dashed border-gray-200/60 pt-2 space-y-1">
                        {(order.items && order.items.length > 0 ? order.items : [{ name: "Custom POS Sale Item", price: order.total, quantity: 1 }]).map((it, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="truncate pr-1">• {it.name} <strong className="text-gray-400">x{it.quantity}</strong></span>
                            <span>₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Total bill */}
                      <div className="flex justify-between items-center text-xs font-bold pt-1.5 border-t border-gray-100">
                        <span className="text-gray-400 font-normal">Method: {order.paymentMethod}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrderForPrint(order)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1 cursor-pointer"
                            title="Print Customer Receipt"
                          >
                            <Printer className="w-2.5 h-2.5" />
                            Print Bill
                          </button>
                          <span className="text-indigo-800 font-extrabold">Bill Paid: ₹{order.total}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-10 text-xs italic">No orders logged with this customer phone.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-300 space-y-3" id="customer-profile-placeholder">
              <Sparkles className="w-12 h-12 text-gray-200" />
              <div>
                <h5 className="font-semibold text-gray-500">Customer Visit Trail</h5>
                <p className="text-xs text-gray-400 max-w-[200px] mx-auto mt-1">Select a customer from the left list to view visit timelines and purchase habits.</p>
              </div>
            </div>
          )}
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
