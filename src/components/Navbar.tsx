"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass py-4 shadow-lg" : "bg-transparent py-6"}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold tracking-tighter text-foreground">
                    PRO<span className="text-accent">VENTURE</span>
                </Link>
                <div className="hidden md:flex space-x-8 text-sm font-medium">
                    <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                    <Link href="/photos" className="hover:text-accent transition-colors">Photography</Link>
                    <Link href="/videos" className="hover:text-accent transition-colors">Cinematography</Link>
                    <Link href="/about" className="hover:text-accent transition-colors">About</Link>
                </div>
                <button className="bg-accent text-white px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
                    Contact Us
                </button>
            </div>
        </nav>
    );
}
