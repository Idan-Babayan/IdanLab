import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightImageZoom from 'starlight-image-zoom';
import path from 'path';

export default defineConfig({
  site: 'https://idanstudio.click',

  vite: {
    resolve: {
      alias: {
        '@components': path.resolve('./src/components'),
      }
    }
  },

  integrations: [
    starlight({
      expressiveCode: {
        themes: ['github-dark-dimmed', 'catppuccin-latte'],
      },
      plugins: [starlightImageZoom()],
      title: "Idan's Cyber Lab",
      customCss: ['./src/styles/custom.css'],
      description: 'CTF Writeups, Machine Walkthroughs & Security Notes By Idan Babayan',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/Idan-Babayan' },
      ],
      sidebar: [
        {
          label: '👤 About',
          link: '/about',
        },
        {
          label: '🧩 HackTheBox',
          items: [{ autogenerate: { directory: 'hackthebox' } }],
        },
        {
          label: '🧪 VulnHub',
          items: [{ autogenerate: { directory: 'vulnhub' } }],
        },
        {
          label: '🏁 PicoCTF',
          items: [{ autogenerate: { directory: 'picoctf' } }],
        },
        {
          label: '🧵 OverTheWire',
          items: [{ autogenerate: { directory: 'overthewire' } }],
        },
      ],
    }),
  ],
});