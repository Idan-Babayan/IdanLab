import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			// WriteupMeta metadata. These three plus the derived platform drive the in-page badge
			// row, which is now INJECTED from frontmatter by plugins/remark-inject-writeupmeta.mjs
			// rather than hand-placed, so frontmatter is the authoring surface and this schema is its
			// first line of validation. `platform` is deliberately absent: it is derived from the
			// writeup's platform directory (the directory is authoritative, as for the sidebar and
			// PlatformIndex), so it can never be mistyped here.
			// The enums MIRROR the component's unions in src/components/badges/icons.ts EXACTLY,
			// including casing and the space in "Active Directory". Keep the two in step: a value
			// this schema accepts but the component rejects would fail later and less clearly.
			// All are optional. `os` is also read by PlatformIndex/WriteupCard for the OS chip on the
			// landing cards, which only ever matched linux/windows, so tightening it breaks nothing.
			extend: z.object({
				os: z.enum(['Linux', 'Windows']).optional(),
				environment: z.enum(['Standalone', 'Active Directory', 'Progressive']).optional(),
				difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Insane']).optional(),
				// Injector opt-out. Typed here so a non-boolean is caught with editor support; the
				// injector still enforces it at the remark stage, where it also rejects the YAML
				// coercion trap (badges: no / off / "false" all parse as truthy strings).
				badges: z.boolean().optional(),
				// Deliberately unused until writeup volume makes a tag filter earn its place (ROADMAP).
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
