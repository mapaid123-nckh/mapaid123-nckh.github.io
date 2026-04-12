import React from 'react';
import './styles.css';
export default function TabFuntionalNeeds({ dataTab }) {
    return (<>
        <div className="card-main-content scroll-y">
            {dataTab.map((needs) => (
                <React.Fragment key={needs.id}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div><span style={{ fontWeight: 600 }}>{needs.name || "Không có thông tin"}</span></div>
                            <div><span style={{ fontWeight: 600 }}>Tuổi: </span>{needs.age || ""}</div>
                            <div><div style={{ fontWeight: 600 }}>Nhu cầu hỗ trợ: </div>{needs.needs_list && needs.needs_list.length > 0
                                ? needs.needs_list
                                    .filter(item => item.checked)
                                    .map(item => <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '30px' }}>
                                        <span>•</span>
                                        <span>{item.text}</span>
                                    </div>)
                                : "Không có thông tin"
                            }</div>
                            <div><div style={{ fontWeight: 600 }}>Tình trạng: </div>{needs.status && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '30px' }}>
                                    <span>•</span>
                                    <span>{needs.status}</span>
                                </div>
                            )}</div>
                        </div>
                    </div>
                    <hr style={{ margin: 0 }} />
                </React.Fragment>
            ))}
        </div>
    </>)
}