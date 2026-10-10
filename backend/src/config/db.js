import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export async function connectDB() {
  try {
    const client = await pool.connect()
    console.log('='.repeat(50))
    console.log('✔ [Database] Kết nối Supabase PostgreSQL THÀNH CÔNG!')
    console.log('='.repeat(50))
    client.release()
    return true
  } catch (error) {
    console.error('❌ [Database] Lỗi kết nối Supabase:', error.message)
    return false
  }
}

export default { pool, connectDB }
