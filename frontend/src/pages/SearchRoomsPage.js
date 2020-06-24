import React, { useEffect, useState } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import { Redirect } from 'react-router-dom';
import RoomCard from '../components/RoomCard';
import { requestHandler } from '../common/utils';

const SearchRoomsPage = (props) => {
	const phrase = queryString.parse(props.location.search).phrase;

	const [state, setState] = useState({ loading: true });
	useEffect(() => {
		const fetch = async () => {
			const uri = `/rooms/with-phrase/${encodeURIComponent(phrase)}`;
			const action = async () => axios.get(uri, { validateStatus: false });
			const rooms = await requestHandler(action);
			setState({ loading: false, rooms });
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