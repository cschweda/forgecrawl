import { config, toRuntimeConfig } from '../../forgecrawl.config'

export default defineNuxtConfig({
  compatibilityDate: '2025-03-01',
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: toRuntimeConfig(),
  nitro: {
    preset: 'node-server',
  },
})
