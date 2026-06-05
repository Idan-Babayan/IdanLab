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
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true } },
        { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap' } },
        // Reading-progress bar (styled by #tp-progress in custom.css)
        { tag: 'script', content: "window.addEventListener('DOMContentLoaded',function(){var b=document.createElement('div');b.id='tp-progress';document.body.appendChild(b);var u=function(){var h=document.documentElement,m=h.scrollHeight-h.clientHeight;b.style.width=(m>0?h.scrollTop/m*100:0)+'%';};document.addEventListener('scroll',u,{passive:true});window.addEventListener('resize',u);u();});" },
      ],
      title: "Idan.Lab",
      customCss: ['./src/styles/custom.css'],
      description: 'CTF Writeups, Machine Walkthroughs & Security Notes By Idan Babayan',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/Idan-Babayan' },
      ],
      sidebar: [
        {
          label: 'About',
          link: '/about',
          attrs: { class: 'sb-about' },
        },
        {
          label: 'HackTheBox',
          collapsed: true,
          items: [
            { label: 'Easy', collapsed: true, items: [{ autogenerate: { directory: 'hackthebox/Easy' } }] },
            // Uncomment each line once you have at least one writeup in that folder.
            // (Starlight errors on an autogenerate directory that doesn't exist yet.)
            // { label: 'Medium', collapsed: true, items: [{ autogenerate: { directory: 'hackthebox/medium' } }] },
            // { label: 'Hard',   collapsed: true, items: [{ autogenerate: { directory: 'hackthebox/hard' } }] },
          ],
        },
        {
          label: 'VulnHub',
          collapsed: true,
          items: [{ autogenerate: { directory: 'vulnhub', collapsed: true } }],
        },
        {
          label: 'PicoCTF',
          collapsed: true,
          items: [{ autogenerate: { directory: 'picoctf', collapsed: true } }],
        },
        {
          label: 'OverTheWire',
          collapsed: true,
          items: [{ autogenerate: { directory: 'overthewire', collapsed: true } }],
        },
      ],
    }),
  ],
});
