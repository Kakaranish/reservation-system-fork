import React, { useState } from 'react';
import axios from 'axios';
import { requestHandler } from '../../../common/utils';
import AwareComponentBuilder from '../../../common/AwareComponentBuilder';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const UserItem = (props) => {

    const { user } = props;
    const history = useHistory();

    const [inEditMode, setInEditMode] = useState(false);
    const [userState, setUserState] = useState(Object.assign({}, user));
    const [selectedRole, setSelectedRole] = useState(user.role);

    const onEdit = () => {
        setInEditMode(true);
        setSelectedRole(userState.role);
    };

    const onCancel = () => {
        setInEditMode(false);
        setSelectedRole(userState.role);
    };

    const onUpdate = async () => {

        const editYourself = userState._id == props.identity.id;
        if (editYourself && !window.confirm('Do you really want to change your role?'))
            return;

        const uri = `/users/${user._id}/role/${selectedRole}`;
        const action = async () => axios.put(uri, {}, { validateStatus: false });
        await requestHandler(action);

        if (editYourself) {
            const logoutAction = async () => axios.post('/auth/logout', {},
                { validateStatus: false });
            await requestHandler(logoutAction);

            toast('You have been logged out')
            props.unsetIdentity();
            history.push('/');

            return;
        }

        setInEditMode(false);
        setUserState(currState => {
            let intermediateState = Object.assign({}, currState);
            return Object.assign(intermediateState, { role: selectedRole });
        });
        toast('User updated', { autoClose: 3000 });
    };

    if (!inEditMode) return <>
        <div className="p-3 border border-darken-1 bg-white mb-3">
            <p>
                <b>Email: </b> {userState.email}
            </p>

            <p>
                <b>Fullname: </b> {userState.firstName} {userState.lastName}
            </p>

            <p>
                <b>Role: </b> {userState.role}
            </p>

            <button className="btn btn-success px-4" onClick={onEdit}>
                Edit
            </button>
        </div>
    </>

    return <>
        <div className="p-3 border border-darken-1 bg-white mb-3">
            <p>
                <b>Email: </b> {userState.email}
            </p>

            <p>
                <b>Fullname: </b> {userState.firstName} {userState.lastName}
            </p>

            <div className="form-group">
                <div className="dropdown">
                    <label>
                        <b>Role</b>
                    </label><br></br>
                    <select name="role" value={selectedRole}
                        onChange={event => setSelectedRole(event.target.value)}
                        className="custom-select">

                        {
                            ["USER", "ADMIN", "OWNER"].map((role) =>
                                <option key={`opt-${role}`} value={role}>
                                    {role}
                                </option>
                            )
                        }
                    </select>
                </div>
            </div>


            <button className="btn btn-success px-4 mr-3" onClick={onUpdate}>
                Update
            </button>

            <button className="btn btn-danger px-4" onClick={onCancel}>
                Cancel
            </button>
        </div>
    </>
};

export default new AwareComponentBuilder()
    .withIdentityAwareness()
    .build(UserItem);