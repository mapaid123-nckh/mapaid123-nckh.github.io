import React, { useState } from 'react';
import { supabase } from '../../supabase_client/supabaseClient';
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('login');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (mode === 'signup') {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone_number: phone,
                        email: email,
                        first_attr: '1',
                        permission: 'user',
                    }
                }
            });
            if (error) alert(error.message);
            else {
                alert('Đăng ký thành công! Hãy kiểm tra email.');
                window.location.replace("https://mail.google.com/mail/u/0/");
            }
        } else {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                alert('Thông tin đăng nhập không chính xác. Vui lòng thử lại.');
            } else if (data.user && data.session) {
                localStorage.setItem('supabase_session', JSON.stringify(data.session));
                const user = data.user;
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('permission, first_attr')
                    .eq('id', user.id)
                    .single();
                if (profileError) {
                    console.error("Lỗi lấy thông tin profile:", profileError);
                    navigate('/detail_house');
                } else {
                    if (profile.permission === 'admin') {
                        navigate('/admin', { replace: true });
                    } else {
                        if (profile.first_attr === '1') {
                            navigate('/create_house', { replace: true });
                        } else {
                            navigate('/detail_house', { replace: true });
                        }
                    }
                }
            }
        }
        setLoading(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.nav}>
                <div className="logo-box">
                    <h2 className="brand-name">MapAid</h2>
                </div>
                <div style={styles.navLinks}>
                    <span
                        style={{ ...styles.link, color: mode === 'signup' ? '#3b82f6' : '#666' }}
                        onClick={() => setMode('signup')}
                    >
                        Đăng ký
                    </span>
                    <span
                        style={{ ...styles.link, color: mode === 'login' ? '#3b82f6' : '#666' }}
                        onClick={() => setMode('login')}
                    >
                        Đăng nhập
                    </span>
                </div>
            </div>

            <div style={styles.loginBox}>
                <h2 style={styles.title}>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    {mode === 'signup' && (
                        <>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Họ và tên:</label>
                                <input
                                    type="text"
                                    placeholder="Nhập họ và tên"
                                    style={styles.input}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email:</label>
                        <input
                            type="email"
                            placeholder="example@example.com"
                            style={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {mode === 'signup' && (
                        <>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Số điện thoại:</label>
                                <input
                                    type="tel"
                                    placeholder="+84*** **** ****"
                                    style={styles.input}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password:</label>
                        <div style={styles.passwordWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••"
                                style={styles.passwordInput}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span
                                style={styles.toggleText}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <BsFillEyeSlashFill size={14} /> : <BsFillEyeFill size={14} />}
                            </span>
                        </div>
                    </div>
                    <button style={styles.button} type="submit" disabled={loading}>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: { height: '100vh', backgroundColor: '#f4f7f9', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'sans-serif' },
    nav: { width: '100%', padding: '15px 50px', display: 'flex', gap: '40px', backgroundColor: '#fff', borderBottom: '1px solid #e1e4e8', alignItems: 'center' },
    logo: { color: '#3b82f6', fontWeight: 'bold', fontSize: '18px' },
    navLinks: { display: 'flex', gap: '25px' },
    link: { cursor: 'pointer', fontWeight: '500' },
    loginBox: { marginTop: '80px', backgroundColor: '#ebedfa', padding: '40px', borderRadius: '12px', width: '380px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    title: { textAlign: 'center', color: '#3b82f6', marginBottom: '35px', fontSize: '24px' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { color: '#555', fontSize: '14px', fontWeight: '500' },
    input: { padding: '12px', border: '1px solid #d1d9e6', borderRadius: '6px', outline: 'none' },
    passwordWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    passwordInput: { padding: '12px', paddingRight: '50px', border: '1px solid #d1d9e6', borderRadius: '6px', width: '100%', outline: 'none' },
    toggleText: { position: 'absolute', right: '12px', cursor: 'pointer', fontSize: '12px', color: '#3b82f6', fontWeight: 'bold', userSelect: 'none' },
    button: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }
};