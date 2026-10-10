import crypto from 'crypto'

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

export function comparePassword(password, storedHash) {
  try {
    const [salt, originalHash] = storedHash.split(':')
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
    return hash === originalHash
  } catch {
    return false
  }
}

export default { hashPassword, comparePassword }
