import mongoose, {Schema} from 'mongoose'
import ImageSchema from './image-schema';

const roomSchema = new Schema({
    ownerId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: String,
    capacity: {
        type: Number,
        get: v => Math.round(v),
        set: v => Math.round(v),
        min: 1,
        alias: 'i'
    },
    pricePerDay: {
        type: Number,
        get: v => v.toFixed(2),
        set: v => v.toFixed(2),
        alias: 'i'
    },
    amenities: {
        type: [String],
        validate: [arr => arr.length > 0, 'At least 1 amenity required']
    },
    dows: {
        type: [String],
        validate: [arr => arr.length > 0, 'At least 1 dow required']
    },
    image: {
        type: ImageSchema,
        required: true
    }
})

const RoomModel = mongoose.model('room', roomSchema);

export default RoomModel;