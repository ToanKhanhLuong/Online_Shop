import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navbar, Container, Nav, Button, Modal, Table, Spinner, Badge, Alert } from 'react-bootstrap'
import { FaUserCircle, FaSignOutAlt, FaEye, FaLaptop, FaShoppingBag, FaUserAlt } from 'react-icons/fa'
import { useNavigate, Navigate } from 'react-router-dom'
import api from '../services/api'

function Home() {
  const { user, logout, updateProfile } = useAuth()
  const navigate = useNavigate()
  
  // State quản lý sản phẩm
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // State quản lý Modal thông tin cá nhân
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState({ phone: '', email: '', address: '' })
  const [profileMessage, setProfileMessage] = useState('')
  const [profileMessageType, setProfileMessageType] = useState('success')
  const [savingProfile, setSavingProfile] = useState(false)

  // State quản lý Đổi mật khẩu
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordMessageType, setPasswordMessageType] = useState('danger')
  const [savingPassword, setSavingPassword] = useState(false)

  const handleOpenProfile = () => {
    if (user) {
      setEditForm({
        phone: user.phone || '',
        email: user.email || '',
        address: user.address || ''
      })
    }
    setProfileMessage('')
    setPasswordMessage('')
    setIsEditingProfile(false)
    setIsChangingPassword(false)
    setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
    setShowProfileModal(true)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileMessage('')

    // Kiểm tra định dạng số điện thoại Việt Nam
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/
    if (!phoneRegex.test(editForm.phone)) {
      setProfileMessageType('danger')
      setProfileMessage('Số điện thoại không hợp lệ! Vui lòng nhập đúng định dạng số điện thoại Việt Nam (ví dụ: 0912345678).')
      return
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editForm.email)) {
      setProfileMessageType('danger')
      setProfileMessage('Email không hợp lệ! Vui lòng nhập đúng định dạng email.')
      return
    }

    setSavingProfile(true)
    const result = await updateProfile(editForm.phone, editForm.email, editForm.address)
    setSavingProfile(false)

    if (result.success) {
      setProfileMessageType('success')
      setProfileMessage('Cập nhật thông tin cá nhân thành công!')
      setIsEditingProfile(false)
    } else {
      setProfileMessageType('danger')
      setProfileMessage(result.message || 'Cập nhật thất bại!')
    }
  }

  // Handler đổi mật khẩu
  const handlePasswordInputChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    })
  }

  const handleSavePassword = async (e) => {
    e.preventDefault()
    setPasswordMessage('')

    const { currentPassword, newPassword, confirmNewPassword } = passwordForm

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordMessageType('danger')
      setPasswordMessage('Vui lòng nhập đầy đủ các trường mật khẩu!')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMessageType('danger')
      setPasswordMessage('Mật khẩu mới và mật khẩu xác nhận không khớp!')
      return
    }

    setSavingPassword(true)
    try {
      const res = await api.post('/auth/change-password', { currentPassword, newPassword })
      setPasswordMessageType('success')
      setPasswordMessage(res.data.message || 'Đổi mật khẩu thành công! Đang tự động đăng xuất...')
      
      // Đăng xuất sau 2 giây
      setTimeout(() => {
        logout()
      }, 2000)
    } catch (err) {
      console.error('Lỗi đổi mật khẩu:', err)
      setPasswordMessageType('danger')
      setPasswordMessage(err.response?.data?.message || 'Đổi mật khẩu thất bại!')
    } finally {
      setSavingPassword(false)
    }
  }

  // Tải danh sách sản phẩm từ backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products')
        setProducts(res.data.products)
      } catch (err) {
        console.error('Lỗi tải sản phẩm:', err)
        setError('Không thể kết nối lấy danh sách sản phẩm!')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])


  // Hàm sinh màu nền Gradient ngẫu nhiên cho mockup hình ảnh sản phẩm
  const getRandomGradient = (name) => {
    const code = name.charCodeAt(0) + name.charCodeAt(1) || 0
    const gradients = [
      'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
      'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #e11d48 100%)',
      'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
      'linear-gradient(135deg, #84cc16 0%, #06b6d4 100%)'
    ]
    return gradients[code % gradients.length]
  }

  if (!user) return null
  if (user.role === 'Admin') return <Navigate to="/admin" replace />

  return (
    <div className="min-vh-100 d-flex flex-column">
      
      {/* Navbar Premium */}
      <Navbar expand="lg" variant="dark" className="navbar-glass sticky-top py-3">
        <Container>
          <Navbar.Brand href="#home" className="d-flex align-items-center gap-2">
            <FaShoppingBag className="text-info fs-4" />
            <span className="gradient-text font-weight-bold fs-4">ONLINE SHOP</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home" active className="text-white">Cửa hàng</Nav.Link>
              <Nav.Link href="#about" className="text-secondary">Giới thiệu</Nav.Link>
              <Nav.Link href="#contact" className="text-secondary">Liên hệ</Nav.Link>
            </Nav>
            
            <Nav className="align-items-center gap-3 mt-3 mt-lg-0">
              <div className="d-flex align-items-center gap-2 text-white pe-3 border-end border-secondary" style={{ cursor: 'pointer' }} onClick={handleOpenProfile}>
                <FaUserCircle className="text-info fs-4" />
                <div>
                  <div className="small font-weight-bold">{user.user_name}</div>
                  <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{user.role}</div>
                </div>
              </div>
              <Button variant="outline-danger" onClick={logout} className="d-flex align-items-center gap-2" style={{ borderRadius: '10px' }}>
                <FaSignOutAlt /> Đăng xuất
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container className="py-5 flex-grow-1">
        <div className="text-center mb-5 fade-in-up">
          <h1 className="display-5 font-weight-bold text-white mb-2">Sản Phẩm Nổi Bật</h1>
          <p className="text-secondary">Khám phá các sản phẩm công nghệ cao cấp chính hãng từ Apple</p>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" variant="info" className="me-2" />
            <span className="text-secondary">Đang tải danh sách sản phẩm...</span>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <div className="alert alert-danger d-inline-block px-5" style={{ borderRadius: '12px' }}>{error}</div>
          </div>
        ) : (
          <div className="row g-4">
            {products.map((product) => (
              <div key={product._id} className="col-12 col-sm-6 col-md-4 col-lg-3 fade-in-up">
                
                {/* Thẻ sản phẩm */}
                <div className="product-card" onClick={() => navigate(`/product/${product._id}`)} style={{ cursor: 'pointer' }}>
                  {/* Hình ảnh sản phẩm */}
                  <div className="product-img-placeholder" style={{ background: 'rgba(0,0,0,0.1)' }}>
                    <img 
                      src={product.image || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500'} 
                      alt={product.product_name}
                      className="w-100 h-100" 
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500'
                      }}
                    />
                  </div>

                  {/* Chi tiết sơ lược */}
                  <div className="p-3 d-flex flex-column flex-grow-1">
                    <h4 className="fs-6 text-white mb-2 text-truncate" title={product.product_name}>{product.product_name}</h4>
                    <p className="text-secondary small text-truncate-2 mb-2" style={{ fontSize: '0.8rem', height: '34px', lineHeight: '1.4' }}>
                      {product.description}
                    </p>
                    
                    <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top border-secondary" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <div>
                        <span className="product-price fs-6 d-block mb-1">{product.price.toLocaleString('vi-VN')} đ</span>
                        <span className="text-secondary" style={{ fontSize: '0.72rem' }}>Còn: {product.product_quantity}</span>
                      </div>
                      <span className="text-info small font-weight-bold d-flex align-items-center gap-1">
                        Chi tiết &rarr;
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </Container>

      {/* Footer */}
      <footer className="py-4 text-center mt-auto border-top border-secondary" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
        <p className="text-secondary mb-0 small">&copy; 2026 Online Shop. Powered by Gemini Advanced Coding Agent.</p>
      </footer>



      {/* 2. Modal Thông Tin Cá Nhân (Hỗ trợ chỉnh sửa thông tin) */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered className="glass-modal">
        <Modal.Header closeButton>
          <Modal.Title className="text-white font-weight-bold">
            <span className="gradient-text">THÔNG TIN CÁ NHÂN</span>
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSaveProfile}>
          <Modal.Body className="p-4">
            {profileMessage && (
              <Alert variant={profileMessageType} style={{ borderRadius: '10px' }} className="text-center">
                {profileMessage}
              </Alert>
            )}

            <div className="d-flex align-items-center gap-3 mb-4">
              <FaUserCircle size={55} className="text-info" />
              <div>
                <h4 className="h5 text-white mb-0">{user.user_name}</h4>
                <Badge bg="primary" className="mt-1">{user.role}</Badge>
              </div>
            </div>
            
            <div className="d-flex flex-column gap-3">
              {isEditingProfile ? (
                <>
                  <div className="d-flex flex-column gap-1">
                    <label className="custom-label">Số điện thoại *</label>
                    <input 
                      type="text" 
                      className="form-control custom-input text-white" 
                      value={editForm.phone} 
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <label className="custom-label">Email *</label>
                    <input 
                      type="email" 
                      className="form-control custom-input text-white" 
                      value={editForm.email} 
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <label className="custom-label">Địa chỉ</label>
                    <input 
                      type="text" 
                      className="form-control custom-input text-white" 
                      value={editForm.address} 
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} 
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <span className="text-secondary small">Số điện thoại</span>
                    <span className="text-white">{user.phone}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <span className="text-secondary small">Email</span>
                    <span className="text-white">{user.email || <em className="text-muted">Chưa cập nhật</em>}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <span className="text-secondary small">Địa chỉ</span>
                    <span className="text-white text-end" style={{ maxWidth: '70%' }}>{user.address || <em className="text-muted">Chưa cập nhật</em>}</span>
                  </div>
                </>
              )}

              {/* Phần đổi mật khẩu trong Profile (Chỉ khi không chỉnh sửa thông tin cá nhân) */}
              {!isEditingProfile && (
                <div className="border-top border-secondary pt-3 mt-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  {!isChangingPassword ? (
                    <Button variant="outline-warning" size="sm" onClick={() => setIsChangingPassword(true)} style={{ borderRadius: '8px' }}>
                      Đổi mật khẩu
                    </Button>
                  ) : (
                    <div>
                      <h6 className="text-warning small font-weight-bold mb-3 uppercase">ĐỔI MẬT KHẨU BẢO MẬT</h6>
                      {passwordMessage && (
                        <Alert variant={passwordMessageType} className="py-2 text-center small" style={{ borderRadius: '8px' }}>
                          {passwordMessage}
                        </Alert>
                      )}
                      
                      <div className="d-flex flex-column gap-2 mb-3">
                        <div>
                          <label className="custom-label text-secondary small mb-1" style={{ fontSize: '0.75rem' }}>Mật khẩu hiện tại *</label>
                          <input 
                            type="password" 
                            name="currentPassword"
                            className="form-control form-control-sm custom-input text-white" 
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordInputChange}
                            required 
                          />
                        </div>
                        <div>
                          <label className="custom-label text-secondary small mb-1" style={{ fontSize: '0.75rem' }}>Mật khẩu mới *</label>
                          <input 
                            type="password" 
                            name="newPassword"
                            className="form-control form-control-sm custom-input text-white" 
                            value={passwordForm.newPassword}
                            onChange={handlePasswordInputChange}
                            required 
                          />
                        </div>
                        <div>
                          <label className="custom-label text-secondary small mb-1" style={{ fontSize: '0.75rem' }}>Xác nhận mật khẩu mới *</label>
                          <input 
                            type="password" 
                            name="confirmNewPassword"
                            className="form-control form-control-sm custom-input text-white" 
                            value={passwordForm.confirmNewPassword}
                            onChange={handlePasswordInputChange}
                            required 
                          />
                        </div>
                      </div>
                      
                      <div className="d-flex gap-2">
                        <Button variant="info" size="sm" onClick={handleSavePassword} style={{ borderRadius: '8px' }} disabled={savingPassword}>
                          {savingPassword ? 'Đang cập nhật...' : 'Xác nhận đổi'}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => setIsChangingPassword(false)} style={{ borderRadius: '8px' }} disabled={savingPassword}>
                          Hủy
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            {isEditingProfile ? (
              <>
                <Button variant="secondary" onClick={() => setIsEditingProfile(false)} style={{ borderRadius: '10px' }} disabled={savingProfile}>
                  Hủy
                </Button>
                <Button type="submit" className="btn-gradient btn btn-primary" style={{ borderRadius: '10px' }} disabled={savingProfile}>
                  {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </>
            ) : (
              <>
                {!isChangingPassword && (
                  <Button variant="outline-info" onClick={() => setIsEditingProfile(true)} style={{ borderRadius: '10px' }}>
                    Chỉnh sửa
                  </Button>
                )}
                <Button variant="secondary" onClick={() => setShowProfileModal(false)} style={{ borderRadius: '10px' }} disabled={isChangingPassword && savingPassword}>
                  Đóng
                </Button>
              </>
            )}
          </Modal.Footer>
        </form>
      </Modal>

    </div>
  )
}

export default Home
