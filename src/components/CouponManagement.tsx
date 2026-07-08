import React, { useState } from "react";
import { Coupon } from "../types";
import { Plus, Edit, Trash2, Tag, Percent, Sparkles, X, Check, Gift } from "lucide-react";
import { createCoupon, updateCoupon, deleteCoupon } from "../lib/api";

interface CouponManagementProps {
  coupons: Coupon[];
  onCouponsUpdated: () => void;
}

export default function CouponManagement({ coupons, onCouponsUpdated }: CouponManagementProps) {
  // Modal & Form States
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form Fields
  const [code, setCode] = useState("");
  const [type, setType] = useState<"Percentage" | "Fixed">("Percentage");
  const [value, setValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [active, setActive] = useState(true);

  // Open Form
  const openAddForm = () => {
    setEditingCoupon(null);
    setCode("");
    setType("Percentage");
    setValue("");
    setMinOrderValue("");
    setActive(true);
    setShowForm(true);
  };

  const openEditForm = (item: Coupon) => {
    setEditingCoupon(item);
    setCode(item.code);
    setType(item.type);
    setValue(item.value.toString());
    setMinOrderValue(item.minOrderValue.toString());
    setActive(item.active);
    setShowForm(true);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value || !minOrderValue) {
      alert("Please fill in all fields.");
      return;
    }

    const valueNum = parseFloat(value);
    const minValNum = parseFloat(minOrderValue);

    if (isNaN(valueNum) || valueNum <= 0 || isNaN(minValNum) || minValNum < 0) {
      alert("Values must be positive numbers.");
      return;
    }

    if (type === "Percentage" && valueNum > 100) {
      alert("Percentage discount cannot exceed 100%!");
      return;
    }

    try {
      const payload = {
        code: code.toUpperCase().trim(),
        type,
        value: valueNum,
        minOrderValue: minValNum,
        active
      };

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload);
      } else {
        await createCoupon(payload);
      }

      setShowForm(false);
      onCouponsUpdated();
    } catch (err) {
      console.error("Coupon error", err);
      alert("Failed to update coupon.");
    }
  };

  // Quick toggle active status
  const handleToggleActive = async (item: Coupon) => {
    try {
      await updateCoupon(item.id, { active: !item.active });
      onCouponsUpdated();
    } catch (err) {
      console.error("Toggle error", err);
    }
  };

  // Delete Coupon
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon? It won't apply to new order checkout operations.")) return;
    try {
      await deleteCoupon(id);
      onCouponsUpdated();
    } catch (err) {
      console.error("Delete coupon error", err);
    }
  };

  return (
    <div className="space-y-6" id="coupon-management-tab">
      
      {/* Title & Add Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="coupon-mgmt-header">
        <div>
          <h3 className="font-bold text-gray-800 text-xl">Promotions & Discount Campaigns</h3>
          <p className="text-xs text-gray-400">Establish and authorize active promo codes, set percentage reductions, or define fixed value discounts</p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          id="btn-add-coupon"
        >
          <Plus className="w-4 h-4" /> Add Coupon Code
        </button>
      </div>

      {/* Main Coupons Listing Table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs" id="coupon-mgmt-body">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="coupon-mgmt-table">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-3">
                <th className="py-3 px-4">Promo Code</th>
                <th className="py-3 px-4">Discount Value</th>
                <th className="py-3 px-4">Min Ticket Order Value</th>
                <th className="py-3 px-4">Campaign status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {coupons.length > 0 ? (
                coupons.map(coupon => {
                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors" id={`row-coupon-${coupon.id}`}>
                      {/* Code Tag */}
                      <td className="py-3.5 px-4 font-black text-indigo-700 uppercase tracking-widest font-mono">
                        {coupon.code}
                      </td>

                      {/* Value reduction */}
                      <td className="py-3.5 px-4 font-bold text-gray-800">
                        {coupon.type === "Percentage" ? `${coupon.value}% Off` : `₹${coupon.value} Flat Off`}
                      </td>

                      {/* Threshold limit */}
                      <td className="py-3.5 px-4 text-gray-600 font-semibold">
                        ₹{coupon.minOrderValue}
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(coupon)}
                          className={`text-xs font-bold px-3 py-1 rounded-full cursor-pointer transition ${
                            coupon.active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-gray-50 text-gray-400 border border-gray-100"
                          }`}
                          id={`btn-toggle-coupon-${coupon.id}`}
                        >
                          {coupon.active ? "Active Campaigns" : "Paused"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => openEditForm(coupon)}
                            className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-indigo-600 rounded-lg transition cursor-pointer"
                            id={`btn-edit-coupon-${coupon.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="p-1.5 hover:bg-rose-50 text-gray-500 hover:text-rose-600 rounded-lg transition cursor-pointer"
                            id={`btn-delete-coupon-${coupon.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No active discount coupons list. Add codes to start campaigns.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Form Modal sheet */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="coupon-modal-overlay">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-gray-100 flex flex-col overflow-hidden" id="coupon-modal-box">
            
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50" id="coupon-modal-header">
              <h4 className="font-extrabold text-gray-800 text-base flex items-center gap-2">
                <Gift className="w-4.5 h-4.5 text-indigo-600" />
                {editingCoupon ? `Campaign: ${editingCoupon.code}` : "Log New Promo Coupon"}
              </h4>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm" id="coupon-creation-form">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CHILLOUT15"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 font-bold uppercase tracking-widest font-mono"
                  id="form-coupon-code"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Discount Class *</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as "Percentage" | "Fixed")}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                    id="form-coupon-type"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Flat Value (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Reduction Value *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 15 or 50"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 font-bold"
                    id="form-coupon-value"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Minimum Order Basket Value (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 250"
                  value={minOrderValue}
                  onChange={e => setMinOrderValue(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                  id="form-coupon-minval"
                />
                <p className="text-[10px] text-gray-400 mt-1">Customers' active shopping cart subtotal must meet or exceed this amount to redeem this code.</p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Authorize Promotion status</label>
                <div className="flex space-x-3 h-10 items-center">
                  <button
                    type="button"
                    onClick={() => setActive(true)}
                    className={`px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition ${
                      active 
                        ? "bg-emerald-50 border border-emerald-500 text-emerald-800" 
                        : "bg-gray-50 border border-gray-200 text-gray-400"
                    }`}
                  >
                    Campaign Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setActive(false)}
                    className={`px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition ${
                      !active 
                        ? "bg-rose-50 border border-rose-500 text-rose-800" 
                        : "bg-gray-50 border border-gray-200 text-gray-400"
                    }`}
                  >
                    Campaign Paused
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-100 pt-5 flex gap-3" id="coupon-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition cursor-pointer"
                  id="coupon-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md cursor-pointer"
                  id="coupon-btn-save"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
