export const adminMiddleware = (req, res, next) => {
  // req.user được giải mã từ token ở authMiddleware, có cấu trúc { userId, role }
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Quyền truy cập bị từ chối! Chức năng này yêu cầu vai trò quản trị viên (Admin).' })
  }
  next()
}
