import { defineCollection, z } from 'astro:content';
import type { Loader, LoaderContext } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// THE .mdx BOUNDARY, ENFORCED WHERE A THROW IS FATAL. Every guard this project relies on for a writeup
// (the taxonomy guard, the principle guard, the axis rules and the badge injection in
// plugins/remark-inject-writeupmeta.mjs) runs at the remark stage and keys on the `.mdx` extension, and
// none of them can police the other side of that boundary. A `.md` file under a platform directory is
// rendered by Astro's glob loader at content-sync time inside a try/catch that LOGS a render error and
// stores the entry anyway (astro/dist/content/loaders/glob.js), so a remark-stage throw is fatal for
// `.mdx`, which Vite compiles at render time, and merely logged for `.md`: the page ships with an empty
// body on a green build (measured 2026-09-14, audit ER-14). The one seam where a throw fails the build
// before `dist/` is touched is the collection loader itself: a rejected `load()` fails the content sync.
// So Starlight's loader is wrapped, not replaced: it runs unchanged, then the store is walked once and
// any non-index file under the four platform directories that is not `.mdx` refuses the build by name.
// A section index (`index.mdx` today) is exempt whatever its extension, the same hub-not-writeup
// reading the injector applies to index.mdx.
// Dev note: after the first sync the glob loader applies file changes through its own watcher, not
// through `load()`, so this gate speaks at build and sync time, which is where the finding lives.
// COUPLING TO KEEP IN STEP: the directory list mirrors DIR_TO_PLATFORM in the injector.
const PLATFORM_DIRS = ['hackthebox', 'vulnhub', 'picoctf', 'overthewire'];
const platformFile = new RegExp(`^src/content/docs/(?:${PLATFORM_DIRS.join('|')})/(.+)$`);

const gatedDocsLoader = (): Loader => {
	const base = docsLoader();
	return {
		...base,
		load: async (context: LoaderContext) => {
			await base.load(context);
			for (const entry of context.store.values()) {
				const filePath = (entry.filePath ?? '').replace(/\\/g, '/');
				const match = filePath.match(platformFile);
				if (!match) continue;
				const name = match[1].split('/').pop() ?? '';
				if (/^index\.[a-z]+$/i.test(name)) continue;
				if (/\.mdx$/i.test(name)) continue;
				throw new Error(
					`docs loader: ${filePath} is not an .mdx file. Every writeup under a platform directory is .mdx, ` +
						`because the remark-stage guards (taxonomy, principle, axis rules, badge injection) are fatal ` +
						`for .mdx and only logged for .md, which would ship the page empty on a green build. ` +
						`Rename it to .mdx, or move it out of src/content/docs/{${PLATFORM_DIRS.join(',')}}/.`
				);
			}
		},
	};
};

export const collections = {
	docs: defineCollection({
		loader: gatedDocsLoader(),
		schema: docsSchema({
			// WriteupMeta metadata. These three plus the derived platform drive the in-page badge
			// row, which is now INJECTED from frontmatter by plugins/remark-inject-writeupmeta.mjs
			// rather than hand-placed, so frontmatter is the authoring surface and this schema is its
			// first line of validation. `platform` is deliberately absent: it is derived from the
			// writeup's platform directory (the directory is authoritative, as for the sidebar and
			// PlatformIndex), so it can never be mistyped here. `category` is absent for the same
			// reason: a PicoCTF writeup's category IS its middle directory (picoctf/<category>/), derived
			// by the injector against src/lib/taxonomy.mjs, and a frontmatter `category:` key fails the
			// build there. The path-dependent difficulty rules (required on hackthebox/ and vulnhub/ and
			// equal to the tier directory, forbidden elsewhere) also live in the injector, which is the
			// one pass that sees both the path and the frontmatter; Zod sees only the frontmatter.
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
				// Optional closing maxim, HackTheBox writeups ONLY. When set, the MarkdownContent
				// override appends the design's <Principle> coda inside the content, and the default
				// Prev/Next pager renders beneath it. Omitted means no coda, exactly as os/tags omit
				// their chips. Zod cannot see the file path, so the scope rule lives in
				// plugins/remark-inject-writeupmeta.mjs, which fails the build on a principle outside
				// hackthebox/ or on an empty one. See src/components/overrides/MarkdownContent.astro.
				principle: z.string().optional(),
			}),
		}),
	}),
};
