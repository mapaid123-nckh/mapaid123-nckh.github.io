import './styles.css';
export default function TabHouseInfo({ dataTab }) {
    return (<>
        <div className="card-main-content scroll-y">
            <div><span style={{ fontWeight: 600 }}>Số người trên 18 tuổi: </span>{dataTab.member || 0} người</div>
            <div><span style={{ fontWeight: 600 }}>Căn hộ chung cư: </span>{dataTab.isApartment ? "Có" : "Không"}</div>
            <div><span style={{ fontWeight: 600 }}>Nhà có thang máy: </span>{dataTab.hasElevator ? "Có" : "Không"}</div>
            <div><span style={{ fontWeight: 600 }}>Hệ thống chữa cháy tự động (Sprinkler): </span>{dataTab.hasSprinkler ? "Có" : "Không"}</div>
            <div><span style={{ fontWeight: 600 }}>Hệ thống báo khói kết nối với PCCC: </span>{dataTab.hasSmokeAlarm ? "Có" : "Không"}</div>
            <div><span style={{ fontWeight: 600 }}>Nhà có bể bơi: </span>{dataTab.hasPool ? "Có" : "Không"}</div>
            <div><span style={{ fontWeight: 600 }}>Nhà có tầng hầm: </span>{dataTab.hasBasement ? "Có" : "Không"}</div>
            <div><span style={{ fontWeight: 600 }}>Mô tả điểm tập kết an toàn: </span>{dataTab.safePointDescription || " "}</div>
            <div><span style={{ fontWeight: 600 }}>Hình thức sở hữu: </span>{dataTab.ownership === "Own" ? "Chính chủ" : "Thuê nhà"}</div>
            <div><span style={{ fontWeight: 600 }}>Các nguy hiểm khác cần lưu ý cho cứu hộ: </span>{dataTab.otherHazards || "Không có nguy hiểm đặc biệt"}</div>
        </div>
    </>)
}