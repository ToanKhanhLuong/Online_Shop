import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Alert } from 'react-bootstrap'
import { FaUser, FaLock, FaPhone, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    user_name: '',
    password: '',
    confirmPassword: '',
    phone: '',
    email: '',
    address: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFormData({
      user_name: '',
      password: '',
      confirmPassword: '',
      phone: '',
      email: '',
      address: ''
    })
    setError('')
    setSuccess('')
  }, [])

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

    const { user_name, password, confirmPassword, phone, email, address } = formData

    // Kiểm tra dữ liệu đầu vào cơ bản
    if (!user_name || !password || !confirmPassword || !phone || !email) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!')
      return
    }

    // Kiểm tra định dạng số điện thoại Việt Nam
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/
    if (!phoneRegex.test(phone)) {
      setError('Số điện thoại không hợp lệ! Vui lòng nhập đúng định dạng số điện thoại Việt Nam (ví dụ: 0912345678).')
      return
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ! Vui lòng kiểm tra lại định dạng email.')
      return
    }

    setLoading(true)
    const result = await register(user_name, password, phone, email, address)
    setLoading(false)

    if (result.success) {
      setSuccess(result.message || 'Đăng ký thành công! Đang chuyển hướng sang Đăng nhập...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
      <div className="glass-card p-4 p-md-5 w-100 fade-in-up" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4 font-weight-bold">
          <span className="gradient-text">ĐĂNG KÝ TÀI KHOẢN</span>
        </h2>

        {error && <Alert variant="danger" className="text-center" style={{ borderRadius: '10px' }}>{error}</Alert>}
        {success && <Alert variant="success" className="text-center" style={{ borderRadius: '10px' }}>{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* Username */}
          <Form.Group className="mb-3">
            <Form.Label className="custom-label">Tên đăng nhập *</Form.Label>
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
                autoComplete="new-username"
                required
              />
            </div>
          </Form.Group>

          {/* Phone */}
          <Form.Group className="mb-3">
            <Form.Label className="custom-label">Số điện thoại *</Form.Label>
            <div className="position-relative">
              <span className="position-absolute translate-middle-y" style={{ left: '15px', top: '50%', color: 'rgba(255,255,255,0.4)', zIndex: 10 }}>
                <FaPhone />
              </span>
              <Form.Control
                type="tel"
                name="phone"
                className="custom-input text-white"
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChange={handleChange}
                style={{ paddingLeft: '45px' }}
                required
              />
            </div>
          </Form.Group>

          {/* Email */}
          <Form.Group className="mb-3">
            <Form.Label className="custom-label">Email *</Form.Label>
            <div className="position-relative">
              <span className="position-absolute translate-middle-y" style={{ left: '15px', top: '50%', color: 'rgba(255,255,255,0.4)', zIndex: 10 }}>
                <FaEnvelope />
              </span>
              <Form.Control
                type="email"
                name="email"
                className="custom-input text-white"
                placeholder="Nhập địa chỉ email"
                value={formData.email}
                onChange={handleChange}
                style={{ paddingLeft: '45px' }}
                required
              />
            </div>
          </Form.Group>

          {/* Address */}
          <Form.Group className="mb-3">
            <Form.Label className="custom-label">Địa chỉ</Form.Label>
            <div className="position-relative">
              <span className="position-absolute translate-middle-y" style={{ left: '15px', top: '50%', color: 'rgba(255,255,255,0.4)', zIndex: 10 }}>
                <FaMapMarkerAlt />
              </span>
              <Form.Control
                type="text"
                name="address"
                className="custom-input text-white"
                placeholder="Nhập địa chỉ nhà riêng"
                value={formData.address}
                onChange={handleChange}
                style={{ paddingLeft: '45px' }}
              />
            </div>
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-3">
            <Form.Label className="custom-label">Mật khẩu *</Form.Label>
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
                autoComplete="new-password"
                required
              />
            </div>
          </Form.Group>

          {/* Confirm Password */}
          <Form.Group className="mb-4">
            <Form.Label className="custom-label">Xác nhận mật khẩu *</Form.Label>
            <div className="position-relative">
              <span className="position-absolute translate-middle-y" style={{ left: '15px', top: '50%', color: 'rgba(255,255,255,0.4)', zIndex: 10 }}>
                <FaLock />
              </span>
              <Form.Control
                type="password"
                name="confirmPassword"
                className="custom-input text-white"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{ paddingLeft: '45px' }}
                autoComplete="new-password"
                required
              />
            </div>
          </Form.Group>

          {/* Button Submit */}
          <button
            type="submit"
            className="w-100 btn-gradient btn btn-primary mb-3"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'ĐĂNG KÝ'}
          </button>

          <div className="text-center mt-3" style={{ fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Bạn đã có tài khoản? </span>
            <Link to="/login" className="custom-link">Đăng nhập ngay</Link>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default Register
