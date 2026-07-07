import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primaria: 'var(--cor-primaria)',
        secundaria: 'var(--cor-secundaria)',
      },
    },
  },
  plugins: [],
};

export default config;
