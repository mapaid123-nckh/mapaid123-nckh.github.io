import React from 'react';
import './styles.css';
import { BsX } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../supabase_client/supabaseClient';

export default function ModalPets({ modal, setModal, card, setCards }) {
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
                array.push({ ...newItem });
            }
            return array;
        };
        const { id, type, description } = modal.body;
        if (id) {
            const newCardBody = upsertMember(card.body, modal.body);
            const { data, error } = await supabase
                .from('pets')
                .update({
                    type: type,
                    description: description,
                })
                .eq('id', id);
            if (error) {
                console.error('Lỗi khi cập nhật:', error.message)
                return
            }
            if (error) alert(error.message);
            else {
                setCards(prevCards => prevCards.map(card => card.id === 5 ? { ...card, body: newCardBody } : card));
                setModal({ ...modal, visible: false });
            }
        } else {
            const { data, error } = await supabase
                .from('pets')
                .upsert({
                    iduser: userId,
                    type: type,
                    description: description,
                }).select();
            if (error) {
                console.error('Lỗi khi cập nhật:', error.message)
                return
            }
            if (error) alert(error.message);
            else {
                setCards(prevCards => prevCards.map(card => card.id === 5 ? { ...card, body: upsertMember(card.body, data[0]) } : card));
                setModal({ ...modal, visible: false });
            }
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
                        <label className="input-label">Loại thú cưng</label>
                        <input
                            type="text"
                            className="custom-input"
                            placeholder="Nhập loại thú cưng"
                            value={modal.body.type}
                            onChange={(e) => setModal({ ...modal, body: { ...modal.body, type: e.target.value } })}
                        />
                    </div>

                    <div className="input-row flex-column align-items-start border-0">
                        <label className="input-label mb-2 fw-bold">Mô tả:</label>
                        <textarea
                            className="edit-input w-100"
                            rows="2"
                            placeholder="Ví dụ: hình dáng, tập tính..."
                            value={modal.body.description}
                            onChange={(e) => setModal({ ...modal, body: { ...modal.body, description: e.target.value } })}
                        ></textarea>
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