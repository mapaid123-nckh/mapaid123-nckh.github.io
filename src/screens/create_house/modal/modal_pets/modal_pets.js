import React from 'react';
import './styles.css';
import { BsX } from "react-icons/bs";

export default function ModalPets({ modal, setModal, onSave }) {
    if (!modal.visible) return null;

    const handleSave = () => {
        if (!modal.type.trim()) {
            alert("Vui lòng điền đầy đủ thông tin loại thú cưng");
            return;
        } else {
            if (modal.cardId) {
                onSave(modal.cardId, modal.type, modal.description);
            } else {
                const newId = null;
                onSave(newId, modal.type, modal.description);
            }

            setModal({ ...modal, visible: false });
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-window">
                <div className="modal-head">
                    <div className="title-group">
                        <h2>Thêm thông tin thú cưng</h2>
                    </div>
                    <button className="close-x" onClick={() => setModal({ ...modal, visible: false })}>
                        <BsX size={28} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="input-row">
                        <label className="input-label">Loại thú cưng</label>
                        <input type="text" className="custom-input" placeholder="Nhập loại thú cưng" value={modal.type}
                            onChange={(e) => setModal({ ...modal, type: e.target.value })} />
                    </div>

                    <div className="input-row flex-column align-items-start border-0">
                        <label className="input-label mb-2 fw-bold">Mô tả:</label>
                        <textarea className="edit-input w-100" rows="2" placeholder="Ví dụ: hình dáng, tập tính..." value={modal.description}
                            onChange={(e) => setModal({ ...modal, description: e.target.value })}></textarea>
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