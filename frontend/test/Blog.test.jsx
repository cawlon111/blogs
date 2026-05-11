import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from '../src/components/Blog'

describe('Blog component', () => {
  const blog = {
    title: 'Test Blog',
    author: 'Test Author',
    url: 'https://test.com',
    likes: 5,
    user: { name: 'Test User', username: 'testuser' }
  }

  const user = { username: 'testuser' }

  test('5.13: shows title and author, but not url or likes by default', () => {
    render(<Blog blog={blog} handleLike={() => {}} handleDelete={() => {}} user={user} />)
    
    expect(screen.getByText('Test Blog - Test Author')).toBeDefined()
    expect(screen.queryByText('url: https://test.com')).toBeNull()
    expect(screen.queryByText('likes: 5')).toBeNull()
  })

  test('5.14: shows url and likes when view button is clicked', async () => {
    render(<Blog blog={blog} handleLike={() => {}} handleDelete={() => {}} user={user} />)
    
    const userEventSetup = userEvent.setup()
    const viewButton = screen.getByText('ver')
    await userEventSetup.click(viewButton)
    
    expect(screen.getByText('url: https://test.com')).toBeDefined()
    expect(screen.getByText('likes: 5')).toBeDefined()
  })

  test('5.15: clicking like button twice calls event handler twice', async () => {
    const mockHandleLike = vi.fn()
    
    render(<Blog blog={blog} handleLike={mockHandleLike} handleDelete={() => {}} user={user} />)
    
    const userEventSetup = userEvent.setup()
    
    const viewButton = screen.getByText('ver')
    await userEventSetup.click(viewButton)
    
    const likeButton = screen.getByText('like')
    await userEventSetup.click(likeButton)
    await userEventSetup.click(likeButton)
    
    expect(mockHandleLike).toHaveBeenCalledTimes(2)
    expect(mockHandleLike).toHaveBeenCalledWith(blog)
  })
})