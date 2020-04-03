import React from "react";
import queryString from "query-string";
import moment from 'moment';
import axios from "axios";

const resolveQueryParams = queryParams => {
    const fromDateMoment = moment(queryParams.fromDate, "DD-MM-YYYY", true).utc();
    let fromDate = fromDateMoment.isValid()
        ? fromDateMoment.toDate()
        : moment().utc().startOf('day').toDate();
    

    const toDateMoment = moment(queryParams.toDate, "DD-MM-YYYY", true).utc();
    let toDate = toDateMoment.isValid()
        ? toDateMoment.toDate()
        : moment().utc().startOf('day').toDate();

        console.log(toDate);
    if (fromDate.getTime() > toDate.getTime()) {
        [fromDate, toDate] = [toDate, fromDate];
    }

    let fromPrice = parseInt(queryParams.fromPrice) || 50;
    let toPrice = parseInt(queryParams.toPrice) || 150;
    if (fromPrice > toPrice) [fromPrice, toPrice] = [toPrice, fromPrice];

    return {
        fromDate: fromDate,
        toDate: toDate,
        fromPrice: fromPrice,
        toPrice: toPrice
    };
};

const getRooms = async queryParams => {
    const rooms = await axios.get("/rooms", {
        params: {
            fromPrice: queryParams.fromPrice,
            toPrice: queryParams.toPrice,
            fromDate: queryParams.fromDate.toISOString(),
            toDate: queryParams.toDate.toISOString()
        }
    });
};

const RoomsPage = (props) => {
    const queryParams = queryString.parse(props.location.search);
    const resolvedQueryParams = resolveQueryParams(queryParams);
    console.log(resolvedQueryParams);
    getRooms(resolvedQueryParams);

    return (
        <div>
            <p>Rooms</p>
            <p>From date: {moment(resolvedQueryParams.fromDate).format("DD-MM-YYYY")}</p>
            <p>To date: {moment(resolvedQueryParams.toDate).format("DD-MM-YYYY")}</p>
            <p>From price: {resolvedQueryParams.fromPrice}</p>
            <p>To price: {resolvedQueryParams.toPrice}</p>
        </div>
    );
};

export default RoomsPage;