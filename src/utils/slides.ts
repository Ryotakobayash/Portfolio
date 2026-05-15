import { getCollection } from 'astro:content';

export async function getPublishedSlides() {
    return await getCollection('slides', ({ data }) => {
        return import.meta.env.PROD ? data.draft !== true : true;
    });
}

export async function isSlidePublished(slug: string): Promise<boolean> {
    const slides = await getPublishedSlides();
    return slides.some((s) => s.id.replace(/\.mdx?$/, '') === slug);
}
