import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { checkSupabaseSession } from '../supabase_client/supabaseClient';
import { useNavigate } from 'react-router-dom';

export const ProtectedRoute = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    useEffect(() => {
        const initAuth = async () => {
            const currentUser = await checkSupabaseSession();
            setUser(currentUser);
            setLoading(false);
        };
        initAuth();
    }, []);

    if (loading) return <div>Đang tải dữ liệu...</div>;

    return user ? <Outlet /> : <Navigate to="/" replace />;
};

export const RejectedRoute = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const initAuth = async () => {
            const currentUser = await checkSupabaseSession();
            setUser(currentUser);
            setLoading(false);
        };
        initAuth();
    }, []);

    if (loading) return <div>Đang tải...</div>;

    return !user ? <Outlet /> : <Navigate to="/" replace />;
};