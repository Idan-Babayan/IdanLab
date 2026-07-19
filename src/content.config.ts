import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			// Optional machine metadata, read by PlatformIndex/WriteupCard to render the OS +
			// topic chips on the platform landing cards. Both are optional and both are omitted
			// gracefully when absent. `os` is partly adopted (busqueda, return, forest set it);
			// `tags` is deliberately unused until writeup volume makes a tag filter earn its
			// place (see ROADMAP). NOTE: the in-page metadata row is the WriteupMeta component,
			// which takes its values as props, so it does NOT read these fields.
			extend: z.object({
				os: z.string().optional(),
				tags: z.array(z.string()).optional(),
				// Optional closing maxim. When a writeup sets this, the Footer override
				// auto-appends the design's <Principle> coda and suppresses pagination on
				// that page (the silence is coupled to the coda). Omitted means no coda,
				// exactly as os/tags omit their chips. See src/components/overrides/Footer.astro.
				principle: z.string().optional(),
			}),
		}),
	}),
};
