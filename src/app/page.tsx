import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] -z-10"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10"></div>

          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold mb-6 tracking-wider uppercase">
                Digital Excellence Redefined
              </span>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight mb-8">
                PRO<span className="text-accent">VENTURE</span> <br />
                STUDIOS.
              </h1>
              <p className="text-slate-500 text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
                Capturing the soul of brands through premium photography,
                cinematography, and AI-driven visual storytelling.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/photos" className="bg-accent text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-xl shadow-accent/20">
                  Explore Gallery
                </Link>
                <Link href="/about" className="glass px-8 py-4 rounded-full font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Our Process
                </Link>
              </div>
            </div>

            <div className="relative">
              {/* Hero Visual - Placeholder for an actual premium image or AI generated asset */}
              <div className="aspect-[4/5] rounded-3xl overflow-hidden glass relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl mx-auto mb-6 flex items-center justify-center border border-white/30 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">AI Integrated Workflow</h2>
                    <p className="text-white/60 text-sm mt-2">Next-gen media management</p>
                  </div>
                </div>
              </div>

              {/* Floating Tag */}
              <div className="absolute -bottom-6 -right-6 glass p-6 rounded-2xl shadow-2xl max-w-[200px] hidden md:block animate-bounce">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live API</span>
                </div>
                <p className="text-[12px] font-medium leading-tight">Syncing Google Photos & Gemini AI in real-time.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Preview */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Portfolio Verticals</h2>
                <p className="text-slate-500 mt-2">Specialized teams for diverse creative needs.</p>
              </div>
              <Link href="/photos" className="text-accent font-bold hover:underline flex items-center gap-2 group">
                View All <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {['Fashion', 'Architecture', 'Commercial', 'Corporate'].map((cat) => (
                <div key={cat} className="group cursor-pointer">
                  <div className="aspect-square rounded-2xl bg-card border border-border overflow-hidden mb-4 relative group-hover:shadow-2xl transition-all duration-500">
                    <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold shadow-xl">Explore</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg">{cat}</h3>
                  <p className="text-sm text-slate-500">Premium Visuals</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
