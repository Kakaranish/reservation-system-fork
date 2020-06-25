import React from 'react';
import Checkbox from '../Checkbox';

const RoomForm = ({ room, handleSubmit = () => { }, children }) => {

	return <>
		<form onSubmit={handleSubmit}>
			<div className="form-group row">
				<label className="col-sm-2 col-form-label">
					Name
				</label>
				<div className="col-sm-10">
					<input className="form-control bg-white" name="name"
						placeholder="Name..." defaultValue={room?.name} required />
				</div>
			</div>

			<div className="form-group row">
				<label className="col-sm-2 col-form-label">
					Capacity
				</label>
				<div className="col-sm-10">
					<input type="number" className="form-control" name="capacity"
						placeholder="Capacity..." defaultValue={room?.capacity} required />
				</div>
			</div>

			<div className="form-group row">
				<label className="col-sm-2 col-form-label">
					Location
				</label>
				<div className="col-sm-10">
					<input className="form-control" name="location"
						placeholder="Location..." defaultValue={room?.location} required />
				</div>
			</div>

			<div className="form-group row">
				<label className="col-2 col-form-label" required>
					Price/Day [PLN]
				</label>
				<div className="col-sm-10">
					<input className="form-control" name="pricePerDay" type="number"
						placeholder="Price per day" step="0.01"
						defaultValue={room?.pricePerDay} required />
				</div>
			</div>

			<div className="form-group row">
				<label className="col-2 col-form-label" placeholder="Description..." >
					Description
				</label>
				<div className="col-sm-10">
					<textarea className="form-control" name="description"
						rows="3" defaultValue={room?.description} required>
					</textarea>
				</div>
			</div>

			<div className="form-group row">
				<label className="col-sm-2 col-form-label">
					Amenities
				</label>
				<div className="col-10 text-left align-self-center">
					{
						amenities.map(x => < Checkbox key={x.name} name={x.name}
							label={x.label} checkedByDefault={
								!room?.amenities
									? x.checkedByDefault
									: room.amenities.some(amt => amt === x.name)
							} />)
					}
				</div>
			</div>

			<div className="form-group row">
				<label className="col-sm-2 col-form-label">
					Availability
				</label>
				<div className="col-10 text-left align-self-center ">
					{
						dows.map(x => < Checkbox key={x.name} name={x.name}
							label={x.label} checkedByDefault={
								!room?.dows
									? x.checkedByDefault
									: room.dows.some(dow => dow === x.name)
							} />)
					}
				</div>
			</div>

			{children}

		</form>
	</>
};

const amenities = [
	{ name: "amtTV", label: "TV", "checkedByDefault": false },
	{ name: "amtMicrophone", label: "Microphone", "checkedByDefault": false },
	{ name: "amtProjector", label: "Projector", "checkedByDefault": true },
	{ name: "amtPhone", label: "Phone", "checkedByDefault": false }
];

const dows = [
	{ name: "dowMonday", label: "Monday", "checkedByDefault": true },
	{ name: "dowTuesday", label: "Tuesday", "checkedByDefault": true },
	{ name: "dowWednesday", label: "Wednesday", "checkedByDefault": true },
	{ name: "dowThursday", label: "Thursday", "checkedByDefault": true },
	{ name: "dowFriday", label: "Friday", "checkedByDefault": true },
	{ name: "dowSaturday", label: "Satursday", "checkedByDefault": false },
	{ name: "dowSunday", label: "Sunday", "checkedByDefault": false },
];

export default RoomForm;