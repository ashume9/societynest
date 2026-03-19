import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function safePublicCopy(): import('vite').Plugin {
  return {
    name: 'safe-public-copy',
    apply: 'build',
    enforce: 'post',
    closeBundle() {
      const publicDir = path.resolve(__dirname, 'public');
      const outDir = path.resolve(__dirname, 'dist');
      const copyDir = (src: string, dest: string) => {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        let entries: fs.Dirent[] = [];
        try { entries = fs.readdirSync(src, { withFileTypes: true }); } catch { return; }
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          try {
            if (entry.isDirectory()) {
              copyDir(srcPath, destPath);
            } else {
              fs.copyFileSync(srcPath, destPath);
            }
          } catch {}
        }
      };
      copyDir(publicDir, outDir);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), safePublicCopy()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      copyPublicDir: false,
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
    },
  };
});