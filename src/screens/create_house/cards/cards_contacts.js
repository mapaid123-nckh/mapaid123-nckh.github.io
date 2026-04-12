import React, { useEffect, useState, useContext } from 'react';
import './styles.css';
import { BsPencilFill, BsFillTrashFill } from "react-icons/bs";
import ModalContact from '../modal/modal_contact/modal_contact';
import { AuthContext } from '../../../AuthContext';

export default function CardsConTacts({ setCardId }) {
    const [modal, setModal] = React.useState({ visible: false, cardId: null, name: '', phone: '' });
    const [dataContacts, setDataContacts] = useState([]);
    const { profile, updateProfileState } = useContext(AuthContext);

    useEffect(() => {
        if (profile && profile.contacts) {
            setDataContacts(profile.contacts);
        }
    }, []);

    const handleDeleteContacts = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa liên lạc này không?")) {
            const newData = dataContacts.filter(item => item.id !== id);
            setDataContacts(newData);
        }
    };

    const handleSaveContacts = (id, newName, newPhone) => {
        if (id === null) {
            setDataContacts([...dataContacts, { id: Date.now().toString(), name: newName, phone: newPhone }]);
        } else {
            const newData = dataContacts.map(item => {
                if (item.id === id) {
                    return { ...item, name: newName, phone: newPhone };
                }
                return item;
            });
            setDataContacts(newData);
        }
    };

    const handleBtnSave = () => {
        const newContacts = [...dataContacts];
        updateProfileState({ contacts: newContacts });
        setCardId(3);
    }

    return (
        <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            margin: '20px 0',
        }} >
            <div className="info-card" style={{ width: 500, height: 600 }}>
                <div className="card-header-row">
                    <h3 className="card-title-text">Thông tin liên lạc</h3>
                </div>
                <div className="card-main-content scroll-y">
                    {dataContacts.map((contact) => (
                        <React.Fragment key={contact.id}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div><span style={{ fontWeight: 600 }}>{contact.name || "Không có thông tin"}</span></div>
                                    <div><span style={{ fontWeight: 600 }}>SĐT: </span>{contact.phone || "Không có thông tin"}</div>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <button className="edit-x" onClick={() => {
                                        setModal({ visible: true, cardId: contact.id, name: contact.name, phone: contact.phone })
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
                    <button className="blue-edit-btn" onClick={() => {
                        setModal({ visible: true, cardId: null, name: '', phone: '' });
                    }}>
                        Thêm
                    </button>
                </div>
                <div>
                    <div className="modal-foot" style={{ flexShrink: 0, borderTop: '1px solid #eee', padding: '15px 25px' }}>
                        <button className="btn-cancel" onClick={() => setCardId(1)}>Quay lại</button>
                        <button className="btn-save" onClick={handleBtnSave}>Tiếp theo</button>
                    </div>
                </div>
            </div>

            {modal.visible && <ModalContact modal={modal} setModal={setModal} onSave={handleSaveContacts} />}
        </div>
    );
}