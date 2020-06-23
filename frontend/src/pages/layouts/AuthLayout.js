import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

const AuthLayout = ({ children }) => {
    const [state, setState] = useState({ loading: true, user: null })

    useEffect(() => {
        const auth = async () => {
            const result = await axios.post('/auth/verify');
            if (result.data.user)
                alert(`You are already logged in. Redirecting to main page...`);
            setState({
                loading: false,
                user: result.data.user
            });
        };
        auth();
    }, []);

    if (state.loading) return <>{children}</>;
    else {
        if (state.user) return <Redirect to={{ pathname: '/' }} />;
        else return <>{children}</>;
    }
}

export default AuthLayout;