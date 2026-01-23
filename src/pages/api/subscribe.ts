
export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const formData = await request.formData();
        const email = formData.get('email')?.toString().trim();

        console.log('Subscribe attempt:', email); // Debug logging

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            console.error('Invalid email format:', email);
            return new Response(JSON.stringify({ message: "Invalid email address" }), { status: 400 });
        }

        // Generate a secure unsubscribe token
        const token = crypto.randomUUID();

        // Access D1 database from Cloudflare runtime
        // @ts-ignore - DB type definition is in env.d.ts but sometimes editor lags
        const db = locals.runtime.env.DB;

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

    } catch (error) {
        console.error('Subscription error:', error);
        return new Response(JSON.stringify({ message: "Server error. The robots are rebelling." }), { status: 500 });
    }
}
