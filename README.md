# IDAN.LAB

Offensive security field notes. CTF writeups, wargame walkthroughs, and the things I learned by breaking them.

[![Live site](https://img.shields.io/badge/live-idanlab.dev-2ea043?style=flat)](https://idanlab.dev)
![Astro](https://img.shields.io/badge/Astro-1B1B1E?style=flat&logo=astro&logoColor=white)
![Starlight](https://img.shields.io/badge/Starlight-1B1B1E?style=flat)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-F38020?style=flat&logo=cloudflare&logoColor=white)

**Live at [idanlab.dev](https://idanlab.dev), where these read the way they were built to.**

---

## What this is

I'm Idan. I'm learning offensive security the way it actually sticks: hands on a box, something breaks, I work out why, and I write the whole thing down. This repository is the source behind [idanlab.dev](https://idanlab.dev), the growing library of that work.

It is not a pile of copy and paste commands. Each writeup walks through how a machine really fell: what I saw, what I guessed, what worked, what did not, and the one lesson worth keeping once it was over.

## What you'll find

- **Machine and CTF writeups** from HackTheBox, PicoCTF, and VulnHub, told as a story: recon, foothold, privilege escalation, root, and the takeaway.
- **Wargame walkthroughs**, starting with the full OverTheWire Bandit set level by level, with Natas, Leviathan, and Krypton on the way.
- **Notes and concepts** picked up along the road, written to reinforce them rather than just record them.

Every writeup closes the same way: the reason the exploit worked, how you would shut it down, and a single principle I do not want to forget. The technique is the fun part. The principle is the point.

## Read it on the site

The repo is the source. The experience is [idanlab.dev](https://idanlab.dev). The writeups render there in full, with proper syntax highlighting, spoiler gated flags, and the reading flow they were designed around. If you came to read, start there. If you came to look under the hood, you are in the right place: the writeups live in `src/content/docs/`, one MDX file per page.

## How I work

> Learn by breaking things, document everything, improve continuously.

That is the whole method. I would rather understand one exploit completely than collect ten I could not explain, so I break things on purpose, keep honest notes including the dead ends, and let the writeups get sharper as I do. It grows in public because working in the open keeps me honest.

## Built with

- **[Astro](https://astro.build)** and **[Starlight](https://starlight.astro.build)** for a fast, static, content first site
- **Cloudflare Pages** for hosting and deploys
- A custom theme and writing pipeline of my own, tuned for how I want these to read

Running it locally:

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server |
| `npm run build` | Build the production site |
| `npm run preview` | Preview the production build |

## Reach out

Questions, corrections, or just want to talk shop? I'm at **[contact@idanlab.dev](mailto:contact@idanlab.dev)**.

This place is always a work in progress, same as me. Things move, pages get rewritten, and the next box is always more interesting than the last.

## License

This repository is dual licensed, split by path.

- **Code is [MIT](LICENSE).** Everything under `plugins/`, `src/components/`, `src/styles/`, `src/lib/`, and `src/pages/`, plus the config: `astro.config.mjs`, `src/content.config.ts`, `package.json`, `package-lock.json`, `tsconfig.json`, `.gitattributes`, `.gitignore`, `.claude/`, and `.vscode/`.
- **Writing and images are [CC BY-NC-SA 4.0](LICENSE-CONTENT).** Everything under `src/content/docs/`, `src/assets/`, and `docs/`, plus `README.md` and `CLAUDE.md`. Attribution required, non-commercial use only, derivatives share alike.

`public/` is deliberately unlicensed, because it holds no original work of mine. The fonts and icons are third-party and keep their own terms (the fonts are OFL 1.1, full text at [public/fonts/OFL.txt](public/fonts/OFL.txt)), and `_headers` and `robots.txt` are deployment config with nothing copyrightable in them.

Third-party assets are excluded from both licenses and stay under their own terms. They are listed in [LICENSE-CONTENT](LICENSE-CONTENT).
