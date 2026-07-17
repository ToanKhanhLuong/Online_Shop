import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import {
  FaEnvelope,
  FaKey,
  FaLock,
  FaShoppingBag,
  FaArrowLeft,
} from "react-icons/fa";
import api from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP & Mật khẩu mới
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setStep(1);
  }, []);

  // Gửi yêu cầu lấy OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Vui lòng nhập email của bạn!");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Định dạng email không hợp lệ!");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setSuccess(res.data.message || "Mã OTP đã được gửi thành công!");
      setStep(2);
    } catch (err) {
      console.error("Lỗi yêu cầu OTP:", err);
      setError(
        err.response?.data?.message || "Có lỗi xảy ra khi gửi yêu cầu OTP!",
      );
    } finally {
      setLoading(false);
    }
  };

  // Đặt lại mật khẩu mới
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ mã OTP và mật khẩu mới!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp!");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      setSuccess(res.data.message || "Đặt lại mật khẩu thành công!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Lỗi đặt lại mật khẩu:", err);
      setError(err.response?.data?.message || "Khôi phục mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg min-vh-100 d-flex align-items-center justify-content-center py-5">
      <Container style={{ maxWidth: "450px" }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center gap-2 mb-2">
            <FaShoppingBag className="text-info fs-1" />
            <span className="gradient-text font-weight-bold fs-2">
              ONLINE SHOP
            </span>
          </div>
          <p className="text-secondary small">
            Hệ thống Khôi phục Mật khẩu Bảo mật
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-4 p-md-5">
          <h2 className="text-center text-white h4 font-weight-bold mb-4">
            {step === 1 ? "QUÊN MẬT KHẨU" : "ĐẶT LẠI MẬT KHẨU"}
          </h2>

          {error && (
            <Alert
              variant="danger"
              className="text-center"
              style={{ borderRadius: "10px" }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              variant="success"
              className="text-center"
              style={{ borderRadius: "10px" }}
            >
              {success}
            </Alert>
          )}

          {step === 1 ? (
            /* Bước 1: Yêu cầu mã OTP */
            <Form onSubmit={handleRequestOtp}>
              <p className="text-secondary small text-center mb-4">
                Vui lòng nhập địa chỉ Email đăng ký tài khoản. Hệ thống sẽ gửi
                mã xác thực OTP gồm 6 chữ số để đặt lại mật khẩu.
              </p>

              <Form.Group className="mb-4">
                <Form.Label className="custom-label">Email của bạn</Form.Label>
                <div className="position-relative">
                  <span
                    className="position-absolute translate-middle-y"
                    style={{
                      left: "15px",
                      top: "50%",
                      color: "rgba(255,255,255,0.4)",
                      zIndex: 10,
                    }}
                  >
                    <FaEnvelope />
                  </span>
                  <Form.Control
                    type="email"
                    placeholder="example@domain.com"
                    className="custom-input text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: "45px" }}
                    autoComplete="off"
                    required
                    disabled={loading}
                  />
                </div>
              </Form.Group>

              <Button
                type="submit"
                className="btn-gradient w-100 py-2 font-weight-bold mb-3 d-flex align-items-center justify-content-center gap-2"
                style={{ borderRadius: "12px" }}
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "GỬI MÃ XÁC THỰC"
                )}
              </Button>
            </Form>
          ) : (
            /* Bước 2: Nhập OTP và đổi mật khẩu */
            <Form onSubmit={handleResetPassword}>
              <p className="text-info small text-center mb-4">
                Mã xác thực OTP đã được gửi về hòm thư <strong>{email}</strong>.
                <br />
                <span className="text-muted">
                  (Nếu không nhận được email, vui lòng kiểm tra Console Terminal
                  của Backend để lấy mã OTP nhanh)
                </span>
              </p>

              {/* OTP Input */}
              <Form.Group className="mb-3">
                <Form.Label className="custom-label">
                  Mã OTP (6 chữ số) *
                </Form.Label>
                <div className="position-relative">
                  <span
                    className="position-absolute translate-middle-y"
                    style={{
                      left: "15px",
                      top: "50%",
                      color: "rgba(255,255,255,0.4)",
                      zIndex: 10,
                    }}
                  >
                    <FaKey />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Nhập mã OTP gồm 6 chữ số"
                    className="custom-input text-white"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    style={{
                      paddingLeft: "45px",
                      letterSpacing: "2px",
                      fontWeight: "bold",
                    }}
                    autoComplete="one-time-code"
                    required
                    disabled={loading}
                  />
                </div>
              </Form.Group>

              {/* New Password */}
              <Form.Group className="mb-3">
                <Form.Label className="custom-label">Mật khẩu mới *</Form.Label>
                <div className="position-relative">
                  <span
                    className="position-absolute translate-middle-y"
                    style={{
                      left: "15px",
                      top: "50%",
                      color: "rgba(255,255,255,0.4)",
                      zIndex: 10,
                    }}
                  >
                    <FaLock />
                  </span>
                  <Form.Control
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    className="custom-input text-white"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ paddingLeft: "45px" }}
                    autoComplete="new-password"
                    required
                    disabled={loading}
                  />
                </div>
              </Form.Group>

              {/* Confirm Password */}
              <Form.Group className="mb-4">
                <Form.Label className="custom-label">
                  Xác nhận mật khẩu mới *
                </Form.Label>
                <div className="position-relative">
                  <span
                    className="position-absolute translate-middle-y"
                    style={{
                      left: "15px",
                      top: "50%",
                      color: "rgba(255,255,255,0.4)",
                      zIndex: 10,
                    }}
                  >
                    <FaLock />
                  </span>
                  <Form.Control
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    className="custom-input text-white"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: "45px" }}
                    autoComplete="new-password"
                    required
                    disabled={loading}
                  />
                </div>
              </Form.Group>

              <Button
                type="submit"
                className="btn-gradient w-100 py-2 font-weight-bold mb-3 d-flex align-items-center justify-content-center gap-2"
                style={{ borderRadius: "12px" }}
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "XÁC NHẬN ĐỔI MẬT KHẨU"
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  className="text-secondary small text-decoration-none p-0 d-flex align-items-center justify-content-center gap-1 mx-auto"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  <FaArrowLeft size={10} /> Quay lại gửi mã OTP
                </Button>
              </div>
            </Form>
          )}

          {/* Links back to login */}
          <div
            className="text-center mt-4 pt-3 border-top border-secondary"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <Link
              to="/login"
              className="text-secondary small text-decoration-none d-flex align-items-center justify-content-center gap-2"
            >
              <FaArrowLeft size={10} /> Quay lại Đăng nhập
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default ForgotPassword;
