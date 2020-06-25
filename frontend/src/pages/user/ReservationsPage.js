import React, { useState } from "react";
import CancellableReservation from "../../components/user/CancellableReservation";
import ReservationInfo from "../../components/user/ReservationInfo";
import TabHeader from "../../components/TabHeader";
import LazyReservations from "../../components/LazyReservations";

const ReservationsPage = () => {

	const [currentTab, setCurrentTab] = useState('navbar-pending');

	return <>
		<h3>Restaurants</h3>

		<div className="nav nav-tabs" id="nav-tab" role="tablist">
			<TabHeader title={'PENDING'} uniqueInitial={'navbar-pending'}
				setCurrentTab={setCurrentTab} currentTab={currentTab} />

			<TabHeader title={'ACCEPTED'} uniqueInitial={'navbar-accepted'}
				setCurrentTab={setCurrentTab} currentTab={currentTab} />

			<TabHeader title={'REJECTED'} uniqueInitial={'navbar-rejected'}
				setCurrentTab={setCurrentTab} currentTab={currentTab} />

			<TabHeader title={'CANCELLED'} uniqueInitial={'navbar-cancelled'}
				setCurrentTab={setCurrentTab} currentTab={currentTab} />
		</div>

		<div className="tab-content bg-white">

			<LazyReservations currentTab={currentTab} status='pending' role="USER"
				showReservations={reservations =>

					<div className="p-4">
						{
							reservations.map(reservation =>
								<CancellableReservation
									key={reservation._id}
									reservation={reservation} />
							)
						}
					</div>
				} />

			<LazyReservations currentTab={currentTab} status='accepted' role="USER"
				showReservations={reservations =>

					<div className="p-4">
						{
							reservations.map(reservation =>
								<CancellableReservation
									key={reservation._id}
									reservation={reservation} />
							)
						}
					</div>
				} />

			<LazyReservations currentTab={currentTab} status='rejected' role="USER"
				showReservations={reservations =>

					<div className="p-4">
						{
							reservations.map(reservation =>
								<ReservationInfo
									key={reservation._id}
									reservation={reservation} />
							)
						}
					</div>
				} />

			<LazyReservations currentTab={currentTab} status='cancelled' role="USER"
				showReservations={reservations =>

					<div className="p-4">
						{
							reservations.map((reservation, i) =>
								<>
									<ReservationInfo
										key={reservation._id}
										reservation={reservation} />
									{
										(i !== reservations.length - 1) &&
										<div style={{height: "20px"}}></div>
									}

								</>
							)
						}
					</div>
				} />
		</div>
	</>
};

export default ReservationsPage;