import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Container, Navbar, Nav, Button, Badge, Spinner, Alert } from 'react-bootstrap'
import { FaUserCircle, FaSignOutAlt, FaArrowLeft, FaShoppingBag, FaCartPlus, FaHeart } from 'react-icons/fa'
import api from '../services/api'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const res = await api.get(`/products/${id}`)
        setProduct(res.data.product)
      } catch (err) {
        console.error('Lỗi tải chi tiết sản phẩm:', err)
        setError(err.response?.data?.message || 'Không thể lấy thông tin sản phẩm!')
      } finally {
        setLoading(false)
      }
    }
    fetchProductDetail()
  }, [id])

  const handleBack = () => {
    navigate('/')
  }

  const handleIncrement = () => {
    if (product && quantity < product.product_quantity) {
      setQuantity(quantity + 1)
    }
  }

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  if (!user) return null

  return (
    <div className="min-vh-100 d-flex flex-column">
      
      {/* Navbar Premium */}
      <Navbar expand="lg" variant="dark" className="navbar-glass sticky-top py-3">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
            <FaShoppingBag className="text-info fs-4" />
            <span className="gradient-text font-weight-bold fs-4">ONLINE SHOP</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/" className="text-white">Cửa hàng</Nav.Link>
              <Nav.Link href="#about" className="text-secondary">Giới thiệu</Nav.Link>
              <Nav.Link href="#contact" className="text-secondary">Liên hệ</Nav.Link>
            </Nav>
            
            <Nav className="align-items-center gap-3 mt-3 mt-lg-0">
              <div className="d-flex align-items-center gap-2 text-white pe-3 border-end border-secondary" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
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
        <Button variant="outline-light" className="d-flex align-items-center gap-2 mb-4" onClick={handleBack} style={{ borderRadius: '10px' }}>
          <FaArrowLeft /> Quay lại cửa hàng
        </Button>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" variant="info" className="me-2" />
            <span className="text-secondary">Đang tải chi tiết sản phẩm...</span>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center" style={{ borderRadius: '12px' }}>
            {error}
          </Alert>
        ) : product ? (
          <div className="glass-card p-4 p-md-5 fade-in-up">
            <div className="row g-5">
              
              {/* Product Image Column */}
              <div className="col-12 col-md-6 d-flex align-items-center justify-content-center">
                <div className="w-100 rounded-4 overflow-hidden shadow-lg border border-secondary" style={{ maxHeight: '420px', maxWidth: '420px', aspectRatio: '1/1', background: 'rgba(0,0,0,0.2)' }}>
                  <img 
                    src={product.image || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600'} 
                    alt={product.product_name}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600'
                    }}
                  />
                </div>
              </div>

              {/* Product Info Column */}
              <div className="col-12 col-md-6 d-flex flex-column justify-content-between">
                <div>
                  <h1 className="display-6 font-weight-bold text-white mb-2">{product.product_name}</h1>
                  
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <Badge bg="success">Đang hoạt động</Badge>
                    <Badge bg="dark" className="text-info border border-info">Còn {product.product_quantity} trong kho</Badge>
                  </div>

                  <h2 className="gradient-text font-weight-bold mb-4" style={{ fontSize: '2rem' }}>
                    {product.price.toLocaleString('vi-VN')} đ
                  </h2>

                  <h6 className="text-secondary small font-weight-bold mb-2 uppercase">MÔ TẢ SẢN PHẨM</h6>
                  <p className="text-white-50 mb-4" style={{ lineHeight: '1.7', textAlign: 'justify' }}>
                    {product.description || 'Sản phẩm hiện tại chưa cập nhật mô tả chi tiết từ nhà sản xuất.'}
                  </p>
                </div>

                {/* Purchase Area */}
                <div className="border-top border-secondary pt-4 mt-auto">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <span className="text-secondary small">Số lượng:</span>
                    <div className="d-flex align-items-center border border-secondary rounded-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <button className="btn btn-sm text-white px-3 py-1 fs-5 border-0" onClick={handleDecrement}>-</button>
                      <span className="px-3 text-white font-weight-bold">{quantity}</span>
                      <button className="btn btn-sm text-white px-3 py-1 fs-5 border-0" onClick={handleIncrement}>+</button>
                    </div>
                  </div>

                  <div className="d-flex gap-3">
                    <Button 
                      className="btn-gradient d-flex align-items-center gap-2 px-4 py-2 flex-grow-1 justify-content-center" 
                      onClick={() => alert(`Đặt mua thành công số lượng: ${quantity} sản phẩm!`)}
                      style={{ borderRadius: '12px' }}
                    >
                      <FaCartPlus /> MUA NGAY
                    </Button>
                    <Button 
                      variant="outline-light" 
                      className="p-3 d-flex align-items-center justify-content-center" 
                      onClick={() => alert('Đã thêm sản phẩm vào danh sách yêu thích!')}
                      style={{ borderRadius: '12px', width: '50px' }}
                    >
                      <FaHeart className="text-danger" />
                    </Button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        ) : null}
      </Container>

      {/* Footer */}
      <footer className="py-4 text-center mt-auto border-top border-secondary" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
        <p className="text-secondary mb-0 small">&copy; 2026 Online Shop. Powered by Gemini Advanced Coding Agent.</p>
      </footer>

    </div>
  )
}

export default ProductDetail
