
export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const formData = await request.formData();
        const email = formData.get('email')?.toString().trim();

        console.log('Subscribe attempt:', email); // Debug logging

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
        // @ts-ignore
        const runtime = locals.runtime;

        console.log('Runtime keys:', Object.keys(runtime || {}));
        console.log('Env keys:', Object.keys(runtime?.env || {}));

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
