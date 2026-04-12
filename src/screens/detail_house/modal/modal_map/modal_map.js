import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './styles.css';
import GoongMap from '../../../../components/map/map';
import { BsSearch, BsGeoAlt, BsMap, BsChevronDown } from "react-icons/bs";
import locationData from '../../../../access/locations.json';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../supabase_client/supabaseClient';

export default function ModalMap({ modal, setModal, setCards, profile }) {
    const [address, setAddress] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggest, setShowSuggest] = useState(false);
    const [wards, setWards] = useState([]);
    const handleClose = () => setModal({ ...modal, visible: false });
    const handleCityChange = (e) => {
        const cityId = e.target.value;
        setModal({ ...modal, body: { ...modal.body, id_province: cityId, id_wards: '' } });
        if (cityId) {
            const city = locationData.cities.find(c => { return c.Code === cityId });
            setWards(city ? city.Wards : []);
        } else {
            setWards([]);
        }
    };
    useEffect(() => {
        if (modal.body.id_province) {
            const city = locationData.cities.find(c => { return c.Code === modal.body.id_province });
            setWards(city ? city.Wards : []);
        } else {
            setWards([]);
        }
        setData({ ...data, tempCoords: modal.body.location, address: modal.body.address })
    }, [])
    const handleWardChange = (e) => {
        setModal({ ...modal, body: { ...modal.body, id_wards: e.target.value } });
    };
    const navigate = useNavigate();
    const [data, setData] = useState({
        visible: false,
        type: '',
        address: '',
        tempCoords: [105.8342, 21.0278]
    });

    const typingTimeoutRef = useRef(null);
    const GOONG_API_KEY = "koA4zOCziXX7lcqeKlLR5Vm2xczHKXEeFYG6HjOU";

    const fetchSuggestions = (input) => {
        setAddress(input);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (input.length > 0) {
            typingTimeoutRef.current = setTimeout(async () => {
                try {
                    const response = await axios.get('https://rsapi.goong.io/Place/Autocomplete', {
                        params: {
                            api_key: GOONG_API_KEY,
                            input: input,
                            location: `${data.tempCoords[1]},${data.tempCoords[0]}`
                        }
                    });
                    if (response.data?.predictions) {
                        setSuggestions(response.data.predictions);
                        setShowSuggest(true);
                    }
                } catch (err) {
                    console.error("Lỗi gợi ý:", err.message);
                }
            }, 500);
        } else {
            setSuggestions([]);
            setShowSuggest(false);
        }
    };

    const selectSearchAddress = async (place_id) => {
        setShowSuggest(false);
        try {
            const response = await axios.get('https://rsapi.goong.io/Place/Detail', {
                params: { place_id, api_key: GOONG_API_KEY }
            });
            if (response.data?.result) {
                const { lng, lat } = response.data.result.geometry.location;
                const formattedAddress = response.data.result.formatted_address;

                setAddress(formattedAddress);
                setData({
                    type: 'search',
                    address: formattedAddress,
                    tempCoords: [lng, lat]
                });
                setModal({ ...modal, body: { ...modal.body, location: [lng, lat] } });
            }
        } catch (err) { console.error("Lỗi chi tiết:", err.message); }
    };


    const handleMapClick = async (e) => {
        if (!e.lngLat) return;
        const { lng, lat } = e.lngLat;

        setData(prev => ({
            ...prev,
            type: 'click',
            address: 'Đang lấy địa chỉ...',
            tempCoords: [lng, lat]
        }));
        setModal({ ...modal, body: { ...modal.body, location: [lng, lat] } });
        try {
            const response = await axios.get('https://rsapi.goong.io/Geocode', {
                params: { latlng: `${lat},${lng}`, api_key: GOONG_API_KEY }
            });
            if (response.data?.results?.[0]) {
                setData(prev => ({
                    ...prev,
                    address: response.data.results[0].formatted_address
                }));
            }
        } catch (err) {
            console.error("Lỗi:", err.message);
        }
    };

    const handleSave = async () => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error("Người dùng chưa đăng nhập");
            navigate('/');
            return null;
        }
        const { error } = await supabase
            .from('location')
            .update({
                location: modal.body.location || [],
                id_province: modal.body.id_province || "",
                id_wards: modal.body.id_wards || "",
                status: 'normal',
                phone: profile.body.phone,
                address: address,
                name: profile.body.name
            })
            .eq('id', modal.body.id);
        if (error) {
            console.error('Lỗi khi cập nhật:', error.message)
            return
        }
        if (error) alert(error.message);
        else {
            setCards(prevCards => prevCards.map(card => card.id === 7 ? {
                ...card, body: {
                    ...card.body,
                    location: modal.body.location || [],
                    id_province: modal.body.id_province || "",
                    id_wards: modal.body.id_wards || "",
                }
            } : card));
            setModal({ ...modal, visible: false });
        }
    }
    return (
        <div className="modal-backdrop">
            <div className="modal-window" style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh', maxWidth: '90vw' }}>
                <div className="google-map-container">
                    <div className="floating-search-panel">
                        <div className="search-input-group">
                            <input
                                type="text"
                                className="google-input"
                                placeholder="Tìm kiếm hoặc chấm vào bản đồ"
                                value={address}
                                onChange={(e) => fetchSuggestions(e.target.value)}
                                onFocus={() => address.length > 0 && setShowSuggest(true)}
                            />
                            <button className="search-btn"><BsSearch /></button>
                        </div>

                        {showSuggest && suggestions.length > 0 && (
                            <ul className="suggestion-list">
                                {suggestions.map((item) => (
                                    <li key={item.place_id} onClick={() => selectSearchAddress(item.place_id)}>
                                        <BsGeoAlt className="icon-geo" />
                                        <div className="text-info">
                                            <span className="main-text">{item.structured_formatting.main_text}</span>
                                            <span className="sub-text">{item.structured_formatting.secondary_text}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="floating-comfirm-panel">
                        <div className="comfirm-input-group">
                            <div className="confirm-modal" style={{ width: '100%', marginLeft: 10 }} onClick={e => e.stopPropagation()}>
                                <div className="modal-header" style={{ justifyContent: 'flex-start', alignItems: 'center', margin: '10px 0' }}>
                                    {data.type === 'search' ? <BsGeoAlt size={24} color="#db4437" /> : <BsMap size={24} color="#4285f4" />}
                                    <h5 style={{ margin: '0 0 0 12px' }}>
                                        {data.type === 'search' ? 'Xác nhận địa chỉ search' : 'Xác nhận điểm đã chọn'}
                                    </h5>
                                </div>
                                <div className="modal-body">
                                    <h6 style={{ fontWeight: 600 }}>Bạn có muốn chọn vị trí này?</h6>
                                    <div className="address-box" style={{ color: "#db4437" }}>
                                        <strong>{data.address}</strong>
                                    </div>
                                    <div className="input-row">
                                        <label className="input-label">Tỉnh / Thành phố</label>
                                        <div className="custom-select-wrapper">
                                            <select
                                                className="custom-combobox"
                                                value={modal.body.id_province}
                                                onChange={handleCityChange}
                                            >
                                                <option value="">-- Chọn tỉnh/ thành phố --</option>
                                                {locationData.cities.map(city => (
                                                    <option key={city.Code} value={city.Code}>
                                                        {city.Name}
                                                    </option>
                                                ))}
                                            </select>
                                            <BsChevronDown className="select-arrow-icon" />
                                        </div>
                                    </div>
                                    <div className="input-row">
                                        <label className="input-label">Xã / Phường</label>
                                        <div className="custom-select-wrapper">
                                            <select
                                                className="custom-combobox"
                                                value={modal.body.id_wards}
                                                onChange={handleWardChange}
                                                disabled={!modal.body.id_province}
                                            >
                                                <option value="">-- Chọn xã/ phường --</option>
                                                {wards.map(ward => (
                                                    <option key={ward.Code} value={ward.Code}>
                                                        {ward.Name}
                                                    </option>
                                                ))}
                                            </select>
                                            <BsChevronDown className="select-arrow-icon" />
                                        </div>
                                    </div>
                                    <small className="coord-text">
                                        Tọa độ: {data.tempCoords[0].toFixed(6)}, {data.tempCoords[1].toFixed(6)}
                                    </small>
                                </div>
                                <div className="modal-foot" style={{ flexShrink: 0, borderTop: '1px solid #eee', padding: '15px 25px' }}>
                                    <button className="btn-save" onClick={handleSave} >Lưu</button>
                                    <button className="btn-cancel" style={{ marginLeft: '10px' }} onClick={handleClose} >Thoát</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="map-view">
                        <GoongMap
                            apiKey="PwwC5OR9BJ8gFYjkBCpWd25zTd8HpikORpsbozyh"
                            center={data.tempCoords}
                            onClick={handleMapClick}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

