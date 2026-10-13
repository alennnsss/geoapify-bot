import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const siteUrl =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "");

export default defineConfig({
  plugins: [
    vue(),
    {
      name: "site-url",
      transformIndexHtml: (html) => html.replaceAll("__SITE_URL__", siteUrl),
    },
  ],
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
  },
});
