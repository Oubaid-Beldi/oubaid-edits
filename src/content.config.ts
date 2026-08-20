import { defineCollection, reference, z } from "astro:content";
import { glob } from "astro/loaders";

// Singleton — one entry in src/content/site/. Bio lives in the Markdown
// body (not a frontmatter field) so it can be a longer, freely-formatted
// piece of prose without a schema constraint on length/structure.
const site = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/site" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      headline: z.string().optional(),
      subheadline: z.string().optional(),
      photo: image().optional(),
      email: z.string().email().optional(),
      instagramHandle: z.string().optional(),
      responseTimeNote: z.string().optional(),
    }),
});

const niches = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/niches" }),
  schema: z.object({
    name: z.string(),
    slug: z.string().optional(),
    sortOrder: z.number().optional(),
  }),
});

const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: z.object({
    youtubeUrl: z.string().url(),
    title: z.string().optional(),
    niche: reference("niches").optional(),
    sortOrder: z.number().optional(),
    featured: z.boolean().optional(),
  }),
});

const process = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/process" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    sortOrder: z.number().optional(),
  }),
});

// Value is a string, not a number: mockup stats include non-numeric
// suffixes ("50+", "3.2M", "48h") that a numeric field can't represent.
const stats = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/stats" }),
  schema: z.object({
    value: z.string(),
    label: z.string().optional(),
    sortOrder: z.number().optional(),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/testimonials" }),
  schema: z.object({
    quote: z.string(),
    name: z.string().optional(),
    role: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
    sortOrder: z.number().optional(),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/faq" }),
  schema: z.object({
    question: z.string(),
    answer: z.string().optional(),
    sortOrder: z.number().optional(),
  }),
});

export const collections = { site, niches, work, process, stats, testimonials, faq };
