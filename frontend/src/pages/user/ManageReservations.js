import React, { useState } from "react";
import CancellableReservation from "../../components/user/CancellableReservation";
import ReservationInfo from "../../components/ReservationInfo";
import TabHeader from "../../components/TabHeader";
import LazyReservations from "../../components/LazyReservations";

const ManageReservations = () => {

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

					<div className="container p-4">
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

					<div className="container p-4">
						{
							reservations.map(reservation =>
								<ReservationInfo
									key={reservation._id}
									reservation={reservation} />
							)
						}
					</div>
				} />

			<LazyReservations currentTab={currentTab} status='rejected' role="USER"
				showReservations={reservations =>

					<div className="container p-4">
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

					<div className="container p-4">
						{
							reservations.map(reservation =>
								<ReservationInfo
									key={reservation._id}
									reservation={reservation} />
							)
						}
					</div>
				} />
		</div>
	</>
};

export default ManageReservations;