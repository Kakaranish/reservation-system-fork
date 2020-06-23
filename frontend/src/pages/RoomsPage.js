import React, { useState, useEffect } from "react";
import queryString from "query-string";
import moment from 'moment';
import axios from "axios";
import RoomCard from "../components/RoomCard";

const RoomsPage = (props) => {
	const queryParams = queryString.parse(props.location.search);
	const resolvedQueryParams = resolveQueryParams(queryParams);

	const [rooms, setRooms] = useState(null);
	useEffect(() => {
		const intervalLength = resolvedQueryParams.toDate.diff(resolvedQueryParams.fromDate, 'days') + 1;
		const getRooms = async queryParams => {
			const result = await axios.get('/rooms', {
				validateStatus: false,
				params: {
					fromPrice: queryParams.fromPrice,
					toPrice: queryParams.toPrice,
					fromDate: queryParams.fromDate.toISOString(),
					toDate: queryParams.toDate.toISOString()
				}
			});
			if (result.status !== 200) {
				result.data.errors.forEach(e => console.log(e?.msg ?? e));
				alert('Internal error. Try to refresh page.');
				return;
			}

			const rooms = result.data ?? [];
			rooms.forEach(r => r.totalPrice = r.pricePerDay * intervalLength);
			setRooms(rooms);
		};
		getRooms(resolvedQueryParams);
	}, []);

	return (
		<>
			{
				!rooms
					? null
					: rooms.length > 0
						?
						<>
							<ul className="global-font">
								<li>Date interval: {moment(resolvedQueryParams.fromDate).format("DD-MM-YYYY")} - {moment(resolvedQueryParams.toDate).format("DD-MM-YYYY")}</li>
								<li>Price: {resolvedQueryParams.fromPrice}PLN - {resolvedQueryParams.toPrice}PLN</li>
							</ul>

							<div className="row">
								{rooms.map(roomData => <RoomCard key={`room-${roomData["_id"]}`} roomData={roomData} />)}
							</div>
						</>
						:
						<div>
							<h3>There is no rooms for following criterias:</h3>
							<ul>
								<li>Date interval: {moment(resolvedQueryParams.fromDate).format("DD-MM-YYYY")} - {moment(resolvedQueryParams.toDate).format("DD-MM-YYYY")}</li>
								<li>Price: {resolvedQueryParams.fromPrice}PLN - {resolvedQueryParams.toPrice}PLN</li>
							</ul>
						</div>
			}
		</>
	);
};

const resolveQueryParams = queryParams => {
	let fromDate = moment.utc(queryParams.fromDate, "DD-MM-YYYY", true);
	if (!fromDate.isValid()) fromDate = moment.utc().startOf('day');

	let toDate = moment.utc(queryParams.toDate, "DD-MM-YYYY", true);
	if (!toDate.isValid()) toDate = moment.utc().startOf('day');

	if (fromDate.isAfter(toDate)) [fromDate, toDate] = [toDate, fromDate];

	let fromPrice = parseInt(queryParams.fromPrice) || 0;
	let toPrice = parseInt(queryParams.toPrice) || 2000;
	if (fromPrice > toPrice) [fromPrice, toPrice] = [toPrice, fromPrice];

	return {
		fromDate: fromDate,
		toDate: toDate,
		fromPrice: fromPrice,
		toPrice: toPrice
	};
};

export default RoomsPage;