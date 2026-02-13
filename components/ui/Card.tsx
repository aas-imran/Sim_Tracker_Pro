"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, title, className = "", onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md ${
        onClick ? "cursor-pointer active:scale-95" : ""
      } ${className}`}
    >
      {title && (
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

