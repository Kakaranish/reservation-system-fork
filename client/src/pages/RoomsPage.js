import React, { useState, useEffect } from "react";
import queryString from "query-string";
import moment from 'moment';
import axios from "axios";

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
		const getRooms = async queryParams => {
			const result = await axios.get('/rooms', {
				params: {
					fromPrice: queryParams.fromPrice,
					toPrice: queryParams.toPrice,
					fromDate: queryParams.fromDate.toISOString(),
					toDate: queryParams.toDate.toISOString()
				}
			});
			setRooms(result.data.rooms);
			console.log(result.data);
		};
		getRooms(resolvedQueryParams);
	}, []);

	return (
		<div>
			<p>Rooms</p>
			<p>From date: {moment(resolvedQueryParams.fromDate).format("DD-MM-YYYY")}</p>
			<p>To date: {moment(resolvedQueryParams.toDate).format("DD-MM-YYYY")}</p>
			<p>From price: {resolvedQueryParams.fromPrice}</p>
			<p>To price: {resolvedQueryParams.toPrice}</p>

			{
				!rooms
					? null
					: rooms.map(room => {
						return (
							<div style={{borderBottom: "1px solid red"}}>
								<p>Name: {room.name}</p>
								<p>Location: {room.location}</p>
								<p>Price per day: {room.pricePerDay}</p>
							</div>
						);
					})
			}
		</div>
	);
};

export default RoomsPage;