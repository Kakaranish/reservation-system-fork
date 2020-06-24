import React, { useState } from "react";
import PendingReservation from "../../components/admin/PendingReservation";
import AcceptedReservation from "../../components/admin/AcceptedReservation";
import RejectedReservation from "../../components/admin/RejectedReservation";
import ReservationInfo from "../../components/ReservationInfo";
import LazyReservations from "../../components/LazyReservations";
import TabHeader from "../../components/TabHeader";

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

			<LazyReservations currentTab={currentTab} status='pending' role="ADMIN"
				showReservations={reservations =>

					<div className="container p-4">
						{
							reservations.map(reservation =>
								<PendingReservation
									key={reservation._id}
									reservation={reservation} />
							)
						}
					</div>
				} />

			<LazyReservations currentTab={currentTab} status='accepted' role="ADMIN"
				showReservations={reservations =>

					<div className="container p-4">
						{
							reservations.map(reservation =>
								<AcceptedReservation
									key={reservation._id}
									reservation={reservation} />
							)
						}
					</div>
				} />

			<LazyReservations currentTab={currentTab} status='rejected' role="ADMIN"
				showReservations={reservations =>

					<div className="container p-4">
						{
							reservations.map(reservation =>
								<RejectedReservation
									key={reservation._id}
									reservation={reservation} />
							)
						}
					</div>
				} />

			<LazyReservations currentTab={currentTab} status='cancelled' role="ADMIN"
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