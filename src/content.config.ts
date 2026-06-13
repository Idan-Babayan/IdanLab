import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			// Optional machine metadata. Today this lives in each writeup's body
			// `.machine-meta` badge row, NOT frontmatter, so these stay undefined and
			// PlatformIndex/WriteupCard omit the OS + topic chips gracefully. Declaring
			// them here (optional) is the forward-compatible hook: when the Notion -> MDX
			// pipeline promotes os/tags into frontmatter, the cards render them with zero
			// component changes. This is a content-lane enhancement, tracked separately.
			extend: z.object({
				os: z.string().optional(),
				tags: z.array(z.string()).optional(),
			}),
		}),
	}),
};
