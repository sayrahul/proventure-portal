"use client";

import { useState } from "react";

interface MediaItem {
    ID: string;
    BaseUrl: string;
    MimeType: string;
    Title: string;
    Description: string;
    Tags: string;
    Category: string;
}

interface MasonryGridProps {
    items: MediaItem[];
    selectionMode?: boolean;
    onSelectionChange?: (selectedIds: string[]) => void;
}

export default function MasonryGrid({
    items,
    selectionMode = false,
    onSelectionChange
}: MasonryGridProps) {
    const [filter, setFilter] = useState("All");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const categories = ["All", ...new Set(items.map(item => item.Category).filter(Boolean))];

    const filteredItems = filter === "All"
        ? items
        : items.filter(item => item.Category === filter);

    const toggleSelection = (id: string) => {
        if (!selectionMode) return;
        const newSelection = selectedIds.includes(id)
            ? selectedIds.filter(i => i !== id)
            : [...selectedIds, id];

        setSelectedIds(newSelection);
        onSelectionChange?.(newSelection);
    };

    return (
        <div className="w-full py-10">
            {/* Filter Bar */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filter === cat
                                ? "bg-accent text-white shadow-lg shadow-accent/30"
                                : "bg-card hover:bg-border border border-border"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Masonry Layout */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {filteredItems.map((item) => {
                    const isSelected = selectedIds.includes(item.ID);
                    return (
                        <div
                            key={item.ID}
                            onClick={() => toggleSelection(item.ID)}
                            className={`break-inside-avoid glass rounded-xl overflow-hidden masonry-item group relative cursor-pointer ${isSelected ? "ring-4 ring-accent ring-offset-4 dark:ring-offset-slate-950" : ""
                                }`}
                        >
                            <div className="relative aspect-auto">
                                <img
                                    src={`${item.BaseUrl}=w800`}
                                    alt={item.Title}
                                    className="w-full h-auto object-cover"
                                    loading="lazy"
                                />

                                {/* Selection Overlay */}
                                {selectionMode && (
                                    <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-colors ${isSelected ? "bg-accent border-accent" : "bg-black/20"
                                        }`}>
                                        {isSelected && (
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                )}

                                {/* Info Overlay (Hidden in selection mode for clarity or kept subtle) */}
                                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white transition-opacity duration-300 ${selectionMode ? "opacity-40 group-hover:opacity-100" : "opacity-0 group-hover:opacity-100"
                                    }`}>
                                    <h3 className="font-bold text-sm mb-1">{item.Title}</h3>
                                    <p className="text-[10px] text-slate-300 line-clamp-2 mb-2">{item.Description}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {item.Tags.split(',').slice(0, 3).map(tag => (
                                            <span key={tag} className="px-2 py-0.5 bg-white/20 rounded text-[8px] backdrop-blur-md">
                                                #{tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                    No media found for this category.
                </div>
            )}
        </div>
    );
}
