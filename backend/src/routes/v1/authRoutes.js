import express from 'express'
import { authController } from '../../controllers/authController'
import { authMiddleware } from '../../middlewares/authMiddleware'

const Router = express.Router()

// Đăng ký tài khoản
Router.post('/register', authController.register)

// Đăng ký tài khoản Admin (chạy trên Postman)
Router.post('/register-admin', authController.registerAdmin)

// Đăng nhập
Router.post('/login', authController.login)

// Lấy thông tin user hiện tại (Yêu cầu Token)
Router.get('/me', authMiddleware, authController.getMe)

// Cập nhật thông tin user hiện tại (Yêu cầu Token)
Router.put('/me', authMiddleware, authController.updateProfile)

// Quên mật khẩu: Yêu cầu OTP (Công khai)
Router.post('/forgot-password', authController.forgotPassword)

// Khôi phục mật khẩu: Nhập OTP và đặt mật khẩu mới (Công khai)
Router.post('/reset-password', authController.resetPassword)

// Đổi mật khẩu trong Profile (Yêu cầu Token)
Router.post('/change-password', authMiddleware, authController.changePassword)

export const authRoutes = Router
