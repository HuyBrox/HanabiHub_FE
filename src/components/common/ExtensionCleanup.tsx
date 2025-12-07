"use client";

import { useEffect } from "react";

/**
 * Component to clean up browser extension injected attributes
 * that cause hydration mismatches (e.g., bis_skin_checked from Bitdefender)
 */
export function ExtensionCleanup() {
  useEffect(() => {
    const commonExtensionAttrs = [
      "bis_skin_checked",
      "data-new-gr-c-s-check-loaded",
      "data-gr-ext-installed",
      "data-adblock-detected",
    ];

    // Function to remove extension attributes
    const cleanupExtensionAttributes = () => {
      commonExtensionAttrs.forEach((attr) => {
        const elements = document.querySelectorAll(`[${attr}]`);
        elements.forEach((el) => {
          el.removeAttribute(attr);
        });
      });
    };

    // ✅ Cleanup ngay lập tức để tránh hydration error
    // Extension inject attributes TRƯỚC khi React hydrate, nên cần cleanup ngay
    // Use requestAnimationFrame to ensure cleanup happens before React renders
    requestAnimationFrame(() => {
      cleanupExtensionAttributes();
    });
    // Also cleanup immediately (before requestAnimationFrame)
    cleanupExtensionAttributes();

    // ✅ Use MutationObserver to detect and remove attributes in real-time
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes") {
          const target = mutation.target as Element;
          commonExtensionAttrs.forEach((attr) => {
            if (target.hasAttribute(attr)) {
              target.removeAttribute(attr);
            }
          });
        } else if (mutation.type === "childList") {
          // Cleanup newly added nodes
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              commonExtensionAttrs.forEach((attr) => {
                if (element.hasAttribute(attr)) {
                  element.removeAttribute(attr);
                }
                // Also cleanup children
                const children = element.querySelectorAll(`[${attr}]`);
                children.forEach((el) => el.removeAttribute(attr));
              });
            }
          });
        }
      });
    });

    // Start observing
    observer.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: commonExtensionAttrs,
    });

    // ✅ Also run cleanup after delays (extensions sometimes inject late)
    // Delay lâu hơn để đảm bảo React đã hydrate xong
    const timeout1 = setTimeout(cleanupExtensionAttributes, 200);
    const timeout2 = setTimeout(cleanupExtensionAttributes, 500);
    const timeout3 = setTimeout(cleanupExtensionAttributes, 1000);
    const timeout4 = setTimeout(cleanupExtensionAttributes, 2000);
    const timeout5 = setTimeout(cleanupExtensionAttributes, 3000);

    // Cleanup on unmount
    return () => {
      observer.disconnect();
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
      clearTimeout(timeout5);
    };
  }, []);

  return null; // This component doesn't render anything
}



