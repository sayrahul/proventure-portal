"use client";

import { useState } from "react";
import MasonryGrid from "@/components/MasonryGrid";
import ShareBar from "@/components/ShareBar";

interface PhotographyClientProps {
    photos: any[];
}

export default function PhotographyClient({ photos }: PhotographyClientProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isShareMode, setIsShareMode] = useState(false);

    const handleShare = () => {
        // For now, we'll encode IDs in the URL for simplicity
        // Later we can implement Google Sheets persistence for shorter URLs
        const ids = selectedIds.join(',');
        const shareUrl = `${window.location.origin}/share?ids=${encodeURIComponent(ids)}`;

        // Copy to clipboard
        navigator.clipboard.writeText(shareUrl);
        alert("Share link copied to clipboard!\n\n" + shareUrl);
    };

    return (
        <div className="relative">
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setIsShareMode(!isShareMode)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isShareMode
                            ? "bg-accent text-white"
                            : "bg-card border border-border text-slate-500 hover:text-foreground"
                        }`}
                >
                    {isShareMode ? "Exit Selection Mode" : "Select to Share"}
                </button>
            </div>

            <MasonryGrid
                items={photos}
                selectionMode={isShareMode}
                onSelectionChange={setSelectedIds}
            />

            <ShareBar
                selectedCount={selectedIds.length}
                onShare={handleShare}
                onClear={() => setSelectedIds([])}
            />
        </div>
    );
}
