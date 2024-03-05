import { Schema, model } from "mongoose";

const doctorSchema = new Schema({
    name: {
        type:String,
        require: [true ,'El nombre es requerido.']
    },
    lastName: {
        type: String,
        require: [true, 'El apellido es requerido.']
    },
    stringName: {
        type: String,
        require: [true, 'El literal del nombre es requerido.']
    },
    title: {
        type: String,
        enum: ['Dra.', 'Dr.'],
        default: 'Dr.',
    },
    email: {
        type: String,
        require: [true,'El email es requerido.']
    },
    password: {
        type: String,
        require: [true, 'El password es requerido.']
    },
    active: Boolean,
    admin: Boolean
})

const Doctors = model('Doctores', doctorSchema);

export default Doctors;
