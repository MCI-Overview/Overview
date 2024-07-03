// LoginUser.tsx
import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';

import {
    Stack,
    FormLabel,
    Input,
    Button
} from '@mui/joy';

const LoginUser: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        axios
            .post("/user/login", {
                username,
                password,
            })
            .then((res) => {
                if (res.status === 200) {
                    window.location.reload();
                } else {
                    toast.error("Invalid username or password");
                }
            });
    };

    return (
        <AuthLayout
            title="Sign in"
            subtitle="Enter the credentials provided by your consultant."
            linkText="Login as Administrator instead."
            linkTo="/admin"
        >
            <form onSubmit={handleSubmit}>
                <Stack spacing={1}>
                    <FormLabel>NRIC / FIN</FormLabel>
                    <Input
                        placeholder=""
                        required
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <FormLabel>Password</FormLabel>
                    <Input
                        type="password"
                        placeholder=""
                        required
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Stack gap={4} sx={{ mt: 2 }}>
                        <Button type="submit">Login</Button>
                    </Stack>
                </Stack>
            </form>
        </AuthLayout>
    );
};

export default LoginUser;
