import React, { useState } from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from "moment";
import 'react-big-calendar/lib/css/react-big-calendar.css';

const ReservationCalendar = ({ onSelectedInterval, reservations, dows, dateIntervalToGenerate }) => {
    const localizer = momentLocalizer(moment);
    moment.locale('ko', {
        week: {
            dow: 1,
            doy: 1
        }
    });

    const [selectedInterval, setSelectedInterval] = useState(null);
    const [events, setEvents] = useState({
        dateIntervals: mapReservationsToEvents(reservations)
    });

    const onSelectSlot = slotInfo => {
        const newEvent = {
            start: slotInfo.start,
            end: moment(slotInfo.end).startOf('day').add(1, 'days').subtract(1, 'milliseconds').toDate(),
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
            "fromDate": newEvent.start,
            "toDate": newEvent.end
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
                min={moment().toDate()} //TODO
                max={moment().add(5, "days").toDate()} //TODO
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

/**
 * @param {Array} reservations 
 */
const mapReservationsToEvents = reservations => {
    return reservations.map(reservation => {
        return {
            start: reservation.start,
            end: moment(reservation.end).startOf('day').add(1, 'days').subtract(1, 'milliseconds').toDate(),
            title: reservation.title,
            type: reservation.type
        };
    })
}

export default ReservationCalendar;