import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Alert } from 'react-bootstrap'
import { FaUser, FaLock } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    user_name: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const { user_name, password } = formData

    if (!user_name || !password) {
      setError('Vui lòng điền đầy đủ Tên đăng nhập và Mật khẩu!')
      return
    }

    setLoading(true)
    const result = await login(user_name, password)
    setLoading(false)

    if (result.success) {
      setSuccess('Đăng nhập thành công! Đang chuyển hướng...')
      setTimeout(() => {
        navigate('/')
      }, 1000)
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
      <div className="glass-card p-4 p-md-5 w-100 fade-in-up" style={{ maxWidth: '450px' }}>
        <h2 className="text-center mb-4 font-weight-bold">
          <span className="gradient-text">ĐĂNG NHẬP</span>
        </h2>

        {error && <Alert variant="danger" className="text-center" style={{ borderRadius: '10px' }}>{error}</Alert>}
        {success && <Alert variant="success" className="text-center" style={{ borderRadius: '10px' }}>{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* Username */}
          <Form.Group className="mb-3">
            <Form.Label className="custom-label">Tên đăng nhập</Form.Label>
            <div className="position-relative">
              <span className="position-absolute translate-middle-y" style={{ left: '15px', top: '50%', color: 'rgba(255,255,255,0.4)', zIndex: 10 }}>
                <FaUser />
              </span>
              <Form.Control
                type="text"
                name="user_name"
                className="custom-input text-white"
                placeholder="Nhập tên đăng nhập"
                value={formData.user_name}
                onChange={handleChange}
                style={{ paddingLeft: '45px' }}
                required
              />
            </div>
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-2">
            <Form.Label className="custom-label">Mật khẩu</Form.Label>
            <div className="position-relative">
              <span className="position-absolute translate-middle-y" style={{ left: '15px', top: '50%', color: 'rgba(255,255,255,0.4)', zIndex: 10 }}>
                <FaLock />
              </span>
              <Form.Control
                type="password"
                name="password"
                className="custom-input text-white"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingLeft: '45px' }}
                required
              />
            </div>
          </Form.Group>

          {/* Forgot Password Link */}
          <div className="text-end mb-4">
            <Link to="/forgot-password" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', textDecoration: 'none' }} className="custom-link">
              Quên mật khẩu?
            </Link>
          </div>

          {/* Button Submit */}
          <button
            type="submit"
            className="w-100 btn-gradient btn btn-primary mb-3"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
          </button>

          <div className="text-center mt-3" style={{ fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Bạn chưa có tài khoản? </span>
            <Link to="/register" className="custom-link">Đăng ký ngay</Link>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default Login
