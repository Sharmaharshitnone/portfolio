import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/data/projects' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        longDescription: z.string().optional(),
        techStack: z.array(z.string()),
        stars: z.number().default(0),
        forks: z.number().default(0),
        github: z.string().url().optional(),
        live: z.string().url().optional(),
        featured: z.boolean().default(false),
        category: z.enum(['systems', 'web', 'data', 'devops', 'tools']),
        order: z.number().default(0),
    }),
});

const algorithms = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/data/algorithms' }),
    schema: z.object({
        title: z.string(),
        platform: z.enum(['CF', 'LC', 'AC']),
        difficulty: z.enum(['easy', 'medium', 'hard']),
        tags: z.array(z.string()),
        solved: z.string().date(),
        rating: z.number().optional(),
        link: z.string().url(),
        timeComplexity: z.string(),
        spaceComplexity: z.string(),
    }),
});

const logs = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/data/logs' }),
    schema: z.object({
        title: z.string(),
        date: z.string().date(),
        type: z.enum(['daily', 'weekly', 'project']),
        tags: z.array(z.string()),
        readTime: z.string().optional(),
        hash: z.string().optional(),
    }),
});

export const collections = { projects, algorithms, logs };
