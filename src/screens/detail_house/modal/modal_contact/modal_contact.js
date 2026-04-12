import React from 'react';
import './styles.css';
import { BsX } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../supabase_client/supabaseClient';

export default function ModalContact({ modal, setModal, card }) {
    const navigate = useNavigate();
    if (!modal.visible) return null;
    const handleSave = async () => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error("Người dùng chưa đăng nhập");
            navigate('/');
            return null;
        }
        const userId = user.id;
        const upsertMember = (array, newItem) => {
            const index = array.findIndex(item => item.id === newItem.id);
            if (index !== -1) {
                array[index] = { ...array[index], ...newItem };
            } else {
                array.push({ ...newItem, id: Date.now().toString() });
            }
            return array;
        };
        const { data, error } = await supabase
            .from('contacts')
            .update({
                contact_list: upsertMember(card.body, modal.body),
            })
            .eq('iduser', userId);
        if (error) {
            console.error('Lỗi khi cập nhật:', error.message)
            return
        }
        if (error) alert(error.message);
        else {
            setModal({ ...modal, visible: false });
        }

    }
    return (
        <div className="modal-backdrop">
            <div className="modal-window">
                <div className="modal-head">
                    <div className="title-group">
                        <h2>{modal.title}</h2>
                    </div>
                    <button className="close-x" onClick={() => setModal({ ...modal, visible: false })}>
                        <BsX size={28} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="input-row">
                        <label className="input-label">Họ và tên</label>
                        <input type="text" className="custom-input"
                            placeholder="Nhập họ và tên"
                            value={modal.body.name}
                            onChange={(e) => setModal({ ...modal, body: { ...modal.body, name: e.target.value } })}
                        />
                    </div>

                    <div className="input-row">
                        <label className="input-label">Số điện thoại</label>
                        <input
                            type="text"
                            className="custom-input"
                            placeholder="+84*** **** ****"
                            value={modal.body.phone}
                            onChange={(e) => setModal({ ...modal, body: { ...modal.body, phone: e.target.value } })}
                        />
                    </div>

                    <div className="modal-foot">
                        <button className="btn-save" onClick={handleSave}>Lưu</button>
                        <button className="btn-cancel" onClick={() => setModal({ ...modal, visible: false })}>Thoát</button>
                    </div>
                </div>
            </div>
        </div>
    );
}