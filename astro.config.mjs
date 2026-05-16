import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://idanstudio.click',
  integrations: [
    starlight({
      title: "Idan's Cyber Lab",
      customCss: ['./src/styles/custom.css'],
      description: 'CTF Writeups, Machine Walkthroughs & Security Notes By Idan Babayan',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/Idan-Babayan' },
      ],
      sidebar: [
        {
          label: '🟩 HackTheBox',
          items: [{ autogenerate: { directory: 'hackthebox' } }],
        },
        {
          label: '🔴 VulnHub',
          items: [{ autogenerate: { directory: 'vulnhub' } }],
        },
        {
          label: '🏴 PicoCTF',
          items: [{ autogenerate: { directory: 'picoctf' } }],
        },
        {
          label: '⚔️ OverTheWire',
          items: [{ autogenerate: { directory: 'overthewire' } }],
        },
      ],
    }),
  ],
});


