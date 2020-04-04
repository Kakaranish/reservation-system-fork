import React, { useState, useEffect } from "react";
import queryString from "query-string";
import moment from 'moment';
import axios from "axios";
import RoomCard from "../components/RoomCard";

const resolveQueryParams = queryParams => {
	let fromDate = moment.utc(queryParams.fromDate, "DD-MM-YYYY", true);
	if (!fromDate.isValid()) fromDate = moment.utc().startOf('day');

	let toDate = moment.utc(queryParams.toDate, "DD-MM-YYYY", true);
	if (!toDate.isValid()) toDate = moment.utc().startOf('day');

	if (fromDate.isAfter(toDate)) [fromDate, toDate] = [toDate, fromDate];

	let fromPrice = parseInt(queryParams.fromPrice) || 50;
	let toPrice = parseInt(queryParams.toPrice) || 150;
	if (fromPrice > toPrice) [fromPrice, toPrice] = [toPrice, fromPrice];

	return {
		fromDate: fromDate,
		toDate: toDate,
		fromPrice: fromPrice,
		toPrice: toPrice
	};
};

const RoomsPage = (props) => {
	const queryParams = queryString.parse(props.location.search);
	const resolvedQueryParams = resolveQueryParams(queryParams);

	const [rooms, setRooms] = useState(null);
	useEffect(() => {
		const intervalLength = resolvedQueryParams.toDate.diff(resolvedQueryParams.fromDate, 'days');
		const getRooms = async queryParams => {
			const result = await axios.get('/rooms', {
				params: {
					fromPrice: queryParams.fromPrice,
					toPrice: queryParams.toPrice,
					fromDate: queryParams.fromDate.toISOString(),
					toDate: queryParams.toDate.toISOString()
				}
			});

			result.data.rooms.forEach(room =>
				room.totalPrice = room.pricePerDay * intervalLength);
			setRooms(result.data.rooms);
		};
		getRooms(resolvedQueryParams);
	}, []);

	return (
		<div>
			<p>From date: {moment(resolvedQueryParams.fromDate).format("DD-MM-YYYY")} | To date: {moment(resolvedQueryParams.toDate).format("DD-MM-YYYY")}</p>
			<p>From price: {resolvedQueryParams.fromPrice} | To price: {resolvedQueryParams.toPrice}</p>

			<div className="row">
				{
					!rooms
						? null
						: rooms.map(roomData => <RoomCard key={roomData["_id"]} roomData={roomData} />)
				}
			</div>
		</div>
	);
};

export default RoomsPage;