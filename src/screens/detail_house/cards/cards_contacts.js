import React from 'react';
import './styles.css';
import { BsPencilFill, BsFillTrashFill } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase_client/supabaseClient';
export default function CardsConTacts({ card, handleEdit, setCards }) {
    const navigate = useNavigate();
    const handleDeleteContacts = async (id) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error("Người dùng chưa đăng nhập");
            navigate('/');
            return null;
        }
        const newData = card.body.filter(item => item.id !== id)
        const userId = user.id;
        const { data, error } = await supabase
            .from('contacts')
            .update({
                contact_list: newData,
            })
            .eq('iduser', userId);
        if (error) {
            console.error('Lỗi khi cập nhật:', error.message)
            return
        }
        if (error) alert(error.message);
        else {
            setCards(prevCards => prevCards.map(card => card.id === 3 ? { ...card, body: newData } : card));
        }

    }
    return (
        <div key={card.id} className="info-card">
            <div className="card-header-row">
                <div className="red-badge">
                    <span className="material-icons">{card.icon}</span>
                </div>
                <h3 className="card-title-text">{card.title}</h3>
            </div>
            <div className="card-main-content scroll-y">
                {card.body.map((contact) => (
                    <React.Fragment key={contact.id}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div><span style={{ fontWeight: 600 }}>{contact.name || "Không có thông tin"}</span></div>
                                <div><span style={{ fontWeight: 600 }}>SĐT: </span>{contact.phone || "Không có thông tin"}</div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <button className="edit-x" onClick={() => {
                                    handleEdit({ ...card, visible: true, cardId: contact.id, body: { ...contact } })
                                }}>
                                    <BsPencilFill size={17} />
                                </button>
                                <button
                                    className="close-x"
                                    onClick={() => handleDeleteContacts(contact.id)}
                                >
                                    <BsFillTrashFill size={17} color="red" />
                                </button>
                            </div>
                        </div>
                        <hr style={{ margin: 0 }} />
                    </React.Fragment>
                ))}
            </div>
            <div className="card-footer-action">
                <button className="blue-edit-btn" onClick={() => handleEdit({ ...card, body: { name: '', phone: '' } })}>Thêm</button>
            </div>
        </div>
    );
}