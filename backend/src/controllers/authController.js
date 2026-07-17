import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/Users'
import { Role } from '../models/Roles'
import { env } from '../config/environment'
import { emailService } from '../services/emailService'

export const authController = {
  // Đăng ký tài khoản mới
  register: async (req, res) => {
    try {
      const { user_name, password, phone, email, address } = req.body

      // Validate dữ liệu cơ bản
      if (!user_name || !password || !phone || !email) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ Tên đăng nhập, Mật khẩu, Số điện thoại và Email!' })
      }

      // Validate định dạng số điện thoại Việt Nam
      const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: 'Số điện thoại không hợp lệ! Vui lòng nhập đúng số điện thoại Việt Nam (ví dụ: 0912345678).' })
      }

      // Validate định dạng email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Định dạng email không hợp lệ! Vui lòng kiểm tra lại.' })
      }

      // Kiểm tra tên đăng nhập đã tồn tại chưa
      const existingUser = await User.findOne({ user_name })
      if (existingUser) {
        return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!' })
      }

      // Kiểm tra email đã tồn tại chưa
      const existingEmail = await User.findOne({ email })
      if (existingEmail) {
        return res.status(400).json({ message: 'Email đã được đăng ký cho tài khoản khác!' })
      }

      // Hash mật khẩu
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Kiểm tra hoặc tạo Role mặc định 'User'
      let userRole = await Role.findOne({ role_name: 'User' })
      if (!userRole) {
        userRole = await Role.create({ role_name: 'User' })
      }

      // Tạo user mới
      const newUser = await User.create({
        user_name,
        password: hashedPassword,
        phone,
        email,
        address: address || '',
        status: 'active',
        role_id: userRole._id
      })

      // Trả về kết quả
      const responseUser = {
        _id: newUser._id,
        user_name: newUser.user_name,
        phone: newUser.phone,
        email: newUser.email,
        address: newUser.address,
        status: newUser.status,
        role: userRole.role_name
      }

      return res.status(201).json({
        message: 'Đăng ký tài khoản thành công!',
        user: responseUser
      })
    } catch (error) {
      console.error('Lỗi đăng ký:', error)
      return res.status(500).json({ message: 'Đã xảy ra lỗi trên máy chủ trong quá trình đăng ký!' })
    }
  },

  // Đăng nhập
  login: async (req, res) => {
    try {
      const { user_name, password } = req.body

      if (!user_name || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp Tên đăng nhập và Mật khẩu!' })
      }

      // Tìm user theo username
      const user = await User.findOne({ user_name }).populate('role_id')
      if (!user) {
        return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác!' })
      }

      // Kiểm tra trạng thái tài khoản
      if (user.status !== 'active') {
        return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động!' })
      }

      // Đối chiếu mật khẩu
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác!' })
      }

      // Lấy tên vai trò
      const roleName = user.role_id ? user.role_id.role_name : 'User'

      // Tạo JWT token
      const token = jwt.sign(
        { userId: user._id, role: roleName },
        env.JWT_SECRET || 'hieujwt',
        { expiresIn: '1d' }
      )

      return res.status(200).json({
        message: 'Đăng nhập thành công!',
        token,
        user: {
          _id: user._id,
          user_name: user.user_name,
          phone: user.phone,
          email: user.email,
          address: user.address,
          status: user.status,
          role: roleName
        }
      })
    } catch (error) {
      console.error('Lỗi đăng nhập:', error)
      return res.status(500).json({ message: 'Đã xảy ra lỗi trên máy chủ trong quá trình đăng nhập!' })
    }
  },

  // Lấy thông tin user hiện tại qua Token
  getMe: async (req, res) => {
    try {
      // req.user chứa payload được giải mã từ token (có userId)
      const user = await User.findById(req.user.userId).populate('role_id')
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng!' })
      }

      return res.status(200).json({
        user: {
          _id: user._id,
          user_name: user.user_name,
          phone: user.phone,
          email: user.email,
          address: user.address,
          status: user.status,
          role: user.role_id ? user.role_id.role_name : 'User'
        }
      })
    } catch (error) {
      console.error('Lỗi lấy thông tin user:', error)
      return res.status(500).json({ message: 'Đã xảy ra lỗi trên máy chủ khi lấy dữ liệu profile!' })
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { phone, email, address } = req.body

      if (!phone || !email) {
        return res.status(400).json({ message: 'Số điện thoại và Email không được để trống!' })
      }

      // Validate định dạng số điện thoại Việt Nam
      const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: 'Số điện thoại không hợp lệ! Vui lòng nhập đúng số điện thoại Việt Nam (ví dụ: 0912345678).' })
      }

      // Validate định dạng email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Định dạng email không hợp lệ!' })
      }

      // Kiểm tra email trùng lặp với người dùng khác
      const existingEmail = await User.findOne({ email, _id: { $ne: req.user.userId } })
      if (existingEmail) {
        return res.status(400).json({ message: 'Email đã được đăng ký cho một tài khoản khác!' })
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user.userId,
        { phone, email, address },
        { new: true }
      ).populate('role_id')

      if (!updatedUser) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng!' })
      }

      return res.status(200).json({
        message: 'Cập nhật thông tin cá nhân thành công!',
        user: {
          _id: updatedUser._id,
          user_name: updatedUser.user_name,
          phone: updatedUser.phone,
          email: updatedUser.email,
          address: updatedUser.address,
          status: updatedUser.status,
          role: updatedUser.role_id ? updatedUser.role_id.role_name : 'User'
        }
      })
    } catch (error) {
      console.error('Lỗi cập nhật profile:', error)
      return res.status(500).json({ message: 'Đã xảy ra lỗi trên máy chủ khi cập nhật thông tin!' })
    }
  },

  // Đăng ký tài khoản Admin (chạy trên Postman)
  registerAdmin: async (req, res) => {
    try {
      const { user_name, password, phone, email, address } = req.body

      // Validate dữ liệu cơ bản
      if (!user_name || !password || !phone || !email) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ Tên đăng nhập, Mật khẩu, Số điện thoại và Email!' })
      }

      // Validate định dạng số điện thoại Việt Nam
      const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: 'Số điện thoại không hợp lệ! Vui lòng nhập đúng số điện thoại Việt Nam (ví dụ: 0912345678).' })
      }

      // Validate định dạng email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Định dạng email không hợp lệ!' })
      }

      // Kiểm tra tên đăng nhập đã tồn tại chưa
      const existingUser = await User.findOne({ user_name })
      if (existingUser) {
        return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!' })
      }

      // Kiểm tra email đã tồn tại chưa
      const existingEmail = await User.findOne({ email })
      if (existingEmail) {
        return res.status(400).json({ message: 'Email đã được đăng ký cho tài khoản khác!' })
      }

      // Hash mật khẩu
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Kiểm tra hoặc tạo Role mặc định 'Admin'
      let adminRole = await Role.findOne({ role_name: 'Admin' })
      if (!adminRole) {
        adminRole = await Role.create({ role_name: 'Admin' })
      }

      // Tạo user mới có quyền Admin
      const newUser = await User.create({
        user_name,
        password: hashedPassword,
        phone,
        email,
        address: address || '',
        status: 'active',
        role_id: adminRole._id
      })

      // Trả về kết quả
      const responseUser = {
        _id: newUser._id,
        user_name: newUser.user_name,
        phone: newUser.phone,
        email: newUser.email,
        address: newUser.address,
        status: newUser.status,
        role: adminRole.role_name
      }

      return res.status(201).json({
        message: 'Đăng ký tài khoản Admin thành công!',
        user: responseUser
      })
    } catch (error) {
      console.error('Lỗi đăng ký Admin:', error)
      return res.status(500).json({ message: 'Đã xảy ra lỗi trên máy chủ trong quá trình đăng ký Admin!' })
    }
  },

  // 1. Quên mật khẩu: Yêu cầu OTP qua email
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body
      if (!email) {
        return res.status(400).json({ message: 'Vui lòng cung cấp email của bạn!' })
      }

      // Tìm user có email tương ứng
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản nào được đăng ký với email này!' })
      }

      // Sinh mã OTP 6 chữ số ngẫu nhiên
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

      // Hạn sử dụng của OTP: 10 phút
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

      // Cập nhật thông tin OTP vào user
      user.resetOtp = otpCode
      user.resetOtpExpiry = otpExpiry
      await user.save()

      // Gửi email OTP
      await emailService.sendResetOtpEmail(email, otpCode, user.user_name)

      return res.status(200).json({
        message: 'Mã xác thực OTP khôi phục mật khẩu đã được gửi về email của bạn (Hãy kiểm tra mail hoặc log console của server)!'
      })
    } catch (error) {
      console.error('Lỗi yêu cầu OTP khôi phục mật khẩu:', error)
      return res.status(500).json({ message: 'Đã xảy ra lỗi trên máy chủ khi gửi mã xác thực!' })
    }
  },

  // 2. Khôi phục mật khẩu: Nhập OTP và đặt mật khẩu mới
  resetPassword: async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body

      if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ Email, mã OTP và Mật khẩu mới!' })
      }

      // Tìm user theo email
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản được liên kết với email này!' })
      }

      // Kiểm tra tính hợp lệ của mã OTP
      if (!user.resetOtp || user.resetOtp !== otp) {
        return res.status(400).json({ message: 'Mã xác thực OTP không chính xác!' })
      }

      // Kiểm tra thời gian hết hạn OTP
      if (new Date() > user.resetOtpExpiry) {
        return res.status(400).json({ message: 'Mã xác thực OTP đã hết hạn sử dụng! Vui lòng yêu cầu mã mới.' })
      }

      // Hash mật khẩu mới
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)

      // Cập nhật mật khẩu mới và xóa mã OTP
      user.password = hashedPassword
      user.resetOtp = null
      user.resetOtpExpiry = null
      await user.save()

      return res.status(200).json({
        message: 'Đặt lại mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập.'
      })
    } catch (error) {
      console.error('Lỗi đặt lại mật khẩu:', error)
      return res.status(500).json({ message: 'Đã xảy ra lỗi trên máy chủ khi đặt lại mật khẩu!' })
    }
  },

  // 3. Đổi mật khẩu trong Profile Modal
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Vui lòng điền mật khẩu hiện tại và mật khẩu mới!' })
      }

      // Tìm user theo ID đăng nhập
      const user = await User.findById(req.user.userId)
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin tài khoản!' })
      }

      // So khớp mật khẩu hiện tại
      const isMatch = await bcrypt.compare(currentPassword, user.password)
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác!' })
      }

      // Hash mật khẩu mới
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)

      // Cập nhật mật khẩu mới
      user.password = hashedPassword
      await user.save()

      return res.status(200).json({
        message: 'Đổi mật khẩu thành công!'
      })
    } catch (error) {
      console.error('Lỗi đổi mật khẩu profile:', error)
      return res.status(500).json({ message: 'Đã xảy ra lỗi trên máy chủ khi đổi mật khẩu!' })
    }
  }
}
