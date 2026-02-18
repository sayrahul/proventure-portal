"use client";

export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-32">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-border rounded-full animate-spin border-t-accent"></div>
                <div className="mt-6 text-center text-sm text-slate-500 tracking-widest uppercase">
                    Loading...
                </div>
            </div>
        </div>
    );
}
