const { test, expect } = require('@playwright/test')

test.describe('Blog app', () => {
  test.beforeEach(async ({ page, request }) => {
    // Vaciar la base de datos ANTES de crear el usuario
    await request.post('http://localhost:3003/api/testing/reset')
    
    // Crear el usuario Dani
    await request.post('http://localhost:3003/api/users', {
      data: {
        username: 'Dani',
        name: 'Dani',
        password: '1234'
      }
    })
    
    await page.goto('http://localhost:5173')
  })

  test('5.17: Login form is shown', async ({ page }) => {
    await expect(page.getByText('Iniciar sesión en la aplicación')).toBeVisible()
    await expect(page.getByLabel('usuario')).toBeVisible()
    await expect(page.getByLabel('contraseña')).toBeVisible()
    await expect(page.getByRole('button', { name: 'iniciar sesión' })).toBeVisible()
  })

  test.describe('5.18: Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.fill('input[name="Username"]', 'Dani')
      await page.fill('input[name="Password"]', '1234')
      await page.click('button[type="submit"]')
      await expect(page.getByText('Dani ha iniciado sesión')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.fill('input[name="Username"]', 'wronguser')
      await page.fill('input[name="Password"]', 'wrongpass')
      await page.click('button[type="submit"]')
      await expect(page.getByText('Usuario o contraseña incorrectos')).toBeVisible()
    })
  })

  test.describe('5.19: When logged in', () => {
    test.beforeEach(async ({ page }) => {
      await page.fill('input[name="Username"]', 'Dani')
      await page.fill('input[name="Password"]', '1234')
      await page.click('button[type="submit"]')
      await expect(page.getByText('Dani ha iniciado sesión')).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      await page.click('button:has-text("crear nuevo blog")')
      await page.fill('input[placeholder="título"]', 'Blog de prueba')
      await page.fill('input[placeholder="autor"]', 'Dani')
      await page.fill('input[placeholder="url"]', 'https://test.com')
      await page.click('button.create-button')
      await expect(page.getByText('Blog de prueba - Dani')).toBeVisible()
    })

    test('5.20: a blog can be liked', async ({ page }) => {
      await page.click('button:has-text("crear nuevo blog")')
      await page.fill('input[placeholder="título"]', 'Blog like test')
      await page.fill('input[placeholder="autor"]', 'Dani')
      await page.fill('input[placeholder="url"]', 'https://test.com')
      await page.click('button.create-button')
      await expect(page.getByText('Blog like test - Dani')).toBeVisible()
      await page.click('button:has-text("ver")')
      await expect(page.getByText('likes: 0')).toBeVisible()
      await page.click('button:has-text("like")')
      await expect(page.getByText('likes: 1')).toBeVisible()
    })
  })

  // Test 5.22 fuera del bloque 'When logged in'
  test('5.22: only the creator can see the delete button', async ({ page, request }) => {
    // 1. Asegurar que la base de datos está limpia antes de crear usuarios
    await request.post('http://localhost:3003/api/testing/reset')
    
    // 2. Crear usuario Dani (creador)
    await request.post('http://localhost:3003/api/users', {
      data: {
        username: 'Dani',
        name: 'Dani',
        password: '1234'
      }
    })
    
    // 3. Ir a la página
    await page.goto('http://localhost:5173')
    
    // 4. Iniciar sesión como Dani
    await page.fill('input[name="Username"]', 'Dani')
    await page.fill('input[name="Password"]', '1234')
    await page.click('button[type="submit"]')
    await expect(page.getByText('Dani ha iniciado sesión')).toBeVisible()
    
    // 5. Crear un blog como Dani
    await page.click('button:has-text("crear nuevo blog")')
    await page.fill('input[placeholder="título"]', 'Blog de Dani')
    await page.fill('input[placeholder="autor"]', 'Dani')
    await page.fill('input[placeholder="url"]', 'https://dani.com')
    await page.click('button.create-button')
    await expect(page.getByText('Blog de Dani - Dani')).toBeVisible()
    
    // 6. Cerrar sesión
    await page.click('button:has-text("cerrar sesión")')
    
    // 7. Crear otro usuario (Maria)
    await request.post('http://localhost:3003/api/users', {
      data: {
        username: 'Maria',
        name: 'Maria',
        password: '5678'
      }
    })
    
    // 8. Iniciar sesión como Maria
    await page.fill('input[name="Username"]', 'Maria')
    await page.fill('input[name="Password"]', '5678')
    await page.click('button[type="submit"]')
    await expect(page.getByText('Maria ha iniciado sesión')).toBeVisible()
    
    // 9. Ver el blog de Dani (Maria NO debe ver el botón eliminar)
    await expect(page.getByText('Blog de Dani - Dani')).toBeVisible()
    await page.getByRole('button', { name: 'ver' }).first().click()
    
    // 10. Verificar que NO hay botón eliminar
    const deleteButton = page.getByRole('button', { name: 'eliminar' })
    await expect(deleteButton).not.toBeVisible()
  })

