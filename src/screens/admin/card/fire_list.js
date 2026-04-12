import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase_client/supabaseClient';
export default function FireList({ modal, firesList, call, setModal }) {
    const navigate = useNavigate();
    const handleSave = async (item) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error("Người dùng chưa đăng nhập");
            navigate('/');
            return null;
        }
        let status = 'normal';
        if (item.status == 'fire') {
            status = 'pendding';
        }
        const { error } = await supabase
            .from('location')
            .update({
                status: status,
            })
            .eq('id', item.id);
        if (error) {
            console.error('Lỗi khi cập nhật:', error.message)
            return
        }
        if (error) alert(error.message);
        else {
            call();
        }
    }
    return (
        <>
            <div>
                {firesList.map((item) => (
                    <>
                        <div key={item.id} style={{
                            width: '100%',
                            border: `4px solid ${item.status == 'fire' ? '#f40606' : '#f4a106'}`,
                            borderRadius: 20,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '10px 20px',
                            margin: '10px'
                        }}>
                            <h3 style={{ fontWeight: 600, fontSize: 22, color: `${item.status == 'fire' ? '#f40606' : '#f4a106'}` }} >{item.name}</h3>
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <div style={{ width: '75%' }}>
                                    <span style={{ fontWeight: 600, fontSize: 18, color: `${item.status == 'fire' ? '#f40606' : '#f4a106'}` }}>Số điện thoại: <h5 style={{ fontWeight: 400, fontSize: 16, color: `${item.status == 'fire' ? '#f40606' : '#f4a106'}` }}>{item.phone}</h5></span>
                                    <span style={{ fontWeight: 600, fontSize: 18, color: `${item.status == 'fire' ? '#f40606' : '#f4a106'}` }}>Địa chỉ: <h5 style={{ fontWeight: 400, fontSize: 16, color: `${item.status == 'fire' ? '#f40606' : '#f4a106'}` }}>{item.address}</h5></span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                                    <button onClick={() => handleSave(item)} style={{ width: 120, border: `1px solid ${item.status === 'fire' ? '#f40606' : '#f4a106'}`, padding: '10px 10px', borderRadius: 20, background: `${item.status == 'fire' ? '#f40606' : '#f4a106'}`, color: '#ffffff', fontWeight: 600, justifyContent: 'center', display: 'flex' }}>{item.status == 'fire' ? 'Xử lý' : 'Đang xử lý'}</button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <button className='btn-save' onClick={() => { setModal({ ...modal, visible: true, body: item }) }} >Xem thông tin</button>
                            </div>
                        </div >
                    </>
                ))}
            </div>
        </>
    );
}