import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true
    },
    token: {
        type: String,
        unique: true,
        required: true
    }
});

const model = mongoose.model('refreshToken', schema);

export default model;