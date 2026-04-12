import React, { useState, useContext, useEffect } from 'react';
import './styles.css';
import { BsHouseFill } from "react-icons/bs";
import { AuthContext } from '../../../../AuthContext';

export default function ModalAccessUtilities({ setCardId }) {
    const [bedroomLocation, setBedroomLocation] = useState('');
    const [mainDoorNotes, setMainDoorNotes] = useState('');
    const [emergencyKitLocation, setEmergencyKitLocation] = useState('');
    const [gasLocation, setGasLocation] = useState('');
    const [waterLocation, setWaterLocation] = useState('');
    const [electricityLocation, setElectricityLocation] = useState('');
    const { profile, updateProfileState } = useContext(AuthContext);

    useEffect(() => {
        if (profile) {
            const existingAccessUtilities = profile.accessUtilities || {};
            setBedroomLocation(existingAccessUtilities.bedroomLocation || '');
            setMainDoorNotes(existingAccessUtilities.mainDoorNotes || '');
            setEmergencyKitLocation(existingAccessUtilities.emergencyKitLocation || '');
            setGasLocation(existingAccessUtilities.gasLocation || '');
            setWaterLocation(existingAccessUtilities.waterLocation || '');
            setElectricityLocation(existingAccessUtilities.electricityLocation || '');
        }
    }, []);

    const handleBtnSave = () => {
        const newAccessUtilities = {
            bedroomLocation: bedroomLocation,
            mainDoorNotes: mainDoorNotes,
            emergencyKitLocation: emergencyKitLocation,
            gasLocation: gasLocation,
            waterLocation: waterLocation,
            electricityLocation: electricityLocation
        };
        updateProfileState({ accessUtilities: newAccessUtilities });
        setCardId(6);
    }

    return (
        <div style={{
            width: '100 %',
            display: 'flex',
            justifyContent: 'center',
            margin: '20px 0'
        }} >
            <div className="modal-window" style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

                <div className="modal-head" style={{ flexShrink: 0 }}>
                    <div className="title-group">
                        <div className="red-badge-small"><BsHouseFill size={18} color="white" /></div>
                        <div>
                            <h2>Lối tiếp cận và tiện ích</h2>
                        </div>
                    </div>
                </div>

                <div className="modal-body scroll-y" style={{ flex: 1, overflowY: 'auto', padding: '15px 25px' }}>
                    <form>
                        <div className="input-row flex-column align-items-start border-0">
                            <label className="input-label mb-2 fw-bold">Mô tả các vị trí phòng ngủ:</label>
                            <textarea className="edit-input w-100" rows="2" placeholder="Ví dụ: Cuối lối đi vào nhà..." name="bedroomLocation" value={bedroomLocation} onChange={(e) => setBedroomLocation(e.target.value)}></textarea>
                        </div>
                        <div className="input-row flex-column align-items-start border-0">
                            <label className="input-label mb-2 fw-bold">Lưu ý về cửa chính:</label>
                            <textarea className="edit-input w-100" rows="2" placeholder="Làm thế nào để mở của chính nhanh nhất" name="mainDoorNotes" value={mainDoorNotes} onChange={(e) => setMainDoorNotes(e.target.value)}   ></textarea>
                        </div>
                        <div className="input-row flex-column align-items-start border-0">
                            <label className="input-label mb-2 fw-bold">Vị trí về nơi đặt dụng cụ khẩn cấp:</label>
                            <textarea className="edit-input w-100" rows="2" placeholder="Ví dụ: Đặt cách cửa chính 2m phía bên phải hướng từ ngoài vào..." name="emergencyKitLocation" value={emergencyKitLocation} onChange={(e) => setEmergencyKitLocation(e.target.value)}></textarea>
                        </div>
                        <div className="input-row flex-column align-items-start border-0">
                            <label className="input-label mb-2 fw-bold">Vị trí nơi để gas:</label>
                            <textarea className="edit-input w-100" rows="2" placeholder="Ví dụ: Đặt cách cửa chính 2m phía bên phải hướng từ ngoài vào..." name="gasLocation" value={gasLocation} onChange={(e) => setGasLocation(e.target.value)}></textarea>
                        </div>
                        <div className="input-row flex-column align-items-start border-0">
                            <label className="input-label mb-2 fw-bold">Vị trí cấp nước:</label>
                            <textarea className="edit-input w-100" rows="2" placeholder="Ví dụ: Đặt cách cửa chính 2m phía bên phải hướng từ ngoài vào..." name="waterLocation" value={waterLocation} onChange={(e) => setWaterLocation(e.target.value)} ></textarea>
                        </div>
                        <div className="input-row flex-column align-items-start border-0">
                            <label className="input-label mb-2 fw-bold">Vị trí cầu dao, ngắt nguồn điện tổng:</label>
                            <textarea className="edit-input w-100" rows="2" placeholder="Ví dụ: Đặt cách cửa chính 2m phía bên phải hướng từ ngoài vào..." name="electricityLocation" value={electricityLocation} onChange={(e) => setElectricityLocation(e.target.value)} ></textarea>
                        </div>
                    </form>
                </div>

                <div>
                    <div className="modal-foot" style={{ flexShrink: 0, borderTop: '1px solid #eee', padding: '15px 25px' }}>
                        <button className="btn-cancel" onClick={() => setCardId(4)} >Quay lại</button>
                        <button className="btn-save" onClick={handleBtnSave} >Tiếp theo</button>
                    </div>
                </div>
            </div>
        </div>
    );
}