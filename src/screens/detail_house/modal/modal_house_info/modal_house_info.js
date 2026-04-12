import React, { useEffect, useState } from 'react';
import './styles.css';
import { BsHouseFill, BsX } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../supabase_client/supabaseClient';

export default function ModalHouseInfo({ modal, setModal, setCards }) {
    const navigate = useNavigate();
    const [member, setMember] = useState(0);
    const [isApartment, setIsApartment] = useState("0");
    const [hasElevator, setHasElevator] = useState("0");
    const [hasSprinkler, setHasSprinkler] = useState("0");
    const [hasSmokeAlarm, setHasSmokeAlarm] = useState("0");
    const [hasPool, setHasPool] = useState("0");
    const [hasBasement, setHasBasement] = useState("0");
    const [safePointDescription, setSafePointDescription] = useState("");
    const [ownership, setOwnership] = useState("Own");
    const [otherHazards, setOtherHazards] = useState("");

    useEffect(() => {
        setMember(modal.body.member);
        setIsApartment(modal.body.isApartment ? "1" : "0");
        setHasElevator(modal.body.hasElevator ? "1" : "0");
        setHasSprinkler(modal.body.hasSprinkler ? "1" : "0");
        setHasSmokeAlarm(modal.body.hasSmokeAlarm ? "1" : "0");
        setHasPool(modal.body.hasPool ? "1" : "0");
        setHasBasement(modal.body.hasBasement ? "1" : "0");
        setSafePointDescription(modal.body.safePointDescription);
        setOwnership(modal.body.ownership);
        setOtherHazards(modal.body.otherHazards);
    }, [modal.body])

    if (!modal?.visible) return null;
    const handleClose = () => setModal({ ...modal, visible: false });

    const renderRadioRow = (label, name, currentValue, setValue) => (
        <div className="input-row">
            <label className="input-label">{label}</label>
            <div className="radio-group">
                <label className="radio-item">
                    <input
                        type="radio"
                        name={name}
                        value={"1"}
                        checked={currentValue === "1"}
                        onChange={(e) => setValue(e.target.value)}
                    />
                    <span>CÓ</span>
                </label>
                <label className="radio-item">
                    <input
                        type="radio"
                        name={name}
                        value={"0"}
                        checked={currentValue === "0"}
                        onChange={(e) => setValue(e.target.value)}
                    />
                    <span>KHÔNG</span>
                </label>
            </div>
        </div>
    );
    const handleSave = async () => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error("Người dùng chưa đăng nhập");
            navigate('/');
            return null;
        }
        const userId = user.id;
        const { data, error } = await supabase
            .from('HouseInfo')
            .update({
                isApartment: isApartment === "1",
                hasBasement: hasBasement === "1",
                hasElevator: hasElevator === "1",
                hasPool: hasPool === "1",
                hasSmokeAlarm: hasSmokeAlarm === "1",
                hasSprinkler: hasSprinkler === "1",
                memberCount: parseInt(member),
                ownership: ownership,
                otherHazards: otherHazards,
                safePointDescription: safePointDescription,
            })
            .eq('iduser', userId);
        if (error) {
            console.error('Lỗi khi cập nhật:', error.message)
            return
        }
        if (error) alert(error.message);
        else {
            setCards(prevCards => prevCards.map(card => card.id === 2 ? { ...card, body: { ...card.body, member, isApartment: isApartment === "1", hasBasement: hasBasement === "1", hasElevator: hasElevator === "1", hasSprinkler: hasSprinkler === "1", hasSmokeAlarm: hasSmokeAlarm === "1", hasPool: hasPool === "1", safePointDescription, ownership, otherHazards } } : card));
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
                            <h2>Thông tin hộ gia đình</h2>
                        </div>
                    </div>
                    <button className="close-x" onClick={handleClose}><BsX size={24} /></button>
                </div>

                <div className="modal-body scroll-y" style={{ flex: 1, overflowY: 'auto', padding: '15px 25px' }}>
                    <form>
                        <div className="input-row" style={{ justifyContent: 'space-between' }}>
                            <label className="input-label">Số người cư trú dưới 18 tuổi?</label>
                            <input type="number" className="custom-input" style={{ width: '100px' }} defaultValue="0" value={member} onChange={(e) => setMember(e.target.value)} />
                        </div>
                        {renderRadioRow("Đây có phải là căn hộ chung cư?", "isApartment", isApartment, setIsApartment)}
                        {renderRadioRow("Nhà có thang máy không?", "hasElevator", hasElevator, setHasElevator)}
                        {renderRadioRow("Có hệ thống chữa cháy tự động (Sprinkler)?", "hasSprinkler", hasSprinkler, setHasSprinkler)}
                        {renderRadioRow("Có hệ thống báo khói kết nối với PCCC?", "hasSmokeAlarm", hasSmokeAlarm, setHasSmokeAlarm)}
                        {renderRadioRow("Nhà có bể bơi không?", "hasPool", hasPool, setHasPool)}
                        {renderRadioRow("Nhà có tầng hầm không?", "hasBasement", hasBasement, setHasBasement)}
                        <div className="input-row flex-column align-items-start border-0">
                            <label className="input-label mb-2 fw-bold">Mô tả điểm tập kết an toàn (nếu có):</label>
                            <textarea className="edit-input w-100" rows="2" placeholder="Ví dụ: Cuối lối đi vào nhà..." value={safePointDescription} onChange={(e) => setSafePointDescription(e.target.value)}></textarea>
                        </div>

                        <div className="input-row">
                            <label className="input-label">Hình thức sở hữu:</label>
                            <div className="radio-group">
                                <label className="radio-item">
                                    <input type="radio" name="ownership" value="Own" checked={ownership === 'Own'} onChange={(e) => setOwnership(e.target.value)} />
                                    <span>Chính chủ</span>
                                </label>
                                <label className="radio-item">
                                    <input type="radio" name="ownership" value="Rent" checked={ownership === 'Rent'} onChange={(e) => setOwnership(e.target.value)} />
                                    <span>Thuê nhà</span>
                                </label>
                            </div>
                        </div>

                        <div className="input-row flex-column align-items-start mt-2 border-0">
                            <label className="input-label mb-2 text-danger fw-bold">Các nguy hiểm khác cần lưu ý cho cứu hộ:</label>
                            <textarea className="edit-input w-100" style={{ borderColor: '#f8d7da', marginBottom: '10px' }} rows="2" value={otherHazards} onChange={(e) => setOtherHazards(e.target.value)}></textarea>
                        </div>
                    </form>
                </div>

                <div className="modal-foot" style={{ flexShrink: 0, borderTop: '1px solid #eee', padding: '15px 25px' }}>
                    <button className="btn-save" onClick={handleSave}>Lưu</button>
                    <button className="btn-cancel" onClick={handleClose} style={{ marginLeft: '10px' }}>Thoát</button>
                </div>
            </div>
        </div>
    );
}