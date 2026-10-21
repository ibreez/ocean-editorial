"use client";

import * as React from "react";
import { Button } from "./button";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  resetText?: string;
}

export function ErrorState({
  title = "މައްސަލައެއް ދިމާވެއްޖެ",
  description = "މަޢުލޫމާތު ގެނައުމުގައި މައްސަލައެއް ދިމާވެއްޖެއެވެ. އަލުން މަސައްކަތް ކުރައްވާށެވެ.",
  onRetry,
  resetText = "އަލުން ފަށާ",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center text-center py-12 px-4 bg-[#FFFFFF] border border-[#B42318]/20 rounded-[10px] my-6"
    >
      <div className="w-12 h-12 rounded-full bg-[#B42318]/10 text-[#B42318] flex items-center justify-center mb-4">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-[#182624] mb-2">{title}</h3>
      <p className="text-sm text-[#53635F] max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {onRetry ? (
        <Button variant="primary" onClick={onRetry}>
          {resetText}
        </Button>
      ) : (
        <Button variant="secondary" onClick={() => window.location.reload()}>
          {resetText}
        </Button>
      )}
    </div>
  );
}
