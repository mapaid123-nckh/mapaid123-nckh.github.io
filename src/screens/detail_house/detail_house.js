import React, { useState, useEffect, useRef } from 'react';
import goongjs from '@goongmaps/goong-js';
import './styles.css';
import ModalMyInfo from './modal/modal_my_info/modal_my_info';
import CardsMyInfo from './cards/cards_my_info';
import ModalHouseInfo from './modal/modal_house_info/modal_house_info';
import CardsHouseInfo from './cards/cards_house_info';
import ModalContact from './modal/modal_contact/modal_contact';
import CardsConTacts from './cards/cards_contacts';
import ModalFunctionalNeeds from './modal/modal_functional_needs/modal_funtional_needs';
import ModalAccessUtilities from './modal/modal_access_utilites/modal_access_utilites';
import ModalMap from './modal/modal_map/modal_map';
import CardsFunctionalNeeds from './cards/cards_funtional_needs';
import CardsAccessUilities from './cards/cards_access_uilities';
import CardsPets from './cards/cards_pets';
import ModalPets from './modal/modal_pets/modal_pets';
import { supabase } from '../../supabase_client/supabaseClient';
import { useNavigate } from 'react-router-dom';
import GoongMap from '../../components/map/map';

const INITIAL_DATA = [
  { id: 1, icon: 'person', title: 'Thông tin chủ hộ', body: {} },
  { id: 2, icon: 'home', title: 'Thông tin nhà', body: {} },
  { id: 3, icon: 'contact', title: 'Thông tin liên lạc', body: [] },
  { id: 4, icon: 'accessible', title: 'Thông tin người cần hỗ trợ', body: [] },
  { id: 5, icon: 'pets', title: 'Thú cưng', body: [] },
  { id: 6, icon: 'access', title: 'Lối tiếp cận và bảo mật', body: {} },
  { id: 7, icon: 'map', title: 'Bản đồ', isMap: true, body: {} },
];

