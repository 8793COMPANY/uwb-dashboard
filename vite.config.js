import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/uwb-dashboard/',   // ⭐ 저장소 이름 그대로
  plugins: [react()],
})
