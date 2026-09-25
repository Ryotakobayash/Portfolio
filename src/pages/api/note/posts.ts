import type { APIRoute } from 'astro';
import { getAllExternalPosts } from '../../../utils/externalPosts';

export const prerender = false;

export const GET: APIRoute = async () => {
    try {
        const posts = await getAllExternalPosts();
        return new Response(JSON.stringify({ posts, source: 'note-rss' }), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch {
        return new Response(JSON.stringify({ posts: [], source: 'static-fallback' }), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        });
    }
};
