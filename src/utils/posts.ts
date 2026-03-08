import { getCollection } from 'astro:content';

/**
 * Gets all posts, filtering out drafts in production builds.
 */
export async function getPublishedPosts() {
    const posts = await getCollection('posts', ({ data }) => {
        return import.meta.env.PROD ? data.draft !== true : true;
    });
    return posts;
}
