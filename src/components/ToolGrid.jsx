import React from "react";

export default function ToolGrid({
  tools,
  isLoading,
  userRole,
  onEditClick,
  onDeleteClick,
  onCheckoutClick,
  onCheckinClick,
  onMaintenanceClick
}) {
  const isManager = userRole === "Manager";

  // Render loading skeleton cards
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading tools list">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="p-6 border border-(--border-light) rounded-md flex flex-col gap-3 bg-(--bg-secondary)"
          >
            <div className="skeleton h-6 w-[70%] bg-(--border-light) rounded-sm" />
            <div className="skeleton h-4 w-[40%] bg-(--border-light) rounded-sm" />
            <div className="skeleton h-4 w-[90%] bg-(--border-light) rounded-sm" />
            <div className="skeleton h-4 w-[80%] bg-(--border-light) rounded-sm" />
            <div className="flex gap-2 mt-4">
              <div className="skeleton h-8 w-20 bg-(--border-light) rounded-sm" />
              <div className="skeleton h-8 w-20 bg-(--border-light) rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state handling
  if (!tools || tools.length === 0) {
    return (
      <div
        className="border-2 border-dashed border-(--border-light) rounded-md p-12 text-center bg-(--bg-secondary) text-(--text-secondary) transition-colors duration-150"
        role="alert"
        aria-live="polite"
      >
        <h3 className="text-lg font-medium mb-1 text-(--text-primary)">
          No data found
        </h3>
        <p className="text-sm">
          There are no tools registered matching your search query or filters.
        </p>
      </div>
    );
  }

  // Helper for status badges
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Available":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold border border-green-500 dark:border-green-800/30 bg-transparent text-green-900 dark:text-green-400" aria-label="Status: Available">
            Available
          </span>
        );
      case "Loaned":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold border border-amber-500 dark:border-amber-800/30 bg-transparent text-amber-900 dark:text-amber-400" aria-label="Status: Loaned">
            Loaned
          </span>
        );
      case "Under Maintenance":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold border border-red-500 dark:border-red-800/30 bg-transparent text-red-900 dark:text-red-400" aria-label="Status: Under Maintenance">
            Maintenance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold border border-(--border-light) bg-(--bg-secondary) text-(--text-primary)">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Lending Library Tools Inventory">
      {tools.map((tool) => {
        const isLoaned = tool.status === "Loaned";
        const isMaintenance = tool.status === "Under Maintenance";

        return (
          <div
            key={tool.id}
            className="p-6 border border-(--border-light) rounded-md flex flex-col justify-between bg-(--bg-secondary) shadow-sm hover:shadow-md transition-all duration-150 focus:outline-none focus:border-(--border-dark)"
            tabIndex={0}
            aria-label={`Tool ${tool.name}, Serial number ${tool.serialNumber}, Status ${tool.status}`}
          >
            <div>
              {/* Card Header */}
              <div className="flex justify-between items-start mb-2 gap-2">
                <span className="text-xs font-semibold tracking-wider text-(--text-secondary) uppercase">
                  {tool.category}
                </span>
                {renderStatusBadge(tool.status)}
              </div>

              {/* Title & Serial */}
              <h2 className="text-lg font-semibold mt-1 mb-1 text-(--text-primary) leading-snug">
                {tool.name}
              </h2>
              <code className="text-sm font-mono bg-(--bg-secondary) px-2 py-0.5 rounded border border-(--border-light) inline-block mb-3 text-(--text-secondary)">
                {tool.serialNumber}
              </code>

              {/* Description */}
              <p className="text-sm text-(--text-secondary) mb-4 min-h-9.5 leading-relaxed">
                {tool.description || "No description provided."}
              </p>

              {/* Borrower details */}
              {isLoaned && (
                <div className="p-3 rounded border border-amber-300 dark:border-amber-800/30 bg-transparent text-sm text-amber-800 dark:text-amber-300 mb-4 leading-relaxed">
                  <strong>Checked Out To:</strong> {tool.borrowerName} <br />
                  <strong>Due Date:</strong> {tool.dueDate}
                </div>
              )}
            </div>

            {/* Actions footer */}
            <div className="border-t border-(--border-light) pt-4 mt-2 flex flex-col gap-2">
              {/* Checkin / Checkout triggers */}
              <div className="flex gap-2">
                {tool.status === "Available" && (
                  <button
                    onClick={() => onCheckoutClick(tool)}
                    className="flex-1 py-2.5 text-sm font-medium rounded-sm cursor-pointer transition-colors duration-150 inline-flex items-center justify-center border border-black bg-white text-black hover:bg-black hover:text-white dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-black whitespace-nowrap"
                    aria-label={`Check out ${tool.name}`}
                  >
                    Check Out
                  </button>
                )}
                {isLoaned && (
                  <button
                    onClick={() => onCheckinClick(tool)}
                    className="flex-1 py-2.5 text-sm font-medium rounded-sm cursor-pointer transition-colors duration-150 inline-flex items-center justify-center border border-black bg-white text-black hover:bg-black hover:text-white dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-black whitespace-nowrap"
                    aria-label={`Check in ${tool.name}`}
                  >
                    Check In
                  </button>
                )}
                
                {/* Maintenance triggers */}
                {isMaintenance && (
                  <button
                    onClick={() => onMaintenanceClick(tool, "Available")}
                    className="flex-1 py-2.5 text-sm font-medium rounded-sm cursor-pointer transition-colors duration-150 inline-flex items-center justify-center border border-black bg-white text-black hover:bg-black hover:text-white dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isManager}
                    title={isManager ? "Mark as Available" : "Manager permission required"}
                    aria-label={`End maintenance and set ${tool.name} to available`}
                  >
                    Set Available
                  </button>
                )}
                {!isMaintenance && !isLoaned && (
                  <button
                    onClick={() => onMaintenanceClick(tool, "Under Maintenance")}
                    className="flex-1 py-2.5 text-sm font-medium rounded-sm cursor-pointer transition-colors duration-150 inline-flex items-center justify-center border border-black bg-white text-black hover:bg-black hover:text-white dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isManager}
                    title={isManager ? "Put tool in maintenance mode" : "Manager permission required"}
                    aria-label={`Set ${tool.name} to maintenance`}
                  >
                    Maintenance
                  </button>
                )}
              </div>

              {/* Admin modifications */}
              {isManager && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditClick(tool)}
                    className="flex-1 py-2 text-sm font-medium rounded-sm cursor-pointer transition-colors duration-150 inline-flex items-center justify-center border border-black bg-white text-black hover:bg-black hover:text-white dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-black"
                    aria-label={`Edit details for ${tool.name}`}
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => onDeleteClick(tool)}
                    className="flex-1 py-2 text-sm font-medium rounded-sm cursor-pointer transition-colors duration-150 inline-flex items-center justify-center border border-red-600 bg-white text-red-700 hover:bg-red-600 hover:text-white dark:border-red-500 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
                    aria-label={`Remove ${tool.name} from library`}
                  >
                    Delete Asset
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
