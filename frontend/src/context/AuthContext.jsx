import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Hàm tải thông tin user hiện tại nếu có token
  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const res = await api.get('/auth/me')
      setUser(res.data.user)
    } catch (error) {
      console.error('Không thể xác thực token:', error)
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  // Đăng nhập
  const login = async (user_name, password) => {
    try {
      const res = await api.post('/auth/login', { user_name, password })
      const { token, user: loggedUser } = res.data
      localStorage.setItem('token', token)
      setUser(loggedUser)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại!'
      return { success: false, message }
    }
  }

  // Đăng ký
  const register = async (user_name, password, phone, email, address) => {
    try {
      const res = await api.post('/auth/register', { user_name, password, phone, email, address })
      return { success: true, message: res.data.message }
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng ký thất bại!'
      return { success: false, message }
    }
  }

  // Đăng xuất
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  // Cập nhật thông tin profile
  const updateProfile = async (phone, email, address) => {
    try {
      const res = await api.put('/auth/me', { phone, email, address })
      setUser(res.data.user)
      return { success: true, message: res.data.message }
    } catch (error) {
      const message = error.response?.data?.message || 'Cập nhật thất bại!'
      return { success: false, message }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchCurrentUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook tiện ích để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider')
  }
  return context
}
