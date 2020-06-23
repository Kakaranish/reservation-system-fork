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
            const uri = `/rooms/with-phrase/${encodeURIComponent(phrase)}`;
            const result = await axios.get(uri, { validateStatus: false });
            if (result.status !== 200) {
                result.data.errors.forEach(e => console.log(e?.msg ?? e));
                alert('Internal error. Try to refresh page.');
                return;
            }
            setRooms(result.data);
        };
        if (phrase && phrase.trim() !== '') getRooms();
    }, []);

    if (!phrase || phrase === '') return <Redirect to={{ pathname: '/filter-rooms' }} />
    else {
        if (!rooms || rooms.length === 0) return <h3>No rooms found for phrase '{phrase}'</h3>;
        else return <>
            <h3>Rooms found for phrase '{phrase}'</h3>
            <div className="row">
                {rooms.map(roomData => <RoomCard key={`room-${roomData["_id"]}`} roomData={roomData} />)}
            </div>
        </>;
    }
};

export default SearchRoomsPage;