import React, { useState } from "react";
import { Link } from "react-router-dom";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import QueryString from "query-string";
import moment from 'moment';

const RoomFilterPage = () => {
    const [dateInterval, setDateInterval] = useState({
        from: new Date(new Date().setUTCHours(0, 0, 0, 0)),
        to: new Date(new Date().setUTCHours(0, 0, 0, 0))
    });

    const fromDateOnChange = value => {
        if (value.getTime() > dateInterval.to.getTime()) {
            setDateInterval({
                from: dateInterval.to,
                to: value
            });
        }
        else {
            setDateInterval({
                from: value,
                to: dateInterval.to
            });
        }
    };

    const toDateOnChange = value => {
        if (value.getTime() < dateInterval.from.getTime()) {
            setDateInterval({
                from: value,
                to: dateInterval.from
            });
        }
        else {
            setDateInterval({
                from: dateInterval.from,
                to: value
            });
        }
    };

    const [priceInterval, setPriceInterval] = useState({
        start: 100,
        end: 300
    });

    const priceIntervalOnChange = value => {
        setPriceInterval({
            start: value[0],
            end: value[1]
        });
    }

    return (
        <div>
            <div className="row">
                <div className="col-12">
                    <h3>Set your preferences about conference rooms</h3>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <h4>When you need conference room?</h4>
                </div>
                <div className="col-lg-6">
                    <div className="row justify-content-center">
                        <Calendar onChange={fromDateOnChange} value={dateInterval.from} minDate={new Date()} maxDate={moment().add(6, 'months').toDate()} />
                    </div>
                    <div className="row justify-content-center">
                        <b>From</b>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="row justify-content-center">
                        <Calendar onChange={toDateOnChange} value={dateInterval.to} minDate={new Date()} maxDate={moment().add(6, 'months').toDate()}  />
                    </div>
                    <div className="row justify-content-center">
                        <b>To</b>
                    </div>
                </div>
            </div>

            <div className="row mt-5">
                <div className="col-12">
                    <h4>Select the price range that suits you</h4>
                </div>
            </div>
            <div className="row mt-2 align-content-center">
                <div className="col-2">
                    {priceInterval.start} PLN
                </div>
                <div className="col-8">
                    <Range min={0} max={2000} defaultValue={[priceInterval.start, priceInterval.end]}
                        step={20} onChange={priceIntervalOnChange} />
                </div>
                <div className="col-2">
                    {priceInterval.end} PLN
                </div>
            </div>

            <div className="row mt-md-5 mt-2">
                <div className="offset-3 col-6 ">
                    <Link to={{
                        pathname: "rooms",
                        search: QueryString.stringify({
                            fromDate: moment(dateInterval.from).format("DD-MM-YYYY"),
                            toDate: moment(dateInterval.to).format("DD-MM-YYYY"),
                            fromPrice: priceInterval.start,
                            toPrice: priceInterval.end
                        })
                    }}>
                        <button type="button" class="btn btn-primary btn-lg btn-block">Search Rooms!</button>
                    </Link>
                </div>
            </div>
        </div >
    );
};

export default RoomFilterPage;