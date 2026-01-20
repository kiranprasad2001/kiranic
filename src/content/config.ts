import { defineCollection, z } from 'astro:content';

const slopCollection = defineCollection({
    type: 'content',
    schema: z.object({
        headline: z.string(),
        summary: z.string(),
        date: z.string().or(z.date()).transform((val) => new Date(val)),
        tags: z.array(z.string()),
        icon: z.string().default('Bot'),
    })
});

export const collections = {
    'slop': slopCollection,
};
