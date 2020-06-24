import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import EditReservationCalendar from '../../components/EditReservationCalendar';

const EditReservationPage = (props) => {

    const history = useHistory();

    const reservationId = props.match.params.reservationId;
    const [state, setState] = useState({
        isLoading: true,
        reservation: null,
        room: null
    });
    const [selectedInterval, setSelectedInterval] = useState(null);
    const onSelectedInterval = passedSelectedInterval =>
        setSelectedInterval(passedSelectedInterval)

    const handleMakeChange = async () => {
        const uri = `/reservations/${state.reservation._id}/user`
        const result = await axios.put(uri, {
            fromDate: selectedInterval.start.toDate(),
            toDate: selectedInterval.end.toDate()
        });
        if (result.status !== 200) {
            alert('Internal error. Try refresh page.');
            result.data.errors.forEach(e => console.log(e.msg ?? e));
            return;
        }
        alert('Reservation updated. Pending for admin acceptation.');
        history.push('/user/manage-reservations');
    };

    const dateIntervalToGenerate = {
        start: moment().startOf('day'),
        end: moment().startOf('day').add(6, 'months')
    };

    useEffect(() => {
        const fireXD = async () => {
            const reservationResult = await axios.get(`/reservations/${reservationId}/user`,
                { validateStatus: false })

            if (reservationResult.status !== 200) {
                alert('Error. Try refresh.');
                reservationResult.data.errors.forEach(e => console.log(e?.msg ?? e));
                setState({ isLoading: false, reservation: null });
                return;
            }


            if (!['PENDING', 'ACCEPTED'].includes(reservationResult.data?.status)) {
                setState({ isLoading: false, reservation: null });
                return;
            }

            const reservation = reservationResult.data;
            setSelectedInterval({
                start: moment(reservation.fromDate),
                end: moment(reservation.toDate)
            });

            // TODO: CHANGE TO HAVE CUSTOM ERRORS
            const roomResult = await axios(`/rooms/${reservation.roomId}`);
            if (roomResult.status !== 200) {
                alert('Error. Try refresh.');
                reservationResult.data.errors.forEach(e => console.log(e?.msg ?? e));
                setState({ isLoading: false, reservation: null });
                return;
            }

            const room = roomResult.data;
            setState({ isLoading: false, reservation: reservation, room: room });
        };

        if (isObjectIdValid(reservationId)) fireXD();
    }, []);


    if (!isObjectIdValid(reservationId)) {
        return (
            <div className="row">
                <div className="col-12">
                    <h2>There is no reservation to edit with id '{reservationId}'!</h2>
                </div>
            </div>
        );
    }

    if (state.isLoading) return <></>;
    else {
        if (!state.reservation) return <h2>There is no reservation to edit with id '{reservationId}'.</h2>
        else return (
            <>
                <div className="container p-4 bg-white">

                    <div className='row'>
                        <div className='col-md-6'>
                            <div><b className='m-0 p-0'>Before changes</b>:</div>

                            <div>
                                <b>Date interval:</b> {moment(state.reservation.fromDate).format('YYYY-MM-DD')} -&nbsp;
                            {moment(state.reservation.toDate).format('YYYY-MM-DD')}
                            </div>

                            <div>
                                <b>Total Price:</b> {state.reservation.totalPrice} PLN
                        </div>
                        </div>
                        <div className='col-md-6'>
                            <div><b>After changes</b>:</div>
                            <div>
                                <b>Date interval:</b> {selectedInterval.start.format('YYYY-MM-DD')} -&nbsp;
                        {selectedInterval.end.format('YYYY-MM-DD')}
                            </div>

                            <div>
                                <b>Total price: </b>
                                {
                                    (() => {
                                        const daysBetween = selectedInterval.end.diff(selectedInterval.start, 'days') + 1
                                        return daysBetween * state.room.pricePerDay;
                                    })()
                                }
                            PLN
                        </div>
                        </div>
                    </div>

                    <div className="row mb-4">

                        <div className="col-12">
                            <EditReservationCalendar
                                reservation={state.reservation}
                                room={state.room}
                                onSelectedInterval={onSelectedInterval}
                                dateIntervalToGenerate={dateIntervalToGenerate}
                            />
                        </div>
                    </div>

                    <div className="row">

                        {
                            (() => {
                                const areSame = selectedInterval.start.startOf('day').diff(moment(state.reservation.fromDate).startOf('day')) === 0 &&
                                    selectedInterval.end.startOf('day').diff(moment(state.reservation.toDate).startOf('day')) === 0;
                                return areSame
                                    ?
                                    <button type="submit" className="btn btn-block secondary-btn" disabled={true}>
                                        Nothing changed. Cannot update reservation
                                    </button>
                                    :
                                    <button type="submit" className="btn btn-block secondary-btn" disabled={false} onClick={handleMakeChange}>
                                        Make changed
                                    </button>

                            })()
                        }
                    </div>
                </div>
            </>
        );
    }
};

const isObjectIdValid = objectId => {
    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
    return checkForHexRegExp.test(objectId);
}

export default EditReservationPage;