test('5.23: blogs are ordered by likes (most likes first)', async ({ page, request }) => {
  // Limpiar base de datos y crear usuario Dani
  await request.post('http://localhost:3003/api/testing/reset')
  await request.post('http://localhost:3003/api/users', {
    data: {
      username: 'Dani',
      name: 'Dani',
      password: '1234'
    }
  })
  
  // Ir a la página e iniciar sesión
  await page.goto('http://localhost:5173')
  await page.fill('input[name="Username"]', 'Dani')
  await page.fill('input[name="Password"]', '1234')
  await page.click('button[type="submit"]')
  await expect(page.getByText('Dani ha iniciado sesión')).toBeVisible()
  
  // Crear primer blog con 5 likes
  await page.click('button:has-text("crear nuevo blog")')
  await page.fill('input[placeholder="título"]', 'Blog con 5 likes')
  await page.fill('input[placeholder="autor"]', 'Dani')
  await page.fill('input[placeholder="url"]', 'https://blog5.com')
  await page.click('button.create-button')
  
  // Dar 5 likes al primer blog
  await page.getByText('Blog con 5 likes - Dani').getByRole('button', { name: 'ver' }).click()
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'like' }).click()
    await page.waitForTimeout(300)
  }
  await page.getByRole('button', { name: 'ocultar' }).click()
  
  // Crear segundo blog con 10 likes
  await page.click('button:has-text("crear nuevo blog")')
  await page.fill('input[placeholder="título"]', 'Blog con 10 likes')
  await page.fill('input[placeholder="autor"]', 'Dani')
  await page.fill('input[placeholder="url"]', 'https://blog10.com')
  await page.click('button.create-button')
  
  // Dar 10 likes al segundo blog
  await page.getByText('Blog con 10 likes - Dani').getByRole('button', { name: 'ver' }).click()
  for (let i = 0; i < 10; i++) {
    await page.getByRole('button', { name: 'like' }).click()
    await page.waitForTimeout(300)
  }
  await page.getByRole('button', { name: 'ocultar' }).click()
  
  // Crear tercer blog con 0 likes
  await page.click('button:has-text("crear nuevo blog")')
  await page.fill('input[placeholder="título"]', 'Blog con 0 likes')
  await page.fill('input[placeholder="autor"]', 'Dani')
  await page.fill('input[placeholder="url"]', 'https://blog0.com')
  await page.click('button.create-button')
  
  // Recargar la página para asegurar orden correcto
  await page.reload()
  await page.waitForTimeout(1000)
  
  // Verificar que el primer blog es el de más likes (10)
  const firstBlogTitle = await page.locator('.blog-title-author').first().textContent()
  expect(firstBlogTitle).toContain('Blog con 10 likes')
  
  // Verificar que el segundo blog tiene 5 likes
  const secondBlogTitle = await page.locator('.blog-title-author').nth(1).textContent()
  expect(secondBlogTitle).toContain('Blog con 5 likes')
  
  // Verificar que el tercer blog tiene 0 likes
  const thirdBlogTitle = await page.locator('.blog-title-author').nth(2).textContent()
  expect(thirdBlogTitle).toContain('Blog con 0 likes')
})

})