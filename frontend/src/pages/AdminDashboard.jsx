import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Container, Navbar, Nav, Button, Table, Modal, Form, Alert, Badge, Spinner } from 'react-bootstrap'
import { FaUserCircle, FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaShoppingBag, FaLaptop } from 'react-icons/fa'
import api from '../services/api'

function AdminDashboard() {
  const { user, logout, updateProfile } = useAuth()
  const navigate = useNavigate()

  // State quản lý sản phẩm
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // State cho Modal Add/Edit sản phẩm
  const [showProductModal, setShowProductModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [productForm, setProductForm] = useState({
    product_name: '',
    price: '',
    product_quantity: '',
    description: '',
    image: ''
  })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // State cho Modal thông tin cá nhân của Admin
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState({ phone: '', email: '', address: '' })
  const [profileMessage, setProfileMessage] = useState('')
  const [profileMessageType, setProfileMessageType] = useState('success')
  const [savingProfile, setSavingProfile] = useState(false)

  // State cho Đổi mật khẩu của Admin
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordMessageType, setPasswordMessageType] = useState('danger')
  const [savingPassword, setSavingPassword] = useState(false)

  // Tải danh sách sản phẩm từ backend
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await api.get('/products')
      setProducts(res.data.products)
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err)
      setError('Không thể kết nối tải danh sách sản phẩm!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.role === 'Admin') {
      fetchProducts()
    }
  }, [user])

  // Redirect nếu không phải là Admin
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'Admin') return <Navigate to="/" replace />

  // Handlers cho CRUD sản phẩm
  const handleOpenAddModal = () => {
    setIsEditMode(false)
    setEditingProductId(null)
    setProductForm({
      product_name: '',
      price: '',
      product_quantity: '',
      description: '',
      image: ''
    })
    setFormError('')
    setFormSuccess('')
    setShowProductModal(true)
  }

  const handleOpenEditModal = (product) => {
    setIsEditMode(true)
    setEditingProductId(product._id)
    setProductForm({
      product_name: product.product_name,
      price: product.price,
      product_quantity: product.product_quantity,
      description: product.description || '',
      image: product.image || ''
    })
    setFormError('')
    setFormSuccess('')
    setShowProductModal(true)
  }

  const handleProductInputChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value
    })
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    const { product_name, price, product_quantity, image } = productForm
    if (!product_name || !price || !product_quantity || !image) {
      setFormError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)')
      return
    }

    setSubmitting(true)
    try {
      if (isEditMode) {
        // Cập nhật sản phẩm
        const res = await api.put(`/products/${editingProductId}`, productForm)
        setFormSuccess(res.data.message || 'Cập nhật sản phẩm thành công!')
        setTimeout(() => {
          setShowProductModal(false)
          fetchProducts()
        }, 1500)
      } else {
        // Thêm mới sản phẩm
        const res = await api.post('/products', productForm)
        setFormSuccess(res.data.message || 'Thêm sản phẩm mới thành công!')
        setTimeout(() => {
          setShowProductModal(false)
          fetchProducts()
        }, 1500)
      }
    } catch (err) {
      console.error('Lỗi khi gửi sản phẩm:', err)
      setFormError(err.response?.data?.message || 'Lỗi thao tác trên máy chủ!')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProduct = async (productId, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" khỏi kho hàng?`)) {
      try {
        const res = await api.delete(`/products/${productId}`)
        alert(res.data.message || 'Xóa sản phẩm thành công!')
        fetchProducts()
      } catch (err) {
        console.error('Lỗi xóa sản phẩm:', err)
        alert(err.response?.data?.message || 'Không thể xóa sản phẩm!')
      }
    }
  }

  // Handlers cho Profile của Admin
  const handleOpenProfile = () => {
    setEditForm({
      phone: user.phone || '',
      email: user.email || '',
      address: user.address || ''
    })
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

    // Validate phone
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/
    if (!phoneRegex.test(editForm.phone)) {
      setProfileMessageType('danger')
      setProfileMessage('Số điện thoại không hợp lệ! Vui lòng nhập đúng số điện thoại Việt Nam (ví dụ: 0912345678).')
      return
    }

    // Validate email
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
      setProfileMessage('Cập nhật thông tin Admin thành công!')
      setIsEditingProfile(false)
    } else {
      setProfileMessageType('danger')
      setProfileMessage(result.message || 'Cập nhật thất bại!')
    }
  }

  // Handlers đổi mật khẩu cho Admin
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
      console.error('Lỗi đổi mật khẩu Admin:', err)
      setPasswordMessageType('danger')
      setPasswordMessage(err.response?.data?.message || 'Đổi mật khẩu thất bại!')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex flex-column">
      
      {/* Navbar cho Admin */}
      <Navbar expand="lg" variant="dark" className="navbar-glass sticky-top py-3">
        <Container>
          <Navbar.Brand href="#admin-dashboard" className="d-flex align-items-center gap-2">
            <FaShoppingBag className="text-info fs-4" />
            <span className="gradient-text font-weight-bold fs-4">ONLINE SHOP (ADMIN)</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="admin-navbar-nav" />
          <Navbar.Collapse id="admin-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#products-manage" active className="text-white">Quản lý sản phẩm</Nav.Link>
            </Nav>
            
            <Nav className="align-items-center gap-3 mt-3 mt-lg-0">
              <div className="d-flex align-items-center gap-2 text-white pe-3 border-end border-secondary" style={{ cursor: 'pointer' }} onClick={handleOpenProfile}>
                <FaUserCircle className="text-warning fs-4" />
                <div>
                  <div className="small font-weight-bold">{user.user_name}</div>
                  <div className="text-warning" style={{ fontSize: '0.75rem' }}>Quản trị viên</div>
                </div>
              </div>
              <Button variant="outline-danger" onClick={logout} className="d-flex align-items-center gap-2" style={{ borderRadius: '10px' }}>
                <FaSignOutAlt /> Đăng xuất
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Admin Dashboard */}
      <Container className="py-5 flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom border-secondary fade-in-up">
          <div>
            <h1 className="display-6 font-weight-bold text-white mb-2">Quản Lý Kho Hàng</h1>
            <p className="text-secondary mb-0">Thêm, sửa đổi thông tin hoặc xóa sản phẩm khỏi cơ sở dữ liệu hệ thống.</p>
          </div>
          <Button className="btn-gradient d-flex align-items-center gap-2" onClick={handleOpenAddModal} style={{ borderRadius: '10px' }}>
            <FaPlus /> Thêm sản phẩm
          </Button>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" variant="info" className="me-2" />
            <span className="text-secondary">Đang tải danh sách kho hàng...</span>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center" style={{ borderRadius: '12px' }}>{error}</Alert>
        ) : (
          <div className="glass-card p-4 fade-in-up">
            <Table responsive borderless className="text-white align-middle mb-0">
              <thead>
                <tr className="border-bottom border-secondary" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <th className="py-3 text-secondary" style={{ width: '5%' }}>#</th>
                  <th className="py-3 text-secondary" style={{ width: '12%' }}>Hình ảnh</th>
                  <th className="py-3 text-secondary" style={{ width: '25%' }}>Tên sản phẩm</th>
                  <th className="py-3 text-secondary" style={{ width: '30%' }}>Mô tả</th>
                  <th className="py-3 text-secondary" style={{ width: '13%' }}>Đơn giá</th>
                  <th className="py-3 text-secondary text-center" style={{ width: '15%' }}>Tồn kho</th>
                  <th className="py-3 text-secondary text-end" style={{ width: '15%' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary">
                      Chưa có sản phẩm nào trong kho hàng. Hãy thêm sản phẩm đầu tiên!
                    </td>
                  </tr>
                ) : (
                  products.map((product, idx) => (
                    <tr key={product._id} className="border-bottom border-secondary" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="rounded-3 overflow-hidden border border-secondary" style={{ width: '50px', height: '50px', background: 'rgba(0,0,0,0.2)' }}>
                          <img 
                            src={product.image || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200'} 
                            alt={product.product_name}
                            className="w-100 h-100"
                            style={{ objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200'
                            }}
                          />
                        </div>
                      </td>
                      <td className="font-weight-bold text-white text-truncate-2">{product.product_name}</td>
                      <td>
                        <div className="text-secondary small text-truncate-2" style={{ maxWidth: '280px' }} title={product.description}>
                          {product.description || <em className="text-muted">Chưa có mô tả</em>}
                        </div>
                      </td>
                      <td className="text-info font-weight-bold">{product.price.toLocaleString('vi-VN')} đ</td>
                      <td className="text-center">
                        <Badge bg={product.product_quantity > 10 ? 'dark' : 'danger'} className="border border-secondary">
                          {product.product_quantity} máy
                        </Badge>
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Button variant="outline-info" size="sm" onClick={() => handleOpenEditModal(product)} style={{ borderRadius: '8px' }}>
                            <FaEdit /> Sửa
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteProduct(product._id, product.product_name)} style={{ borderRadius: '8px' }}>
                            <FaTrash /> Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        )}
      </Container>

      {/* Footer */}
      <footer className="py-4 text-center mt-auto border-top border-secondary" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
        <p className="text-secondary mb-0 small">&copy; 2026 Online Shop. Admin Panel. Powered by Gemini Advanced Agent.</p>
      </footer>

      {/* 1. Modal Thêm / Sửa Sản phẩm (Glassmorphism) */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} centered className="glass-modal">
        <Modal.Header closeButton>
          <Modal.Title className="text-white font-weight-bold">
            <span className="gradient-text">{isEditMode ? 'CẬP NHẬT SẢN PHẨM' : 'THÊM SẢN PHẨM MỚI'}</span>
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleProductSubmit}>
          <Modal.Body className="p-4">
            {formError && <Alert variant="danger" className="text-center" style={{ borderRadius: '10px' }}>{formError}</Alert>}
            {formSuccess && <Alert variant="success" className="text-center" style={{ borderRadius: '10px' }}>{formSuccess}</Alert>}

            {/* Product Name */}
            <Form.Group className="mb-3">
              <Form.Label className="custom-label">Tên sản phẩm *</Form.Label>
              <Form.Control
                type="text"
                name="product_name"
                className="custom-input text-white"
                placeholder="Nhập tên sản phẩm (ví dụ: iPhone 15 Pro)"
                value={productForm.product_name}
                onChange={handleProductInputChange}
                required
              />
            </Form.Group>

            <div className="row mb-3">
              {/* Product Price */}
              <div className="col-6">
                <Form.Group>
                  <Form.Label className="custom-label">Đơn giá (đ) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    className="custom-input text-white"
                    placeholder="25000000"
                    value={productForm.price}
                    onChange={handleProductInputChange}
                    required
                  />
                </Form.Group>
              </div>

              {/* Product Quantity */}
              <div className="col-6">
                <Form.Group>
                  <Form.Label className="custom-label">Số lượng tồn kho *</Form.Label>
                  <Form.Control
                    type="number"
                    name="product_quantity"
                    className="custom-input text-white"
                    placeholder="50"
                    value={productForm.product_quantity}
                    onChange={handleProductInputChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>

            {/* Image URL */}
            <Form.Group className="mb-3">
              <Form.Label className="custom-label">Đường dẫn ảnh (URL) *</Form.Label>
              <Form.Control
                type="url"
                name="image"
                className="custom-input text-white"
                placeholder="https://example.com/image.jpg"
                value={productForm.image}
                onChange={handleProductInputChange}
                required
              />
            </Form.Group>

            {/* Description */}
            <Form.Group className="mb-2">
              <Form.Label className="custom-label">Mô tả sản phẩm</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                className="custom-input text-white"
                placeholder="Mô tả các thông số kỹ thuật chính của sản phẩm..."
                value={productForm.description}
                onChange={handleProductInputChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowProductModal(false)} style={{ borderRadius: '10px' }} disabled={submitting}>
              Hủy
            </Button>
            <Button type="submit" className="btn-gradient btn btn-primary" style={{ borderRadius: '10px' }} disabled={submitting}>
              {submitting ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật' : 'Thêm mới')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* 2. Modal Thông Tin Admin (Glassmorphism) */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered className="glass-modal">
        <Modal.Header closeButton>
          <Modal.Title className="text-white font-weight-bold">
            <span className="gradient-text">THÔNG TIN ADMIN</span>
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveProfile}>
          <Modal.Body className="p-4">
            {profileMessage && (
              <Alert variant={profileMessageType} style={{ borderRadius: '10px' }} className="text-center">
                {profileMessage}
              </Alert>
            )}

            <div className="d-flex align-items-center gap-3 mb-4">
              <FaUserCircle size={55} className="text-warning" />
              <div>
                <h4 className="h5 text-white mb-0">{user.user_name}</h4>
                <Badge bg="warning" className="text-dark mt-1">Quản trị viên</Badge>
              </div>
            </div>
            
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <span className="text-secondary small">Tên đăng nhập</span>
                <span className="text-white font-weight-bold">{user.user_name}</span>
              </div>

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

              {/* Phần đổi mật khẩu Admin */}
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
                  <Button variant="outline-warning" onClick={() => setIsEditingProfile(true)} style={{ borderRadius: '10px' }} className="text-dark-hover">
                    Chỉnh sửa
                  </Button>
                )}
                <Button variant="secondary" onClick={() => setShowProfileModal(false)} style={{ borderRadius: '10px' }} disabled={isChangingPassword && savingPassword}>
                  Đóng
                </Button>
              </>
            )}
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  )
}

export default AdminDashboard
