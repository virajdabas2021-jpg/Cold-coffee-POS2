import React, { useEffect } from "react";
import { Order } from "../types";
import { X, Printer, CheckCircle, AlertTriangle } from "lucide-react";

interface ReceiptPrintProps {
  order: Order;
  warnings?: string[];
  onClose: () => void;
}

export default function ReceiptPrint({ order, warnings = [], onClose }: ReceiptPrintProps) {
  
  // Auto-trigger browser print on modal load (optional, but let's provide a clear button to trigger it manually to keep things controlled in an iframe)
  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto" id="receipt-modal-container">
      
      {/* Print-specific style block to ensure ONLY the receipt is printed when printing is triggered */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-receipt-paper, #print-receipt-paper * {
            visibility: visible;
          }
          #print-receipt-paper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          /* Hide modals and non-printable structures */
          #receipt-modal-controls, .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 flex flex-col overflow-hidden max-h-[90vh]" id="receipt-modal-box">
        
        {/* Success Header and alerts (Non-printable) */}
        <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-start gap-3 shrink-0 no-print" id="receipt-success-banner">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-full mt-0.5">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-emerald-950 text-sm">Order Placed Successfully!</h4>
            <p className="text-emerald-700 text-xs mt-0.5">Order #{order.orderNumber} has been recorded in the database.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inventory low stock alerts (Non-printable) */}
        {warnings.length > 0 && (
          <div className="p-3.5 bg-amber-50 border-b border-amber-100 flex items-start gap-2.5 text-xs text-amber-800 shrink-0 no-print" id="receipt-modal-warnings">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <span className="font-bold">Post-Checkout Warnings:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                {warnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Scrollable container for receipt preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50 flex justify-center" id="receipt-scroll-container">
          
          {/* Simulated Thermal Printer Roll Paper */}
          <div 
            id="print-receipt-paper"
            className="bg-white p-5 shadow-sm border border-gray-200 w-full max-w-xs text-slate-800 font-mono text-[11px] leading-relaxed relative flex flex-col justify-between"
          >
            {/* Thermal Cut Edge Graphic lines at top */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-b from-gray-200 to-transparent pointer-events-none"></div>

            <div className="space-y-4">
              {/* Coffee Brand Logo & Header */}
              <div className="text-center space-y-1">
                <span className="text-xl">☕</span>
                <h2 className="font-black text-sm uppercase tracking-wider text-black">Ramsas Coffee Cafe</h2>
                <p className="text-[10px] text-gray-500">Medical clg , Mansurpur</p>
                <p className="text-[10px] text-gray-500">Tel: +91 98765 43210</p>
                <p className="text-[10px] text-gray-500">GSTIN: 07AAAAA1111A1Z1</p>
              </div>

              {/* Dotted separator */}
              <div className="border-t border-dashed border-gray-400 my-2"></div>

              {/* Order Info Metadata */}
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>ORDER NO:</span>
                  <span className="font-bold text-black">#{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{new Date(order.createdAt).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>CASHIER:</span>
                  <span className="uppercase">{order.staffName}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAYMENT:</span>
                  <span className="font-bold uppercase text-black">{order.paymentMethod} (PAID)</span>
                </div>
                {order.customerPhone && (
                  <div className="flex justify-between text-black">
                    <span>CUSTOMER:</span>
                    <span>{order.customerName || "Member"} ({order.customerPhone})</span>
                  </div>
                )}
              </div>

              {/* Dotted separator */}
              <div className="border-t border-dashed border-gray-400 my-2"></div>

              {/* Items Table Headers */}
              <div className="space-y-1">
                <div className="grid grid-cols-12 font-bold text-black border-b border-dashed border-gray-300 pb-1 mb-1 text-[10px]">
                  <span className="col-span-6">ITEM</span>
                  <span className="col-span-2 text-center">QTY</span>
                  <span className="col-span-4 text-right">TOTAL</span>
                </div>

                {/* Items List */}
                <div className="space-y-1">
                  {(order.items && order.items.length > 0 ? order.items : [{ name: "Custom POS Sale Item", price: order.total, quantity: 1 }]).map((item, index) => (
                    <div key={index} className="grid grid-cols-12 text-[10px] text-black">
                      <div className="col-span-6 truncate pr-1">
                        <span>{item.name}</span>
                        <div className="text-[9px] text-gray-500">@ ₹{item.price}</div>
                      </div>
                      <span className="col-span-2 text-center self-start">x{item.quantity}</span>
                      <span className="col-span-4 text-right font-bold self-start">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dotted separator */}
              <div className="border-t border-dashed border-gray-400 my-2"></div>

              {/* Pricing Math calculations */}
              <div className="space-y-1 text-[10px] text-black">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>₹{order.subtotal}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>COUPON SAVINGS:</span>
                    <span>-₹{order.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-dashed border-gray-300">
                  <span>TOTAL BILL:</span>
                  <span>₹{order.total}</span>
                </div>
              </div>

              {/* Dotted separator */}
              <div className="border-t border-dashed border-gray-400 my-2"></div>

              {/* Footer Greet Message */}
              <div className="text-center space-y-1 py-1 text-[10px]">
                <p className="font-bold">THANK YOU FOR VISITING!</p>
                <p className="text-gray-500">Brewed with love & chilled to perfection.</p>
                <p className="text-[9px] text-gray-400 pt-2">Powered by Cold Coffee POS</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls Pane (Non-printable) */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0 no-print" id="receipt-modal-controls">
          <button
            onClick={onClose}
            className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
            id="receipt-btn-close"
          >
            Done & Close
          </button>
          
          <button
            onClick={triggerPrint}
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            id="receipt-btn-print"
          >
            <Printer className="w-4 h-4" />
            Print Thermal
          </button>
        </div>

      </div>
    </div>
  );
}
