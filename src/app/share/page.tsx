"use client";

import { Suspense } from "react";
import ShareContent from "./ShareContent";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function SharePage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <ShareContent />
        </Suspense>
    );
}
