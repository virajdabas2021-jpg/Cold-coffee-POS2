import React, { useState } from "react";
import { MenuItem, InventoryItem } from "../types";
import { Plus, Edit, Trash2, Check, X, Tag, Sparkles, HelpCircle, PackageOpen } from "lucide-react";
import { createMenuItem, updateMenuItem, deleteMenuItem } from "../lib/api";

interface MenuManagementProps {
  menu: MenuItem[];
  inventory: InventoryItem[];
  onMenuUpdated: () => void;
}

export default function MenuManagement({ menu, inventory, onMenuUpdated }: MenuManagementProps) {
  // Modal & Form States
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Classic Brews");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [available, setAvailable] = useState(true);
  
  // Linkages to raw ingredients
  const [selectedIngredients, setSelectedIngredients] = useState<{ inventoryId: string; amount: number }[]>([]);
  const [currentIngredientId, setCurrentIngredientId] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");

  const categories = ["Classic Brews", "Flavored Brews", "Frappes", "Sides & Snacks"];

  // Open Add Form
  const openAddForm = () => {
    setEditingItem(null);
    setName("");
    setPrice("");
    setCategory("Classic Brews");
    setDescription("");
    setImage("");
    setAvailable(true);
    setSelectedIngredients([]);
    setCurrentIngredientId("");
    setCurrentAmount("");
    setShowForm(true);
  };

  // Open Edit Form
  const openEditForm = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(item.price.toString());
    setCategory(item.category);
    setDescription(item.description || "");
    setImage(item.image || "");
    setAvailable(item.available);
    setSelectedIngredients(item.ingredients || []);
    setCurrentIngredientId("");
    setCurrentAmount("");
    setShowForm(true);
  };

  // Add ingredient link to current form state
  const addIngredientLink = () => {
    if (!currentIngredientId || !currentAmount) return;
    const amountNum = parseFloat(currentAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    // Avoid duplicate ingredients linkage
    if (selectedIngredients.some(i => i.inventoryId === currentIngredientId)) {
      alert("Ingredient is already mapped to this drink!");
      return;
    }

    setSelectedIngredients(prev => [...prev, { inventoryId: currentIngredientId, amount: amountNum }]);
    setCurrentIngredientId("");
    setCurrentAmount("");
  };

  // Remove ingredient link from current form state
  const removeIngredientLink = (invId: string) => {
    setSelectedIngredients(prev => prev.filter(i => i.inventoryId !== invId));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      alert("Please fill in Name and Price.");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Price must be a valid positive number.");
      return;
    }

    try {
      const payload = {
        name,
        price: priceNum,
        category,
        description,
        image: image.trim() || undefined,
        available,
        ingredients: selectedIngredients
      };

      if (editingItem) {
        await updateMenuItem(editingItem.id, payload);
      } else {
        await createMenuItem(payload);
      }

      setShowForm(false);
      onMenuUpdated();
    } catch (err) {
      console.error("Failed to save menu item", err);
      alert("Failed to save menu item. Check server configurations.");
    }
  };

  // Handle Delete Action
  const executeDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteMenuItem(deleteTargetId);
      setDeleteTargetId(null);
      onMenuUpdated();
    } catch (err) {
      console.error("Failed to delete menu item", err);
    }
  };

  // Helper: toggle availability directly from listing
  const handleToggleAvailable = async (item: MenuItem) => {
    try {
      await updateMenuItem(item.id, { available: !item.available });
      onMenuUpdated();
    } catch (err) {
      console.error("Toggle error", err);
    }
  };

  return (
    <div className="space-y-6" id="menu-management-tab">
      
      {/* Title & Add Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="menu-mgmt-header">
        <div>
          <h3 className="font-bold text-gray-800 text-xl">Menu Catalog Customization</h3>
          <p className="text-xs text-gray-400">Configure point-of-sale beverages, prices, and automated recipe inventory deduct linkages</p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          id="btn-add-menu-item"
        >
          <Plus className="w-4 h-4" /> Add Menu Item
        </button>
      </div>

      {/* Categories Grid list of menu items */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs" id="menu-mgmt-body">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="menu-mgmt-table">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-3">
                <th className="py-3 px-4">Item details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4 text-center">Ingredients mapped</th>
                <th className="py-3 px-4">POS Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {menu.length > 0 ? (
                menu.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors" id={`row-menu-${item.id}`}>
                    {/* Item and description with Image thumbnail */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image || "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=120&q=80"} 
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-xl bg-gray-50 border border-gray-100 shadow-3xs shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-bold text-gray-800">{item.name}</h4>
                          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.description || "No custom description."}</p>
                        </div>
                      </div>
                    </td>
                    {/* Category tag */}
                    <td className="py-3.5 px-4">
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {item.category}
                      </span>
                    </td>
                    {/* Price tag */}
                    <td className="py-3.5 px-4 font-extrabold text-gray-900">
                      ₹{item.price}
                    </td>
                    {/* Linked Recipe list */}
                    <td className="py-3.5 px-4 text-center">
                      {item.ingredients && item.ingredients.length > 0 ? (
                        <span className="bg-indigo-50 text-indigo-800 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center justify-center gap-1 w-max mx-auto border border-indigo-100">
                          {item.ingredients.length} items linked
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    {/* Available toggle indicator */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleAvailable(item)}
                        className={`text-xs font-bold px-3 py-1 rounded-full cursor-pointer transition ${
                          item.available
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}
                        id={`btn-toggle-avail-${item.id}`}
                      >
                        {item.available ? "Active" : "Disabled"}
                      </button>
                    </td>
                    {/* CRUD buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => openEditForm(item)}
                          className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-indigo-600 rounded-lg transition cursor-pointer"
                          title="Edit recipe & price"
                          id={`btn-edit-${item.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(item.id)}
                          className="p-1.5 hover:bg-rose-50 text-gray-500 hover:text-rose-600 rounded-lg transition cursor-pointer"
                          title="Delete product"
                          id={`btn-delete-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <PackageOpen className="w-12 h-12 mx-auto text-gray-300 stroke-1 mb-2" />
                    No menu items in catalog. Create one to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Modal Form Sheet overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto" id="menu-modal-overlay">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-gray-100 flex flex-col overflow-hidden max-h-[90vh]" id="menu-modal-box">
            
            {/* Modal Title bar */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0" id="menu-modal-header">
              <h4 className="font-extrabold text-gray-800 text-base flex items-center gap-2">
                <Tag className="w-4.5 h-4.5 text-indigo-600" />
                {editingItem ? `Edit Menu Product: ${editingItem.name}` : "Create New Menu Product"}
              </h4>
              <button 
                onClick={() => setShowForm(false)} 
                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scrollable Form parameters */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-sm" id="menu-creation-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Hazelnut Frappe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                    id="form-item-name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">POS Sales Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="150"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 font-bold"
                    id="form-item-price"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                    id="form-item-category"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Availability Status</label>
                  <div className="flex items-center space-x-3 h-11" id="form-item-availability-toggles">
                    <button
                      type="button"
                      onClick={() => setAvailable(true)}
                      className={`px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition ${
                        available 
                          ? "bg-emerald-50 border border-emerald-500 text-emerald-800" 
                          : "bg-gray-50 border border-gray-200 text-gray-400"
                      }`}
                      id="form-avail-true"
                    >
                      Available
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvailable(false)}
                      className={`px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition ${
                        !available 
                          ? "bg-rose-50 border border-rose-500 text-rose-800" 
                          : "bg-gray-50 border border-gray-200 text-gray-400"
                      }`}
                      id="form-avail-false"
                    >
                      Out of Stock
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Product Description</label>
                <textarea
                  placeholder="Describe your cold brew flavor profiles..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 text-xs"
                  id="form-item-desc"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 block text-xs">Product Image</label>
                <div className="flex gap-4 items-center bg-gray-50 border border-gray-200 rounded-xl p-3" id="form-image-container">
                  {image ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0">
                      <img 
                        src={image} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setImage("")}
                        className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all cursor-pointer"
                        title="Remove Image"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-lg bg-white shrink-0">
                      ☕
                    </div>
                  )}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label 
                        htmlFor="image-upload-input" 
                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors inline-block text-center"
                      >
                        Choose from Gallery
                      </label>
                      <input 
                        type="file" 
                        id="image-upload-input" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                      />
                      <span className="text-[10px] text-gray-400">or paste URL below</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      value={image.startsWith("data:image") ? "" : image}
                      onChange={e => setImage(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 text-[11px]"
                      id="form-item-image-url"
                    />
                  </div>
                </div>
              </div>

              {/* Ingredients Linker Sub-Form (Advanced Feature) */}
              <div className="border-t border-gray-100 pt-4 space-y-3" id="recipe-ingredients-linking-subform">
                <div>
                  <h5 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Automated Ingredients Linker
                  </h5>
                  <p className="text-[11px] text-gray-400">Map this drink to raw ingredients. Selling this drink will deduct stock from inventory automatically!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                  <div className="md:col-span-6 space-y-1">
                    <label className="text-xs text-gray-500">Ingredient from Stock</label>
                    <select
                      value={currentIngredientId}
                      onChange={e => setCurrentIngredientId(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none text-gray-700"
                      id="linker-select-ing"
                    >
                      <option value="">-- Choose Stock Item --</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <label className="text-xs text-gray-500">Deduct Qty per Serving</label>
                    <input
                      type="number"
                      step="any"
                      min="0.001"
                      placeholder="e.g. 0.20"
                      value={currentAmount}
                      onChange={e => setCurrentAmount(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none text-gray-700 font-semibold"
                      id="linker-input-amount"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={addIngredientLink}
                    className="md:col-span-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold py-2 rounded-lg cursor-pointer h-9 transition-colors"
                    id="linker-add-btn"
                  >
                    Link
                  </button>
                </div>

                {/* Display currently mapped items */}
                <div className="space-y-1.5" id="linker-linked-list">
                  {selectedIngredients.length > 0 ? (
                    <div className="space-y-1.5">
                      {selectedIngredients.map(ing => {
                        const inv = inventory.find(i => i.id === ing.inventoryId);
                        return (
                          <div 
                            key={ing.inventoryId} 
                            className="flex justify-between items-center bg-indigo-50/50 px-3 py-2 rounded-lg border border-indigo-100/50 text-xs text-gray-800"
                            id={`linked-ing-${ing.inventoryId}`}
                          >
                            <span className="font-semibold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              {inv ? inv.name : "Unknown Item"}: {ing.amount} {inv ? inv.unit : ""}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeIngredientLink(ing.inventoryId)}
                              className="text-rose-600 hover:text-rose-800 font-bold p-1 cursor-pointer"
                              id={`linker-remove-btn-${ing.inventoryId}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs italic flex items-center gap-1 pl-1">
                      <HelpCircle className="w-3.5 h-3.5" /> No ingredients mapped yet. Ingredients won't deduct automatically for this recipe.
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-gray-100 pt-5 flex gap-3 shrink-0" id="menu-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition cursor-pointer"
                  id="menu-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md cursor-pointer"
                  id="menu-btn-save"
                >
                  Save Product
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="delete-menu-confirm-modal">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h4 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              Delete Menu Item?
            </h4>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this menu item from the POS? This action cannot be undone.
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
