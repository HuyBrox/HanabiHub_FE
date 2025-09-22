"use client";

import React, { memo, useRef } from "react";
import { AuthForm } from "./AuthForm";
import { AuthFormProps } from "@/types/auth";

// Wrapper component để isolate re-renders
const AuthFormWrapper = memo(
  ({ mode, onModeChange, isModal }: AuthFormProps) => {
    const renderCountRef = useRef(0);
    renderCountRef.current += 1;

    console.log(`🔄 AuthFormWrapper render #${renderCountRef.current}:`, {
      mode,
      isModal,
      timestamp: new Date().toISOString(),
    });

    return (
      <div key={`auth-form-${mode}`}>
        {" "}
        {/* Stable wrapper */}
        <AuthForm mode={mode} onModeChange={onModeChange} isModal={isModal} />
      </div>
    );
  }
);

AuthFormWrapper.displayName = "AuthFormWrapper";

export { AuthFormWrapper };
