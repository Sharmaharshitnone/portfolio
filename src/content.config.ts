import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/data/projects' }),
    schema: z.object({
        title: z.string().min(1).max(100),
        description: z.string().min(10).max(300),
        techStack: z.array(z.string()).min(1),
        githubUrl: z.string().url(),
        category: z.enum(['fullstack', 'backend', 'frontend', 'systems', 'mobile']),
        pubDate: z.coerce.date(),

        liveUrl: z.string().url().optional(),
        subdomain: z.string().optional(),
        thumbnail: z.string().optional(),
        featured: z.boolean().default(false),
        status: z.enum(['active', 'archived', 'wip']).default('active'),

        // Case study fields
        problem: z.string().optional(),
        solution: z.string().optional(),
        architecture: z.string().optional(),
        challenges: z.array(z.string()).optional(),
        outcomes: z.array(z.string()).optional(),
    }),
});

const algorithms = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/data/algorithms' }),
    schema: z.object({
        title: z.string().min(1),
        platform: z.enum(['codeforces', 'leetcode', 'atcoder', 'cses', 'codechef']),
        problemUrl: z.string().url().optional(),
        difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
        rating: z.number().int().min(800).max(4000).optional(),
        tags: z.array(z.string()).min(1),
        timeComplexity: z.string(),
        spaceComplexity: z.string(),
        language: z.enum(['cpp', 'rust', 'python']).default('cpp'),
        executionTimeMs: z.number().optional(),
        memoryUsedKb: z.number().optional(),
        pubDate: z.coerce.date(),

        // Wasm runner support — opt-in per algorithm
        wasmSlug: z.string().optional(),
        sampleInput: z.string().optional(),
        sampleOutput: z.string().optional(),
    }),
});

const logs = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/data/logs' }),
    schema: z.object({
        title: z.string().min(1),
        summary: z.string().optional(),
        type: z.enum(['daily', 'weekly', 'project', 'problem']),
        tags: z.array(z.string()),
        mood: z.enum(['productive', 'learning', 'struggling', 'breakthrough']).optional(),
        hoursWorked: z.number().optional(),
        pubDate: z.coerce.date(),
    }),
});

const algorithmNotes = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/data/algorithm-notes' }),
    schema: z.object({
        title: z.string().min(1),
        parentAlgo: z.string(),
        section: z.enum(['approach', 'story', 'analysis', 'similar']),
        pubDate: z.coerce.date(),
    }),
});

export const collections = { projects, algorithms, logs, algorithmNotes };
