import React, { useEffect, useRef, useState } from "react";

export default function ToolFormModal({
  mode, // "create" | "edit" | "checkout"
  tool, // tool object (for edit and checkout modes)
  tools = [], // all tools list for duplicate check
  onClose,
  onSubmit
}) {
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);
  
  // State for form fields initialized lazily based on modal mode
  const [formData, setFormData] = useState(() => {
    if (mode === "edit" && tool) {
      return {
        name: tool.name || "",
        category: tool.category || "Power Tools",
        serialNumber: tool.serialNumber || "",
        description: tool.description || "",
        status: tool.status || "Available",
        borrowerName: tool.borrowerName || "",
        dueDate: tool.dueDate || ""
      };
    } else if (mode === "checkout" && tool) {
      return {
        name: tool.name,
        category: tool.category,
        serialNumber: tool.serialNumber,
        description: tool.description || "",
        status: "Loaned",
        borrowerName: "",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
    } else {
      return {
        name: "",
        category: "Power Tools",
        serialNumber: "",
        description: "",
        status: "Available",
        borrowerName: "",
        dueDate: ""
      };
    }
  });

  // State for form validation errors
  const [errors, setErrors] = useState({});

  // Focus first input on open for accessibility
  useEffect(() => {
    const timer = setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Focus trap for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // If shift + tab and on first element, wrap to last
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // If tab and on last element, wrap to first
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Handle changes in fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field is updated
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Perform client-side validations
  const validateForm = () => {
    const newErrors = {};
    
    if (mode === "create" || mode === "edit") {
      if (!formData.name.trim()) {
        newErrors.name = "Tool name is required.";
      }
      
      const serialPattern = /^TL-\d{5}$/i;
      if (!formData.serialNumber.trim()) {
        newErrors.serialNumber = "Serial number is required.";
      } else if (!serialPattern.test(formData.serialNumber.trim())) {
        newErrors.serialNumber = "Serial number must match format TL-XXXXX (e.g., TL-12345).";
      } else {
        // Local duplicate check
        const serialUpper = formData.serialNumber.trim().toUpperCase();
        const isDuplicate = tools.some(
          (t) => t.serialNumber.toUpperCase() === serialUpper && t.id !== tool?.id
        );
        if (isDuplicate) {
          newErrors.serialNumber = "This serial number is already registered in the library.";
        }
      }

      if (formData.status === "Loaned") {
        if (!formData.borrowerName.trim()) {
          newErrors.borrowerName = "Borrower name is required.";
        }
        if (!formData.dueDate) {
          newErrors.dueDate = "Due date is required.";
        }
      }
    } else if (mode === "checkout") {
      if (!formData.borrowerName.trim()) {
        newErrors.borrowerName = "Borrower name is required to check out.";
      }
      if (!formData.dueDate) {
        newErrors.dueDate = "Return due date is required.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    onSubmit({
      ...formData,
      id: tool ? tool.id : undefined
    });
  };

  const getTitle = () => {
    if (mode === "create") return "Register New Tool Asset";
    if (mode === "edit") return `Edit Asset Details: ${tool?.serialNumber}`;
    if (mode === "checkout") return `Check Out Tool: ${tool?.name}`;
    return "Tool Library Form";
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" 
      role="presentation"
    >
      <div
        ref={modalRef}
        className="bg-(--bg-primary) border border-(--border-light) rounded-md max-w-125 w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-lg transition-all duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 id="modal-title" className="text-lg font-medium text-(--text-primary)">{getTitle()}</h2>
          <button
            onClick={onClose}
            aria-label="Close form modal"
            className="background-transparent border-none text-2xl cursor-pointer text-(--text-secondary) hover:text-(--text-primary) leading-none"
          >
            &times;
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate>
          {mode !== "checkout" ? (
            <>
              {/* Tool Name */}
              <div className="mb-4">
                <label htmlFor="modal-name" className="block text-xs font-medium mb-1.5 text-(--text-primary)">
                  Tool Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  id="modal-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-1.5 text-sm bg-(--bg-primary) border rounded-sm text-(--text-primary) focus:outline-none focus:border-(--border-dark) transition-colors duration-150 ${errors.name ? "border-red-500 bg-red-500/5 focus:border-red-500" : "border-(--border-light)"}`}
                  aria-invalid={errors.name ? "true" : "false"}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  required
                />
                {errors.name && (
                  <span id="name-error" className="block text-[11px] text-red-600 dark:text-red-400 mt-1">{errors.name}</span>
                )}
              </div>

              {/* Category */}
              <div className="mb-4">
                <label htmlFor="modal-category" className="block text-xs font-medium mb-1.5 text-(--text-primary)">
                  Category
                </label>
                <select
                  id="modal-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm bg-(--bg-primary) border border-(--border-light) rounded-sm text-(--text-primary) focus:outline-none focus:border-(--border-dark) transition-colors duration-150"
                >
                  <option value="Power Tools">Power Tools</option>
                  <option value="Hand Tools">Hand Tools</option>
                  <option value="Measurement">Measurement</option>
                  <option value="Safety Equipment">Safety Equipment</option>
                </select>
              </div>

              {/* Serial Number */}
              <div className="mb-4">
                <label htmlFor="modal-serial" className="block text-xs font-medium mb-1.5 text-(--text-primary)">
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="modal-serial"
                  name="serialNumber"
                  type="text"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  placeholder="TL-XXXXX"
                  className={`w-full px-3 py-1.5 text-sm bg-(--bg-primary) border rounded-sm text-(--text-primary) focus:outline-none focus:border-(--border-dark) transition-colors duration-150 ${errors.serialNumber ? "border-red-500 bg-red-500/5 focus:border-red-500" : "border-(--border-light)"}`}
                  aria-invalid={errors.serialNumber ? "true" : "false"}
                  aria-describedby={errors.serialNumber ? "serial-error" : undefined}
                  required
                />
                <small className="block text-[10px] text-(--text-secondary) mt-1 opacity-70">
                  Must start with &apos;TL-&apos; followed by exactly 5 digits (e.g. TL-20412)
                </small>
                {errors.serialNumber && (
                  <span id="serial-error" className="block text-[11px] text-red-600 dark:text-red-400 mt-1">{errors.serialNumber}</span>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <label htmlFor="modal-desc" className="block text-xs font-medium mb-1.5 text-(--text-primary)">
                  Description
                </label>
                <textarea
                  id="modal-desc"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm bg-(--bg-primary) border border-(--border-light) rounded-sm text-(--text-primary) focus:outline-none focus:border-(--border-dark) transition-colors duration-150"
                  rows="3"
                  maxLength={500}
                />
              </div>

              {/* Status */}
              <div className="mb-4">
                <label htmlFor="modal-status" className="block text-xs font-medium mb-1.5 text-(--text-primary)">
                  Initial Availability Status
                </label>
                <select
                  id="modal-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm bg-(--bg-primary) border border-(--border-light) rounded-sm text-(--text-primary) focus:outline-none focus:border-(--border-dark) transition-colors duration-150"
                  disabled={mode === "edit" && tool?.status === "Loaned"} // Cannot change main status to Available here if checked out (forces check-in flow)
                >
                  <option value="Available">Available</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  {mode === "edit" && tool?.status === "Loaned" && (
                    <option value="Loaned">Loaned (Manage via Check In/Out)</option>
                  )}
                </select>
              </div>
            </>
          ) : (
            /* CHECKOUT MODE */
            <div>
              <p className="text-sm text-(--text-secondary) mb-4">
                You are checking out the asset <strong>{tool?.name} ({tool?.serialNumber})</strong>. Please record the borrowing staff details.
              </p>

              {/* Borrower Name */}
              <div className="mb-4">
                <label htmlFor="modal-borrower" className="block text-xs font-medium mb-1.5 text-(--text-primary)">
                  Borrower Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  id="modal-borrower"
                  name="borrowerName"
                  type="text"
                  value={formData.borrowerName}
                  onChange={handleChange}
                  className={`w-full px-3 py-1.5 text-sm bg-(--bg-primary) border rounded-sm text-(--text-primary) focus:outline-none focus:border-(--border-dark) transition-colors duration-150 ${errors.borrowerName ? "border-red-500 bg-red-500/5 focus:border-red-500" : "border-(--border-light)"}`}
                  aria-invalid={errors.borrowerName ? "true" : "false"}
                  aria-describedby={errors.borrowerName ? "borrower-error" : undefined}
                  required
                />
                {errors.borrowerName && (
                  <span id="borrower-error" className="block text-[11px] text-red-600 dark:text-red-400 mt-1">{errors.borrowerName}</span>
                )}
              </div>

              {/* Due Date */}
              <div className="mb-4">
                <label htmlFor="modal-duedate" className="block text-xs font-medium mb-1.5 text-(--text-primary)">
                  Due Return Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="modal-duedate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  onClick={(e) => {
                    try {
                      e.target.showPicker();
                    } catch (err) {
                      console.warn("showPicker is not supported in this browser:", err);
                    }
                  }}
                  className={`w-full px-3 py-1.5 text-sm bg-(--bg-primary) border rounded-sm text-(--text-primary) focus:outline-none focus:border-(--border-dark) transition-colors duration-150 ${errors.dueDate ? "border-red-500 bg-red-500/5 focus:border-red-500" : "border-(--border-light)"}`}
                  aria-invalid={errors.dueDate ? "true" : "false"}
                  aria-describedby={errors.dueDate ? "duedate-error" : undefined}
                  required
                  min={new Date().toISOString().split('T')[0]} // Cannot select past dates
                />
                {errors.dueDate && (
                  <span id="duedate-error" className="block text-[11px] text-red-600 dark:text-red-400 mt-1">{errors.dueDate}</span>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-(--border-light)">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-sm font-medium rounded-sm cursor-pointer border border-(--border-light) bg-(--bg-primary) text-(--text-primary) hover:bg-(--bg-secondary) transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-sm font-medium rounded-sm cursor-pointer bg-(--border-dark) text-(--bg-primary) hover:opacity-85 transition-colors duration-150"
            >
              {mode === "create" ? "Register Asset" : mode === "edit" ? "Save Changes" : "Confirm Checkout"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
