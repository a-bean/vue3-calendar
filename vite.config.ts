import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import UnoCSS from 'unocss/vite';

export default defineConfig(({ command }) => {
  // 库模式构建配置
  if (command === 'build' && process.env.BUILD_MODE === 'lib') {
    return {
      plugins: [vue(), UnoCSS()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src'),
        },
        extensions: ['.js', '.vue', '.json', '.ts'],
      },
      build: {
        lib: {
          entry: path.resolve(__dirname, 'src/index.ts'),
          name: 'CalendarVue',
          fileName: (format) => `calendar-vue.${format}.js`,
          formats: ['es'],
        },
        rollupOptions: {
          external: ['vue'],
          output: {
            globals: {
              vue: 'Vue',
            },
            exports: 'named',
          },
        },
        outDir: 'dist',
        emptyOutDir: true,
      },
    };
  }

  // 开发模式配置
  return {
    base: '/',
    root: 'example/',
    plugins: [vue(), UnoCSS()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      extensions: ['.js', '.vue', '.json', '.ts'],
    },

    server: {
      host: true,
      open: true,
      port: 3000,
    },
  };
});
