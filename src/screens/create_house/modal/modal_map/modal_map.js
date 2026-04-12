import React, { useState, useRef, useContext } from 'react';
import axios from 'axios';
import './styles.css';
import GoongMap from '../../../../components/map/map';
import { BsSearch, BsGeoAlt, BsMap, BsChevronDown } from "react-icons/bs";
import { AuthContext } from '../../../../AuthContext';
import { supabase } from '../../../../supabase_client/supabaseClient';
import { useNavigate } from 'react-router-dom';
import locationData from '../../../../access/locations.json';

export default function ModalMap({ setCardId }) {
    const navigate = useNavigate();
    const [data, setData] = useState({
        visible: false,
        type: '',
        address: '',
        tempCoords: [105.8342, 21.0278],
        id_province: '',
        id_wards: '',
    });
    const [address, setAddress] = useState("");
    const [coords] = useState([105.8342, 21.0278]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggest, setShowSuggest] = useState(false);
    const { profile } = useContext(AuthContext);
    const typingTimeoutRef = useRef(null);
    const GOONG_API_KEY = "koA4zOCziXX7lcqeKlLR5Vm2xczHKXEeFYG6HjOU";
    const [wards, setWards] = useState([]);
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
                            location: `${coords[1]},${coords[0]}`
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
    const handleCityChange = (e) => {
        const cityId = e.target.value;
        setData({ ...data, id_province: cityId, id_wards: '' });
        if (cityId) {
            const city = locationData.cities.find(c => { return c.Code === cityId });
            setWards(city ? city.Wards : []);
        } else {
            setWards([]);
        }
    };
    const handleWardChange = (e) => {
        setData({ ...data, id_wards: e.target.value });
    };
    const saveAllEmergencyData = async () => {
        const { accessUtilities, contacts, functional_needs, houseInfo, pets } = profile;

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                alert("Vui lòng đăng nhập để lưu thông tin!");
                return;
            }

            const userId = user.id;

            const results = await Promise.all([

                supabase
                    .from('profiles')
                    .update({ first_attr: "0" })
                    .eq('id', userId),

                supabase.from('AccessUtilities').upsert({
                    idUser: userId,
                    location: data.tempCoords,
                    bedroomLocation: accessUtilities.bedroomLocation || "",
                    electricityLocation: accessUtilities.electricityLocation || "",
                    emergencyKitLocation: accessUtilities.emergencyKitLocation || "",
                    gasLocation: accessUtilities.gasLocation || "",
                    mainDoorNotes: accessUtilities.mainDoorNotes || "",
                    waterLocation: accessUtilities.waterLocation || ""
                }),

                supabase.from('contacts').upsert({
                    iduser: userId,
                    contact_list: contacts
                }),

                supabase.from('functionalneeds').upsert(
                    functional_needs.map(person => ({
                        iduser: userId,
                        name: person.name,
                        age: parseInt(person.age) || 0,
                        status: person.status || "",
                        needs_list: person.functional_needs
                    }))
                ),

                supabase.from('HouseInfo').upsert({
                    iduser: userId,
                    isApartment: houseInfo.isApartment === "1",
                    hasBasement: houseInfo.hasBasement === "1",
                    hasElevator: houseInfo.hasElevator === "1",
                    hasPool: houseInfo.hasPool === "1",
                    hasSmokeAlarm: houseInfo.hasSmokeAlarm === "1",
                    hasSprinkler: houseInfo.hasSprinkler === "1",
                    memberCount: parseInt(houseInfo.member) || 1,
                    ownership: houseInfo.ownership || "",
                    otherHazards: houseInfo.otherHazards || "",
                    safePointDescription: houseInfo.safePointDescription || ""
                }),

                supabase.from('pets').upsert(
                    pets.map(pet => ({
                        iduser: userId,
                        type: pet.type,
                        description: pet.description || "",
                    }))
                ),

                supabase.from('location').upsert({
                    idUser: userId,
                    location: data.tempCoords || [],
                    id_province: data.id_province || "",
                    id_wards: data.id_wards || "",
                    status: 'normal',
                    phone: user.user_metadata.phone_number || '',
                    address: data.address,
                    name: user.user_metadata.full_name || '',
                })
            ]);

            const errors = results.filter(res => res.error);
            if (errors.length > 0) {
                console.error("Lỗi chi tiết:", errors.map(e => e.error.message));
                alert("Có lỗi xảy ra trong quá trình lưu dữ liệu.");
            } else {
                alert("Tất cả thông tin và hồ sơ cá nhân đã được cập nhật thành công!");
                navigate('/detail_house');
            }

        } catch (err) {
            console.error("Lỗi hệ thống:", err.message);
            alert("Không thể kết nối tới máy chủ.");
        }
    };

    return (
        <div style={{
            width: '100 %',
            display: 'flex',
            justifyContent: 'center',
            margin: '20px 0'
        }} >
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
                                        <label className="input-label">Tỉnh / Thành phố </label>
                                        <div className="custom-select-wrapper">
                                            <select
                                                className="custom-combobox"
                                                value={data.id_province}
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
                                                value={data.id_wards}
                                                onChange={handleWardChange}
                                                disabled={!data.id_province}
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
                                        Tọa độ: {data.tempCoords[1].toFixed(6)}, {data.tempCoords[0].toFixed(6)}
                                    </small>
                                </div>
                                <div>
                                    <div className="modal-foot" style={{ flexShrink: 0, borderTop: '1px solid #eee', padding: '15px 25px' }}>
                                        <button className="btn-cancel" onClick={() => setCardId(5)}>Quay lại</button>
                                        <button className="btn-save" onClick={saveAllEmergencyData}>Hoàn thành</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="map-view">
                        <GoongMap
                            apiKey="PwwC5OR9BJ8gFYjkBCpWd25zTd8HpikORpsbozyh"
                            center={data.tempCoords}
                            onMapClick={handleMapClick}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

