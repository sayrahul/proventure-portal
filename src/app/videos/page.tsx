import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VideoPlayer from "@/components/VideoPlayer";

export const dynamic = 'force-dynamic';

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

export default async function VideosPage() {
    const media = await getMedia();

    // Filter for videos only (mimeType or based on your GAS logic)
    const videos = media.filter((item: any) => !item.MimeType.startsWith('image/'));

    return (
        <>
            <Navbar />
            <main className="flex-grow pt-32 pb-20">
                <div className="container mx-auto px-6">
                    <header className="mb-12">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
                            CINEMATIC <span className="text-accent text-outline-accent">REELS</span>
                        </h1>
                        <p className="text-slate-500 max-w-2xl text-lg">
                            Dynamic storytelling through high-fidelity motion pictures,
                            curated for digital impact.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {videos.map((video: any) => (
                            <VideoPlayer
                                key={video.ID}
                                url={video.BaseUrl}
                                title={video.Title}
                            />
                        ))}
                    </div>

                    {videos.length === 0 && (
                        <div className="text-center py-20 text-slate-500">
                            No cinematic sequences found.
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
