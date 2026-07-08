import React, { useState, useEffect } from "react";
import { MenuItem, OrderItem, Coupon, Customer, Staff } from "../types";
import { Search, ShoppingCart, Tag, User, CreditCard, ChevronRight, Plus, Minus, Trash2, Printer, Coffee, AlertCircle, Sparkles } from "lucide-react";
import { createOrder, CheckoutPayload } from "../lib/api";
import { motion, AnimatePresence } from "motion/react";
import ReceiptPrint from "./ReceiptPrint";

const getPlaceholderImageForCategory = (name: string, category: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes("shake")) {
    return "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80";
  }
  if (category === "Classic Brews") {
    return "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80";
  }
  if (category === "Flavored Brews") {
    return "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=500&q=80";
  }
  if (category === "Frappes") {
    return "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=80";
  }
  // Default to sides/snacks
  return "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=500&q=80";
};

interface OrderSystemProps {
  menu: MenuItem[];
  coupons: Coupon[];
  customers: Customer[];
  currentStaff: Staff;
  onOrderPlaced: () => void;
}

export default function OrderSystem({ menu, coupons, customers, currentStaff, onOrderPlaced }: OrderSystemProps) {
  // POS State
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Customer State
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Discount & Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "UPI" | "Card">("Cash");

  // Checkout Response / Receipt State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutWarnings, setCheckoutWarnings] = useState<string[]>([]);
  const [receiptOrder, setReceiptOrder] = useState<any | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Auto-lookup customer name by phone
  useEffect(() => {
    if (customerPhone.trim().length >= 10) {
      const match = customers.find(c => c.phone.trim() === customerPhone.trim());
      if (match) {
        setCustomerName(match.name);
        setCustomerEmail(match.email || "");
      }
    }
  }, [customerPhone, customers]);

  // Categories extraction
  const categories = ["All", ...Array.from(new Set(menu.map(item => item.category)))];

  // Filtering Menu Items
  const filteredMenu = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add Item to Cart
  const addToCart = (item: MenuItem) => {
    if (!item.available) return;
    
    setCart(prevCart => {
      const existing = prevCart.find(cartItem => cartItem.menuItemId === item.id);
      if (existing) {
        return prevCart.map(cartItem =>
          cartItem.menuItemId === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          category: item.category
        }];
      }
    });
  };

  // Adjust Quantity
  const updateQuantity = (menuItemId: string, change: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.menuItemId === menuItemId) {
          const newQty = item.quantity + change;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as OrderItem[];
    });
  };

  // Remove Item from Cart
  const removeFromCart = (menuItemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.menuItemId !== menuItemId));
  };

  // Math totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Calculate discount based on applied coupon
  let discountAmount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.type === "Percentage") {
      discountAmount = parseFloat(((subtotal * appliedCoupon.value) / 100).toFixed(2));
    } else {
      discountAmount = appliedCoupon.value;
    }
  }
  const total = Math.max(0, subtotal - discountAmount);

  // Apply coupon function
  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError("");

    const code = couponInput.toUpperCase().trim();
    if (!code) {
      setAppliedCoupon(null);
      return;
    }

    const coupon = coupons.find(c => c.code === code);
    if (!coupon) {
      setCouponError("Invalid coupon code.");
      setAppliedCoupon(null);
      return;
    }

    if (!coupon.active) {
      setCouponError("This coupon has expired.");
      setAppliedCoupon(null);
      return;
    }

    if (subtotal < coupon.minOrderValue) {
      setCouponError(`Min order value is ₹${coupon.minOrderValue}.`);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponError("");
  };

  // Handle Checkout Action
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    setCheckoutWarnings([]);

    try {
      const payload: CheckoutPayload = {
        items: cart,
        subtotal,
        discountAmount,
        couponCode: appliedCoupon?.code,
        total,
        paymentMethod,
        paymentStatus: "Paid",
        staffId: currentStaff.id,
        staffName: currentStaff.name,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined
      };

      const result = await createOrder(payload);
      if (result.success) {
        setReceiptOrder(result.order);
        setCheckoutWarnings(result.warnings);
        setShowReceiptModal(true);

        // Reset Cart and parameters
        setCart([]);
        setCustomerPhone("");
        setCustomerName("");
        setCustomerEmail("");
        setAppliedCoupon(null);
        setCouponInput("");
        onOrderPlaced();
      }
    } catch (err) {
      console.error("Checkout error", err);
      alert("Error processing transaction. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="pos-billing-system">
      {/* LEFT PANEL: Menu Catalog Selector (8 columns) */}
      <div className="xl:col-span-8 flex flex-col bg-white rounded-2xl border border-gray-100 p-5 shadow-xs" id="pos-catalog-panel">
        
        {/* Search and Categories Header */}
        <div className="space-y-4 shrink-0" id="pos-catalog-controls">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <Coffee className="w-5 h-5 text-indigo-600" />
                Beverage Catalog
              </h3>
              <p className="text-xs text-gray-400">Select drinks or snacks to build client cart</p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search cold coffees..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                id="pos-item-search"
              />
            </div>
          </div>

          {/* Horizonal Categories Scrollable Strip */}
          <div className="flex space-x-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent" id="pos-category-scroller">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                id={`cat-tab-${cat.replace(/\s+/g, "-")}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Grid of Items */}
        <div className="mt-4" id="pos-menu-grid">
          {filteredMenu.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-4">
              {filteredMenu.map(item => (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className={`bg-white border rounded-2xl overflow-hidden cursor-pointer transition-all flex flex-col justify-between h-full group ${
                    item.available 
                      ? "border-gray-100 hover:border-indigo-500 hover:shadow-lg hover:-translate-y-0.5" 
                      : "border-gray-200 bg-gray-50/50 cursor-not-allowed opacity-60"
                  }`}
                  id={`menu-item-${item.id}`}
                >
                  <div className="flex flex-col">
                    {/* Item Image */}
                    <div className="relative w-full aspect-video md:aspect-[4/3] bg-gray-100 overflow-hidden shrink-0">
                      <img 
                        src={item.image || getPlaceholderImageForCategory(item.name, item.category)} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      {!item.available && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                          <span className="text-[10px] font-extrabold text-white bg-rose-600 px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 space-y-1">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[9px] font-extrabold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      
                      <h4 className="font-extrabold text-gray-900 text-sm md:text-base leading-tight group-hover:text-indigo-600 transition-colors">
                        {item.name}
                      </h4>
                      
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                        {item.description || "Freshly brewed classic beverage."}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-3.5 pb-3.5 pt-2 border-t border-gray-50">
                    <span className="font-extrabold text-indigo-950 text-sm md:text-base">
                      ₹{item.price}
                    </span>
                    <span className={`p-1.5 rounded-xl ${item.available ? "bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white" : "bg-gray-100 text-gray-400"} transition-all`}>
                      <Plus className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-3" id="pos-no-items">
              <Coffee className="w-16 h-16 text-gray-200 stroke-1" />
              <div>
                <h5 className="font-bold text-gray-700">No Items Found</h5>
                <p className="text-xs">Adjust search keywords or add new menu items.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Shopping Cart, Customer & Checkout Details (4 columns) */}
      <div className="xl:col-span-4 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-xs" id="pos-billing-panel">
        
        {/* Cart Header */}
        <div className="bg-gray-50/70 p-4 border-b border-gray-100 flex justify-between items-center shrink-0" id="pos-cart-header">
          <div className="flex items-center space-x-2 text-gray-700 font-bold text-sm">
            <ShoppingCart className="w-4 h-4 text-indigo-600" />
            <span>Active Cart ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
          </div>
          {cart.length > 0 && (
            <button 
              onClick={() => setCart([])}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Clear Cart
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="p-4 space-y-3" id="pos-cart-items-scroller">
          {cart.length > 0 ? (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.menuItemId} className="flex justify-between items-center gap-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50" id={`cart-item-${item.menuItemId}`}>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-gray-800 text-xs md:text-sm truncate">{item.name}</h5>
                    <p className="text-[11px] text-gray-400 mt-0.5">₹{item.price} each</p>
                  </div>
                  
                  {/* Quantity Incrementor Controls */}
                  <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 px-1 py-0.5 shadow-2xs">
                    <button 
                      onClick={() => updateQuantity(item.menuItemId, -1)}
                      className="p-1 hover:bg-gray-50 text-gray-500 rounded cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-gray-800 w-5 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.menuItemId, 1)}
                      className="p-1 hover:bg-gray-50 text-gray-500 rounded cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right pl-1">
                    <span className="font-extrabold text-xs md:text-sm text-gray-800 block">
                      ₹{item.price * item.quantity}
                    </span>
                    <button 
                      onClick={() => removeFromCart(item.menuItemId)}
                      className="text-gray-300 hover:text-rose-600 mt-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-300 py-16 space-y-2" id="pos-cart-empty">
              <ShoppingCart className="w-10 h-10 stroke-1 text-gray-300" />
              <p className="text-xs text-gray-400">Cart is empty. Select beverages from the catalog.</p>
            </div>
          )}
        </div>

        {/* Dynamic Billing Form Controls */}
        <div className="border-t border-gray-100 p-4 space-y-4 shrink-0 bg-gray-50/40" id="pos-billing-calculations">
          
          {/* Customer History & Tracking Form */}
          <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-100 shadow-2xs" id="pos-customer-subform">
            <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              Customer Association
            </h6>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Mobile (10 digit)"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                maxLength={10}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                id="pos-cust-phone"
              />
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                id="pos-cust-name"
              />
            </div>
          </div>

          {/* Discount Coupon Code Integration */}
          <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-100 shadow-2xs" id="pos-coupon-subform">
            <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              Discounts & Promo Coupons
            </h6>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Code (e.g. WELCOME10)"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value)}
                disabled={appliedCoupon !== null}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 flex-1"
                id="pos-coupon-code"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponInput("");
                  }}
                  className="bg-gray-200 text-gray-700 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-gray-300 transition cursor-pointer shrink-0"
                  id="pos-btn-remove-coupon"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-indigo-600 text-white font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition shadow-xs cursor-pointer shrink-0"
                  id="pos-btn-apply-coupon"
                >
                  Apply
                </button>
              )}
            </form>
            {couponError && <p className="text-[10px] text-rose-600 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {couponError}</p>}
            {appliedCoupon && (
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-spin" /> Promo "{appliedCoupon.code}" Applied: Saved ₹{discountAmount}!
              </p>
            )}
          </div>

          {/* Payment Method Selector Grid */}
          <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-100 shadow-2xs" id="pos-payment-subform">
            <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
              Payment Mechanism
            </h6>
            <div className="grid grid-cols-3 gap-2">
              {(["Cash", "UPI", "Card"] as const).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center border cursor-pointer ${
                    paymentMethod === method
                      ? "bg-indigo-50 border-indigo-600 text-indigo-950"
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                  }`}
                  id={`pay-method-${method.toLowerCase()}`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Cart Pricing Summary details */}
          <div className="space-y-1.5 text-sm pt-2" id="pos-pricing-breakdown">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal:</span>
              <span className="font-medium text-gray-700">₹{subtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Coupon Savings:</span>
                <span className="font-semibold">-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-800 border-t border-dashed border-gray-200 pt-2 text-base">
              <span className="font-bold">Total Bill:</span>
              <span className="font-extrabold text-indigo-600 text-lg">₹{total}</span>
            </div>
          </div>

          {/* Checkout Checkout Action Trigger */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isSubmitting}
            className={`w-full font-bold text-white py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
              cart.length === 0 
                ? "bg-gray-300 shadow-none cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            id="pos-checkout-btn"
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                <span>Punch Order & Print (₹{total})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Render Printer / Print Receipt Modal */}
      {showReceiptModal && receiptOrder && (
        <ReceiptPrint
          order={receiptOrder}
          onClose={() => {
            setShowReceiptModal(false);
            setReceiptOrder(null);
            setCheckoutWarnings([]);
          }}
          warnings={checkoutWarnings}
        />
      )}
    </div>
  );
}
