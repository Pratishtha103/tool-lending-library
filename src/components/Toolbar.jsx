import React from "react";

export default function Toolbar({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  onAddClick,
  userRole
}) {
  const isManager = userRole === "Manager";

  return (
    <div className="flex flex-row justify-between items-center gap-4 mb-6 p-4 rounded-md border border-(--border-light) bg-(--bg-secondary) flex-wrap transition-colors duration-150">
      {/* Search & Filters */}
      <div className="flex flex-row gap-3 flex-1 min-w-70 flex-wrap">
        {/* Search */}
        <div className="flex-2 min-w-45">
          <input
            id="search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or serial number (e.g. TL-10021)..."
            className="w-full px-3 py-1.5 text-sm bg-(--bg-primary) border border-(--border-light) rounded-sm text-(--text-primary) focus:outline-none focus:border-(--border-dark) transition-colors duration-150"
            aria-label="Search tools by name or serial number"
          />
        </div>

        {/* Category Filter */}
        <div className="flex-1 min-w-32.5">
          <select
            id="category-select"
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-(--bg-primary) border border-(--border-light) rounded-sm text-(--text-primary) focus:outline-none focus:border-(--border-dark) transition-colors duration-150"
            aria-label="Filter tools by category"
          >
            <option value="All">All Categories</option>
            <option value="Power Tools">Power Tools</option>
            <option value="Hand Tools">Hand Tools</option>
            <option value="Measurement">Measurement</option>
            <option value="Safety Equipment">Safety Equipment</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex-1 min-w-32.5">
          <select
            id="status-select"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-(--bg-primary) border border-(--border-light) rounded-sm text-(--text-primary) focus:outline-none focus:border-(--border-dark) transition-colors duration-150"
            aria-label="Filter tools by status"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Loaned">Loaned</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
        </div>
      </div>

      {/* Add Tool Trigger */}
      <div className="flex flex-col items-end">
        <button
          onClick={onAddClick}
          className="px-4 py-1.5 text-sm font-medium rounded-sm cursor-pointer transition-colors duration-150 inline-flex items-center justify-center border border-transparent whitespace-nowrap bg-(--border-dark) text-(--bg-primary) hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isManager}
          title={isManager ? "Add new tool to inventory" : "Only Managers can register new tools"}
          aria-label="Add new tool"
        >
          + Add New Tool
        </button>
      </div>
    </div>
  );
}
