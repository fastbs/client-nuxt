// https://nuxt.com/docs/api/configuration/nuxt-config
import type { HookResult } from '@nuxt/schema';

declare module '#app' {
  interface RuntimeNuxtHooks {
    'menu:update': () => HookResult,
  }
}

export default defineNuxtConfig({
  app: {
    head: {
      title: 'Fastbs App',
    },
    pageTransition: true,
  },
  devtools: { enabled: true },
  pages: true,
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  modules: ['@pinia/nuxt', 'nuxt-primevue', 'vue-yandex-maps/nuxt'],
  primevue: {
    usePrimeVue: true,
    components: {
      prefix: 'p',
    }
  },
  css: ['primevue/resources/themes/fluent-light/theme.css'],
  pinia: {
    storesDirs: ['./stores/**'],
  },
  yandexMaps: {
    apikey: '44b7d891-3d34-4121-81ed-d51efc0559ea',
  },

});
