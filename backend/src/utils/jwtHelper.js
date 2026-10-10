import crypto from 'crypto'

const SECRET = process.env.JWT_SECRET || 'super_secret_clinic_jwt_key_2026'

export function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64url')
  const signature = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${signature}`
}

export function verifyToken(token) {
  try {
    const [header, body, signature] = token.split('.')
    if (!header || !body || !signature) return null

    const expectedSig = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url')
    if (expectedSig !== signature) return null

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (payload.exp && Date.now() > payload.exp) return null

    return payload
  } catch {
    return null
  }
}

export default { generateToken, verifyToken }
