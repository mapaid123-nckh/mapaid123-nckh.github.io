import React from 'react';
import './styles.css';

export default function CardsHouseInfo({ card, handleEdit }) {
    return (
        <div key={card.id} className="info-card">
            <div className="card-header-row">
                <div className="red-badge">
                    <span className="material-icons">{card.icon}</span>
                </div>
                <h3 className="card-title-text">{card.title}</h3>
            </div>
            <div className="card-main-content scroll-y">
                <div><span style={{ fontWeight: 600 }}>Số người trên 18 tuổi: </span>{card.body.member || 0} người</div>
                <div><span style={{ fontWeight: 600 }}>Căn hộ chung cư: </span>{card.body.isApartment ? "Có" : "Không"}</div>
                <div><span style={{ fontWeight: 600 }}>Nhà có thang máy: </span>{card.body.hasElevator ? "Có" : "Không"}</div>
                <div><span style={{ fontWeight: 600 }}>Hệ thống chữa cháy tự động (Sprinkler): </span>{card.body.hasSprinkler ? "Có" : "Không"}</div>
                <div><span style={{ fontWeight: 600 }}>Hệ thống báo khói kết nối với PCCC: </span>{card.body.hasSmokeAlarm ? "Có" : "Không"}</div>
                <div><span style={{ fontWeight: 600 }}>Nhà có bể bơi: </span>{card.body.hasPool ? "Có" : "Không"}</div>
                <div><span style={{ fontWeight: 600 }}>Nhà có tầng hầm: </span>{card.body.hasBasement ? "Có" : "Không"}</div>
                <div><span style={{ fontWeight: 600 }}>Mô tả điểm tập kết an toàn: </span>{card.body.safePointDescription || " "}</div>
                <div><span style={{ fontWeight: 600 }}>Hình thức sở hữu: </span>{card.body.ownership === "Own" ? "Chính chủ" : "Thuê nhà"}</div>
                <div><span style={{ fontWeight: 600 }}>Các nguy hiểm khác cần lưu ý cho cứu hộ: </span>{card.body.otherHazards || "Không có nguy hiểm đặc biệt"}</div>
            </div>
            <div className="card-footer-action">
                <button className="blue-edit-btn" onClick={() => handleEdit(card)}>Sửa</button>
            </div>
        </div>
    );
}