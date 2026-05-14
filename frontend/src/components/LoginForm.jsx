import { useState } from 'react'

const LoginForm = ({ handleLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = (event) => {
    event.preventDefault()
    handleLogin({ username, password })
    setUsername('')
    setPassword('')
  }

  return (
    <form onSubmit={onSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="username-input">👤 Usuario</label>
        <input
          id="username-input"
          type="text"
          value={username}
          name="Username"
          placeholder="Escribe tu usuario"
          autoComplete="username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="password-input">🔒 Contraseña</label>
        <input
          id="password-input"
          type="password"
          value={password}
          name="Password"
          placeholder="Escribe tu contraseña"
          autoComplete="current-password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit" className="btn-primary">
        Iniciar sesión
      </button>
    </form>
  )
}

export default LoginForm