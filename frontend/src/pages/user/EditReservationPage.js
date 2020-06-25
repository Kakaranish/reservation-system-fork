import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import EditReservationCalendar from '../../components/EditReservationCalendar';
import { requestHandler } from '../../common/utils';
import { toast } from 'react-toastify';

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
        const uri = `/user/reservations/${state.reservation._id}`
        const action = async () => axios.put(uri, {
            fromDate: selectedInterval.start.toDate(),
            toDate: selectedInterval.end.toDate()
        });
        await requestHandler(action, {
            status: 200,
            callback: async () => {
                toast('Reservation updated. Pending for admin acceptation.');
                history.push('/user/reservations');
            }
        });
    };

    const dateIntervalToGenerate = {
        start: moment().startOf('day'),
        end: moment().startOf('day').add(6, 'months')
    };

    useEffect(() => {
        const fetch = async () => {
            const reservationUri = `/user/reservations/${reservationId}`;
            const reservationAction = async () => axios.get(reservationUri,
                { validateStatus: false })
            const reservation = await requestHandler(reservationAction);

            if (!['PENDING', 'ACCEPTED'].includes(reservation?.status)) {
                setState({ isLoading: false, reservation: null });
                return;
            }

            setSelectedInterval({
                start: moment(reservation.fromDate),
                end: moment(reservation.toDate)
            });

        
            const roomAction = async () => axios(`/rooms/${reservation.roomId}`);
            const room = await requestHandler(roomAction);
            setState({ isLoading: false, reservation, room });
        };

        if (isObjectIdValid(reservationId)) fetch();
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
                            // TODO:
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