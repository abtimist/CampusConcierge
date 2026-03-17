"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OpportunityCard, { Opportunity } from "@/components/OpportunityCard";
import { getOpportunities, getMe, triggerSync } from "@/lib/api";
import { RefreshCw, LayoutDashboard, Bookmark } from "lucide-react";
import Link from "next/link";

const TYPE_FILTERS = ["all", "internship", "hackathon", "job"];

type UserProfile = {
    interests: string[];
    types: string[];
    onboardingComplete: boolean;
};

export default function DashboardPage() {
    const { getToken, isLoaded } = useAuth();
    const router = useRouter();

    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState("");

    const fetchData = async (typeFilter?: string) => {
        setLoading(true);
        setError("");
        try {
            const token = await getToken();
            const [oppRes, userRes] = await Promise.all([
                getOpportunities(token!, { type: typeFilter === "all" ? undefined : typeFilter }),
                getMe(token!),
            ]);
            const od = oppRes as { opportunities: Opportunity[] };
            const ud = userRes as { user: UserProfile };
            setOpportunities(od.opportunities || []);
            setUser(ud.user);

            if (!ud.user?.onboardingComplete) {
                router.push("/onboarding");
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load opportunities.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded) fetchData(filter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, filter]);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const token = await getToken();
            await triggerSync(token!);
            setTimeout(() => fetchData(filter), 2000);
        } catch {
            /* silently fail */
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Navbar */}
            <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-gray-950/80 backdrop-blur z-10">
                <div className="flex items-center gap-3">
                    <span className="text-violet-400 text-xl">🎯</span>
                    <span className="text-white font-bold text-lg">Opportunity Detector</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-violet-400 flex items-center gap-1.5 text-sm font-medium">
                        <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link href="/saved" className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm transition">
                        <Bookmark size={16} /> Saved
                    </Link>
                    <UserButton />
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Hero */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Your Feed 🚀</h1>
                        <p className="text-gray-400">
                            Personalized opportunities based on{" "}
                            {user?.interests?.slice(0, 3).join(", ") || "your preferences"}
                        </p>
                    </div>
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm rounded-xl transition disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
                        {syncing ? "Syncing..." : "Sync Now"}
                    </button>
                </div>

                {/* Type filter pills */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {TYPE_FILTERS.map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition ${filter === t
                                ? "bg-violet-600 text-white"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl h-64 animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-16">
                        <p className="text-red-400 text-lg">{error}</p>
                        <button onClick={() => fetchData(filter)} className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-xl">
                            Retry
                        </button>
                    </div>
                ) : opportunities.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-5xl mb-4">🔍</p>
                        <p className="text-gray-400 text-xl">No opportunities yet.</p>
                        <p className="text-gray-600 mt-2">Try syncing or adjusting your preferences.</p>
                        <button onClick={handleSync} className="mt-6 px-6 py-2 bg-violet-600 text-white rounded-xl">
                            Sync Opportunities
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {opportunities.map((opp) => (
                            <OpportunityCard key={opp._id} opportunity={opp} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
