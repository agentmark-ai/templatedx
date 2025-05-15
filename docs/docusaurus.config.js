import {themes as prismThemes} from 'prism-react-renderer';

module.exports = {
  title: 'TemplateDX',
  tagline: 'The declarative, extensible & composable type-safe templating engine. Based on Markdown and JSX.',
  url: 'https://agentmark-ai.github.io/',
  baseUrl: '/templatedx/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'agentmark-ai',
  projectName: 'templatedx',
  scripts: [
    {
      src: 'https://plausible.io/js/script.outbound-links.js',
      async: true,
      defer: true,
      'data-domain': 'agentmark-ai.github.io/templatedx',
      'data-spa': 'auto',
    },
  ],
  staticDirectories: ['static'],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/agentmark-ai/templatedx-docs/edit/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
    },
    navbar: {
      title: 'TemplateDX',
      logo: {
        alt: 'TemplateDX Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'right',
          label: 'Docs',
        },
        {
          label: 'Discord',
          to: 'https://discord.gg/P2NeMDtXar',
          position: 'right'
        },
        {
          to: 'https://github.com/agentmark-ai/templatedx',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started',
            },
            {
              label: 'FAQ',
              to: '/docs/faq',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/agentmark-ai/templatedx',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/P2NeMDtXar',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Agentmark.co`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['jsx', 'bash'],
    },
  },
};