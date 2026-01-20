import { defineCollection, z } from 'astro:content';

const slopCollection = defineCollection({
    type: 'content',
    schema: z.object({
        headline: z.string(),
        summary: z.string(),
        date: z.coerce.date(),
        tags: z.array(z.string()),
        icon: z.string().optional(),
    })
});

const resumeCollection = defineCollection({
    type: 'content', // Body will be the Professional Summary
    schema: z.object({
        name: z.string(),
        title: z.string(),
        email: z.string(),
        location: z.string(),
        linkedin: z.string(),
        skills: z.array(z.object({
            category: z.string(),
            items: z.array(z.string())
        })),
        experience: z.array(z.object({
            title: z.string(),
            slug: z.string(),
            description: z.string(),
            details: z.array(z.string()),
            tags: z.array(z.string()),
            year: z.string(),
            technologies: z.array(z.string())
        })),
        education: z.array(z.object({
            institution: z.string(),
            year: z.string(),
            degree: z.string()
        }))
    })
});

export const collections = {
    'slop': slopCollection,
    'resume': resumeCollection
};
