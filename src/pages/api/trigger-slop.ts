export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async (context) => {
    // Try to get secret from Cloudflare Runtime (Production) or import.meta (Dev/Build)
    const runtime = context.locals.runtime as any;
    const env = runtime?.env || {};

    // Check both sources
    const GITHUB_PAT = env.GITHUB_PAT || import.meta.env.GITHUB_PAT;

    const REPO_OWNER = 'kiranprasad2001';
    const REPO_NAME = 'kiranic';
    const WORKFLOW_ID = 'daily-slop.yml';

    if (!GITHUB_PAT) {
        return new Response(JSON.stringify({
            error: 'Server misconfiguration: Missing GITHUB_PAT. (Ensure it is added to Cloudflare Pages Settings)'
        }), { status: 500 });
    }

    try {
        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_ID}/dispatches`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `Bearer ${GITHUB_PAT}`,
                    'User-Agent': 'kiranic-app',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ref: 'main'
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GitHub API failed: ${response.status} ${errorText}`);
        }

        return new Response(JSON.stringify({
            message: 'Workflow triggered successfully',
            status: 'success'
        }), { status: 200 });

    } catch (error: any) {
        console.error('Failed to trigger workflow:', error);
        return new Response(JSON.stringify({
            error: error.message || 'Failed to trigger workflow'
        }), { status: 500 });
    }
};
