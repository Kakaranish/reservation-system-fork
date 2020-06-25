import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { requestHandler } from '../../common/utils';
import RoomCard from '../../components/RoomCard';
import { Link } from 'react-router-dom';

const RoomsPage = () => {

    const [state, setState] = useState({ loading: true });
    useEffect(() => {
        const fetch = async () => {
            const action = async () => axios.get('/rooms/owner',
                { validateStatus: false });
            const rooms = await requestHandler(action);
            setState({ loading: false, rooms });
        };
        fetch();
    }, []);

    if (state.loading) return <></>
    else if (!state.rooms?.length) return <h3>No rooms</h3>

    return <>
        <div className="row">
            {
                state.rooms.map(roomData =>
                    <RoomCard roomData={roomData} key={`room-${roomData["_id"]}`}>
                        <div className="row">
                            <div className="col-6 mr-0">
                                <Link to={`/rooms/${roomData._id}`}>
                                    <button type="button" className="btn btn-lg btn-block mt-2 primary-btn show-more-details-btn">
                                        Show
                                    </button>
                                </Link>
                            </div>

                            <div className="col-6">
                                <Link to={`/owner/rooms/${roomData._id}/edit`}>
                                    <button type="button" className="btn btn-lg btn-success btn-block mt-2 show-more-details-btn">
                                        Edit
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </RoomCard>
                )
            }
        </div>
    </>
};

export default RoomsPage;