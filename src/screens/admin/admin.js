import React, { useEffect, useState, useRef } from 'react';
import './styles.css';
import { supabase } from '../../supabase_client/supabaseClient';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GoongMapAdmin from '../../components/map/map_admin';
import ProfileCard from './card/avatar';
import FireList from './card/fire_list';
import ModalViewInfo from './modal/modal_view_info';
export default function Admin() {
    const navigate = useNavigate();
    const [idProvince, setIdProvince] = useState();
    const [userId, setUserId] = useState();
    const [profile, setProfile] = useState();
    const [constructionList, setConstructionList] = useState();
    const [modal, setModal] = useState({
        visible: false,
    });
    const [fireList, setFireList] = useState({
        "type": "FeatureCollection",
        "features": []
    });
    const [firesList, setFiresList] = useState([]);
    const [data, setData] = useState({
        visible: false,
        type: '',
        address: '',
        tempCoords: [105.8342, 21.0278]
    });
    const [isActive, setIsActive] = useState(false);
    const GOONG_API_KEY = "koA4zOCziXX7lcqeKlLR5Vm2xczHKXEeFYG6HjOU";

    const constructionToGeoJSON = (rawArray) => {
        return {
            "type": "FeatureCollection",
            "features": rawArray.map((item, index) => ({
                "type": "Feature",
                "id": index,
                "geometry": {
                    "type": "Point",
                    "coordinates": item.location
                },
                "properties": {
                    "name": `${item.name}`,
                    "address": `${item.address}`,
                }
            }))
        };
    };

    const fetchAllConstruction = async () => {
        try {
            const results = await Promise.all([
                supabase.from('location').select('*').eq('id_province', idProvince),
                supabase.from('profiles').select('*').eq('id', userId).single(),
            ]);
            const errors = results.filter(res => res.error && res.error.code !== 'PGRST116');
            if (errors.length > 0) {
                console.error("Lỗi khi lấy dữ liệu:", errors.map(e => e.error.message));
                return null;
            }
            const [locationRes, profileRes] = results;


            const normalList = [];
            const fireList = [];
            if (locationRes.data.length != 0) {
                locationRes.data.forEach(item => {
                    if (item.status === "normal") normalList.push(item);
                    else fireList.push(item);
                });
                setProfile(profileRes.data);
                setConstructionList(constructionToGeoJSON(normalList));
                setFireList(constructionToGeoJSON(fireList));
                setFiresList(fireList);
            }


        } catch (err) {
            console.error("Lỗi hệ thống khi fetch:", err.message);
            return null;
        }
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

    const verifyUserPermission = async () => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) return { isAllowed: false, message: "Chưa đăng nhập" };

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setUserId(user.id);
            if (profileError || !profile) {
                console.error("Lỗi truy vấn profile:", profileError);
                navigate('/');
            }

            setIdProvince(profile.id_province);
            const isUser = profile.permission === 'admin';
            const hasZeroPermission = profile.first_attr === '0';

            if (isUser) {
                navigate('/admin');
            } else if (hasZeroPermission) {
                navigate('/detail_house');
            } else {
                navigate('/create_house');
            }

        } catch (err) {
            console.error("Lỗi hệ thống:", err.message);
            return { isAllowed: false, error: err.message };
        }
    };

    useEffect(() => {
        verifyUserPermission();
    }, []);
    useEffect(() => {
        if (idProvince) {
            setTimeout(() => { fetchAllConstruction() }, 1000)
        }
    }, [idProvince]);

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                fetchAllConstruction();
            }, 7000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const [tabs, setTabs] = useState([
        { id: 1, label: 'Thông tin', body: {} },
        { id: 2, label: 'Thông tin nhà', body: [] },
        { id: 3, label: 'Liên hệ khác', body: {} },
        { id: 4, label: 'Người cần trợ giúp', body: [] },
        { id: 5, label: 'Thú cưng', body: [] },
        { id: 6, label: 'Lỗi tiếp cận và bảo mật', body: {} },
    ]);

    const fetchAllEmergencyData = async () => {

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                console.error("Người dùng chưa đăng nhập");
                navigate('/');
                return null;
            }
            const userId = modal.body.idUser;
            const results = await Promise.all([
                supabase.from('profiles').select('*').eq('id', userId).single(),
                supabase.from('AccessUtilities').select('*').eq('idUser', userId).single(),
                supabase.from('contacts').select('*').eq('iduser', userId).single(),
                supabase.from('functionalneeds').select('*').eq('iduser', userId),
                supabase.from('HouseInfo').select('*').eq('iduser', userId).single(),
                supabase.from('pets').select('*').eq('iduser', userId),
            ]);
            const errors = results.filter(res => res.error && res.error.code !== 'PGRST116');
            if (errors.length > 0) {
                console.error("Lỗi khi lấy dữ liệu:", errors.map(e => e.error.message));
                return null;
            }
            const [
                profileRes,
                accessRes,
                contactsRes,
                needsRes,
                houseRes,
                petsRes
            ] = results;

            setTabs(prev => prev.map(tab => {
                if (tab.id === 1) {
                    return { ...tab, body: { name: profileRes.data.full_name, email: profileRes.data.email, phone: profileRes.data.phone_number } };
                } else if (tab.id === 2) {
                    return { ...tab, body: { member: houseRes.data.memberCount, isApartment: houseRes.data.isApartment, hasElevator: houseRes.data.hasElevator, hasSprinkler: houseRes.data.hasSprinkler, hasSmokeAlarm: houseRes.data.hasSmokeAlarm, hasPool: houseRes.data.hasPool, hasBasement: houseRes.data.hasBasement, safePointDescription: houseRes.data.safePointDescription, ownership: houseRes.data.ownership, otherHazards: houseRes.data.otherHazards }, content: `Residents under 18: ${houseRes.data.residentsUnder18}. Sprinkler: ${houseRes.data.hasSprinkler === '1' ? 'Yes' : 'No'}` };
                } else if (tab.id === 3) {
                    return { ...tab, body: contactsRes.data.contact_list || [] };
                } else if (tab.id === 4) {
                    return { ...tab, body: needsRes.data || [] };
                } else if (tab.id === 6) {
                    return { ...tab, body: accessRes.data || {} };
                } else if (tab.id === 5) {
                    return { ...tab, body: petsRes.data || [] };
                }
                return tab;
            }));
        } catch (err) {
            console.error("Lỗi hệ thống khi fetch:", err.message);
            return null;
        }
    };
    useEffect(() => {
        if (modal.body) {
            fetchAllEmergencyData();
        }
    }, [modal]);
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Lỗi khi đăng xuất:', error.message);
        } else {
            navigate('/');
        }
    };
    return (
        <div className="admin-layout">
            <header className="top-nav">
                <div className="nav-content">
                    <div className="logo-box">
                        <h2 className="brand-name">MapAid</h2>
                    </div>

                    <div className="nav-right-group" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={handleLogout} className="logout-btn">
                            <span className="material-icons">Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </header>
            <main className="admin-content">
                <div className="admin-sidebar">
                    <div className="card profile-section">
                        <ProfileCard profile={profile} setIsActive={setIsActive} />
                    </div>

                    <div className="card list-section">
                        <h3 className="section-title">Danh sách sự cố</h3>
                        <FireList modal={modal} firesList={firesList} call={fetchAllConstruction} setModal={setModal} />
                    </div>
                </div>

                <section className="admin-map-area">
                    <div className="map-wrapper">
                        <GoongMapAdmin
                            apiKey="PwwC5OR9BJ8gFYjkBCpWd25zTd8HpikORpsbozyh"
                            center={data.tempCoords}
                            onMapClick={handleMapClick}
                            constructionList={constructionList}
                            fireList={fireList}
                            webApiKey="koA4zOCziXX7lcqeKlLR5Vm2xczHKXEeFYG6HjOU"
                        />
                    </div>
                </section>
            </main>
            {modal.visible && <ModalViewInfo modal={modal} setModal={setModal} tabs={tabs} />}
        </div>
    );
}
