import React from 'react';
import './styles.css';

export default function CardsAccessUilities({ card, handleEdit }) {
    return (
        <div key={card.id} className="info-card">
            <div className="card-header-row">
                <div className="red-badge">
                    <span className="material-icons">{card.icon}</span>
                </div>
                <h3 className="card-title-text">{card.title}</h3>
            </div>
            <div className="card-main-content scroll-y">
                <div><span style={{ fontWeight: 600 }}>Mô tả vị trí phòng ngủ: </span><p>{card.body.bedroomLocation || "Không có mô tả"}</p></div>
                <div><span style={{ fontWeight: 600 }}>Lưu ý về của chính: </span><p>{card.body.mainDoorNotes || "Không có lưu ý đặc biệt"}</p></div>
                <div><span style={{ fontWeight: 600 }}>Vị trí nơi đặt dụng cụ khẩn cấp: </span><p>{card.body.emergencyKitLocation || ""}</p></div>
                <div><span style={{ fontWeight: 600 }}>Vị trí nơi để gas: </span><p>{card.body.gasLocation || ""}</p></div>
                <div><span style={{ fontWeight: 600 }}>Vị trí cấp nước: </span><p>{card.body.waterLocation || ""}</p></div>
                <div><span style={{ fontWeight: 600 }}>Vị trí đặt cầu dao, ngắt nguồn điện tổng: </span><p>{card.body.electricityLocation || ""}</p></div>
            </div>
            <div className="card-footer-action">
                <button className="blue-edit-btn" onClick={() => handleEdit(card)}>Sửa</button>
            </div>
        </div>
    );
}