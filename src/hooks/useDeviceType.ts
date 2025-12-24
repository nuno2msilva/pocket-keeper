/**
 * useDeviceType Hook
 * 
 * This hook detects what type of device the user is on:
 * - Mobile: phones (width < 768px)
 * - Tablet: tablets (width 768px - 1024px)
 * - Desktop: computers (width > 1024px)
 * 
 * It also detects if the device has camera capability for scanner features.
 */

import { useState, useEffect } from "react";

// Screen size breakpoints (in pixels)
const MOBILE_MAX_WIDTH = 768;
const TABLET_MAX_WIDTH = 1024;

// Device types as simple strings
export type DeviceType = "mobile" | "tablet" | "desktop";

export interface DeviceInfo {
  /** Current device type: mobile, tablet, or desktop */
  deviceType: DeviceType;
  
  /** True if device is a phone */
  isMobile: boolean;
  
  /** True if device is a tablet */
  isTablet: boolean;
  
  /** True if device is a desktop computer */
  isDesktop: boolean;
  
  /** True if device likely has a camera (for scanner features) */
  hasCamera: boolean;
  
  /** True if scanners should be enabled (mobile devices with cameras) */
  canUseScanners: boolean;
}

/**
 * Detects device type and capabilities
 * Updates automatically when window is resized
 */
export function useDeviceType(): DeviceInfo {
  // State to track current window width
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  
  // State to track if device has camera
  const [hasCamera, setHasCamera] = useState<boolean>(false);

  // Listen for window resize events
  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }

    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Clean up when component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Check for camera capability on mount
  useEffect(() => {
    async function checkCamera() {
      try {
        // Check if the browser supports media devices API
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === "videoinput");
          setHasCamera(videoDevices.length > 0);
        }
      } catch (error) {
        // If we can't check, assume no camera on desktop
        setHasCamera(windowWidth < TABLET_MAX_WIDTH);
      }
    }
    
    checkCamera();
  }, [windowWidth]);

  // Determine device type based on window width
  const isMobile = windowWidth < MOBILE_MAX_WIDTH;
  const isTablet = windowWidth >= MOBILE_MAX_WIDTH && windowWidth < TABLET_MAX_WIDTH;
  const isDesktop = windowWidth >= TABLET_MAX_WIDTH;

  // Determine device type string
  let deviceType: DeviceType = "desktop";
  if (isMobile) {
    deviceType = "mobile";
  } else if (isTablet) {
    deviceType = "tablet";
  }

  // Scanners should only work on mobile devices with cameras
  const canUseScanners = isMobile && hasCamera;

  return {
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    hasCamera,
    canUseScanners,
  };
}
