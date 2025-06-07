
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Configurações de segurança para produção
    minify: mode === 'production' ? 'terser' : false,
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        // Renomear arquivos para dificultar análise
        entryFileNames: mode === 'production' ? 'assets/[name]-[hash].js' : 'assets/[name].js',
        chunkFileNames: mode === 'production' ? 'assets/[name]-[hash].js' : 'assets/[name].js',
        assetFileNames: mode === 'production' ? 'assets/[name]-[hash].[ext]' : 'assets/[name].[ext]',
      },
    },
    terserOptions: mode === 'production' ? {
      compress: {
        // Remove console.log em produção
        drop_console: true,
        drop_debugger: true,
      },
      mangle: {
        // Ofuscar nomes de variáveis
        toplevel: true,
      },
    } : undefined,
  },
  define: {
    // Definir variáveis de ambiente de forma segura
    __DEV__: mode === 'development',
    __PROD__: mode === 'production',
  },
}));
