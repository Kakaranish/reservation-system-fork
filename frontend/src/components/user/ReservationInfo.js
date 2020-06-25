import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

const ReservationInfo = ({ reservation, children }) => {
	return <>
		<div className="card border-0 p-1 mb-3">
			<div className="row no-gutters">
				<div className="col-auto">
					<img src={reservation.room.image.thumbnailUri} style={{ width: "40vh" }} />
				</div>

				<div className="col pb-3">
					<div className="card-block px-4">
						<p className="card-text">
							What's requested room?&nbsp;
							<Link to={`/rooms/${reservation.room._id}`}>
								<b>{reservation.room.name}</b>
							</Link>
							&nbsp;| {reservation.room.location}
						</p>

						<p className="card-text">
							When? <b>{moment(reservation.fromDate).format("YYYY-MM-DD")} -&nbsp;
							{moment(reservation.toDate).format("YYYY-MM-DD")}</b>
						</p>

						<p className="card-text">
							Pice Per Day: <b>{reservation.pricePerDay}PLN</b>
						</p>

						<p className="card-text">
							Total Price: <b>{reservation.totalPrice}PLN</b>
						</p>
					</div>
				</div>

				{children}

			</div>
		</div>
	</>
};

export default ReservationInfo;