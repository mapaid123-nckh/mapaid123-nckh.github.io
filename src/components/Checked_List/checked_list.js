import React, { useState, useEffect } from 'react';
import './styles.css';;

export default function CheckedList({ items, onChange }) {
    const [list, setList] = useState(items);
    useEffect(() => {
        onChange(list);
    }, [list]);

    useEffect(() => {
        setList(items);
    }, [items]);

    const toggleCheck = (id) => {
        setList(list.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    return (
        <div className="checked-list">
            {list.map((item) => (
                <div key={item.id} className="list-item">
                    <label className="checkbox-container">
                        <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => toggleCheck(item.id)}
                        />
                        <span className="checkmark"></span>
                        <span className={`item-text ${item.checked ? 'strikethrough' : ''}`}>
                            {item.text}
                        </span>
                    </label>
                </div>
            ))}
        </div>
    );
}