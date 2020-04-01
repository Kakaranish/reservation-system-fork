import React, {useState, useEffect} from "react";
import 'react-calendar/dist/Calendar.css';
import Calendar from "react-calendar";

const CalendarPicker = () => {
    const [date, setDate] = useState(new Date());
    const onChange = newDate => setDate(newDate);
    const onClickDay = day => {
        console.log(day);
    }
    return (
        <Calendar onChange={onChange} onClickDay={onClickDay} showNavigation />
    );
};

export default CalendarPicker;