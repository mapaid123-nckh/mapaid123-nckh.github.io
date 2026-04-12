import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [profile, setProfile] = useState(null);

    const updateProfileState = (newData) => {
        setProfile(prev => ({ ...prev, ...newData }));
    };

    return (
        <AuthContext.Provider value={{ profile, updateProfileState }}>
            {children}
        </AuthContext.Provider>
    );
};