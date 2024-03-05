import mongoose from "mongoose";

const {DB_URI} = process.env;

export const connectDB = async ()=>{
        try {
            mongoose.set('strictQuery', false)
            await mongoose.connect(DB_URI);
            console.log('Se conecto correctamente a la DB.')
        }catch(e) {
            console.log(`Error al conectar a la DB. ${e}`)
        }


}