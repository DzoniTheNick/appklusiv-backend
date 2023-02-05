import { Schema, model } from 'mongoose';

const UserSchema: Schema = new Schema({
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    }
},
{ collection: 'users' });

const User = model('userData', UserSchema);

export default User;