"use client";

import { useState, useEffect } from "react";

export function useMedia() {
    const [media, setMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            setLoading(false);
            return;
        }

        fetch(apiUrl)
            .then((res) => res.json())
            .then((data) => {
                setMedia(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch media:", err);
                setLoading(false);
            });
    }, []);

    return { media, loading };
}
