import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from "moment";
import axios from "axios";
import 'react-big-calendar/lib/css/react-big-calendar.css';

const ReservationCalendar = ({ roomId, onSelectedInterval, dows, dateIntervalToGenerate, email }) => {
    const localizer = momentLocalizer(moment);
    moment.locale('ko', {
        week: {
            dow: 1,
            doy: 1
        }
    });

    const notAvailableEvents = getEventsForDows(dows, dateIntervalToGenerate);

    const [selectedInterval, setSelectedInterval] = useState(null);
    const [events, setEvents] = useState({
        dateIntervals: []
    });

    useEffect(() => {
        const getEventsForRoomReservations = async (roomId) => {
            try {
                const result = await axios.get(`/rooms/${roomId}/reservations-preview`,
                    { validateStatus: false });
                const reservations = result.data;
                const reservationEvents = mapReservationsToEvents(reservations);
                setEvents({
                    dateIntervals: [...notAvailableEvents, ...reservationEvents]
                });
            } catch (error) {
                // Some error handling...
                console.log(error);
            }
        }

        getEventsForRoomReservations(roomId);
    }, []);

    const onSelectSlot = slotInfo => {
        if(!email) {
            alert('Log in to make reservation');
            return;
        }
        const userDateInterval = {
            start: moment(slotInfo.start).startOf('day'),
            end: moment(slotInfo.end).startOf('day').add(1, 'days').subtract(1, 'milliseconds')
        }

        if (userDateIntervalIsOutOfRange(userDateInterval, dateIntervalToGenerate)) return;

        const newEvent = {
            start: userDateInterval.start.toDate(),
            end: userDateInterval.end.toDate(),
            title: "YOUR SELECTION",
            type: "user",
            allDay: true
        };

        const probablyColidingEvents = !selectedInterval
            ? events.dateIntervals
            : events.dateIntervals.slice(0, -1);
        const overlapWithOtherEvent = probablyColidingEvents.some(event =>
            newEvent.start.getTime() <= event.end.getTime() &&
            newEvent.end.getTime() >= event.start.getTime());
        if (overlapWithOtherEvent) return;

        setSelectedInterval(newEvent);
        setEvents({
            dateIntervals: [...probablyColidingEvents, newEvent]
        });
        onSelectedInterval({
            "fromDate": userDateInterval.start,
            "toDate": userDateInterval.end
        });
    };

    return (
        <div>
            <Calendar
                defaultDate={moment().toDate()}
                views={["month"]}
                localizer={localizer}
                startAccessor="start"
                events={events.dateIntervals}
                endAccessor="end"
                eventPropGetter={customEventPropGetter}
                style={{ height: 500 }}
                selectable={true}
                onSelectSlot={onSelectSlot}
            />
        </div>
    );
};

const customEventPropGetter = event => {
    if (event.type === "user") {
        return {
            style: {
                backgroundColor: "#00b33c",
                color: "white",
                textAlign: "center"
            }
        }
    }
    else if (event.type === "reserved") {
        return {
            style: {
                backgroundColor: "#ff8566",
                color: "white",
                textAlign: "center"
            }
        }
    }
    return {
        style: {
            backgroundColor: "#e6e6e6",
            color: "#8c8c8c",
            textAlign: "center"
        }
    }
};

const userDateIntervalIsOutOfRange = (userDateInterval, legalDateInterval) => {
    return userDateInterval.start.valueOf() < legalDateInterval.start.valueOf() ||
        userDateInterval.end.valueOf() > legalDateInterval.end.valueOf();
};

const getEventsForDows = (dows, dateIntervalToGenerate) => {
    const availability = dows.map(dow => legalDows[dow]);
    const nonAvailability = Object.values(legalDows).filter(dow => !availability.includes(dow)).sort();
    const consecutiveDowsInts = getIntIntervalsFromIntArray(nonAvailability);
    const weeksBetween = dateIntervalToGenerate.end.diff(dateIntervalToGenerate.start, 'week');

    const dowEvents = [];
    const daysInWeek = 7;
    for (let weekIndex = 0; weekIndex < weeksBetween; weekIndex++) {
        consecutiveDowsInts.forEach(consecutiveInts => {
            dowEvents.push({
                start: moment().startOf('week').add(weekIndex * daysInWeek + (consecutiveInts.start - 1), 'days').toDate(),
                end: moment().startOf('week').add(weekIndex * daysInWeek + consecutiveInts.end, 'days').subtract(1, 'milliseconds').toDate(),
                title: "N/A",
                type: "n/a"
            })
        });
    }
    return dowEvents;
};

const getIntIntervalsFromIntArray = intArray => {
    let currentInterval = {
        start: undefined,
        end: undefined
    };
    const intIntervals = [];
    intArray.forEach(currentInt => {
        if (!currentInterval.start) {
            currentInterval.start = currentInt;
            currentInterval.end = currentInt;
            return;
        }

        const isNext = currentInt === currentInterval.end + 1;
        if (isNext) {
            currentInterval.end = currentInt;
            return;
        }

        intIntervals.push(currentInterval);
        currentInterval = {
            start: currentInt,
            end: currentInt
        };
    });
    intIntervals.push(currentInterval);
    return intIntervals;
}

const legalDows = {
    "dowMonday": 1, "dowTuesday": 2, "dowWednesday": 3, "dowThursday": 4,
    "dowFriday": 5, "dowSaturday": 6, "dowSunday": 7
};

/**
 * @param {Array} reservations 
 */
const mapReservationsToEvents = reservations => {
    console.log(reservations)
    return reservations.map(reservation => {
        return {
            start: moment(reservation.startDate).startOf('day').toDate(),
            end: moment(reservation.endDate).startOf('day').add(1, 'days').subtract(1, 'milliseconds').toDate(),
            title: "RESERVED",
            type: "reserved"
        };
    })
};

export default ReservationCalendar;