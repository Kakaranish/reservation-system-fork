import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { requestHandler, getFormDataJsonFromEvent } from '../../common/utils';

const AccountPage = () => {

    const [state, setState] = useState({ loading: true });
    useEffect(() => {
        const fetch = async () => {
            const action = async () => axios.get('/admin/users/me',
                { validateStatus: false });
            const user = await requestHandler(action);

            setState({ loading: false, user });
        };
        fetch();
    }, []);

    if (state.loading) return <></>
    else if (!state.user) return <h3>No such user</h3>

    const onSubmit = async event => {
        event.preventDefault();

        const formData = getFormDataJsonFromEvent(event);
        const action = async () => axios.put('/admin/users/me', formData,
            { validateStatus: false });
        await requestHandler(action);
        
        toast('Account updated');
    };

    return <>
        <div className="p-4 bg-white">

            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Contact email</label>
                    <input name="email" type="text" className="form-control"
                        defaultValue={state.user.email} readOnly />
                </div>

                <div className="form-group">
                    <label>First name</label>
                    <input name="firstName" type="text" className="form-control"
                        defaultValue={state.user.firstName}
                        placeholder="First name..." required />
                </div>

                <div className="form-group">
                    <label>Last name</label>
                    <input name="lastName" type="text" className="form-control"
                        defaultValue={state.user.lastName}
                        placeholder="Last name..." required />
                </div>

                <button type="submit" className="btn btn-success w-100 mt-2">
                    Update
                </button>
            </form>
        </div>
    </>
};

export default AccountPage;