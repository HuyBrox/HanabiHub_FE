"use client";

import { useEffect, useRef } from "react";
import { useJapaneseInputMode } from "@/contexts/JapaneseInputModeContext";
import * as wanakana from "wanakana";

/**
 * Global hook to apply Japanese input mode to all input/textarea elements on the page
 * This hook automatically binds/unbinds wanakana to all input elements based on the current input mode
 * Wanakana handles React controlled components automatically through input events
 */
export function useGlobalJapaneseInput() {
  const { inputMode } = useJapaneseInputMode();
  const boundElementsRef = useRef<WeakSet<HTMLElement>>(new WeakSet());

  useEffect(() => {
    const shouldBind = inputMode !== "off";

    // Configuration based on mode
    const getBindOptions = () => {
      if (inputMode === "katakana") {
        return {
          IMEMode: "toKatakana" as const,
          useObsoleteKana: false,
        };
      } else if (inputMode === "hiragana") {
        return {
          IMEMode: false,
          useObsoleteKana: false,
        };
      }
      return null;
    };

    // Function to bind an element
    const bindElement = (element: HTMLElement) => {
      if (
        !(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)
      ) {
        return;
      }

      // Skip if already bound
      if (boundElementsRef.current.has(element)) {
        return;
      }

      // Skip if element is disabled or readonly
      if (element.disabled || element.readOnly) {
        return;
      }

      // Skip if element has data-ignore-japanese attribute
      if (element.hasAttribute("data-ignore-japanese")) {
        return;
      }

      // Skip password, hidden, checkbox, radio, file, submit, button, reset, image inputs
      if (element instanceof HTMLInputElement) {
        const type = element.type.toLowerCase();
        if (["password", "hidden", "checkbox", "radio", "file", "submit", "button", "reset", "image"].includes(type)) {
          return;
        }
      }

      if (!shouldBind) {
        return;
      }

      const bindOptions = getBindOptions();
      if (!bindOptions) {
        return;
      }

      try {
        // Bind wanakana - it automatically handles React controlled components
        // by triggering input events that React's onChange handlers will catch
        wanakana.bind(element, bindOptions);
        boundElementsRef.current.add(element);
      } catch (error) {
        console.warn("Error binding wanakana to element:", error);
      }
    };

    // Function to unbind an element
    const unbindElement = (element: HTMLElement) => {
      if (
        !(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)
      ) {
        return;
      }

      if (boundElementsRef.current.has(element)) {
        try {
          wanakana.unbind(element);
          boundElementsRef.current.delete(element);
        } catch (error) {
          // Ignore errors
        }
      }
    };

    // Unbind all elements first if mode is off
    if (!shouldBind) {
      // Query all inputs and unbind
      const allInputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        "input, textarea"
      );
      allInputs.forEach((input) => {
        if (boundElementsRef.current.has(input)) {
          unbindElement(input);
        }
      });
      return;
    }

    // Bind all existing input/textarea elements
    const bindAllElements = () => {
      const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        "input:not([data-ignore-japanese]):not([disabled]):not([readonly]):not([type='password']):not([type='hidden']):not([type='checkbox']):not([type='radio']):not([type='file']):not([type='submit']):not([type='button']):not([type='reset']):not([type='image']), textarea:not([data-ignore-japanese]):not([disabled]):not([readonly])"
      );
      inputs.forEach(bindElement);
    };

    // Initial bind with a delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      bindAllElements();
    }, 150);

    // Use MutationObserver to bind new elements added to DOM
    let observerTimeoutId: NodeJS.Timeout;
    const observer = new MutationObserver((mutations) => {
      // Debounce to avoid too many bindings
      clearTimeout(observerTimeoutId);
      observerTimeoutId = setTimeout(() => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;

              // Check if the added node itself is an input/textarea
              if (
                element instanceof HTMLInputElement ||
                element instanceof HTMLTextAreaElement
              ) {
                bindElement(element);
              }

              // Check for inputs/textareas within the added node
              const inputs = element.querySelectorAll?.<HTMLInputElement | HTMLTextAreaElement>(
                "input:not([data-ignore-japanese]):not([disabled]):not([readonly]):not([type='password']), textarea:not([data-ignore-japanese]):not([disabled]):not([readonly])"
              );
              inputs?.forEach(bindElement);
            }
          });
        });
      }, 150);
    });

    // Observe the entire document
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also bind on focus (for dynamically created inputs)
    const handleFocus = (e: FocusEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        // Delay to ensure element is fully initialized
        setTimeout(() => {
          bindElement(target);
        }, 100);
      }
    };

    document.addEventListener("focusin", handleFocus, true);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      if (observerTimeoutId) {
        clearTimeout(observerTimeoutId);
      }
      observer.disconnect();
      document.removeEventListener("focusin", handleFocus, true);

      // Unbind all elements
      const allInputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        "input, textarea"
      );
      allInputs.forEach((input) => {
        if (boundElementsRef.current.has(input)) {
          unbindElement(input);
        }
      });
    };
  }, [inputMode]);
}
