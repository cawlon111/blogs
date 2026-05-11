import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from '../src/components/BlogForm'

describe('BlogForm component', () => {
  test('5.16: calls createBlog with correct details when new blog is created', async () => {
    const mockCreateBlog = vi.fn()
    
    render(<BlogForm createBlog={mockCreateBlog} />)
    
    const userEventSetup = userEvent.setup()
    
    // Como los inputs no tienen labels con htmlFor, usamos el placeholder
    const titleInput = screen.getByPlaceholderText('título')
    const authorInput = screen.getByPlaceholderText('autor')
    const urlInput = screen.getByPlaceholderText('url')
    
    await userEventSetup.type(titleInput, 'Nuevo Blog')
    await userEventSetup.type(authorInput, 'Nuevo Autor')
    await userEventSetup.type(urlInput, 'https://nuevo.com')
    
    const createButton = screen.getByText('crear')
    await userEventSetup.click(createButton)
    
    expect(mockCreateBlog).toHaveBeenCalledTimes(1)
    expect(mockCreateBlog).toHaveBeenCalledWith({
      title: 'Nuevo Blog',
      author: 'Nuevo Autor',
      url: 'https://nuevo.com'
    })
  })
})