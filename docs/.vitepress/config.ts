import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'PayGate JS SDK',
  description: 'SDK JavaScript moderne pour PayGateGlobal - Support FLOOZ et T-Money',
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/' },
      { text: 'API', link: '/api/' },
      { text: 'Exemples', link: '/examples/' },
      {
        text: 'Packages',
        items: [
          { text: 'Core', link: '/packages/core' },
          { text: 'React', link: '/packages/react' },
          { text: 'Vue', link: '/packages/vue' },
          { text: 'Nuxt', link: '/packages/nuxt' },
          { text: 'Next.js', link: '/packages/next' }
        ]
      }
    ],

    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Qu\'est-ce que PayGate SDK?', link: '/' },
            { text: 'Installation rapide', link: '/guide/quick-start' },
            { text: 'Configuration', link: '/guide/configuration' }
          ]
        },
        {
          text: 'Guide',
          items: [
            { text: 'Concepts de base', link: '/guide/concepts' },
            { text: 'Initier un paiement', link: '/guide/initiate-payment' },
            { text: 'Vérifier le statut', link: '/guide/check-status' },
            { text: 'Gestion des erreurs', link: '/guide/error-handling' },
            { text: 'Webhooks', link: '/guide/webhooks' }
          ]
        },
        {
          text: 'Frameworks',
          items: [
            { text: 'React', link: '/frameworks/react' },
            { text: 'Vue.js', link: '/frameworks/vue' },
            { text: 'Nuxt', link: '/frameworks/nuxt' },
            { text: 'Next.js', link: '/frameworks/next' }
          ]
        },
        {
          text: 'Avancé',
          items: [
            { text: 'Migration', link: '/advanced/migration' },
            { text: 'Performance', link: '/advanced/performance' },
            { text: 'Sécurité', link: '/advanced/security' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'PayGateClient', link: '/api/client' },
            { text: 'Types', link: '/api/types' },
            { text: 'Erreurs', link: '/api/errors' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Exemples',
          items: [
            { text: 'E-commerce', link: '/examples/ecommerce' },
            { text: 'Abonnements', link: '/examples/subscriptions' },
            { text: 'Marketplace', link: '/examples/marketplace' },
            { text: 'Mobile App', link: '/examples/mobile' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/filano/paygate-js-sdk' }
    ],

    footer: {
      message: 'Développé avec ❤️ par <a href="https://me.fedapay.com/filano_don">Filano</a>',
      copyright: 'Copyright © 2024 Filano. Sous licence MIT.'
    },

    editLink: {
      pattern: 'https://github.com/filano/paygate-js-sdk/edit/main/docs/:path',
      text: 'Modifier cette page'
    },

    search: {
      provider: 'local'
    },

    lastUpdated: {
      text: 'Dernière mise à jour',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    }
  },

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#4CAF50' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'fr' }],
    ['meta', { property: 'og:title', content: 'PayGate JS SDK | SDK JavaScript pour PayGateGlobal' }],
    ['meta', { property: 'og:site_name', content: 'PayGate JS SDK' }],
    ['meta', { property: 'og:image', content: '/og-image.png' }],
    ['meta', { property: 'og:url', content: 'https://paygate-js-sdk.netlify.app/' }]
  ],

  cleanUrls: true,
  
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})