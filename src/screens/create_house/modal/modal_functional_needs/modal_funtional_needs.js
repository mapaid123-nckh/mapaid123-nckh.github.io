import React, { useEffect, useState } from 'react'; // Thêm useState
import './styles.css';
import { BsX } from "react-icons/bs";
import CheckedList from '../../../../components/Checked_List/checked_list';

export default function ModalFunctionalNeeds({ modal, setModal, onSave }) {

    const [formData, setFormData] = useState({
        needs: [
            { id: 1, text: 'Khiếm thính / Nghe kém', type: 'hearing', checked: false },
            { id: 2, text: 'Suy giảm thị lực / Khiếm thị', type: 'vision', checked: false },
            { id: 3, text: 'Alzheimer / Sa sút trí tuệ', type: 'cognitive', checked: false },
            { id: 4, text: 'Tự kỷ', type: 'behavioral', checked: false },
            { id: 5, text: 'Khó di chuyển', type: 'mobility', checked: false },
        ]
    });

    useEffect(() => {
        if (modal.functional_needs && modal.functional_needs.length > 0) {
            setFormData({ needs: modal.functional_needs });
        }
    }, [])

    if (!modal.visible) return null;

    const handleSave = () => {
        if (!modal.name.trim() || !modal.age.trim()) {
            alert("Vui lòng điền đầy đủ thông tin tên và tuổi");
            return;
        } else {
            if (modal.cardId) {
                onSave(modal.cardId, modal.name, modal.age, modal.functional_needs, modal.additionalInfo);
            } else {
                const newId = null;
                onSave(newId, modal.name, modal.age, modal.functional_needs, modal.additionalInfo);
            }

            setModal({ ...modal, visible: false });
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-window">
                <div className="modal-head">
                    <div className="title-group">
                        <h2>Thêm người cần hỗ trợ</h2>
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
                            name="name"
                            className="custom-input"
                            placeholder="Nhập họ và tên"
                            value={modal.name}
                            onChange={(e) => setModal({ ...modal, name: e.target.value })}
                        />
                    </div>

                    <div className="input-row">
                        <label className="input-label">Tuổi</label>
                        <input
                            type="text"
                            name="age"
                            className="custom-input"
                            placeholder="Nhập tuổi"
                            value={modal.age}
                            onChange={(e) => setModal({ ...modal, age: e.target.value })}
                        />
                    </div>

                    <div className="card-main-content scroll-y">
                        <label className="input-label">Danh sách kiểm tra:</label>
                        <CheckedList items={formData.needs} onChange={(needs) => {
                            setModal({ ...modal, functional_needs: needs })
                        }} />
                    </div>

                    <div className="input-row flex-column align-items-start border-0">
                        <label className="input-label mb-2 fw-bold">Có thông tin nào khác không?</label>
                        <textarea
                            name="additionalInfo"
                            className="edit-input w-100"
                            rows="2"
                            value={modal.additionalInfo}
                            onChange={(e) => setModal({ ...modal, additionalInfo: e.target.value })}
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