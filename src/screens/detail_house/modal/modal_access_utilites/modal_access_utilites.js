import React from 'react';
import './styles.css';
import { BsHouseFill, BsX } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../supabase_client/supabaseClient';

export default function ModalAccessUtilities({ modal, setModal, setCards }) {
    const navigate = useNavigate();
    if (!modal?.visible) return null;
    const handleClose = () => setModal({ ...modal, visible: false });
    const handleOnSave = async () => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error("Người dùng chưa đăng nhập");
            navigate('/');
            return null;
        }
        const userId = user.id;
        const { bedroomLocation, mainDoorNotes, emergencyKitLocation, gasLocation, waterLocation, electricityLocation } = modal.body;
        const { data, error } = await supabase
            .from('AccessUtilities')
            .update({
                bedroomLocation: bedroomLocation || "",
                electricityLocation: electricityLocation || "",
                emergencyKitLocation: emergencyKitLocation || "",
                gasLocation: gasLocation || "",
                mainDoorNotes: mainDoorNotes || "",
                waterLocation: waterLocation || ""
            })
            .eq('idUser', userId);
        if (error) {
            console.error('Lỗi khi cập nhật:', error.message)
            return
        }
        if (error) alert(error.message);
        else {
            setCards(prevCards => prevCards.map(card => card.id === 6 ? { ...card, body: { ...card.body, bedroomLocation, mainDoorNotes, emergencyKitLocation, gasLocation, waterLocation, electricityLocation } } : card));
            setModal({ ...modal, visible: false });
        }
    }
    return (
        <div className="modal-backdrop">
            <div className="modal-window" style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

                <div className="modal-head" style={{ flexShrink: 0 }}>
                    <div className="title-group">
                        <div className="red-badge-small"><BsHouseFill size={18} color="white" /></div>
                        <div>
                            <h2>Lối tiếp cận và tiện ích</h2>
                        </div>
                    </div>
                    <button className="close-x" onClick={handleClose}><BsX size={24} /></button>
                </div>

                <div className="modal-body scroll-y" style={{ flex: 1, overflowY: 'auto', padding: '15px 25px' }}>
                    <form>
                        <div className="input-row flex-column align-items-start border-0">
                            <label className="input-label mb-2 fw-bold">Mô tả các vị trí phòng ngủ:</label>
                            <textarea
                                className="edit-input w-100"
                                rows="2"
                                placeholder="Ví dụ: Cuối lối đi vào nhà..."
                                value={modal.body.bedroomLocation}
                                onChange={(e) => setModal({ ...modal, body: { ...modal.body, bedroomLocation: e.target.value } })}
                            ></textarea>
                        </div>
                        <div className="input-row flex-column align-items-start border-0">
                            <label className="input-label mb-2 fw-bold">Lưu ý về cửa chính:</label>
                            <textarea
                                className="edit-input w-100"
                                rows="2"
                                placeholder="Làm thế nào để mở của chính nhanh nhất"
                                value={modal.body.mainDoorNotes}
                                onChange={(e) => setModal({ ...modal, body: { ...modal.body, mainDoorNotes: e.target.value } })}
                            ></textarea>
                        </div>
                        <div className="input-row flex-column align-items-start border-0">
                            <label className="input-label mb-2 fw-bold">Vị trí về nơi đặt dụng cụ khẩn cấp:</label>
                            <textarea
                                className="edit-input w-100"
                                rows="2"
                                placeholder="Ví dụ: Đặt cách cửa chính 2m phía bên phải hướng từ ngoài vào..."
                                value={modal.body.emergencyKitLocation}
                                onChange={(e) => setModal({ ...modal, body: { ...modal.body, emergencyKitLocation: e.target.value } })}
                            ></textarea>
                        </div>
                        <div className="input-row flex-column align-items-start border-0">
                            <label className="input-label mb-2 fw-bold">Vị trí nơi để gas:</label>
                            <textarea
                                className="edit-input w-100"
                                rows="2"
                                placeholder="Ví dụ: Đặt cách cửa chính 2m phía bên phải hướng từ ngoài vào..."
                                value={modal.body.gasLocation}
                                onChange={(e) => setModal({ ...modal, body: { ...modal.body, gasLocation: e.target.value } })}
                            ></textarea>
                        </div>
                        <div className="input-row flex-column align-items-start border-0">
                            <label className="input-label mb-2 fw-bold">Vị trí cấp nước:</label>
                            <textarea
                                className="edit-input w-100"
                                rows="2"
                                placeholder="Ví dụ: Đặt cách cửa chính 2m phía bên phải hướng từ ngoài vào..."
                                value={modal.body.waterLocation}
                                onChange={(e) => setModal({ ...modal, body: { ...modal.body, waterLocation: e.target.value } })}
                            ></textarea>
                        </div>
                        <div className="input-row flex-column align-items-start border-0">
                            <label className="input-label mb-2 fw-bold">Vị trí cầu dao, ngắt nguồn điện tổng:</label>
                            <textarea
                                className="edit-input w-100"
                                rows="2"
                                placeholder="Ví dụ: Đặt cách cửa chính 2m phía bên phải hướng từ ngoài vào..."
                                value={modal.body.electricityLocation}
                                onChange={(e) => setModal({ ...modal, body: { ...modal.body, electricityLocation: e.target.value } })}
                            ></textarea>
                        </div>
                    </form>
                </div>

                <div className="modal-foot" style={{ flexShrink: 0, borderTop: '1px solid #eee', padding: '15px 25px' }}>
                    <button className="btn-save" onClick={handleOnSave}>Lưu</button>
                    <button className="btn-cancel" onClick={handleClose} style={{ marginLeft: '10px' }}>Thoát</button>
                </div>
            </div>
        </div>
    );
}