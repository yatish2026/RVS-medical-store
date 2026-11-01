import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-api-handler',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/')) {
            const net = await import('net')
            const socket = new net.Socket()
            socket.setTimeout(80)

            const onOffline = () => {
              socket.destroy()
              res.setHeader('Content-Type', 'application/json')
              if (req.url === '/api/health') {
                res.statusCode = 200
                res.end(JSON.stringify({ status: 'offline', connected: false, message: 'Local Mode (Standalone)' }))
              } else {
                res.statusCode = 200
                res.end(JSON.stringify({ offline: true, connected: false }))
              }
            }

            socket.on('connect', () => {
              socket.destroy()
              next() // Port 5000 is open, proceed to proxy
            })

            socket.on('timeout', onOffline)
            socket.on('error', onOffline)

            socket.connect(5000, '127.0.0.1')
            return
          }
          next()
        })
      }
    }
  ],
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
