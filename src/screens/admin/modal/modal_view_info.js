import React, { useState } from 'react';
import './styles.css'; // Import file CSS ở trên

import TabMyInfo from '../tab/tab_my_info';
import TabHouseInfo from '../tab/tab_house_info';
import TabContact from '../tab/tab_contact';
import TabFuntionalNeeds from '../tab/tab_funtional_needs';
import TabPets from '../tab/tab_pets';
import TabAccessUilities from '../tab/tab_acces_uilities';


const ModalTabs = ({ modal, setModal, tabs }) => {
    const [activeTab, setActiveTab] = useState(0);
    if (!modal.visible) return null;
    console.log('modal', modal);
    return (
        <div className="modal-overlay">
            <div className="modal-container" style={{ maxWidth: '840px', maxHeight: '70vh', height: '70vh' }}>
                <div className="modal-header" style={{ flexDirection: 'column' }}>
                    <div className="header-top">
                        <h3>Thông tin nơi xảy ra vụ cháy</h3>
                    </div>
                    <div className="tab-nav" style={{ width: '100%' }}>
                        {tabs.map((tab, idx) => (
                            <button
                                key={idx}
                                className={`tab-button ${activeTab === idx ? 'active' : ''}`}
                                onClick={() => setActiveTab(idx)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="modal-body">
                    <div className="tab-content-box">
                        {tabs[activeTab].id === 1 && (<TabMyInfo dataTab={tabs[activeTab].body} />)}
                        {tabs[activeTab].id === 2 && (<TabHouseInfo dataTab={tabs[activeTab].body} />)}
                        {tabs[activeTab].id === 3 && (<TabContact dataTab={tabs[activeTab].body} />)}
                        {tabs[activeTab].id === 4 && (<TabFuntionalNeeds dataTab={tabs[activeTab].body} />)}
                        {tabs[activeTab].id === 5 && (<TabPets dataTab={tabs[activeTab].body} />)}
                        {tabs[activeTab].id === 6 && (<TabAccessUilities dataTab={tabs[activeTab].body} />)}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setModal({ ...modal, visible: false })}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default ModalTabs;