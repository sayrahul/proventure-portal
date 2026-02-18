"use client";

import { useState } from "react";

interface VideoPlayerProps {
    url: string;
    title: string;
}

export default function VideoPlayer({ url, title }: VideoPlayerProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="group relative aspect-video bg-card rounded-2xl overflow-hidden border border-border cursor-pointer" onClick={() => setIsOpen(true)}>
            <img
                src={`${url}=w800`}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center shadow-2xl">
                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white font-bold text-sm truncate">{title}</h3>
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        className="absolute top-6 right-6 text-white hover:text-accent transition-colors"
                    >
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black">
                        <video
                            src={`${url}=dv`}
                            controls
                            autoPlay
                            className="w-full h-full"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
