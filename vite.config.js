import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'NA2-study';
const base = process.env.BASE_PATH || (process.env.GITHUB_ACTIONS ? `/${repository}/` : '/');
const bank = readFileSync(fileURLToPath(new URL('./public/data/bank.json', import.meta.url)));
export default defineConfig({
  base,
  plugins: [react()],
  define: {
    __BANK_BYTES__: JSON.stringify(bank.length),
    __BANK_VERSION__: JSON.stringify(createHash('sha256').update(bank).digest('hex').slice(0, 12)),
  },
  build: { chunkSizeWarningLimit: 600 },
});
