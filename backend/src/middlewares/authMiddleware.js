import jwt from 'jsonwebtoken'
import { env } from '../config/environment'

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yêu cầu đăng nhập để thực hiện chức năng này!' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET || 'hieujwt')
    req.user = decoded // Gán thông tin giải mã (chứa id, role,...) vào req.user
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Token hết hạn hoặc không hợp lệ!' })
  }
}
