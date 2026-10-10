import app from './app.js'
import { connectDB } from './config/db.js'

const PORT = process.env.PORT || 5000

async function startServer() {
  try {
    await connectDB()

    const server = app.listen(PORT, () => {
      console.log('='.repeat(50))
      console.log(` Clinic Management Backend API Server `)
      console.log(` Listening on port: ${PORT}`)
      console.log(` Health check: http://localhost:${PORT}/api/health`)
      console.log('='.repeat(50))
    })

    const shutdown = () => {
      console.log('\nShutting down server gracefully...')
      server.close(() => {
        console.log('Server stopped.')
        process.exit(0)
      })
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