function DetailHouse() {
  const navigate = useNavigate();
  const [cards, setCards] = useState(INITIAL_DATA);
  const [modal, setModal] = useState({ visible: false, cardId: null, title: '', text: '' });
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

  const fetchAllEmergencyData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('user user_metadata', user.user_metadata.full_name);
      console.log('user user_metadata', user.user_metadata.phone_number);

      if (authError || !user) {
        console.error("Người dùng chưa đăng nhập");
        navigate('/');
        return null;
      }
      const userId = user.id;
      const results = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('AccessUtilities').select('*').eq('idUser', userId).single(),
        supabase.from('contacts').select('*').eq('iduser', userId).single(),
        supabase.from('functionalneeds').select('*').eq('iduser', userId),
        supabase.from('HouseInfo').select('*').eq('iduser', userId).single(),
        supabase.from('location').select('*').eq('idUser', userId),
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
        locationRes,
        petsRes
      ] = results;

      setCards(prev => prev.map(card => {
        if (card.id === 1) {
          return { ...card, body: { name: profileRes.data.full_name, email: profileRes.data.email, phone: profileRes.data.phone_number } };
        } else if (card.id === 2) {
          return { ...card, body: { member: houseRes.data.memberCount, isApartment: houseRes.data.isApartment, hasElevator: houseRes.data.hasElevator, hasSprinkler: houseRes.data.hasSprinkler, hasSmokeAlarm: houseRes.data.hasSmokeAlarm, hasPool: houseRes.data.hasPool, hasBasement: houseRes.data.hasBasement, safePointDescription: houseRes.data.safePointDescription, ownership: houseRes.data.ownership, otherHazards: houseRes.data.otherHazards }, content: `Residents under 18: ${houseRes.data.residentsUnder18}. Sprinkler: ${houseRes.data.hasSprinkler === '1' ? 'Yes' : 'No'}` };
        } else if (card.id === 3) {
          return { ...card, body: contactsRes.data.contact_list || [] };
        } else if (card.id === 4) {
          return { ...card, body: needsRes.data || [] };
        } else if (card.id === 6) {
          return { ...card, body: accessRes.data || {} };
        } else if (card.id === 5) {
          return { ...card, body: petsRes.data || [] };
        } else if (card.id === 7) {
          return { ...card, body: locationRes.data[0] || {} };
        }
        return card;
      }));
      console.log('location', locationRes);

    } catch (err) {
      console.error("Lỗi hệ thống khi fetch:", err.message);
      return null;
    }
  };
  useEffect(() => {
    verifyUserPermission();
    fetchAllEmergencyData();
  }, []);

  const handleEdit = (card) => {
    setModal({
      visible: true,
      cardId: card.id,
      title: card.title,
      content: card.content || '',
      body: card.body || {}
    });
  };

  const handleSave = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Người dùng chưa đăng nhập");
      navigate('/');
      return null;
    }
    const { data, error } = await supabase
      .from('location')
      .update({
        status: 'fire',
      })
      .eq('idUser', user.id);
    if (error) {
      console.error('Lỗi khi cập nhật:', error.message)
      return
    }
    if (error) alert(error.message);
    else {
      alert("Bạn đã báo cháy thành công. Lực lượng cứu hộ đang trên đường đến");
    }
  }
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Lỗi khi đăng xuất:', error.message);
    } else {
      navigate('/');
    }
  };
  return (
    <div className="detail-house-layout">
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

      <main className="content-container">
        <div className="cards-wrapper">
          {cards.map(card => (
            <div key={card.id} className={`card-item-container item-${card.id}`}>
              {card.id === 1 && <CardsMyInfo card={card} handleEdit={handleEdit} />}
              {card.id === 2 && <CardsHouseInfo card={card} handleEdit={handleEdit} />}
              {card.id === 3 && <CardsConTacts card={card} handleEdit={handleEdit} setCards={setCards} />}
              {card.id === 4 && <CardsFunctionalNeeds card={card} handleEdit={handleEdit} setCards={setCards} />}
              {card.id === 5 && <CardsPets card={card} handleEdit={handleEdit} setCards={setCards} />}
              {card.id === 6 && <CardsAccessUilities card={card} handleEdit={handleEdit} />}
              {card.id === 7 && <div key={card.id} className="info-card">
                <div className="card-header-row">
                  <div className="red-badge">
                    <span className="material-icons">{card.icon}</span>
                  </div>
                  <h3 className="card-title-text">{card.title}</h3>
                </div>
                <div className="card-main-content">
                  {card.isMap ? (
                    <div className="goong-map-wrapper">
                      <GoongMap
                        apiKey="PwwC5OR9BJ8gFYjkBCpWd25zTd8HpikORpsbozyh"
                        center={card.body.location || [105.8342, 21.0278]}
                      />
                    </div>
                  ) : (
                    <p className="card-description">{card.content}</p>
                  )}
                </div>
                <div className="card-footer-action">
                  <button className="blue-edit-btn" onClick={() => handleEdit(card)}>Edit</button>
                </div>
              </div>
              }
            </div>
          ))}
        </div>
      </main>
      <button className="emergency-fab" onClick={handleSave}>
        <span className="material-icons">warning</span>
        <span>HELP</span>
      </button>

      {
        modal.visible && (
          <>

            {modal.cardId === 1 && <ModalMyInfo modal={modal} setModal={setModal} setCards={setCards} />}
            {modal.cardId === 2 && <ModalHouseInfo modal={modal} setModal={setModal} setCards={setCards} />}
            {modal.cardId === 3 && <ModalContact modal={modal} setModal={setModal} setCards={setCards} card={cards[2]} />}
            {modal.cardId === 4 && <ModalFunctionalNeeds modal={modal} setModal={setModal} card={cards[3]} setCards={setCards} />}
            {modal.cardId === 5 && <ModalPets modal={modal} setModal={setModal} card={cards[4]} setCards={setCards} />}
            {modal.cardId === 6 && <ModalAccessUtilities modal={modal} setModal={setModal} setCards={setCards} />}
            {modal.cardId === 7 && <ModalMap modal={modal} setModal={setModal} setCards={setCards} profile={cards[0]} />}
          </>
        )
      }
    </div>
  );
}

export default DetailHouse;