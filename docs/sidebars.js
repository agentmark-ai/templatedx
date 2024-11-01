// sidebars.js

module.exports = {
  docs: [
    // Direct Links
    'getting-started',
    'overview',
    'faq',
    'variables',
    'expressions',
    'syntax-highlighting',
    'components',
    {
      type: 'category',
      label: 'Tags',
      items: ['tags'],
    },
    {
      type: 'category',
      label: 'Filters',
      items: [
        'filters/overview',
        {
          type: 'category',
          label: 'Built-In',
          items: [
            'filters/capitalize',
            'filters/upper',
            'filters/lower',
            'filters/truncate',
            'filters/abs',
            'filters/join',
            'filters/round',
            'filters/replace',
            'filters/urlencode',
            'filters/dump',
          ]
        },
        
      ],
    },
  ],
};
