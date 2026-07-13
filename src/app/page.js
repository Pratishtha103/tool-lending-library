"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AlertTriangle } from "lucide-react";
import Header from "../components/Header";
import Toolbar from "../components/Toolbar";
import ToolGrid from "../components/ToolGrid";
import ToolFormModal from "../components/ToolFormModal";

export default function LibraryDashboard() {
  // Global State
  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState("Manager"); // Default simulated login as Manager
  const [latencyMode, setLatencyMode] = useState("none"); // none, high, slow3g
  const [theme, setTheme] = useState("light"); // light, dark
  
  // Synchronize manual UI theme to document attributes
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const timer = setTimeout(() => {
      setTheme(savedTheme);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals & Action States
  const [activeModal, setActiveModal] = useState(null); // null, "create", "edit", "checkout", "delete_confirm"
  const [selectedTool, setSelectedTool] = useState(null);
  
  // Custom Toast Notification State
  const [toast, setToast] = useState(null);

  // Helper to show toasts that auto-dismiss
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    // Telemetry log for notification alerts
    console.log(`[Analytics] Telemetry event: System alert displayed - [${type.toUpperCase()}] ${message}`);
    
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Fetch tools from Next.js server API
  const fetchTools = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tools?latency=${latencyMode}`);
      if (!response.ok) throw new Error("Failed to load inventory.");
      
      const data = await response.json();
      setTools(data);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to load inventory.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [latencyMode, showToast]);

  // Load tools on mount and when latency setting changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTools();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTools]);

  // Client-side search and filtering matching DB logic
  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "All" || tool.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || tool.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Create or Update Form submit handler
  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    const isEditing = activeModal === "edit";
    const method = isEditing ? "PUT" : "POST";
    
    try {
      const response = await fetch(`/api/tools?latency=${latencyMode}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          operator: userRole // Pass current role for telemetry / auditing
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        if (result.errors) {
          // Display validation errors
          const errorMsg = Object.values(result.errors).join(" ");
          throw new Error(errorMsg);
        }
        throw new Error(result.message || "Operation failed.");
      }

      showToast(
        isEditing 
          ? `Successfully updated asset: ${result.tool.serialNumber}`
          : `Successfully registered new asset: ${result.tool.serialNumber}`, 
        "success"
      );
      
      setActiveModal(null);
      setSelectedTool(null);
      await fetchTools(); // Reload lists
    } catch (err) {
      showToast(err.message, "error");
      setIsLoading(false);
    }
  };

  // Checkout Form submit handler
  const handleCheckoutSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tools?latency=${latencyMode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTool.id,
          name: selectedTool.name,
          category: selectedTool.category,
          serialNumber: selectedTool.serialNumber,
          description: selectedTool.description,
          status: "Loaned",
          borrowerName: formData.borrowerName,
          dueDate: formData.dueDate,
          operator: userRole
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Checkout failed.");

      showToast(`Asset checked out to ${formData.borrowerName} successfully.`, "success");
      console.log(`[Analytics] User interacted with Feature Complete CRUD - CHECKOUT - Operator: ${userRole}`);
      
      setActiveModal(null);
      setSelectedTool(null);
      await fetchTools();
    } catch (err) {
      showToast(err.message, "error");
      setIsLoading(false);
    }
  };

  // Instant Checkin handler
  const handleCheckin = async (tool) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tools?latency=${latencyMode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tool.id,
          name: tool.name,
          category: tool.category,
          serialNumber: tool.serialNumber,
          description: tool.description,
          status: "Available",
          borrowerName: null,
          dueDate: null,
          operator: userRole
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Check in failed.");

      showToast(`Asset checked in. Returned to available pool.`, "success");
      console.log(`[Analytics] User interacted with Feature Complete CRUD - CHECKIN - Operator: ${userRole}`);
      await fetchTools();
    } catch (err) {
      showToast(err.message, "error");
      setIsLoading(false);
    }
  };

  // Toggle maintenance status (Manager only)
  const handleMaintenanceToggle = async (tool, nextStatus) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tools?latency=${latencyMode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tool.id,
          name: tool.name,
          category: tool.category,
          serialNumber: tool.serialNumber,
          description: tool.description,
          status: nextStatus,
          borrowerName: null,
          dueDate: null,
          operator: userRole
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to update maintenance status.");

      showToast(`Asset status updated to: ${nextStatus}`, "success");
      console.log(`[Analytics] User interacted with Feature Complete CRUD - UPDATE STATUS - Status: ${nextStatus}`);
      await fetchTools();
    } catch (err) {
      showToast(err.message, "error");
      setIsLoading(false);
    }
  };

  // Delete Action triggered (Manager only)
  const handleDeleteTrigger = (tool) => {
    setSelectedTool(tool);
    setActiveModal("delete_confirm");
  };

  // Confirmed Delete operation
  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tools?id=${selectedTool.id}&operator=${userRole}&latency=${latencyMode}`, {
        method: "DELETE"
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Deletion failed.");

      showToast(`Asset ${selectedTool.serialNumber} deleted successfully.`, "success");
      setActiveModal(null);
      setSelectedTool(null);
      await fetchTools();
    } catch (err) {
      showToast(err.message, "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-(--bg-primary) transition-colors duration-150">
      {/* Header component */}
      <Header
        role={userRole}
        onRoleChange={setUserRole}
        latency={latencyMode}
        onLatencyChange={setLatencyMode}
        theme={theme}
        onThemeChange={handleThemeChange}
      />

      <main className="max-w-300 w-full mx-auto px-4 md:px-8 flex-1 py-4">
        {/* Main Headings */}
        <div className="mb-6">
          <h1 id="main-dashboard-title" className="text-2xl font-medium text-(--text-primary) mb-1 tracking-tight">
            Inventory & Lending Dashboard
          </h1>
          <p className="text-sm text-(--text-secondary)">
            Create, search, update, check in/out, and deprecate assets inside the library catalog.
          </p>
        </div>

        {/* Toolbar filter area */}
        <Toolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onAddClick={() => setActiveModal("create")}
          userRole={userRole}
        />

        {/* Tool Cards grid display */}
        <ToolGrid
          tools={filteredTools}
          isLoading={isLoading}
          userRole={userRole}
          onEditClick={(tool) => {
            setSelectedTool(tool);
            setActiveModal("edit");
          }}
          onDeleteClick={handleDeleteTrigger}
          onCheckoutClick={(tool) => {
            setSelectedTool(tool);
            setActiveModal("checkout");
          }}
          onCheckinClick={handleCheckin}
          onMaintenanceClick={handleMaintenanceToggle}
        />
      </main>

      {/* Footer bar */}
      <footer className="mt-12 py-6 border-t border-(--border-light) bg-(--bg-secondary) text-xs text-(--text-secondary) text-center transition-colors duration-150">
        <div className="max-w-300 mx-auto px-4">
          Tool Lending Library Management System • Department of Asset Infrastructure Overhaul • P1 Project ENG-159708
        </div>
      </footer>

      {/* Floating toast notifications */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 p-4 rounded-md border text-sm shadow-md transition-all duration-150 z-50 max-w-87.5 leading-relaxed font-medium ${
            toast.type === "error" 
              ? "border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
              : "border-green-200 dark:border-green-800/30 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Add / Edit / Checkout Modals */}
      {activeModal && activeModal !== "delete_confirm" && (
        <ToolFormModal
          mode={activeModal}
          tool={selectedTool}
          onClose={() => {
            setActiveModal(null);
            setSelectedTool(null);
          }}
          onSubmit={activeModal === "checkout" ? handleCheckoutSubmit : handleFormSubmit}
        />
      )}

      {/* Delete Confirmation Modal (Enterprise level validation flow) */}
      {activeModal === "delete_confirm" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" role="presentation">
          <div className="bg-(--bg-primary) border border-(--border-light) rounded-md max-w-125 w-full p-6 relative shadow-lg transition-all duration-150" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
            <div className="flex items-center gap-2.5 mb-3 text-red-800 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2 id="delete-modal-title" className="text-lg font-medium">
                Confirm Permanent Deletion
              </h2>
            </div>
            <p className="text-sm text-(--text-secondary) mb-6 leading-relaxed">
              Are you sure you want to permanently delete the asset <strong>{selectedTool?.name} ({selectedTool?.serialNumber})</strong>? 
              This operation will permanently erase the database record. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-(--border-light)">
              <button
                type="button"
                onClick={() => { setActiveModal(null); setSelectedTool(null); }}
                className="px-4 py-1.5 text-sm font-medium rounded-sm cursor-pointer border border-(--border-light) bg-(--bg-primary) text-(--text-primary) hover:bg-(--bg-secondary) transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-sm font-medium rounded-sm cursor-pointer bg-red-800 hover:bg-red-900 text-white transition-colors duration-150"
              >
                Permanently Delete Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
