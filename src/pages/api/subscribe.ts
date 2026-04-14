
export const prerender = false;

import type { APIRoute } from 'astro';

// Simple in-memory rate limiter: max 5 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60_000;

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return false;
    }
    entry.count++;
    return entry.count > RATE_LIMIT_MAX;
}

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
    if (isRateLimited(clientAddress)) {
        return new Response(JSON.stringify({ message: "Too many requests. Please try again later." }), { status: 429 });
    }

    try {
        const formData = await request.formData();
        const email = formData.get('email')?.toString().trim();

        if (!email) {
            return new Response(JSON.stringify({ message: "Email is missing from request" }), { status: 400 });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return new Response(JSON.stringify({
                message: `Invalid email format. Server received: '${email}' (Length: ${email.length})`
            }), { status: 400 });
        }

        // Generate a secure unsubscribe token
        const token = crypto.randomUUID();

        // Access D1 database from Cloudflare runtime
        const runtime = (locals as Record<string, any>).runtime;
        const db = runtime?.env?.DB;

        if (!db) {
            throw new Error(`Database binding 'DB' is missing. Available keys: ${Object.keys(runtime?.env || {}).join(', ')}`);
        }

        // Check if exists
        const { results } = await db.prepare("SELECT email FROM subscribers WHERE email = ?").bind(email).all();

        if (results.length > 0) {
            return new Response(JSON.stringify({
                message: "You're already subscribed! (But we appreciate the enthusiasm)"
            }), { status: 200 });
        }

        // Insert
        await db.prepare("INSERT INTO subscribers (email, token) VALUES (?, ?)")
            .bind(email, token)
            .run();

        return new Response(JSON.stringify({
            message: "Success! You have joined the collective hallucination."
        }), { status: 200 });

    } catch (error: any) {
        console.error('Subscription error:', error);
        return new Response(JSON.stringify({
            message: `Server error: ${error.message || error.toString()}`
        }), { status: 500 });
    }
}
