import React from 'react';
import './styles.css';
import { BsX } from "react-icons/bs";

export default function ModalContact({ modal, setModal, onSave }) {
    if (!modal.visible) return null;

    const handleSave = () => {
        if (!modal.name.trim() || !modal.phone.trim()) {
            alert("Vui lòng điền đầy đủ thông tin");
            return;
        } else {
            if (modal.cardId) {
                onSave(modal.cardId, modal.name, modal.phone);
            } else {
                const newId = null;
                onSave(newId, modal.name, modal.phone);
            }

            setModal({ ...modal, visible: false });
        }

    };
    return (
        <div className="modal-backdrop">
            <div className="modal-window">
                <div className="modal-head">
                    <div className="title-group">
                        <h2>{modal.cardId ? 'Chỉnh sửa thông tin liên lạc' : 'Thêm thông tin liên lạc'}</h2>
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
                            value={modal.name}
                            onChange={(e) => setModal({ ...modal, name: e.target.value })}
                        />
                    </div>

                    <div className="input-row">
                        <label className="input-label">Số điện thoại</label>
                        <input
                            type="text"
                            className="custom-input"
                            placeholder="+84*** **** ****"
                            value={modal.phone}
                            onChange={(e) => setModal({ ...modal, phone: e.target.value })}
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