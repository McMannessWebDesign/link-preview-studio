/**
 * DarkModeToggle.tsx — Dark/Light Mode Toggle Button (Client Component)
 *
 * A button in the header that switches between dark and light themes.
 *
 * HOW DARK MODE WORKS IN THIS APP:
 * Tailwind CSS is configured for class-based dark mode (`darkMode: 'class'` in tailwind.config).
 * This means dark styles (e.g. `dark:bg-neutral-800`) only apply when the <html> element
 * has the "dark" class. This component manages adding/removing that class.
 *
 * THEME PERSISTENCE:
 * - The user's preference is saved in localStorage under the key "lps-theme" ("dark" or "light").
 * - On mount, if there's a stored preference, that's used.
 * - If no stored preference exists, it falls back to the OS-level preference
 *   (via the `prefers-color-scheme` media query).
 * - This means first-time visitors automatically get the theme matching their OS setting.
 *
 * ICONS:
 * - In dark mode: Shows a sun icon (amber colored) — click to switch to light.
 * - In light mode: Shows a moon icon (gray) — click to switch to dark.
 *
 * WHY CLASSLIST TOGGLE?
 * `document.documentElement.classList.toggle("dark", isDark)` adds or removes the "dark"
 * class on <html>. This is the standard approach for Tailwind's class-based dark mode.
 * It's immediate (no flash of wrong theme) since it happens in a useEffect on mount.
 */
"use client";

import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  /**
   * ON MOUNT: Determine the initial theme.
   * Priority: localStorage saved preference > OS preference > default (light).
   * Then apply the "dark" class to <html> immediately so Tailwind renders the right theme.
   */
  useEffect(() => {
    const stored = localStorage.getItem("lps-theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  /**
   * toggle: Switch between dark and light mode.
   * 1. Flip the state.
   * 2. Add/remove the "dark" class on <html> (Tailwind reads this).
   * 3. Save the preference to localStorage so it persists across page loads.
   */
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("lps-theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-150"
      aria-label="Toggle dark mode"
    >
      {/* Dark mode active: show sun icon (click to go light) */}
      {dark ? (
        <svg
          className="w-5 h-5 text-amber-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        /* Light mode active: show moon icon (click to go dark) */
        <svg
          className="w-5 h-5 text-neutral-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}
