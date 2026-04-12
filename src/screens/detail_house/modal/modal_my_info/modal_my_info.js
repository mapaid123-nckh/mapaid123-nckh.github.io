import React from 'react';
import './styles.css';
// import locationData from '../../access/locations.json';
import { BsX } from "react-icons/bs";
import { supabase } from '../../../../supabase_client/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function ModalMyInfo({ modal, setModal, setCards }) {
    const navigate = useNavigate();
    // const [selectedCityId, setSelectedCityId] = useState("");
    // const [wards, setWards] = useState([]);
    // const [selectedWardId, setSelectedWardId] = useState("");

    // 2. Hàm xử lý logic chọn Thành phố -> Lọc Xã
    // const handleCityChange = (e) => {
    //     const cityId = e.target.value;
    //     setSelectedCityId(cityId);
    //     setSelectedWardId(""); // Reset xã khi đổi tỉnh

    //     if (cityId) {
    //         const city = locationData.cities.find(c => c.id === cityId);
    //         setWards(city ? city.wards : []);
    //     } else {
    //         setWards([]);
    //     }
    // };

    // const handleWardChange = (e) => {
    //     setSelectedWardId(e.target.value);
    // };

    if (!modal.visible) return null;
    const handleOnSave = async () => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error("Người dùng chưa đăng nhập");
            navigate('/');
            return null;
        }
        const userId = user.id;
        const { name, phone } = modal.body;
        const { data, error } = await supabase
            .from('profiles') // Thay 'profiles' bằng tên bảng của bạn
            .update({
                full_name: name,
                phone_number: phone
            })
            .eq('id', userId);
        if (error) {
            console.error('Lỗi khi cập nhật:', error.message)
            return
        }
        if (error) alert(error.message);
        else {
            setCards(prevCards => prevCards.map(card => card.id === 1 ? { ...card, body: { ...card.body, name, phone } } : card));
            setModal({ ...modal, visible: false });
        }
    }
    return (
        <div className="modal-backdrop">
            <div className="modal-window">
                <div className="modal-head">
                    <div className="title-group">
                        <h2>{modal.title}</h2>
                    </div>
                    <button className="close-x" onClick={() => setModal({ ...modal, visible: false })}>
                        <BsX size={28} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="input-row">
                        <label className="input-label">Họ và tên</label>
                        <input type="text" className="custom-input" placeholder="Nhập họ và tên" name="name" value={modal.body.name} onChange={(e) => setModal({ ...modal, body: { ...modal.body, name: e.target.value } })} />
                    </div>

                    <div className="input-row">
                        <label className="input-label">Email</label>
                        <input disabled type="email" className="custom-input" placeholder="example@example.com" name="email" value={modal.body.email} onChange={(e) => setModal({ ...modal, email: e.target.value })} />
                    </div>

                    <div className="input-row">
                        <label className="input-label">Số điện thoại</label>
                        <input type="text" className="custom-input" placeholder="+84*** **** ****" name="phone" value={modal.body.phone} onChange={(e) => setModal({ ...modal, body: { ...modal.body, phone: e.target.value } })} />
                    </div>

                    {/* <div className="input-row">
                        <label className="input-label">Tỉnh / Thành phố</label>
                        <div className="custom-select-wrapper">
                            <select
                                className="custom-combobox"
                                value={selectedCityId}
                                onChange={handleCityChange}
                            >
                                <option value="">-- Chọn tỉnh/ thành phố --</option>
                                {locationData.cities.map(city => (
                                    <option key={city.id} value={city.id}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                            <BsChevronDown className="select-arrow-icon" />
                        </div>
                    </div> */}

                    {/* <div className="input-row">
                        <label className="input-label">Xã / Phường</label>
                        <div className="custom-select-wrapper">
                            <select
                                className="custom-combobox"
                                value={selectedWardId}
                                onChange={handleWardChange}
                                disabled={!selectedCityId}
                            >
                                <option value="">-- Chọn xã/ phường --</option>
                                {wards.map(ward => (
                                    <option key={ward.id} value={ward.id}>
                                        {ward.name}
                                    </option>
                                ))}
                            </select>
                            <BsChevronDown className="select-arrow-icon" />
                        </div>
                    </div> */}


                    <div className="modal-foot">
                        <button className="btn-save" onClick={handleOnSave}>Lưu</button>
                        <button className="btn-cancel" onClick={() => setModal({ ...modal, visible: false })}>Thoát</button>
                    </div>
                </div>
            </div>
        </div>
    );
}