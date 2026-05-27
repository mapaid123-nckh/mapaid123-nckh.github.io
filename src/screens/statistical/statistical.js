import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase_client/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { BsPencilFill, BsFillTrashFill } from "react-icons/bs";
import './statistics.css';

export default function VehicleStatistics() {
    const navigate = useNavigate();
    const [idProvince, setIdProvince] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState({
        totalVehicles: 0,
        activeVehicles: 0,
        fireTrucks: 0,
        waterTrucks: 0,
    });

    const [vehicleList, setVehicleList] = useState([]);
    const [deviceList, setDeviceList] = useState([]);
    const [filterType, setFilterType] = useState('All');
    const [searchKeyword, setSearchKeyword] = useState('');

    // State lưu danh sách ID các xe được chọn qua Checkbox để lọc vật tư
    const [selectedVehicleIds, setSelectedVehicleIds] = useState([]);

    const [isOpenVehicleModal, setIsOpenVehicleModal] = useState(false);
    const [isOpenDeviceModal, setIsOpenDeviceModal] = useState(false);

    const [isEditVehicleModal, setIsEditVehicleModal] = useState(false);
    const [isEditDeviceModal, setIsEditDeviceModal] = useState(false);

    const [newVehicle, setNewVehicle] = useState({ ma_xe: '', loai_xe: 'CC', trang_thai: 'ready', chu_thich: '' });
    const [newDevice, setNewDevice] = useState({
        id_xe: '',
        ten_thiet_bi: '',
        so_luong: 1,
        trang_thai: 'Tốt',
        chu_thich: ''
    });

    const [editingVehicle, setEditingVehicle] = useState(null);
    const [editingDevice, setEditingDevice] = useState(null);

    const fetchData = async () => {
        const currentProvinceId = idProvince || 1;
        setLoading(true);
        try {
            const { data: vData, error: vError } = await supabase
                .from('phuong_tien')
                .select('*');
            if (vError) throw vError;

            const { data: dData, error: dError } = await supabase
                .from('thiet_bi')
                .select('*');
            if (dError) throw dError;

            if (vData) {
                setVehicleList(vData);
                // CHỈ tự động tích chọn các xe có trạng thái 'ready' khi tải dữ liệu lần đầu
                const readyVehicleIds = vData.filter(v => v.trang_thai === 'ready').map(v => v.id);
                setSelectedVehicleIds(readyVehicleIds);

                const total = vData.length;
                const active = vData.filter(v => v.trang_thai === 'ready' || v.trang_thai === 'active').length;
                const fire = vData.filter(v => v.loai_xe === 'CC' || v.loai_xe === 'fire_truck' || v.loai_xe === 'ahd').length;
                const water = vData.filter(v => v.loai_xe === 'TN' || v.loai_xe === 'anb').length;

                setStatistics({
                    totalVehicles: total,
                    activeVehicles: active,
                    fireTrucks: fire,
                    waterTrucks: water
                });
            }
            if (dData) setDeviceList(dData);

        } catch (err) {
            console.error("Lỗi đồng bộ hệ thống:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [idProvince]);

    const handleCheckboxChange = (vehicleId) => {
        if (selectedVehicleIds.includes(vehicleId)) {
            setSelectedVehicleIds(selectedVehicleIds.filter(id => id !== vehicleId));
        } else {
            setSelectedVehicleIds([...selectedVehicleIds, vehicleId]);
        }
    };

    // SỬA ĐỔI: Chỉ chọn tất cả các xe có trạng thái là 'ready'
    const handleSelectAllVehicles = (selectAll) => {
        if (selectAll) {
            const readyVehicleIds = vehicleList.filter(v => v.trang_thai === 'ready').map(v => v.id);
            setSelectedVehicleIds(readyVehicleIds);
        } else {
            setSelectedVehicleIds([]);
        }
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        try {
            const currentProvinceId = idProvince || 1;
            const { error } = await supabase.from('phuong_tien').insert([{ ...newVehicle }]);
            if (error) throw error;
            alert('Thêm phương tiện thành công!');
            setIsOpenVehicleModal(false);
            setNewVehicle({ ma_xe: '', loai_xe: 'CC', trang_thai: 'ready', chu_thich: '' });
            fetchData();
        } catch (err) { alert(err.message); }
    };

    const handleAddDevice = async (e) => {
        e.preventDefault();
        try {
            const targetIdXe = parseInt(newDevice.id_xe);
            const targetSoLuong = parseInt(newDevice.so_luong);

            if (!targetIdXe || !newDevice.ten_thiet_bi) {
                alert('Vui lòng chọn xe và tên thiết bị!');
                return;
            }

            if (targetSoLuong <= 0) {
                alert('Số lượng thêm phải lớn hơn 0!');
                return;
            }

            const { data: sameStatusDevice, error: checkError } = await supabase
                .from('thiet_bi')
                .select('*')
                .eq('id_xe', targetIdXe)
                .eq('ten_thiet_bi', newDevice.ten_thiet_bi)
                .eq('trang_thai', newDevice.trang_thai)
                .maybeSingle();

            if (checkError) throw checkError;

            if (sameStatusDevice) {
                const { error: upSameError } = await supabase
                    .from('thiet_bi')
                    .update({ so_luong: sameStatusDevice.so_luong + targetSoLuong })
                    .eq('id', sameStatusDevice.id);

                if (upSameError) throw upSameError;
                alert('Cộng dồn số lượng vào thiết bị đã có sẵn thành công!');
            }
            else {
                const { error: insError } = await supabase
                    .from('thiet_bi')
                    .insert([{
                        id_xe: targetIdXe,
                        ten_thiet_bi: newDevice.ten_thiet_bi,
                        so_luong: targetSoLuong,
                        trang_thai: newDevice.trang_thai,
                        chu_thich: newDevice.chu_thich
                    }]);

                if (insError) throw insError;
                alert('Thêm thiết bị mới theo trạng thái thành công!');
            }

            setIsOpenDeviceModal(false);
            setNewDevice({ id_xe: '', ten_thiet_bi: '', so_luong: 1, trang_thai: 'Tốt', chu_thich: '' });
            if (typeof fetchData === 'function') fetchData();

        } catch (err) {
            alert('Lỗi hệ thống: ' + err.message);
        }
    };

    const handleUpdateVehicle = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('phuong_tien')
                .update({
                    ma_xe: editingVehicle.ma_xe,
                    loai_xe: editingVehicle.loai_xe,
                    trang_thai: editingVehicle.trang_thai,
                    chu_thich: editingVehicle.chu_thich
                })
                .eq('id', editingVehicle.id);

            if (error) throw error;
            alert('Cập nhật thông tin xe thành công!');
            setIsEditVehicleModal(false);
            fetchData();
        } catch (err) { alert(err.message); }
    };

    const handleUpdateDevice = async (e) => {
        e.preventDefault();
        try {
            const targetIdXe = parseInt(editingDevice.id_xe);
            const updateSoLuong = parseInt(editingDevice.so_luong);

            if (updateSoLuong < 0) {
                alert("Số lượng thiết bị không được là số âm!");
                return;
            }
            const { data: originalDevice, error: fetchErr } = await supabase
                .from('thiet_bi')
                .select('*')
                .eq('id', editingDevice.id)
                .single();

            if (fetchErr) throw fetchErr;
            const { data: existingDevices, error: checkError } = await supabase
                .from('thiet_bi')
                .select('*')
                .eq('id_xe', targetIdXe)
                .eq('ten_thiet_bi', originalDevice.ten_thiet_bi);

            if (checkError) throw checkError;
            const diffStatusDevice = existingDevices.find(d => d.trang_thai !== originalDevice.trang_thai);
            const totalAvailable = existingDevices.reduce((sum, item) => sum + item.so_luong, 0);
            if (originalDevice.trang_thai !== editingDevice.trang_thai) {
                if (updateSoLuong > originalDevice.so_luong) {
                    alert(`Số lượng chuyển trạng thái (${updateSoLuong}) không được lớn hơn số lượng hiện có của dòng này (${originalDevice.so_luong})!`);
                    return;
                }
                const remainingQty = originalDevice.so_luong - updateSoLuong;
                if (remainingQty === 0) {
                    const sameStatusDevice = existingDevices.find(d => d.trang_thai === editingDevice.trang_thai);
                    if (sameStatusDevice) {
                        const { error: upSameErr } = await supabase
                            .from('thiet_bi')
                            .update({ so_luong: sameStatusDevice.so_luong + updateSoLuong, chu_thich: editingDevice.chu_thich })
                            .eq('id', sameStatusDevice.id);
                        if (upSameErr) throw upSameErr;

                        const { error: delOrigErr } = await supabase.from('thiet_bi').delete().eq('id', originalDevice.id);
                        if (delOrigErr) throw delOrigErr;
                    } else {
                        const { error: upOrigErr } = await supabase
                            .from('thiet_bi')
                            .update({
                                id_xe: targetIdXe,
                                ten_thiet_bi: editingDevice.ten_thiet_bi,
                                so_luong: updateSoLuong,
                                trang_thai: editingDevice.trang_thai,
                                chu_thich: editingDevice.chu_thich
                            })
                            .eq('id', originalDevice.id);
                        if (upOrigErr) throw upOrigErr;
                    }
                }
                else {
                    const { error: upOriginalErr } = await supabase
                        .from('thiet_bi')
                        .update({ so_luong: remainingQty })
                        .eq('id', originalDevice.id);
                    if (upOriginalErr) throw upOriginalErr;
                    const sameStatusDevice = existingDevices.find(d => d.trang_thai === editingDevice.trang_thai);
                    if (sameStatusDevice) {
                        const { error: upDupErr } = await supabase
                            .from('thiet_bi')
                            .update({
                                so_luong: sameStatusDevice.so_luong + updateSoLuong,
                                chu_thich: editingDevice.chu_thich
                            })
                            .eq('id', sameStatusDevice.id);
                        if (upDupErr) throw upDupErr;
                    } else {
                        const { error: insNewErr } = await supabase
                            .from('thiet_bi')
                            .insert([{
                                id_xe: targetIdXe,
                                ten_thiet_bi: editingDevice.ten_thiet_bi,
                                so_luong: updateSoLuong,
                                trang_thai: editingDevice.trang_thai,
                                chu_thich: editingDevice.chu_thich
                            }]);
                        if (insNewErr) throw insNewErr;
                    }
                }

                alert('Điều chuyển trạng thái và tách dòng thiết bị thành công!');
            }
            else {
                if (updateSoLuong > totalAvailable) {
                    alert(`Không thể thay đổi số lượng vượt quá tổng kho! Tổng số lượng hiện có trên xe là ${totalAvailable}.`);
                    return;
                }
                const delta = updateSoLuong - originalDevice.so_luong;

                if (updateSoLuong === 0) {
                    const { error: delErr } = await supabase.from('thiet_bi').delete().eq('id', originalDevice.id);
                    if (delErr) throw delErr;
                } else {
                    const { error: normalUpdateErr } = await supabase
                        .from('thiet_bi')
                        .update({
                            id_xe: targetIdXe,
                            ten_thiet_bi: editingDevice.ten_thiet_bi,
                            so_luong: updateSoLuong,
                            chu_thich: editingDevice.chu_thich
                        })
                        .eq('id', originalDevice.id);
                    if (normalUpdateErr) throw normalUpdateErr;
                }
                if (diffStatusDevice && delta !== 0) {
                    let newDiffQuantity = diffStatusDevice.so_luong - delta;

                    if (newDiffQuantity <= 0) {
                        const { error: delDiffErr } = await supabase.from('thiet_bi').delete().eq('id', diffStatusDevice.id);
                        if (delDiffErr) throw delDiffErr;
                    } else {
                        const { error: upDiffErr } = await supabase
                            .from('thiet_bi')
                            .update({ so_luong: newDiffQuantity })
                            .eq('id', diffStatusDevice.id);
                        if (upDiffErr) throw upDiffErr;
                    }
                }

                alert('Cập nhật thông tin thiết bị thành công!');
            }
            setIsEditDeviceModal(false);
            if (typeof fetchData === 'function') fetchData();

        } catch (err) {
            alert('Lỗi khi cập nhật thiết bị: ' + err.message);
        }
    };

    const filteredVehicles = vehicleList.filter(item => {
        const matchesType = (filterType === 'All' || item.loai_xe === filterType);
        const matchesSearch = item.ma_xe?.toLowerCase().includes(searchKeyword.toLowerCase());
        return matchesType && matchesSearch;
    });

    const filteredDevices = deviceList.filter(device => {
        const isSelected = selectedVehicleIds.includes(device.id_xe);
        const parentVehicle = vehicleList.find(v => v.id === device.id_xe);
        const isVehicleReady = parentVehicle && parentVehicle.trang_thai === 'ready';

        return isSelected && isVehicleReady;
    });

    const getVehicleTypeName = (value) => {
        const typeMapping = {
            'CC': 'Xe chữa cháy',
            'TH': 'Xe thang',
            'TN': 'Xe téc',
            'CNCH': 'Xe cứu nạn cứu hộ',
        };
        return typeMapping[value] || value || 'Chưa xác định';
    };

    const handleDeleteDevice = async (id) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa thiết bị này không?");
        if (!confirmDelete) return;

        try {
            const { error } = await supabase
                .from('thiet_bi')
                .delete()
                .eq('id', id);

            if (error) throw error;
            alert('Xóa thiết bị thành công!');
            if (typeof fetchData === 'function') fetchData();

        } catch (err) {
            alert('Lỗi khi xóa thiết bị: ' + err.message);
        }
    };

    const handleDeleteVehicle = async (idXe) => {
        const confirmDelete = window.confirm("CẢNH BÁO: Xóa xe này sẽ xóa toàn bộ danh sách thiết bị/vật tư đang có trên xe! Bạn có chắc chắn muốn xóa?");
        if (!confirmDelete) return;

        try {
            const { error: deleteDevicesErr } = await supabase
                .from('thiet_bi')
                .delete()
                .eq('id_xe', idXe);

            if (deleteDevicesErr) throw deleteDevicesErr;
            const { error: deleteVehicleErr } = await supabase
                .from('phuong_tien')
                .delete()
                .eq('id', idXe);

            if (deleteVehicleErr) throw deleteVehicleErr;

            alert('Xóa phương tiện và các thiết bị kèm theo thành công!');
            if (typeof fetchData === 'function') fetchData();

        } catch (err) {
            alert('Lỗi khi xóa phương tiện: ' + err.message);
        }
    };
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Lỗi khi đăng xuất:', error.message);
        } else {
            navigate('/');
        }
    };
    return (
        <div className="stats-layout">
            <header className="top-nav">
                <div className="nav-content">
                    <div className="logo-box">
                        <h2 className="brand-name">MapAid</h2>
                    </div>

                    <div className="nav-right-group" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => { navigate('/admin') }} className="logout-btn">
                            <span className="material-icons" style={{ fontSize: 14, padding: '2px 3px' }}>Trang chủ</span>
                        </button>
                        <button onClick={() => { navigate('/admin/statistical') }} className="logout-btn">
                            <span className="material-icons" style={{ fontSize: 14, padding: '2px 3px' }}>Thống kê phương tiện</span>
                        </button>
                        <button onClick={handleLogout} className="logout-btn">
                            <span className="material-icons" style={{ fontSize: 14, padding: '2px 3px' }}>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </header >

            <main className="stats-container">
                <section className="uikit-card filter-toolbar">
                    <div className="form-element-group">
                        <label className="uikit-label">Tìm kiếm xe (Mã xe)</label>
                        <input type="text" placeholder="Nhập mã xe..." className="uikit-input" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                    </div>
                    <div className="form-element-group">
                        <label className="uikit-label">Loại xe</label>
                        <select className="uikit-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="All">Tất cả xe</option>
                            <option value="CC">Xe chữa cháy</option>
                            <option value="TH">Xe thang</option>
                            <option value="TN">Xe téc</option>
                            <option value="CNCH">Xe cứu nạn cứu hộ</option>
                        </select>
                    </div>
                    <div className="action-buttons-group">
                        <button className="uikit-btn-primary" onClick={() => setIsOpenVehicleModal(true)}>+ Thêm Xe</button>
                        <button className="btn-save" onClick={() => setIsOpenDeviceModal(true)}>+ Thêm Thiết Bị</button>
                    </div>
                </section>

                <div className="tables-split-grid">
                    <section className="uikit-card table-section">
                        <h3 className="table-title-text">📌 Danh Sách Phương Tiện (Xe)</h3>
                        <div className="table-responsive">
                            <table className="uikit-table table-bordered">
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'center', fontWeight: 'bold' }}>STT</th>
                                        <th style={{ textAlign: 'center', fontWeight: 'bold' }}>Mã xe (Biển số)</th>
                                        <th style={{ textAlign: 'center', fontWeight: 'bold' }}>Loại xe</th>
                                        <th style={{ textAlign: 'center', fontWeight: 'bold' }}>Trạng thái</th>
                                        <th style={{ textAlign: 'center', fontWeight: 'bold' }}>Chú thích</th>
                                        <th style={{ textAlign: 'center', fontWeight: 'bold' }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredVehicles.map((vehicle, index) => (
                                        <tr key={vehicle.id}>
                                            <td style={{ width: 50, textAlign: 'center' }}>{index + 1}</td>
                                            <td className="font-weight-bold" style={{ width: 250 }}>{vehicle.ma_xe}</td>
                                            <td style={{ width: 150 }}>{getVehicleTypeName(vehicle.loai_xe)}</td>
                                            <td style={{ width: 150 }}>{vehicle.trang_thai === 'ready' ? 'Sẵn sàng' : 'Bảo dưỡng'}</td>
                                            <td>{vehicle.chu_thich}</td>
                                            <td style={{ width: '100px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button className="edit-x" onClick={() => { setEditingVehicle(vehicle); setIsEditVehicleModal(true); }}>
                                                        <BsPencilFill size={17} />
                                                    </button>
                                                    <button className="close-x" onClick={() => handleDeleteVehicle(vehicle.id)}>
                                                        <BsFillTrashFill size={17} color="red" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                    <section className="uikit-card table-section">
                        <div style={{ marginBottom: '20px', padding: '15px', border: '1px dashed #ccc', borderRadius: '6px', backgroundColor: '#fafafa' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#333', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                🔍 Xe thực hiện nhiệm vụ chiến đấu
                                <div style={{ fontSize: '13px' }}>
                                    <button type="button" className="uikit-btn-link" style={{ marginRight: '10px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }} onClick={() => handleSelectAllVehicles(true)}>Chọn tất cả sẵn sàng</button>
                                    <button type="button" className="uikit-btn-link" style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }} onClick={() => handleSelectAllVehicles(false)}>Bỏ chọn hết</button>
                                </div>
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                {vehicleList.map((v) => {
                                    if (v.trang_thai !== 'ready') {
                                        return null;
                                    }
                                    return (
                                        <label key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', padding: '4px 8px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedVehicleIds.includes(v.id)}
                                                onChange={() => handleCheckboxChange(v.id)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: '500' }}>{v.ma_xe}</span>
                                            <span style={{ fontSize: '12px', color: '#777' }}>({getVehicleTypeName(v.loai_xe)})</span>
                                        </label>
                                    )
                                })}
                                {vehicleList.filter(v => v.trang_thai === 'ready').length === 0 && <span style={{ color: '#999', fontSize: '13px' }}>Chưa có phương tiện sẵn sàng chiến đấu.</span>}
                            </div>
                        </div>

                        <h3 className="table-title-text">🧰 Danh Sách Thiết Bị / Vật Tư Theo Xe Chiến Đấu</h3>
                        <div className="table-responsive">
                            <table className="uikit-table table-bordered">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Thuộc mã xe</th>
                                        <th>Tên thiết bị</th>
                                        <th>Số lượng</th>
                                        <th>Trạng thái</th>
                                        <th>Chú thích tình trạng</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDevices.map((device, index) => {
                                        const parentVehicle = vehicleList.find(v => v.id === device.id_xe);
                                        return (
                                            <tr key={device.id}>
                                                <td>{index + 1}</td>
                                                <td className="parent-vehicle-tag">{parentVehicle ? parentVehicle.ma_xe : `ID Xe: ${device.id_xe}`}</td>
                                                <td className="font-weight-bold">{device.ten_thiet_bi}</td>
                                                <td>{device.so_luong}</td>
                                                <td style={{ color: device.trang_thai === 'Tốt' ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>{device.trang_thai}</td>
                                                <td>{device.chu_thich}</td>
                                                <td>
                                                    <div style={{ display: 'flex' }}>
                                                        <button className="edit-x" onClick={() => { setEditingDevice(device); setIsEditDeviceModal(true); }}>
                                                            <BsPencilFill size={17} />
                                                        </button>
                                                        <button className="close-x" onClick={() => handleDeleteDevice(device.id)}>
                                                            <BsFillTrashFill size={17} color="red" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredDevices.length === 0 && (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                                                Không có vật tư chiến đấu nào hiển thị. Hãy tích chọn xe sẵn sàng ở trên!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>

            {isEditVehicleModal && editingVehicle && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Cập nhật phương tiện (ID: {editingVehicle.id})</h3>
                            <button className="close-btn" onClick={() => setIsEditVehicleModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleUpdateVehicle} style={{ padding: '0 25px' }}>
                            <div className="form-group">
                                <label>Mã xe / Biển số:</label>
                                <input type="text" required className="uikit-input" value={editingVehicle.ma_xe} onChange={(e) => setEditingVehicle({ ...editingVehicle, ma_xe: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Loại xe:</label>
                                <select className="uikit-select" value={editingVehicle.loai_xe} onChange={(e) => setEditingVehicle({ ...editingVehicle, loai_xe: e.target.value })}>
                                    <option value="CC">Xe chữa cháy</option>
                                    <option value="TH">Xe thang</option>
                                    <option value="TN">Xe téc</option>
                                    <option value="CNCH">Xe cứu nạn cứu hộ</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Trạng thái hoạt động:</label>
                                <select className="uikit-select" value={editingVehicle.trang_thai} onChange={(e) => setEditingVehicle({ ...editingVehicle, trang_thai: e.target.value })}>
                                    <option value="ready">Sẵn sàng</option>
                                    <option value="maintenance">Bảo dưỡng</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Chú thích:</label>
                                <textarea className="uikit-input" rows="3" value={editingVehicle.chu_thich || ''} onChange={(e) => setEditingVehicle({ ...editingVehicle, chu_thich: e.target.value })}></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsEditVehicleModal(false)}>Hủy</button>
                                <button type="submit" className="btn-save">Cập nhật</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditDeviceModal && editingDevice && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Cập nhật thiết bị (ID: {editingDevice.id})</h3>
                            <button className="close-btn" onClick={() => setIsEditDeviceModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleUpdateDevice} style={{ padding: '0 25px' }}>
                            <div className="form-group">
                                <label>Điều chuyển sang Xe khác:</label>
                                <select required className="uikit-select" value={editingDevice.id_xe} onChange={(e) => setEditingDevice({ ...editingDevice, id_xe: e.target.value })}>
                                    {vehicleList.map(v => (
                                        <option key={v.id} value={v.id}>{v.ma_xe}({getVehicleTypeName(v.loai_xe)})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tên thiết bị:</label>
                                <select required className="uikit-select" value={editingDevice.ten_thiet_bi} onChange={(e) => setEditingDevice({ ...editingDevice, ten_thiet_bi: e.target.value })}>
                                    <option value="Lăng A">Lăng A</option>
                                    <option value="Lăng B">Lăng B</option>
                                    <option value="Vòi 77">Vòi 77</option>
                                    <option value="Vòi 65">Vòi 65</option>
                                    <option value="Vòi 55">Vòi 55</option>
                                    <option value="Lăng giá">Lăng giá</option>
                                    <option value="Bơm tay">Bơm tay</option>
                                    <option value="Cưa máy">Cưa máy</option>
                                    <option value="Kìm cộng lực">Kìm cộng lực</option>
                                    <option value="Rìu">Rìu</option>
                                    <option value="Thang">Thang</option>
                                    <option value="Dụng cụ đa năng">Dụng cụ đa năng</option>
                                    <option value="Bọt">Bọt</option>
                                    <option value="Mặt nạ Drager">Mặt nạ Drager</option>
                                    <option value="Bình khí">Bình khí</option>
                                    <option value="Lăng phun bọt LPB 600">Lăng phun bọt LPB 600</option>
                                    <option value="Lăng phun bọt LPB 400">Lăng phun bọt LPB 400</option>
                                    <option value="Lăng phun bọt LPB 200">Lăng phun bọt LPB 200</option>
                                    <option value="Đầu chuyển">Đầu chuyển</option>
                                    <option value="Ba chạc">Ba chạc</option>
                                    <option value="Máy nén khí">Máy nén khí</option>
                                    <option value="Máy thủy lực">Máy thủy lực</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Số lượng:</label>
                                <input type="number" min="1" required className="uikit-input" value={editingDevice.so_luong} onChange={(e) => setEditingDevice({ ...editingDevice, so_luong: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Trạng thái vật tư:</label>
                                <select className="uikit-select" value={editingDevice.trang_thai} onChange={(e) => setEditingDevice({ ...editingDevice, trang_thai: e.target.value })}>
                                    <option value="Tốt">Tốt</option>
                                    <option value="Hỏng">Hỏng</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Mô tả tình trạng:</label>
                                <textarea className="uikit-input" rows="2" value={editingDevice.chu_thich || ''} onChange={(e) => setEditingDevice({ ...editingDevice, chu_thich: e.target.value })}></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsEditDeviceModal(false)}>Hủy</button>
                                <button type="submit" className="btn-save">Cập nhật</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isOpenVehicleModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Thêm Phương Tiện Mới</h3>
                            <button className="close-btn" onClick={() => setIsOpenVehicleModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddVehicle} style={{ padding: '0 25px' }}>
                            <div className="form-group">
                                <label>Tên xe - Biển số:</label>
                                <input type="text" required className="uikit-input" value={newVehicle.ma_xe} onChange={(e) => setNewVehicle({ ...newVehicle, ma_xe: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Loại phương tiện:</label>
                                <select className="uikit-select" value={newVehicle.loai_xe} onChange={(e) => setNewVehicle({ ...newVehicle, loai_xe: e.target.value })}>
                                    <option value="CC">Xe chữa cháy</option>
                                    <option value="TH">Xe thang</option>
                                    <option value="TN">Xe téc</option>
                                    <option value="CNCH">Xe cứu nạn cứu hộ</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Trạng thái ban đầu:</label>
                                <select className="uikit-select" value={newVehicle.trang_thai} onChange={(e) => setNewVehicle({ ...newVehicle, trang_thai: e.target.value })}>
                                    <option value="ready">Sẵn sàng</option>
                                    <option value="maintenance">Bảo dưỡng</option>
                                    <option value="in_use">Đang sử dụng</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Chú thích:</label>
                                <textarea className="uikit-input" rows="3" value={newVehicle.chu_thich} onChange={(e) => setNewVehicle({ ...newVehicle, chu_thich: e.target.value })}></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsOpenVehicleModal(false)}>Hủy</button>
                                <button type="submit" className="btn-save">Lưu lại</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isOpenDeviceModal && (
                <div className="modal-overlay">
                    <div className="modal-window">
                        <div className="modal-header">
                            <h3>Thêm Thiết Bị Vào Xe</h3>
                            <button className="close-btn" onClick={() => setIsOpenDeviceModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddDevice} style={{ padding: '0 25px' }}>
                            <div className="form-group">
                                <label>Chọn Xe lắp đặt:</label>
                                <select required className="uikit-select" value={newDevice.id_xe} onChange={(e) => setNewDevice({ ...newDevice, id_xe: e.target.value })}>
                                    <option value="">-- Chọn xe từ danh sách --</option>
                                    {vehicleList.map(v => (
                                        <option key={v.id} value={v.id}>{v.ma_xe} ({getVehicleTypeName(v.loai_xe)})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tên thiết bị/phương tiện:</label>
                                <select
                                    required
                                    className="uikit-select"
                                    value={newDevice.ten_thiet_bi}
                                    onChange={(e) => setNewDevice({ ...newDevice, ten_thiet_bi: e.target.value })}
                                >
                                    <option value="">-- Chọn loại thiết bị --</option>
                                    <option value="Lăng A">Lăng A</option>
                                    <option value="Lăng B">Lăng B</option>
                                    <option value="Vòi 77">Vòi 77</option>
                                    <option value="Vòi 65">Vòi 65</option>
                                    <option value="Vòi 55">Vòi 55</option>
                                    <option value="Lăng giá">Lăng giá</option>
                                    <option value="Bơm tay">Bơm tay</option>
                                    <option value="Cưa máy">Cưa máy</option>
                                    <option value="Kìm cộng lực">Kìm cộng lực</option>
                                    <option value="Rìu">Rìu</option>
                                    <option value="Thang">Thang</option>
                                    <option value="Dụng cụ đa năng">Dụng cụ đa năng</option>
                                    <option value="Bọt">Bọt</option>
                                    <option value="Mặt nạ Drager">Mặt nạ Drager</option>
                                    <option value="Bình khí">Bình khí</option>
                                    <option value="Lăng phun bọt LPB 600">Lăng phun bọt LPB 600</option>
                                    <option value="Lăng phun bọt LPB 400">Lăng phun bọt LPB 400</option>
                                    <option value="Lăng phun bọt LPB 200">Lăng phun bọt LPB 200</option>
                                    <option value="Đầu chuyển">Đầu chuyển</option>
                                    <option value="Ba chạc">Ba chạc</option>
                                    <option value="Máy nén khí">Máy nén khí</option>
                                    <option value="Máy thủy lực">Máy thủy lực</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Số lượng:</label>
                                <input type="number" min="1" required className="uikit-input" value={newDevice.so_luong} onChange={(e) => setNewDevice({ ...newDevice, so_luong: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Trạng thái:</label>
                                <select className="uikit-select" value={newDevice.trang_thai} onChange={(e) => setNewDevice({ ...newDevice, trang_thai: e.target.value })}>
                                    <option value="Tốt">Tốt</option>
                                    <option value="Hỏng">Hỏng</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tình trạng chi tiết / Chú thích:</label>
                                <textarea className="uikit-input" rows="2" placeholder="Tình trạng hỏng..." value={newDevice.chu_thich} onChange={(e) => setNewDevice({ ...newDevice, chu_thich: e.target.value })}></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsOpenDeviceModal(false)}>Hủy</button>
                                <button type="submit" className="btn-save">Thêm thiết bị</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}