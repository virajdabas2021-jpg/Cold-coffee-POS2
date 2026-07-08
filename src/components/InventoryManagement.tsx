import React, { useState } from "react";
import { InventoryItem } from "../types";
import { Plus, Edit, Trash2, ArrowUpRight, ShieldAlert, Sparkles, X, RefreshCw, Layers } from "lucide-react";
import { createInventoryItem, updateInventoryItem, deleteInventoryItem } from "../lib/api";

interface InventoryManagementProps {
  inventory: InventoryItem[];
  onInventoryUpdated: () => void;
}

export default function InventoryManagement({ inventory, onInventoryUpdated }: InventoryManagementProps) {
  // Modal & Form States
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [unit, setUnit] = useState("Liters");
  const [reorderLevel, setReorderLevel] = useState("");

  const units = ["Liters", "kg", "Bottles", "Units", "Boxes", "Grams"];

  // Open Form
  const openAddForm = () => {
    setEditingItem(null);
    setName("");
    setCurrentStock("");
    setUnit("Liters");
    setReorderLevel("");
    setShowForm(true);
  };

  const openEditForm = (item: InventoryItem) => {
    setEditingItem(item);
    setName(item.name);
    setCurrentStock(item.currentStock.toString());
    setUnit(item.unit);
    setReorderLevel(item.reorderLevel.toString());
    setShowForm(true);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !currentStock || !reorderLevel) {
      alert("Please fill in all fields.");
      return;
    }

    const stockNum = parseFloat(currentStock);
    const reorderNum = parseFloat(reorderLevel);

    if (isNaN(stockNum) || stockNum < 0 || isNaN(reorderNum) || reorderNum < 0) {
      alert("Values must be positive numbers.");
      return;
    }

    try {
      const payload = {
        name,
        currentStock: stockNum,
        unit,
        reorderLevel: reorderNum
      };

      if (editingItem) {
        await updateInventoryItem(editingItem.id, payload);
      } else {
        await createInventoryItem(payload);
      }

      setShowForm(false);
      onInventoryUpdated();
    } catch (err) {
      console.error("Inventory error", err);
      alert("Failed to update inventory.");
    }
  };

  // Quick addition of stock
  const handleQuickAdd = async (item: InventoryItem, amount: number) => {
    try {
      const newStock = Math.max(0, parseFloat((item.currentStock + amount).toFixed(3)));
      await updateInventoryItem(item.id, { currentStock: newStock });
      onInventoryUpdated();
    } catch (err) {
      console.error("Quick adjust error", err);
    }
  };

  // Delete Ingredient
  const executeDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteInventoryItem(deleteTargetId);
      setDeleteTargetId(null);
      onInventoryUpdated();
    } catch (err) {
      console.error("Delete inventory error", err);
    }
  };

  return (
    <div className="space-y-6" id="inventory-management-tab">
      
      {/* Title & Add Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="inv-mgmt-header">
        <div>
          <h3 className="font-bold text-gray-800 text-xl">Raw Materials & Inventory</h3>
          <p className="text-xs text-gray-400">Manage cafe reserves (milk, sugar, beans, cup supplies) with threshold level notifications</p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          id="btn-add-inv-item"
        >
          <Plus className="w-4 h-4" /> Add Raw Ingredient
        </button>
      </div>

      {/* Grid: Stock Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="inv-mgmt-stats">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Raw Materials</h5>
            <p className="text-xl font-bold text-gray-800">{inventory.length} Stock SKU items</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center space-x-4 col-span-2">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h5 className="text-xs text-gray-400 font-medium uppercase tracking-wider">Restock Priority</h5>
            <p className="text-sm font-semibold text-gray-700 mt-0.5">
              {inventory.filter(i => i.currentStock <= i.reorderLevel).length > 0 ? (
                <span className="text-rose-600 font-bold">
                  {inventory.filter(i => i.currentStock <= i.reorderLevel).map(i => i.name).join(", ")} are critically low!
                </span>
              ) : (
                <span className="text-emerald-600 font-bold">All stock reserves are above safe threshold limits.</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Stock Inventory Table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs" id="inv-mgmt-body">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="inventory-mgmt-table">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-3">
                <th className="py-3 px-4">Raw Ingredient</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Safeguard Limit</th>
                <th className="py-3 px-4 text-center">Quick Restock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {inventory.length > 0 ? (
                inventory.map(item => {
                  const isLow = item.currentStock <= item.reorderLevel;
                  const ratio = Math.min(100, (item.currentStock / (item.reorderLevel * 3)) * 100);
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors" id={`row-inv-${item.id}`}>
                      {/* Name & unit */}
                      <td className="py-3.5 px-4 font-bold text-gray-800">
                        {item.name}
                        <span className="text-[10px] font-medium text-gray-400 block mt-0.5">Unit size: {item.unit}</span>
                      </td>
                      
                      {/* Level progress bar */}
                      <td className="py-3.5 px-4 w-1/3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between font-bold text-xs">
                            <span className={isLow ? "text-rose-600 font-black animate-pulse" : "text-gray-700"}>
                              {item.currentStock} {item.unit}
                            </span>
                            <span className="text-gray-400 font-normal">Level Status</span>
                          </div>
                          
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${isLow ? "bg-rose-500" : "bg-indigo-600"}`} 
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Reorder limit */}
                      <td className="py-3.5 px-4">
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase border border-gray-200">
                          Min limit: {item.reorderLevel} {item.unit}
                        </span>
                      </td>

                      {/* Quick Restock buttons */}
                      <td className="py-3.5 px-4">
                        <div className="flex justify-center items-center space-x-1.5" id={`quick-restock-${item.id}`}>
                           <button
                            onClick={() => handleQuickAdd(item, item.unit === "Liters" ? 5 : item.unit === "Units" ? 50 : 1)}
                            className="bg-gray-100 hover:bg-indigo-100 hover:text-indigo-800 text-gray-600 font-bold text-[10px] px-2.5 py-1 rounded-md border border-gray-200 hover:border-indigo-200 cursor-pointer flex items-center gap-0.5"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            +{item.unit === "Liters" ? "5L" : item.unit === "Units" ? "50" : "1kg"}
                          </button>
                          <button
                            onClick={() => handleQuickAdd(item, item.unit === "Liters" ? 10 : item.unit === "Units" ? 100 : 5)}
                            className="bg-gray-100 hover:bg-indigo-100 hover:text-indigo-800 text-gray-600 font-bold text-[10px] px-2.5 py-1 rounded-md border border-gray-200 hover:border-indigo-200 cursor-pointer flex items-center gap-0.5"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            +{item.unit === "Liters" ? "10L" : item.unit === "Units" ? "100" : "5kg"}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => openEditForm(item)}
                            className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-indigo-700 rounded-lg transition cursor-pointer"
                            id={`btn-edit-inv-${item.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(item.id)}
                            className="p-1.5 hover:bg-rose-50 text-gray-500 hover:text-rose-600 rounded-lg transition cursor-pointer"
                            id={`btn-delete-inv-${item.id}`}
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
                    No ingredients listed. Initialize stock SKU records first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit modal sheet */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="inv-modal-overlay">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 flex flex-col overflow-hidden" id="inv-modal-box">
            
            {/* Modal title */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50" id="inv-modal-header">
              <h4 className="font-extrabold text-gray-800 text-base flex items-center gap-2">
                <RefreshCw className="w-4.5 h-4.5 text-indigo-600" />
                {editingItem ? `Adjust Stock SKU: ${editingItem.name}` : "Log New Raw Material"}
              </h4>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4" id="inventory-creation-form">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Ingredient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium Cocoa Powder"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                  id="form-inv-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Measuring Unit *</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                    id="form-inv-unit"
                  >
                    {units.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Current Stock *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 15.5"
                    value={currentStock}
                    onChange={e => setCurrentStock(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 font-bold"
                    id="form-inv-stock"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Reorder Alert Level *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 3.0"
                  value={reorderLevel}
                  onChange={e => setReorderLevel(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                  id="form-inv-reorder"
                />
                <p className="text-[10px] text-gray-400 mt-1">Triggers low stock alerts on the dashboard when stock falls below this level.</p>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-100 pt-5 flex gap-3" id="inv-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition cursor-pointer"
                  id="inv-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md cursor-pointer"
                  id="inv-btn-save"
                >
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="delete-inv-confirm-modal">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h4 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              Delete Raw Material?
            </h4>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this raw ingredient? Any mapped recipes will stop deducting this item. This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-xl font-semibold hover:bg-gray-50 transition cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="flex-1 bg-rose-600 text-white font-semibold py-2 rounded-xl hover:bg-rose-700 transition shadow-md cursor-pointer text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
