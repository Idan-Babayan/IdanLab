export type Platform = 'HackTheBox' | 'VulnHub' | 'PicoCTF' | 'OverTheWire';
export type OS = 'Linux' | 'Windows';
export type Environment = 'Standalone' | 'Active Directory' | 'Progressive';
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Insane';

// Single registry, split by CONSUMPTION MECHANISM (what each icon needs), not stored uniformly.
//
// LOGOS render as native-color <img> from a hashed `?url` import: the four platform brand logos plus
// Linux (a multicolor Tux that cannot be a clean single-color glyph). A logo keeps its own fills and
// does not need currentColor, and a file served once and cached beats inlining it into every page.
// The four platform SVGs are duplicated in public/icons for the sidebar CSS backgrounds (a plain CSS
// url() cannot resolve a hashed src asset); that duplication is forced by the CSS lock and intentional.
import htbUrl from '../../assets/icons/htb.svg?url';
import vulnhubUrl from '../../assets/icons/vulnhub.svg?url';
import picoctfUrl from '../../assets/icons/picoctf.svg?url';
import overthewireUrl from '../../assets/icons/overthewire.svg?url';
import linuxUrl from '../../assets/icons/linux.svg?url';

// GLYPHS inline via set:html and inherit currentColor so they tint to the chip accent in both themes:
// Windows plus the environment marks. Windows / Active Directory / Progressive are the real marks with
// their single baked fill rebound to currentColor (artwork otherwise unchanged); Standalone is a
// purpose-drawn glyph (no source file exists). Category glyphs live only in src/assets/icons/ because
// inlining requires importing them, and public/ is not in the import graph.
import windowsRaw from '../../assets/icons/windows.svg?raw';
import activeDirectoryRaw from '../../assets/icons/active-directory.svg?raw';
import progressiveRaw from '../../assets/icons/progressive.svg?raw';

// Native-color logos, rendered as <img>. Platforms.
export const platformLogos: Record<Platform, string> = {
  HackTheBox: htbUrl,
  VulnHub: vulnhubUrl,
  PicoCTF: picoctfUrl,
  OverTheWire: overthewireUrl,
};

// OS spans both mechanisms: Linux is a logo (<img>), Windows is a tinting glyph (set:html).
export const osLogos: Record<Extract<OS, 'Linux'>, string> = { Linux: linuxUrl };
export const osIcons: Record<Extract<OS, 'Windows'>, string> = { Windows: windowsRaw };

// Environment marks are all tinting currentColor glyphs (set:html).
export const environmentIcons: Record<Environment, string> = {
  Standalone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="8" opacity="0.35"/></svg>`,
  'Active Directory': activeDirectoryRaw,
  Progressive: progressiveRaw,
};

// Platform slug for the future filter route, e.g. /platform/hackthebox
export const platformSlug: Record<Platform, string> = {
  HackTheBox: 'hackthebox',
  VulnHub: 'vulnhub',
  PicoCTF: 'picoctf',
  OverTheWire: 'overthewire',
};

export const difficultyLevel: Record<Difficulty, number> = {
  Easy: 1, Medium: 2, Hard: 3, Insane: 4,
};
