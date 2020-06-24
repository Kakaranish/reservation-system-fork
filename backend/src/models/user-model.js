import mongoose from 'mongoose';
import emailValidator from 'email-validator';
const Schema = mongoose.Schema;

const availableRoles = [
    "USER",
    "ADMIN"
];

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    }
});

userSchema.path('email').validate(email =>
    emailValidator.validate(email), "invalid 'email'"
);

userSchema.path('role').validate(role =>
    availableRoles.includes(role), "invalid 'role'"
);

userSchema.methods.toIdentityJson = function ()  {
    return {
        id: this._id,
        email: this.email,
        role: this.role
    };
};

userSchema.post('save', (error, doc, next) => {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new Error("'email' must be unique"));
    } else {
        next(error);
    }
});

const UserModel = mongoose.model('user', userSchema);

export default UserModel;