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
			<div className="row">
				{
					!rooms
						? null
						: rooms.length > 0
							? <div>
								<ul>
									<li>Date interval: {moment(resolvedQueryParams.fromDate).format("DD-MM-YYYY")} - {moment(resolvedQueryParams.toDate).format("DD-MM-YYYY")}</li>
									<li>Price: {resolvedQueryParams.fromPrice}PLN - {resolvedQueryParams.toPrice}PLN</li>
								</ul>
								{rooms.map(roomData => <RoomCard key={`room-${roomData["_id"]}`} roomData={roomData} />)}
							</div>
							: <div>
								<h3>There is no rooms for following criterias:</h3>
								<ul>
									<li>Date interval: {moment(resolvedQueryParams.fromDate).format("DD-MM-YYYY")} - {moment(resolvedQueryParams.toDate).format("DD-MM-YYYY")}</li>
									<li>Price: {resolvedQueryParams.fromPrice}PLN - {resolvedQueryParams.toPrice}PLN</li>
								</ul>
							</div>
				}
			</div>
		</div>
	);
};

export default RoomsPage;