import React from 'react';
import './styles.css';
import { BsPencilFill, BsFillTrashFill } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase_client/supabaseClient';
export default function CardsFunctionalNeeds({ card, handleEdit, setCards }) {
    const navigate = useNavigate();
    const handleDeleteFunctionalNeeds = async (id) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error("Người dùng chưa đăng nhập");
            navigate('/');
            return null;
        }
        const newData = card.body.filter(item => item.id !== id)
        const { data, error } = await supabase
            .from('functionalneeds')
            .delete()
            .eq('id', id);
        if (error) {
            console.error('Lỗi khi cập nhật:', error.message)
            return
        }
        if (error) alert(error.message);
        else {
            setCards(prevCards => prevCards.map(card => card.id === 4 ? { ...card, body: newData } : card));
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
                {card.body.map((needs) => (
                    <React.Fragment key={needs.id}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div><span style={{ fontWeight: 600 }}>{needs.name || "Không có thông tin"}</span></div>
                                <div><span style={{ fontWeight: 600 }}>Tuổi: </span>{needs.age || ""}</div>
                                <div><div style={{ fontWeight: 600 }}>Nhu cầu hỗ trợ: </div>{needs.needs_list && needs.needs_list.length > 0
                                    ? needs.needs_list
                                        .filter(item => item.checked)
                                        .map(item => <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '30px' }}>
                                            <span>•</span>
                                            <span>{item.text}</span>
                                        </div>)
                                    : "Không có thông tin"
                                }</div>
                                <div><div style={{ fontWeight: 600 }}>Tình trạng: </div>{needs.status && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '30px' }}>
                                        <span>•</span>
                                        <span>{needs.status}</span>
                                    </div>
                                )}</div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <button className="edit-x" onClick={() => {
                                    handleEdit({ ...card, visible: true, cardId: needs.id, body: { ...needs, name: needs.name, age: needs.age, functional_needs: needs.needs_list, status: needs.status } });
                                }}>
                                    <BsPencilFill size={17} />
                                </button>
                                <button
                                    className="close-x"
                                    onClick={() => handleDeleteFunctionalNeeds(needs.id)}
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
                <button className="blue-edit-btn" onClick={() => handleEdit({
                    ...card, visible: true, cardId: '', body: {
                        id: '', name: '', age: '', functional_needs: [
                            { id: 1, text: 'Khiếm thính / Nghe kém', type: 'hearing', checked: false },
                            { id: 2, text: 'Suy giảm thị lực / Khiếm thị', type: 'vision', checked: false },
                            { id: 3, text: 'Alzheimer / Sa sút trí tuệ', type: 'cognitive', checked: false },
                            { id: 4, text: 'Tự kỷ', type: 'behavioral', checked: false },
                            { id: 5, text: 'Khó di chuyển', type: 'mobility', checked: false },
                        ], status: ''
                    }
                })}> Thêm người</button>
            </div>
        </div >
    );
}