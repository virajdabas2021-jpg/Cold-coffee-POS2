import React, { useState } from "react";
import { Staff } from "../types";
import { Plus, Edit, Trash2, Key, Users, Check, X, Shield, Lock } from "lucide-react";
import { createStaff, updateStaff, deleteStaff } from "../lib/api";

interface StaffManagementProps {
  staff: Staff[];
  currentStaff: Staff;
  onStaffUpdated: () => void;
}

export default function StaffManagement({ staff, currentStaff, onStaffUpdated }: StaffManagementProps) {
  // Modal & Form States
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState<"Admin" | "Cashier">("Cashier");
  const [active, setActive] = useState(true);

  // Open Form
  const openAddForm = () => {
    setEditingStaff(null);
    setName("");
    setPin("");
    setRole("Cashier");
    setActive(true);
    setShowForm(true);
  };

  const openEditForm = (item: Staff) => {
    setEditingStaff(item);
    setName(item.name);
    setPin(item.pin);
    setRole(item.role);
    setActive(item.active);
    setShowForm(true);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pin) {
      alert("Please fill in Name and PIN.");
      return;
    }

    if (pin.length !== 4 || isNaN(parseInt(pin))) {
      alert("PIN must be exactly 4 digits.");
      return;
    }

    try {
      const payload = {
        name,
        pin,
        role,
        active
      };

      if (editingStaff) {
        await updateStaff(editingStaff.id, payload);
      } else {
        await createStaff(payload);
      }

      setShowForm(false);
      onStaffUpdated();
    } catch (err) {
      console.error("Staff update error", err);
      alert("Failed to update staff.");
    }
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (id === currentStaff.id) {
      alert("You cannot delete yourself during an active shift!");
      return;
    }
    if (!window.confirm("Are you sure you want to revoke this staff member's POS terminal access?")) return;
    try {
      await deleteStaff(id);
      onStaffUpdated();
    } catch (err) {
      console.error("Delete staff error", err);
    }
  };

  return (
    <div className="space-y-6" id="staff-management-tab">
      
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="staff-mgmt-header">
        <div>
          <h3 className="font-bold text-gray-800 text-xl">Staff Roster & Access Controls</h3>
          <p className="text-xs text-gray-400">Establish cashier credentials, define operational roles, and set 4-digit terminal authentication PINs</p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          id="btn-add-staff"
        >
          <Plus className="w-4 h-4" /> Register New Employee
        </button>
      </div>

      {/* Staff Roster Listing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="staff-list-grid">
        {staff.map(member => {
          const isMe = member.id === currentStaff.id;
          
          return (
            <div 
              key={member.id} 
              className={`bg-white rounded-2xl border p-5 space-y-4 relative overflow-hidden transition ${
                isMe ? "border-indigo-500 shadow-md ring-1 ring-indigo-100" : "border-gray-100 shadow-2xs"
              }`}
              id={`staff-card-${member.id}`}
            >
              {/* Profile Card Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${member.role === "Admin" ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-700"}`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-800 text-sm flex items-center gap-1">
                      {member.name}
                      {isMe && <span className="text-[9px] bg-indigo-200 text-indigo-900 font-bold px-1.5 py-0.5 rounded uppercase">Active Shift</span>}
                    </h4>
                    <p className="text-xs text-gray-400 capitalize">{member.role} • PIN: ****</p>
                  </div>
                </div>

                <div className="flex space-x-1" id={`staff-actions-${member.id}`}>
                  <button
                    onClick={() => openEditForm(member)}
                    className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded"
                    title="Edit account credentials"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-1 text-gray-400 hover:text-rose-600 hover:bg-gray-50 rounded"
                    disabled={isMe}
                    title="Revoke access"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Pin verification and diagnostics */}
              <div className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 flex justify-between items-center text-xs">
                <span className="text-gray-400 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5" /> Terminal PIN: <strong className="text-gray-700 font-mono tracking-widest">{member.pin}</strong>
                </span>
                
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  member.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"
                }`}>
                  {member.active ? "Access Granted" : "Deactivated"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Form Modal sheet */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="staff-modal-overlay">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-gray-100 flex flex-col overflow-hidden" id="staff-modal-box">
            
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50" id="staff-modal-header">
              <h4 className="font-extrabold text-gray-800 text-base flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-indigo-600" />
                {editingStaff ? `Credentials: ${editingStaff.name}` : "Register New Cashier"}
              </h4>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm" id="staff-creation-form">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Full Employee Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aman Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                  id="form-staff-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Pincode (4 digit) *</label>
                  <input
                    type="password"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    required
                    placeholder="e.g. 1234"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 text-center font-mono font-bold tracking-widest"
                    id="form-staff-pin"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Role Designation</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as "Admin" | "Cashier")}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                    id="form-staff-role"
                  >
                    <option value="Cashier">Cashier</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Access Privileges</label>
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
                    Access Active
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
                    Access Revoked
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-100 pt-5 flex gap-3" id="staff-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition cursor-pointer"
                  id="staff-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md cursor-pointer"
                  id="staff-btn-save"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
