import React, { useEffect, useState, useContext } from 'react';
import './styles.css';
import { BsPencilFill, BsFillTrashFill } from "react-icons/bs";
import { AuthContext } from '../../../AuthContext';
import ModalFunctionalNeeds from '../modal/modal_functional_needs/modal_funtional_needs';

export default function CardsFunctionalNeeds({ setCardId }) {
    const [modal, setModal] = React.useState({ visible: false, cardId: null, name: '', age: '', functional_needs: [], status: '' });
    const [dataFunctionalNeeds, setDataFunctionalNeeds] = useState([]);
    const { profile, updateProfileState } = useContext(AuthContext);

    useEffect(() => {
        if (profile && profile.functional_needs) {
            setDataFunctionalNeeds(profile.functional_needs);
        }
    }, []);

    const handleDeleteFunctionalNeeds = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa nhu cầu hỗ trợ này không?")) {
            const newData = dataFunctionalNeeds.filter(item => item.id !== id);
            setDataFunctionalNeeds(newData);
        }
    };

    const handleSaveFunctionalNeeds = (id, newName, newAge, newFunctionalNeeds, newStatus) => {
        if (id === null) {
            setDataFunctionalNeeds([...dataFunctionalNeeds, { id: Date.now().toString(), name: newName, age: newAge, functional_needs: newFunctionalNeeds, status: newStatus }]);
        } else {
            const newData = dataFunctionalNeeds.map(item => {
                if (item.id === id) {
                    return { ...item, name: newName, age: newAge, functional_needs: newFunctionalNeeds, status: newStatus };
                }
                return item;
            });
            setDataFunctionalNeeds(newData);
        }
    };

    const handleBtnSave = () => {
        const newFunctionalNeeds = [...dataFunctionalNeeds];
        updateProfileState({ functional_needs: newFunctionalNeeds });
        setCardId(4);
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
                    <h3 className="card-title-text">Thông tin người cần hỗ trợ</h3>
                </div>
                <div className="card-main-content scroll-y">
                    {dataFunctionalNeeds.map((need) => (
                        <React.Fragment key={need.id}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div><span style={{ fontWeight: 600 }}>{need.name || "Không có thông tin"}</span></div>
                                    <div><span style={{ fontWeight: 600 }}>Tuổi: </span>{need.age || ""}</div>
                                    <div><div style={{ fontWeight: 600 }}>Nhu cầu hỗ trợ: </div>{need.functional_needs && need.functional_needs.length > 0
                                        ? need.functional_needs
                                            .filter(item => item.checked)
                                            .map(item => <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '30px' }}>
                                                <span>•</span>
                                                <span>{item.text}</span>
                                            </div>)
                                        : "Không có thông tin"
                                    }</div>
                                    <div><div style={{ fontWeight: 600 }}>Tình trạng: </div>{need.status && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '30px' }}>
                                            <span>•</span>
                                            <span>{need.status}</span>
                                        </div>
                                    )}</div>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <button className="edit-x" onClick={() => {
                                        setModal({ visible: true, cardId: need.id, name: need.name, age: need.age, functional_needs: need.functional_needs, status: need.status });
                                    }}>
                                        <BsPencilFill size={17} />
                                    </button>
                                    <button
                                        className="close-x"
                                        onClick={() => handleDeleteFunctionalNeeds(need.id)}
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
                        setModal({ visible: true, cardId: null, name: '', age: '', functional_needs: [], status: '' });
                    }}>Thêm</button>
                </div>
                <div>
                    <div className="modal-foot" style={{ flexShrink: 0, borderTop: '1px solid #eee', padding: '15px 25px' }}>
                        <button className="btn-cancel" onClick={() => setCardId(2)}>Quay lại</button>
                        <button className="btn-save" onClick={handleBtnSave}>Tiếp theo</button>
                    </div>
                </div>
            </div>
            {modal.visible && <ModalFunctionalNeeds modal={modal} setModal={setModal} onSave={handleSaveFunctionalNeeds} />}
        </div >
    );
}