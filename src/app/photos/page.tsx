import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PhotographyClient from "@/components/PhotographyClient";


export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getMedia() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return [];

    try {
        const res = await fetch(apiUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch media');
        return res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export default async function PhotographyPage() {
    const media = await getMedia();

    // Filter for photos only
    const photos = media.filter((item: any) => item.MimeType.startsWith('image/'));

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
                            enhanced by AI to showcase the essence of Proventure's digital eye.
                        </p>
                    </header>

                    <PhotographyClient photos={photos} />
                </div>
            </main>
            <Footer />
        </>
    );
}
