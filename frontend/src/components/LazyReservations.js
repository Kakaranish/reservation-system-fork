import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { requestHandler } from '../common/utils';
import TabContent from './TabContent';

const LazyReservations = ({ currentTab, status, showReservations, role }) => {

    const uniqueInitial = `navbar-${status}`;
    const isActive = currentTab === uniqueInitial;
    const [reservations, setReservations] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            const statusUpper = status.toUpperCase();

            const uri = role === 'OWNER'
                ? `/owner/reservations/status/${statusUpper}`
                : `/user/reservations/status/${statusUpper}`;
            const action = async () => axios.get(uri, { validateStatus: false });
            const result = await requestHandler(action, {
                status: 400,
                callback: async res => console.log(res)
            });
            setReservations(result);
        };

        if (!reservations && uniqueInitial === currentTab) fetch();
    }, [currentTab]);

    if (!isActive || !reservations) return <></>
    else if (!reservations.length) return <>
        <TabContent isActive={isActive} uniqueInitial={'navbar-acccepted'}>
            <h3>No reservations</h3>
        </TabContent>
    </>

    return <>
        <TabContent isActive={isActive} uniqueInitial={uniqueInitial}>
            {showReservations(reservations)}
        </TabContent>
    </>
};

export default LazyReservations;