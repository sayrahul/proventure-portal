"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MasonryGrid from "@/components/MasonryGrid";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSearchParams } from "next/navigation";

export default function ShareContent() {
    const searchParams = useSearchParams();
    const idsString = searchParams.get("ids") || "";
    const selectedIds = idsString.split(",").filter(Boolean);

    const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl || selectedIds.length === 0) {
            setLoading(false);
            return;
        }

        fetch(apiUrl)
            .then((res) => res.json())
            .then((data) => {
                const filtered = data.filter((item: any) =>
                    selectedIds.includes(item.ID)
                );
                setSelectedMedia(filtered);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch media:", err);
                setLoading(false);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idsString]);

    return (
        <>
            <Navbar />
            <main className="flex-grow pt-32 pb-20">
                <div className="container mx-auto px-6">
                    <header className="mb-12 text-center">
                        <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold mb-4 tracking-widest uppercase">
                            Curated Collection
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
                            SHARED FOR{" "}
                            <span className="text-accent underline decoration-accent/30 decoration-8 underline-offset-[-2px]">
                                YOU
                            </span>
                        </h1>
                        <p className="text-slate-500 max-w-xl mx-auto text-sm">
                            This gallery contains a specific selection of
                            Proventure&apos;s work curated for your review.
                        </p>
                    </header>

                    {loading ? (
                        <LoadingSpinner />
                    ) : (
                        <>
                            <MasonryGrid items={selectedMedia} />

                            {selectedMedia.length === 0 && (
                                <div className="text-center py-20 glass rounded-3xl border border-dashed border-border">
                                    <p className="text-slate-500 italic">
                                        This selection appears to be empty or link is invalid.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
