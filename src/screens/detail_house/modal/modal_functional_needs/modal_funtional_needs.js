import React from 'react';
import './styles.css';
import { BsX } from "react-icons/bs";
import CheckedList from '../../../../components/Checked_List/checked_list';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../supabase_client/supabaseClient';
export default function ModalFunctionalNeeds({ modal, setModal, card, setCards }) {
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
        const { id, name, age, status, functional_needs } = modal.body;
        if (id) {
            const newModalBody = { ...modal.body, needs_list: functional_needs };
            const newCardBody = upsertMember(card.body, newModalBody);
            const { data, error } = await supabase
                .from('functionalneeds')
                .update({
                    name: name,
                    age: parseInt(age) || 0,
                    status: status || "",
                    needs_list: functional_needs,
                })
                .eq('id', id);
            if (error) {
                console.error('Lỗi khi cập nhật:', error.message)
                return
            }
            if (error) alert(error.message);
            else {
                setCards(prevCards => prevCards.map(card => card.id === 4 ? { ...card, body: newCardBody } : card));
                setModal({ ...modal, visible: false });
            }
        } else {
            const { data, error } = await supabase
                .from('functionalneeds')
                .upsert({
                    iduser: userId,
                    name: name,
                    age: parseInt(age) || 0,
                    status: status || "",
                    needs_list: functional_needs,
                }).select();
            if (error) {
                console.error('Lỗi khi cập nhật:', error.message)
                return
            }
            if (error) alert(error.message);
            else {
                setCards(prevCards => prevCards.map(card => card.id === 4 ? { ...card, body: upsertMember(card.body, data[0]) } : card));
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
                        <label className="input-label">Họ và tên</label>
                        <input
                            type="text"
                            className="custom-input"
                            placeholder="Nhập họ và tên"
                            value={modal.body.name}
                            onChange={(e) => setModal({ ...modal, body: { ...modal.body, name: e.target.value } })}
                        />
                    </div>

                    <div className="input-row">
                        <label className="input-label">Tuổi</label>
                        <input
                            type="text"
                            className="custom-input"
                            placeholder="Nhập tuổi"
                            value={modal.body.age}
                            onChange={(e) => setModal({ ...modal, body: { ...modal.body, age: e.target.value } })}
                        />
                    </div>
                    <div className="card-main-content scroll-y">
                        <label className="input-label">Danh sách kiểm tra:</label>
                        <CheckedList items={modal.body.functional_needs} onChange={(needs) => {
                            setModal({ ...modal, body: { ...modal.body, functional_needs: needs } })
                        }} />
                    </div>
                    <div className="input-row flex-column align-items-start border-0">
                        <label className="input-label mb-2 fw-bold">Có thông tin nào khác chúng tôi nên biết về tình trạng của người này không?</label>
                        <textarea
                            className="edit-input w-100"
                            rows="2"
                            placeholder=""
                            value={modal.body.status}
                            onChange={(e) => setModal({ ...modal, body: { ...modal.body, status: e.target.value } })} >
                        </textarea>
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