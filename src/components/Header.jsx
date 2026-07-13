import React from "react";
import Image from "next/image";

export default function Header({ role, onRoleChange, latency, onLatencyChange, theme, onThemeChange }) {
  return (
    <header className="border-b border-(--border-light) py-4 bg-(--bg-secondary) mb-6 transition-colors duration-150">
      <div className="max-w-300 mx-auto px-4 md:px-8 flex flex-row justify-between items-center flex-wrap gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <Image
            src="/favicon.ico"
            alt="Tool Lending Library logo"
            width={36}
            height={36}
            style={{ border: theme === "light" ? "1px solid #000000" : "none" }}
            className="rounded-md bg-(--bg-primary) transition-all"
          />
          <div>
            <h1 className="text-xl font-medium leading-tight tracking-tight text-(--text-primary)">
              Tool Lending Library
            </h1>
            <p className="text-xs text-(--text-secondary)">
              Corporate Asset Tracking System
            </p>
          </div>
        </div>

        {/* Dashboard simulation selectors */}
        <div className="flex gap-4 items-center flex-wrap">
          {/* Latency simulator */}
          <div className="flex items-center gap-2">
            <label htmlFor="latency-selector" className="text-xs font-medium text-(--text-primary)">
              Network Profile:
            </label>
            <select
              id="latency-selector"
              value={latency}
              onChange={(e) => onLatencyChange(e.target.value)}
              className="px-2 py-1 text-xs bg-(--bg-primary) border border-(--border-light) rounded-sm text-(--text-primary) focus:outline-none focus:border-(--border-dark) min-w-30"
              aria-label="Select Network latency profile to test loading states"
            >
              <option value="none">Fast (No Delay)</option>
              <option value="high">Latency (800ms)</option>
              <option value="slow3g">Slow 3G (1.5s)</option>
            </select>
            {latency !== "none" && (
              <span 
                className="w-2 h-2 rounded-full bg-amber-500 animate-ping"
                title="Latency simulation is active"
                aria-label="Simulated latency warning"
              />
            )}
          </div>

          {/* User Role swapper */}
          <div className="flex items-center gap-2">
            <label htmlFor="role-selector" className="text-xs font-medium text-(--text-primary)">
              User Role:
            </label>
            <select
              id="role-selector"
              value={role}
              onChange={(e) => onRoleChange(e.target.value)}
              className="px-2 py-1 text-xs bg-(--bg-primary) border border-(--border-light) rounded-sm text-(--text-primary) focus:outline-none focus:border-(--border-dark) min-w-32.5"
              aria-label="Switch User Role to test permissions"
            >
              <option value="Floor Staff">Floor Staff</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          {/* Theme swapper */}
          <div className="flex items-center gap-2">
            <label htmlFor="theme-selector" className="text-xs font-medium text-(--text-primary)">
              Theme:
            </label>
            <select
              id="theme-selector"
              value={theme}
              onChange={(e) => onThemeChange(e.target.value)}
              className="px-2 py-1 text-xs bg-(--bg-primary) border border-(--border-light) rounded-sm text-(--text-primary) focus:outline-none focus:border-(--border-dark) min-w-25"
              aria-label="Switch UI visual theme"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
