import React, { useEffect } from "react";

interface FullSiteLoaderProps {
  onLoaded?: () => void;
}

/**
 * Quick non-blocking loader replacement.
 * The slow full-screen 0% initializing screen has been removed for rural accessibility.
 */
export const FullSiteLoader: React.FC<FullSiteLoaderProps> = ({ onLoaded }) => {
  useEffect(() => {
    onLoaded?.();
  }, [onLoaded]);

  return null;
};
