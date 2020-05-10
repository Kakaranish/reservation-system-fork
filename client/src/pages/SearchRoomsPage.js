import React, { useEffect, useState } from 'react';
import queryString from 'query-string';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import RoomCard from '../components/RoomCard';

const SearchRoomsPage = (props) => {
    const phrase = queryString.parse(props.location.search).phrase;

    const [rooms, setRooms] = useState(null);
    useEffect(() => {
        const getRooms = async () => {
            const result = await axios.get(`/rooms/with-phrase/${encodeURIComponent(phrase)}`,
                { validateStatus: false });
            if (result.status !== 200) {
                alert('Internal error');
                return;
            }
            setRooms(result.data);
        };
        if (phrase && phrase.trim() !== '') getRooms();
    }, []);

    if (!phrase || phrase === '') return <Redirect to={{ pathname: '/filter-rooms' }} />
    else {
        return (
            <>
                {
                    !rooms || rooms.length === 0 ?
                        <>
                            <h3>No rooms found for phrase '{phrase}'</h3>
                        </>
                        :
                        <>
                            <h3>Rooms found for phrase '{phrase}'</h3>
                            <div className="row">
                                {rooms.map(roomData => <RoomCard key={`room-${roomData["_id"]}`} roomData={roomData} />)}
                            </div>
                        </>
                }
            </>
        );
    }
};

export default SearchRoomsPage;