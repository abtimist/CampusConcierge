"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveOnboarding } from "@/lib/api";

const INTERESTS = ["AI", "Web Dev", "Blockchain", "Mobile", "Cloud", "Data Science", "DevOps", "Cybersecurity"];
const TYPES = ["internship", "hackathon", "job"];

export default function OnboardingPage() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [interests, setInterests] = useState<string[]>([]);
    const [types, setTypes] = useState<string[]>([]);
    const [telegramChatId, setTelegramChatId] = useState("");
    const [email, setEmail] = useState(user?.emailAddresses?.[0]?.emailAddress || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [googleStatus, setGoogleStatus] = useState<"idle" | "connecting" | "connected">("idle");

    const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
        setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
    };

    const handleConnectGoogle = () => {
        const clerkId = user?.id;
        if (!clerkId) return;
        setGoogleStatus("connecting");
        // Open Google OAuth in same tab; callback will redirect back to /onboarding?googleConnected=true
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google?clerkId=${clerkId}`;
    };

    const handleSubmit = async () => {
        if (!email) { setError("Email is required."); return; }
        setLoading(true);
        setError("");
        try {
            const token = await getToken();
            await saveOnboarding(token!, {
                interests,
                types,
                telegramChatId: telegramChatId || null,
                email,
            });
            router.push("/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
            <div className="w-full max-w-xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">🎯 Let's set you up</h1>
                    <p className="text-gray-400">Step {step} of 3</p>
                    {/* Progress bar */}
                    <div className="mt-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-violet-500 transition-all duration-500"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-2xl">
                    {/* Step 1: Interests + Types */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-2xl font-semibold text-white mb-1">Your Interests</h2>
                            <p className="text-gray-400 text-sm mb-6">We'll show you relevant opportunities</p>

                            <div className="mb-6">
                                <p className="text-gray-300 font-medium mb-3">Tech areas</p>
                                <div className="flex flex-wrap gap-2">
                                    {INTERESTS.map((i) => (
                                        <button
                                            key={i}
                                            onClick={() => toggleItem(interests, setInterests, i)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${interests.includes(i)
                                                    ? "bg-violet-600 border-violet-500 text-white"
                                                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-violet-500"
                                                }`}
                                        >
                                            {i}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-300 font-medium mb-3">Opportunity types</p>
                                <div className="flex flex-wrap gap-2">
                                    {TYPES.map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => toggleItem(types, setTypes, t)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all capitalize ${types.includes(t)
                                                    ? "bg-emerald-600 border-emerald-500 text-white"
                                                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-emerald-500"
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={interests.length === 0 && types.length === 0}
                                className="mt-8 w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition"
                            >
                                Continue →
                            </button>
                        </div>
                    )}

                    {/* Step 2: Integrations */}
                    {step === 2 && (
                        <div>
                            <h2 className="text-2xl font-semibold text-white mb-1">Connect Alerts</h2>
                            <p className="text-gray-400 text-sm mb-6">Get notified where it matters</p>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-gray-300 text-sm mb-2 font-medium">
                                        📧 Email address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm mb-1 font-medium">
                                        ✈️ Telegram Chat ID
                                    </label>
                                    <p className="text-gray-500 text-xs mb-2">
                                        Message <span className="text-violet-400">@userinfobot</span> on Telegram to get your Chat ID
                                    </p>
                                    <input
                                        type="text"
                                        value={telegramChatId}
                                        onChange={(e) => setTelegramChatId(e.target.value)}
                                        placeholder="e.g. 123456789"
                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500 transition"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition"
                                >
                                    Continue →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Google Calendar */}
                    {step === 3 && (
                        <div>
                            <h2 className="text-2xl font-semibold text-white mb-1">Google Calendar</h2>
                            <p className="text-gray-400 text-sm mb-6">Add deadlines directly to your calendar</p>

                            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">📅</div>
                                    <div>
                                        <p className="text-white font-medium">Connect Google Calendar</p>
                                        <p className="text-gray-400 text-sm">We only create events — we never read your calendar</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleConnectGoogle}
                                    disabled={googleStatus === "connected"}
                                    className={`mt-4 w-full py-3 rounded-xl font-semibold transition ${googleStatus === "connected"
                                            ? "bg-emerald-600 text-white cursor-default"
                                            : "bg-white text-gray-900 hover:bg-gray-100"
                                        }`}
                                >
                                    {googleStatus === "connected"
                                        ? "✅ Connected!"
                                        : googleStatus === "connecting"
                                            ? "Connecting..."
                                            : "Connect with Google"}
                                </button>
                                <p className="text-gray-500 text-xs text-center mt-2">Optional — you can skip this</p>
                            </div>

                            {error && (
                                <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold rounded-xl transition"
                                >
                                    {loading ? "Saving..." : "Go to Dashboard 🚀"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
