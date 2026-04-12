import React from 'react';
import './styles.css';
export default function TabPets({ dataTab }) {
    return (<>
        <div className="card-main-content scroll-y">
            {dataTab.map((pets) => (
                <React.Fragment key={pets.id}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div><span style={{ fontWeight: 600 }}>{pets.type || "Không có thông tin"}</span></div>
                            <div><p>{pets.description || "Không có thông tin"}</p></div>
                        </div>
                    </div>
                    <hr style={{ margin: 0 }} />
                </React.Fragment>
            ))}
        </div>
    </>)
}