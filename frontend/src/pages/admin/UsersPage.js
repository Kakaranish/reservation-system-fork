import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { requestHandler } from '../../common/utils';
import UserItem from '../../components/admin/UserItem';

const UsersPage = () => {

    const [state, setState] = useState({ loading: true });
    useEffect(() => {
        const fetch = async () => {
            const action = async () => axios.get('/users', { validateStatus: false });
            const users = await requestHandler(action);
            setState({ loading: false, users });
        };
        fetch();
    }, []);

    if (state.loading) return <></>
    else if (!state.users?.length) return <h3>There are no users in db</h3>

    return <>
        <h3>Users</h3>
        {
            state.users.map((user, i) =>
                <UserItem user={user} key={`u-${i}`} />
            )
        }
    </>
};

export default UsersPage;