import React, { useState } from 'react';
import './styles.css';
import defaultAvatar from '../../../access/img/avatar.png';

const ProfileCard = ({ profile, setIsActive }) => {
    const [currentValue, setCurrentValue] = useState('notOnDuty');
    return (
        <>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                <div class="avatar-container">
                    <img src={defaultAvatar} alt="Avatar" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 20 }}><span style={{ fontWeight: 600, fontSize: 24 }}>{profile ? profile.full_name : ''}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', margin: '3px 20px', fontWeight: 600, fontSize: 16 }}>Email: <span style={{ fontWeight: 400, fontSize: 16 }}>{profile ? profile.email : ''}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', margin: '3px 20px', fontWeight: 600, fontSize: 16 }}>Sđt: <span style={{ fontWeight: 400, fontSize: 16 }}>{profile ? profile.phone_number : ''}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', margin: '3px 20px', }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>Trạng thái: </span>
                    <label className="radio-item">
                        <button
                            className='btn-save'
                            style={{
                                fontSize: 14,
                                margin: '5px 10px',
                                backgroundColor: `${currentValue === 'notOnDuty' ? '#3b82f6' : '#06be12'}`
                            }}
                            onClick={() => {
                                if (currentValue === 'onDuty') {
                                    setCurrentValue('notOnDuty');
                                    setIsActive(false);
                                } else {
                                    setCurrentValue('onDuty');
                                    setIsActive(true);
                                }
                            }}><span>{currentValue === "onDuty" ? 'Đang trực' : 'Không trực'}</span></button>
                    </label>
                </div>
            </div>
            <hr />
        </>
    );
};

export default ProfileCard;