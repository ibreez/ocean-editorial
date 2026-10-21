import * as React from "react";
import Link from "next/link";
import { Button } from "./button";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  title = "އެއްވެސް މަޢުލޫމާތެއް ނުފެނުނު",
  description = "ހޯއްދަވާ މައުޟޫޢާ ގުޅޭ ޚަބަރެއް މިވަގުތު ލިބެން ނެތެވެ. އެހެން ބަހަކުން ހޯއްދަވައި ބައްލަވާށެވެ.",
  actionHref = "/",
  actionLabel = "ފުރަތަމަ ޞަފްޙާއަށް",
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] my-6">
      <div className="w-12 h-12 rounded-full bg-[#EDF2EF] text-[#0F766E] flex items-center justify-center mb-4">
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
            strokeWidth="1.5"
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-[#182624] mb-2">{title}</h3>
      <p className="text-sm text-[#53635F] max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {children ? (
        children
      ) : actionHref && actionLabel ? (
        <Link href={actionHref}>
          <Button variant="secondary" size="md">
            {actionLabel}
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
