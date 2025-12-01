import { defineConfig } from "vitepress";

export default defineConfig({
  title: "daemon.danielmiessler.com",
  description: "Real-time operational dashboard for Daniel Miessler's personal AI daemon",
  cleanUrls: true,
  appearance: false,
  
  themeConfig: {
    // Theme configuration
  },
  
  head: [
    [
      "link",
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon.png",
      },
    ],
    // ULT Real-time Analytics - same system as main website
    [
      "script",
      {
        src: "/analytics.js",
        defer: true,
        "data-cfasync": "false" // Bypass Cloudflare Rocket Loader
      }
    ],
  ],
});