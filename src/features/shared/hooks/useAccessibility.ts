import { useState, useEffect } from "react";

const STORAGE_KEY = "accessibility-settings";

interface AccessibilitySettings {
  highContrast: boolean;
  largerTargets: boolean;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largerTargets: false,
};

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    // Apply high contrast mode
    if (settings.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
    
    // Apply larger touch targets
    if (settings.largerTargets) {
      document.documentElement.classList.add("larger-targets");
    } else {
      document.documentElement.classList.remove("larger-targets");
    }
  }, [settings]);

  const toggleHighContrast = () => {
    setSettings((prev) => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleLargerTargets = () => {
    setSettings((prev) => ({ ...prev, largerTargets: !prev.largerTargets }));
  };

  return {
    ...settings,
    toggleHighContrast,
    toggleLargerTargets,
  };
}
