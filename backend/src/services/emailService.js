import nodemailer from 'nodemailer'

export const emailService = {
  sendResetOtpEmail: async (toEmail, otpCode, userName) => {
    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASS

    console.log('\n======================================================')
    console.log(`✉️  [EMAIL OTP LOG] Gửi mã xác thực khôi phục mật khẩu`)
    console.log(`Người nhận: ${toEmail} (Tên tài khoản: ${userName})`)
    console.log(`MÃ XÁC THỰC (OTP) CỦA BẠN LÀ: ${otpCode}`)
    console.log('======================================================\n')

    // Nếu người dùng có cấu hình SMTP thì gửi email thật
    if (emailUser && emailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail', // Sử dụng Gmail hoặc cấu hình custom SMTP tùy chọn
          auth: {
            user: emailUser,
            pass: emailPass
          }
        })

        const mailOptions = {
          from: `"Online Shop Support" <${emailUser}>`,
          to: toEmail,
          subject: 'Mã xác thực OTP đặt lại mật khẩu - Online Shop',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
              <h2 style="color: #0ea5e9; text-align: center;">Khôi phục mật khẩu Online Shop</h2>
              <p>Chào <strong>${userName}</strong>,</p>
              <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu từ tài khoản của bạn. Vui lòng sử dụng mã OTP dưới đây để hoàn tất việc đặt lại mật khẩu:</p>
              <div style="background-color: #0f172a; color: #38bdf8; font-size: 24px; font-weight: bold; text-align: center; padding: 15px; border-radius: 8px; letter-spacing: 5px; margin: 20px 0;">
                ${otpCode}
              </div>
              <p style="color: #64748b; font-size: 14px;">Mã xác thực này có hiệu lực trong vòng <strong>10 phút</strong>. Nếu không phải bạn yêu cầu, hãy bỏ qua email này.</p>
              <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
              <p style="text-align: center; color: #94a3b8; font-size: 12px;">© 2026 Online Shop. Powered by Advanced Agentic Coding.</p>
            </div>
          `
        }

        const info = await transporter.sendMail(mailOptions)
        console.log(`✅ Đã gửi email OTP thực tế thành công: ${info.messageId}`)
        return { success: true, message: 'Đã gửi email thật!' }
      } catch (err) {
        console.error('❌ Gặp lỗi khi gửi email thực tế:', err.message)
        return { success: false, message: `Lỗi SMTP: ${err.message}` }
      }
    } else {
      console.log('💡 [Thông báo]: Chưa cấu hình SMTP (EMAIL_USER & EMAIL_PASS trong .env) -> Đang chạy ở chế độ giả lập. Vui lòng lấy mã OTP hiển thị ở Console trên để test.')
      return { success: true, message: 'OTP logged to server console.' }
    }
  }
}
