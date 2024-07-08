// LoginAdmin.tsx
import React from 'react';
import Button from '@mui/joy/Button';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import AuthLayout from './AuthLayout';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const LoginAdmin: React.FC = () => {
    const handleMSLogin = () => {
        window.location.href = `${SERVER_URL}/admin/login`;
    };

    return (
        <AuthLayout
            title="Sign in as Administrator"
            subtitle="Sign in using your MCI microsoft credentials."
            linkText="Login as user instead."
            linkTo="/"
        >
            <Button
                startDecorator={<MicrosoftIcon />}
                onClick={handleMSLogin}
            >
                Sign in with Microsoft
            </Button>
        </AuthLayout>
    );
};

export default LoginAdmin;