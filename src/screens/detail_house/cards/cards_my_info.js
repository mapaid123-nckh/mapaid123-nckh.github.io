import React from 'react';
import './styles.css';

export default function CardsMyInfo({ card, handleEdit }) {

    return (
        <div key={card.id} className="info-card">
            <div className="card-header-row">
                <div className="red-badge">
                    <span className="material-icons">{card.icon}</span>
                </div>
                <h3 className="card-title-text">{card.title}</h3>
            </div>
            <div className="card-main-content scroll-y">
                <div><span style={{ fontWeight: 600 }}>Họ tên: </span>{card.body.name}</div>
                <div><span style={{ fontWeight: 600 }}>Email: </span>{card.body.email}</div>
                <div><span style={{ fontWeight: 600 }}>Số điện thoại: </span>{card.body.phone}</div>
            </div>

            <div className="card-footer-action">
                <button className="blue-edit-btn" onClick={() => handleEdit(card)}>Sửa</button>
            </div>
        </div>
    );
}