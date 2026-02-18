export default function Footer() {
    return (
        <footer className="bg-card text-card-foreground py-12 border-t border-border mt-auto">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0">
                        <h2 className="text-xl font-bold tracking-tighter">
                            PRO<span className="text-accent">VENTURE</span>
                        </h2>
                        <p className="text-sm text-slate-500 mt-2">Elevating digital stories since 2024.</p>
                    </div>
                    <div className="flex space-x-6 text-sm">
                        <a href="#" className="hover:text-accent transition-colors">Instagram</a>
                        <a href="#" className="hover:text-accent transition-colors">Behance</a>
                        <a href="#" className="hover:text-accent transition-colors">LinkedIn</a>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-border/50 text-center text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} Proventure Digital Agency. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
