import {themes as prismThemes} from 'prism-react-renderer';

module.exports = {
  title: 'TemplateDX',
  tagline: 'A declarative, extensible & composable template engine based on Markdown and JSX.',
  url: 'https://your-docusaurus-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'puzzlet-ai', // Usually your GitHub org/user name.
  projectName: 'templatedx', // Usually your repo name.

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/your-org/templatedx-docs/edit/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'TemplateDX',
      logo: {
        alt: 'TemplateDX Logo',
        src: 'https://www.puzzlet.ai/images/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        // Remove or modify the Tutorial link if not needed
        // {
        //   to: '/docs/intro',
        //   label: 'Tutorial',
        //   position: 'left',
        // },
        {
          href: 'https://github.com/your-org/templatedx',
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
            // Add more links as needed
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/your-org/templatedx',
            },
            // Add more community links if available
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Puzzlet.ai`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['jsx'],
    },
  },
};