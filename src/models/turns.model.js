import { Schema, model } from "mongoose";

const turnSchema = new Schema({
    year: {
        type: Number,
        require: [true, 'El Año es requerido.']
        },
    month: {
        type: Number,
        require: [true, 'El Mes es requerido.']
    },
    day: {
        type: Number,
        require: [true, 'El dia es requerido']
    },
    hour: String,
    minute: String,
    hourIndex: Number,
    status: {
          type: String,
          enum: ['busy', 'free', 'offDuty'],
    },
    idpatient: {
        type: String,
        require: [true, 'Un nombre de paciente es requerido']
    },
    email: {
        type: String,
        require: [true, 'Un email unico es obligatorio']
    },
    typetreatment: {
                type: String,
                enum: ['urgencia','consulta','extraccion','conducto', 'limpieza', 'restauracion'],
    },
    healthinsurance: String,
    phone: {
        type: String,
        require: [true, 'Un numero de teléfono es requerido']
    },
    comment: String,
    doctor: {
        type: String,
        require: [true, 'El doctor es requerido']
    }
})

const Turns = model('Turnos', turnSchema);

export default Turns;