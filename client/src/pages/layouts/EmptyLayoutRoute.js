import React from 'react';
import { Route } from "react-router-dom";
import EmptyLayout from "./EmptyLayout";

const EmptyLayoutRoute = ({ component: Component, ...rest }) => {
    return (
        <Route {...rest} render={matchProps => (
            <EmptyLayout>
                <Component {...matchProps} />
            </EmptyLayout>
        )} />
    )
};

export default EmptyLayoutRoute;