import test from 'node:test'
import assert from 'node:assert'
import authService from '../src/services/authService.js'

test('Auth Service - Login with valid credentials', async () => {
  const result = await authService.login('admin@phongkham.vn', '123456')
  assert.ok(result.token, 'Token should be returned')
  assert.strictEqual(result.user.email, 'admin@phongkham.vn')
  assert.strictEqual(result.user.role, 'ADMIN')
})

test('Auth Service - Login with invalid password fails', async () => {
  await assert.rejects(
    async () => {
      await authService.login('admin@phongkham.vn', 'wrongpass')
    },
    /Email hoặc mật khẩu không chính xác/
  )
})
