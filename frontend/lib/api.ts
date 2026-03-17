/**
 * lib/api.ts
 * Typed fetch client that automatically attaches the Clerk JWT to every request.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8181";

type RequestOptions = {
    method?: string;
    body?: unknown;
    token?: string | null;
    headers?: Record<string, string>;
};

async function apiFetch<T = unknown>(
    path: string,
    { method = "GET", body, token, headers = {} }: RequestOptions = {}
): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data?.error || `Request failed: ${res.status}`);
    }
    return data as T;
}

// ── User ──────────────────────────────────────────────────────────────────────

export const saveOnboarding = (token: string, payload: object) =>
    apiFetch("/api/user/onboarding", { method: "POST", body: payload, token });

export const getMe = (token: string) =>
    apiFetch("/api/user/me", { token });

// ── Opportunities ─────────────────────────────────────────────────────────────

export const getOpportunities = (
    token: string,
    params?: { type?: string; page?: number; limit?: number }
) => {
    const qs = new URLSearchParams(
        Object.entries(params || {}).reduce((acc, [k, v]) => {
            if (v !== undefined) acc[k] = String(v);
            return acc;
        }, {} as Record<string, string>)
    ).toString();
    return apiFetch(`/api/opportunities${qs ? `?${qs}` : ""}`, { token });
};

// ── Saved ─────────────────────────────────────────────────────────────────────

export const saveOpportunity = (token: string, opportunityId: string) =>
    apiFetch("/api/save", { method: "POST", body: { opportunityId }, token });

export const unsaveOpportunity = (token: string, opportunityId: string) =>
    apiFetch(`/api/save/${opportunityId}`, { method: "DELETE", token });

export const getSaved = (token: string) =>
    apiFetch("/api/saved", { token });

// ── Calendar ──────────────────────────────────────────────────────────────────

export const addToCalendar = (token: string, opportunityId: string) =>
    apiFetch("/api/calendar/add", {
        method: "POST",
        body: { opportunityId },
        token,
    });

// ── Sync ──────────────────────────────────────────────────────────────────────

export const triggerSync = (token: string) =>
    apiFetch("/api/sync-trigger", { method: "POST", token });
