"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import OpportunityCard, { Opportunity } from "@/components/OpportunityCard";
import { getSaved } from "@/lib/api";
import { Bookmark, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function SavedPage() {
    const { getToken, isLoaded } = useAuth();
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchSaved = async () => {
        setLoading(true);
        setError("");
        try {
            const token = await getToken();
            const res = await getSaved(token!) as { opportunities: Opportunity[] };
            setOpportunities(res.opportunities || []);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load saved opportunities.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded) fetchSaved();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded]);

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Navbar */}
            <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-gray-950/80 backdrop-blur z-10">
                <div className="flex items-center gap-3">
                    <span className="text-violet-400 text-xl">🎯</span>
                    <span className="text-white font-bold text-lg">Opportunity Detector</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm transition">
                        <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link href="/saved" className="text-violet-400 flex items-center gap-1.5 text-sm font-medium">
                        <Bookmark size={16} /> Saved
                    </Link>
                    <UserButton />
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-1">Saved Opportunities 🔖</h1>
                    <p className="text-gray-400">Your personal bookmarks — {opportunities.length} saved</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl h-64 animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-16">
                        <p className="text-red-400 text-lg">{error}</p>
                        <button onClick={fetchSaved} className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-xl">
                            Retry
                        </button>
                    </div>
                ) : opportunities.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-5xl mb-4">🔖</p>
                        <p className="text-gray-400 text-xl">No saved opportunities yet.</p>
                        <p className="text-gray-600 mt-2">Click the bookmark icon on any opportunity to save it here.</p>
                        <Link href="/dashboard" className="inline-block mt-6 px-6 py-2 bg-violet-600 text-white rounded-xl">
                            Browse Opportunities
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {opportunities.map((opp) => (
                            <OpportunityCard
                                key={opp._id}
                                opportunity={opp}
                                isSaved={true}
                                onSaveToggle={fetchSaved}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
