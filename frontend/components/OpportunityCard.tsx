"use client";

import { formatDistanceToNow, differenceInDays } from "date-fns";
import { CalendarDays, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { saveOpportunity, unsaveOpportunity, addToCalendar } from "@/lib/api";

export type Opportunity = {
    _id: string;
    title: string;
    description: string;
    link: string;
    deadline: string;
    type: "internship" | "hackathon" | "job";
    tags: string[];
};

type Props = {
    opportunity: Opportunity;
    isSaved?: boolean;
    onSaveToggle?: () => void;
};

const TYPE_COLORS: Record<string, string> = {
    internship: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    hackathon: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    job: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

function getUrgency(deadline: string) {
    const days = differenceInDays(new Date(deadline), new Date());
    if (days < 0) return { label: "Expired", emoji: "⚫", color: "text-gray-500", bg: "bg-gray-800" };
    if (days < 2) return { label: `${days}d left`, emoji: "🔴", color: "text-red-400", bg: "bg-red-900/20" };
    if (days < 7) return { label: `${days}d left`, emoji: "🟡", color: "text-yellow-400", bg: "bg-yellow-900/20" };
    return { label: `${days}d left`, emoji: "🟢", color: "text-emerald-400", bg: "bg-emerald-900/20" };
}

export default function OpportunityCard({ opportunity, isSaved = false, onSaveToggle }: Props) {
    const { getToken } = useAuth();
    const [saved, setSaved] = useState(isSaved);
    const [calStatus, setCalStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
    const [saveLoading, setSaveLoading] = useState(false);

    const urgency = getUrgency(opportunity.deadline);

    const handleSaveToggle = async () => {
        setSaveLoading(true);
        try {
            const token = await getToken();
            if (saved) {
                await unsaveOpportunity(token!, opportunity._id);
            } else {
                await saveOpportunity(token!, opportunity._id);
            }
            setSaved(!saved);
            onSaveToggle?.();
        } catch {
            /* silently fail */
        } finally {
            setSaveLoading(false);
        }
    };

    const handleAddToCalendar = async () => {
        setCalStatus("loading");
        try {
            const token = await getToken();
            await addToCalendar(token!, opportunity._id);
            setCalStatus("done");
        } catch {
            setCalStatus("error");
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-violet-500/50 transition-all group shadow-lg">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-white font-semibold text-lg leading-snug group-hover:text-violet-300 transition">
                    {opportunity.title}
                </h3>
                <span className={`shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${TYPE_COLORS[opportunity.type] || "bg-gray-800 text-gray-400 border-gray-700"}`}>
                    {opportunity.type}
                </span>
            </div>

            {/* Description */}
            {opportunity.description && (
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
                    {opportunity.description}
                </p>
            )}

            {/* Tags */}
            {opportunity.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {opportunity.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-gray-800 text-gray-400">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Urgency + Deadline */}
            <div className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg mb-5 ${urgency.bg}`}>
                <span>{urgency.emoji}</span>
                <span className={urgency.color}>{urgency.label}</span>
                <span className="text-gray-500 ml-auto text-xs flex items-center gap-1">
                    <CalendarDays size={13} />
                    {new Date(opportunity.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <a
                    href={opportunity.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition"
                >
                    Apply Now <ExternalLink size={14} />
                </a>

                <button
                    onClick={handleSaveToggle}
                    disabled={saveLoading}
                    title={saved ? "Unsave" : "Save"}
                    className={`p-2.5 rounded-xl border transition ${saved
                            ? "bg-violet-600/20 border-violet-500 text-violet-400"
                            : "bg-gray-800 border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400"
                        }`}
                >
                    {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>

                <button
                    onClick={handleAddToCalendar}
                    disabled={calStatus === "loading" || calStatus === "done"}
                    title="Add to Google Calendar"
                    className={`p-2.5 rounded-xl border transition text-sm ${calStatus === "done"
                            ? "bg-emerald-600/20 border-emerald-500 text-emerald-400"
                            : calStatus === "error"
                                ? "bg-red-900/20 border-red-500 text-red-400"
                                : "bg-gray-800 border-gray-700 text-gray-400 hover:border-emerald-500 hover:text-emerald-400"
                        }`}
                >
                    {calStatus === "done" ? "✅" : calStatus === "error" ? "❌" : calStatus === "loading" ? "⏳" : "📅"}
                </button>
            </div>
        </div>
    );
}
