import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const supabaseUrl = env.VITE_SUPABASE_URL
  const lcpImageUrl = supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/game_Images/HalliGalli.webp`
    : null

  return {
    plugins: [
      react(),
      // 빌드 시 LCP 이미지 URL을 HTML에 preload 힌트로 주입해 브라우저가 JS 실행 전에 미리 요청하게 한다.
      {
        name: 'inject-lcp-preload',
        transformIndexHtml(html: string) {
          if (!lcpImageUrl) return html
          const preloadTag = `<link rel="preload" as="image" href="${lcpImageUrl}" fetchpriority="high" />`
          return html.replace('</head>', `  ${preloadTag}\n  </head>`)
        },
      },
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-router': ['react-router-dom'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-supabase': ['@supabase/supabase-js'],
          },
        },
      },
    },
  }
})
