import React from 'react';

const EditRoomPage = ({ match }) => {
    
    const roomId = match.params.id;
    
    return <>
        EditRoomPage {roomId}
    </>
};

export default EditRoomPage;