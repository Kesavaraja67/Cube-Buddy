// app/solver/solution/page.tsx
import React, { Suspense } from "react";
import SolutionClient from "./SolutionClient";

export const revalidate = 0; // optional: adjust if you want ISR behaviour

export default function SolutionPage() {
    return (
        <main className="p-6 max-w-4xl mx-auto text-white">
            <h1 className="sr-only">Solution</h1>

            {/* Keep server-rendered wrapper content minimal; client component handles the dynamic UI */}
            <Suspense fallback={
                <div className="p-6 max-w-3xl mx-auto text-white">
                    <div className="text-center py-8">Loading solution…</div>
                </div>
            }>
                {/* This component uses client-only hooks (useSearchParams, sessionStorage, router) */}
                <SolutionClient />
            </Suspense>
        </main>
    );
}
