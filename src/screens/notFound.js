import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Số 404 lớn làm điểm nhấn */}
                <h1 style={styles.errorCode}>404</h1>

                {/* Tiêu đề lỗi */}
                <h2 style={styles.title}>Không Tìm Thấy Trang</h2>

                {/* Đoạn mô tả */}
                <p style={styles.description}>
                    Đường dẫn bạn đang truy cập không tồn tại, đã bị xóa <br />
                    hoặc bạn không có quyền xem nội dung này.
                </p>

                {/* Cụm nút bấm điều hướng */}
                <div style={styles.buttonGroup}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ ...styles.button, ...styles.btnSecondary }}
                    >
                        ← Quay lại trang trước
                    </button>

                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{ ...styles.button, ...styles.btnPrimary }}
                    >
                        Về trang chủ Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

// CSS-in-JS giúp bạn copy chạy ngay không cần cấu hình file CSS riêng lẻ
const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f3f4f6', // Nền xám nhạt hiện đại
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '20px',
    },
    card: {
        textAlign: 'center',
        backgroundColor: '#ffffff',
        padding: '40px 50px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%',
    },
    errorCode: {
        fontSize: '96px',
        fontWeight: '800',
        color: '#ef4444', // Màu đỏ cảnh báo cá tính
        margin: '0 0 10px 0',
        lineHeight: '1',
        letterSpacing: '-0.05em',
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1f2937',
        margin: '0 0 15px 0',
    },
    description: {
        fontSize: '15px',
        color: '#6b7280',
        lineHeight: '1.6',
        margin: '0 0 30px 0',
    },
    buttonGroup: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    button: {
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '600',
        borderRadius: '8px',
        cursor: 'pointer',
        border: 'none',
        transition: 'all 0.2s ease',
    },
    btnPrimary: {
        backgroundColor: '#3b82f6', // Màu xanh chủ đạo
        color: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
    },
    btnSecondary: {
        backgroundColor: '#e5e7eb',
        color: '#374151',
    },
};

export default NotFound;