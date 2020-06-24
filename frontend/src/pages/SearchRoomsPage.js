import React, { useEffect, useState } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import { Redirect } from 'react-router-dom';
import RoomCard from '../components/RoomCard';

const SearchRoomsPage = (props) => {
	const phrase = queryString.parse(props.location.search).phrase;

	const [state, setState] = useState({ loading: true });
	useEffect(() => {
		const fetch = async () => {
			const uri = `/rooms/with-phrase/${encodeURIComponent(phrase)}`;
			const result = await axios.get(uri, { validateStatus: false });
			if (result.status !== 200) {
				result.data.errors.forEach(e => console.log(e?.msg ?? e));
				alert('Internal error. Try to refresh page.');
				return;
			}
			setState({ loading: false, rooms: result.data });
		};
		if (phrase) fetch();
	}, []);

	if (!phrase || phrase === '') return <Redirect to={'/filter-rooms'} />
	else if (state.loading) return <></>
	else if (!state.rooms || state.rooms.length === 0)
		return <h3>No rooms found for phrase '{phrase}'</h3>;

	return <>
		<h3>Rooms found for phrase '{phrase}'</h3>
		<div className="row">
			{
				state.rooms.map(roomData =>
					<RoomCard key={`room-${roomData["_id"]}`} roomData={roomData} />
				)
			}
		</div>
	</>;
};

export default SearchRoomsPage;