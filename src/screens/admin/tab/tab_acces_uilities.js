import './styles.css';
export default function TabAccessUilities({ dataTab }) {
    return (<>
        <div className="card-main-content scroll-y">
            <div><span style={{ fontWeight: 600 }}>Mô tả vị trí phòng ngủ: </span><p>{dataTab.bedroomLocation || "Không có mô tả"}</p></div>
            <div><span style={{ fontWeight: 600 }}>Lưu ý về của chính: </span><p>{dataTab.mainDoorNotes || "Không có lưu ý đặc biệt"}</p></div>
            <div><span style={{ fontWeight: 600 }}>Vị trí nơi đặt dụng cụ khẩn cấp: </span><p>{dataTab.emergencyKitLocation || ""}</p></div>
            <div><span style={{ fontWeight: 600 }}>Vị trí nơi để gas: </span><p>{dataTab.gasLocation || ""}</p></div>
            <div><span style={{ fontWeight: 600 }}>Vị trí cấp nước: </span><p>{dataTab.waterLocation || ""}</p></div>
            <div><span style={{ fontWeight: 600 }}>Vị trí đặt cầu dao, ngắt nguồn điện tổng: </span><p>{dataTab.electricityLocation || ""}</p></div>
        </div>
    </>)
}