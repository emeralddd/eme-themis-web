import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    return {
        plugins: [react(), tailwindcss()],
        server: {
            port: parseInt(env.PORT) || 5173,
            proxy: {
                '/api': {
                    target: env.VITE_BACKEND_URL,
                    changeOrigin: true,
                },
                '/socket.io': {
                    target: env.VITE_BACKEND_URL,
                    ws: true,
                    changeOrigin: true,
                }
            }
        }
    }
})
