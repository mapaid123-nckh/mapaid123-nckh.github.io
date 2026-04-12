import React from 'react';
import './styles.css';

export default function TabContact({ dataTab }) {
    console.log('contact', dataTab);

    return (<>
        <div className="card-main-content scroll-y">
            {dataTab.map((contact) => (
                <React.Fragment key={contact.id}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div><span style={{ fontWeight: 600 }}>Họ và tên: </span>{contact.name || "Không có thông tin"}</div>
                            <div><span style={{ fontWeight: 600 }}>SĐT: </span>{contact.phone || "Không có thông tin"}</div>
                        </div>
                    </div>
                    <hr style={{ margin: 0 }} />
                </React.Fragment>
            ))}
        </div>
    </>)
}