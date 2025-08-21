module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['regexp', 'regex'],
  overrides: [
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      excludedFiles: [
        'styles/themes.css',
        'tailwind.config.*',
        '**/*.d.ts'
      ],
      rules: {
        'regexp/no-super-linear-backtracking': 'error',
        'regexp/no-dupe-characters-character-class': 'error',
        'regexp/no-invisible-character': 'error',
        'regexp/no-misleading-unicode-character': 'error',
        'regexp/no-useless-flag': 'error',
        'regexp/no-empty-alternative': 'error',
        'regexp/optimal-quantifier-concatenation': 'off',
        'regexp/no-dupe-disjunctions': 'off',
        'regexp/no-obscure-range': 'off',
        'regex/invalid': ['warn', [
          {
            regex: '#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})',
            message: 'Use design tokens (Tailwind + CSS vars) instead of hex colors.'
          },
          {
            regex: '\\btext-(?:black|white|gray(?:-\\d{2,3})?)\\b',
            message: 'Use token classes (e.g., text-fg, text-muted).'
          },
          {
            regex: '\\bbg-(?:white|black|gray(?:-\\d{2,3})?)\\b',
            message: 'Use token classes (e.g., bg-bg, bg-card).'
          },
          {
            regex: '\\bborder-(?:white|black|gray(?:-\\d{2,3})?)\\b',
            message: 'Use token classes (e.g., border-card, border-muted).'
          },
          {
            regex: '\\b(?:text|bg|border)-(?:red|blue|green|emerald|amber|orange|yellow|purple|pink|rose|cyan|teal|indigo)-(?:[1-9]00)\\b',
            message: 'Use token classes (primary/secondary/accent/success/warning/danger).'
          }
        ]]
      }
    },
    {
      files: ['**/*.{css,scss}'],
      excludedFiles: ['styles/themes.css'],
      rules: {
        'regex/invalid': ['warn', [
          {
            regex: '#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})',
            message: 'Define colors in themes.css as CSS variables; use tokens in components.'
          }
        ]]
      }
    }
  ]
};
