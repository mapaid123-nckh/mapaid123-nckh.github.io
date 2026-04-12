import React, { useState, useEffect } from 'react';
import './styles.css';
import ModalHouseInfo from './modal/modal_house_info/modal_house_info';
import { supabase } from '../../supabase_client/supabaseClient';
import { useNavigate } from 'react-router-dom';
import CardsConTacts from './cards/cards_contacts';
import CardsFunctionalNeeds from './cards/cards_funtional_needs';
import CardsPets from './cards/cards_pets';
import ModalAccessUtilities from './modal/modal_access_utilites/modal_access_utilites';
import ModalMap from './modal/modal_map/modal_map';

function CreateHouse() {
    const navigate = useNavigate();
    const [cardId, setCardId] = useState(1);

    const verifyUserPermission = async () => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) return { isAllowed: false, message: "Chưa đăng nhập" };

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('first_attr, permission')
                .eq('id', user.id)
                .single();

            if (profileError || !profile) {
                console.error("Lỗi truy vấn profile:", profileError);
                navigate('/');
            }

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
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) navigate('/');
        };
        checkUser();
    }, [navigate]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Lỗi khi đăng xuất:', error.message);
        } else {
            navigate('/');
        }
    };
    return (
        <div className="dashboard-container">
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

            <>
                {cardId === 1 && <ModalHouseInfo setCardId={setCardId} />}
                {cardId === 2 && <CardsConTacts setCardId={setCardId} />}
                {cardId === 3 && <CardsFunctionalNeeds setCardId={setCardId} />}
                {cardId === 4 && <CardsPets setCardId={setCardId} />}
                {cardId === 5 && <ModalAccessUtilities setCardId={setCardId} />}
                {cardId === 6 && <ModalMap setCardId={setCardId} />}
            </>
        </div>
    );
}

export default CreateHouse;