"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PhotographyClient from "@/components/PhotographyClient";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useMedia } from "@/hooks/useMedia";

export default function PhotographyPage() {
    const { media, loading } = useMedia();
    const photos = media.filter((item: any) => item.MimeType?.startsWith('image/'));

    return (
        <>
            <Navbar />
            <main className="flex-grow pt-32 pb-20">
                <div className="container mx-auto px-6">
                    <header className="mb-12">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
                            VISUAL <span className="text-accent text-outline-accent">ARTISTRY</span>
                        </h1>
                        <p className="text-slate-500 max-w-2xl text-lg">
                            A curated collection of moments captured across various industries,
                            enhanced by AI to showcase the essence of Proventure&apos;s digital eye.
                        </p>
                    </header>

                    {loading ? <LoadingSpinner /> : <PhotographyClient photos={photos} />}
                </div>
            </main>
            <Footer />
        </>
    );
}
