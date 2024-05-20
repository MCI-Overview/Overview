import { Outlet, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';


const PrivateRoutes = () => {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api', {withCredentials : true});
                const user = response.data;
                setIsAdmin(user && user.isAdmin);
            } catch (error) {
                setIsAdmin(false);
                console.error('Error checking admin status:', error);
            }
        };

        checkAdminStatus();
    }, []);

    if (isAdmin === null) {
        // Optionally, you can return a loading spinner or some placeholder while the admin check is in progress
        return <div>Loading...</div>;
    }

    return (
        isAdmin ? <Outlet /> : <Navigate to="/admin" />
    );
};

export default PrivateRoutes;
