import './styles.css';
export default function TabMyInfo({ dataTab }) {
    return (<>
        <div className="card-main-content scroll-y">
            <div><span style={{ fontWeight: 600 }}>Họ tên: </span>{dataTab.name}</div>
            <div><span style={{ fontWeight: 600 }}>Email: </span>{dataTab.email}</div>
            <div><span style={{ fontWeight: 600 }}>Số điện thoại: </span>{dataTab.phone}</div>
        </div>
    </>)
}