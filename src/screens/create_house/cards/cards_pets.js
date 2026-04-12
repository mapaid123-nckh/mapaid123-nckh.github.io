import React, { useState, useEffect, useContext } from 'react';
import './styles.css';
import { BsPencilFill, BsFillTrashFill } from "react-icons/bs";
import ModalPets from '../modal/modal_pets/modal_pets';
import { AuthContext } from '../../../AuthContext';

export default function CardsPets({ setCardId }) {
    const [modal, setModal] = React.useState({ visible: false, cardId: null, type: '', description: '' });
    const [dataPets, setDataPets] = useState([]);
    const { profile, updateProfileState } = useContext(AuthContext);

    useEffect(() => {
        if (profile && profile.pets) {
            setDataPets(profile.pets);
        }
    }, []);

    const handleDeletePets = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa thú cưng này không?")) {
            const newData = dataPets.filter(item => item.id !== id);
            setDataPets(newData);
        }
    };

    const handleSavePets = (id, newType, newDescription) => {
        if (id === null) {
            setDataPets([...dataPets, { id: Date.now().toString(), type: newType, description: newDescription }]);
        } else {
            const newData = dataPets.map(item => {
                if (item.id === id) {
                    return { ...item, type: newType, description: newDescription };
                }
                return item;
            });
            setDataPets(newData);
        }
    };

    const handleBtnSave = () => {
        const newPets = [...dataPets];
        updateProfileState({ pets: newPets });
        setCardId(5);
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
                    <h3 className="card-title-text">Thông tin thú cưng</h3>
                </div>
                <div className="card-main-content scroll-y">
                    {dataPets.map((pets) => (
                        <React.Fragment key={pets.id}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div><span style={{ fontWeight: 600 }}>{pets.type || "Không có thông tin"}</span></div>

                                    <div><div style={{ fontWeight: 600 }}>Mô tả: </div>{pets.description && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '30px' }}>
                                            <span>•</span>
                                            <span>{pets.description}</span>
                                        </div>
                                    )}</div>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <button className="edit-x" onClick={() => {
                                        setModal({ visible: true, cardId: pets.id, type: pets.type, description: pets.description });
                                    }}>
                                        <BsPencilFill size={17} />
                                    </button>
                                    <button
                                        className="close-x"
                                        onClick={() => handleDeletePets(pets.id)}
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
                        setModal({ visible: true, cardId: null, type: '', description: '' });
                    }}>Thêm</button>
                </div>
                <div>
                    <div className="modal-foot" style={{ flexShrink: 0, borderTop: '1px solid #eee', padding: '15px 25px' }}>
                        <button className="btn-cancel" onClick={() => setCardId(3)}>Quay lại</button>
                        <button className="btn-save" onClick={handleBtnSave}>Tiếp theo</button>
                    </div>
                </div>
            </div>
            {modal.visible && <ModalPets modal={modal} setModal={setModal} onSave={handleSavePets} />}
        </div>
    );
}