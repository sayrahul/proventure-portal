"use client";

import { useState } from "react";

interface ShareBarProps {
    selectedCount: number;
    onShare: () => void;
    onClear: () => void;
}

export default function ShareBar({ selectedCount, onShare, onClear }: ShareBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[80] glass px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-6 border border-accent/20 animate-in fade-in slide-in-from-bottom-10 duration-500">
            <div className="flex items-center gap-3 pr-6 border-r border-slate-700/30">
                <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold text-xs">
                    {selectedCount}
                </div>
                <span className="text-sm font-semibold whitespace-nowrap">Items Selected</span>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onClear}
                    className="text-sm font-medium text-slate-500 hover:text-foreground transition-colors"
                >
                    Clear
                </button>
                <button
                    onClick={onShare}
                    className="bg-accent text-white px-6 py-2 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20"
                >
                    Generate Share Link
                </button>
            </div>
        </div>
    );
}
