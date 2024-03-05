import Turns from '../models/turns.model.js'
import mongoose from 'mongoose'

//funcion que diariamente a las 23:45 de la noche borra todos los registros de ese dia y anteriores de la db
const deleteAntiquesRecordsDBService = async ()=>{
    try{
        let today=new Date()
        let actualYear = today.getFullYear();
        let actualMonth = today.getMonth()+1;
        let actualDay = today.getDate();
        let result = await Turns.deleteMany(
                { $or: [
                        { year: { $lt: actualYear } },
                        { 
                          $and: [
                            {year: actualYear},
                            {month: {$lt: actualMonth}}
                        ]  
                        },
                        {
                          $and: [
                            {year: actualYear},
                            {month: actualMonth},
                            {day: { $lte: actualDay }}
                        ]   
                        }
                ]
                }    
        )
        console.log('---------------------------------------------------------------------------')        
        console.log(`Borrado De Mantenimiento Diario: ${actualDay}/${actualMonth}/${actualYear} `)
        console.log(`Registros borrados: ${result.deletedCount}`)
        console.log('---------------------------------------------------------------------------')
    }catch(e){ 
        let today=new Date()
        let actualYear = today.getFullYear();
        let actualMonth = today.getMonth()+1;
        let actualDay = today.getDate();
        console.log('---------------------------------------------------------------------------')        
        console.log(`Error en Borrado De Mantenimiento Diario: ${actualDay}/${actualMonth}/${actualYear} `)
        console.log('---------------------------------------------------------------------------')        
    }    



}

const deleteDisabledTurnService = async(data)=>{
    const {day, month, year, hourIndex, doctor} = data;
    let result= await Turns.deleteOne({day, month, year, hourIndex, doctor})
    if (result.acknowledged && result.deletedCount==1) return 200
    else return 500
}

//-Funcion que se usa para cancelar turno individual
const deleteTurnService = async(data)=>{
    let result;
    await Turns.deleteOne({_id:data } )
        .then(resolve=>{
            result=200
        })
        .catch(error=>{
            result=500
        })
    return result;
}

const deleteTurnServiceAll= async (day,month,year,doctor)=>{
    let result;
    await Turns.deleteMany({day, month, year, doctor})
        .then(resolve=>{
            result=200
        })
        .catch(error=>{
            result=500
        })
    return result;
} 

//-funcion para que el medico pueda activar un dia desactivado
const activateDayService = async(data)=>{
    const year=data.year;
    const month=data.month;
    const day=data.day;
    const doctor=data.doctor;
    let response;
    await Turns.deleteOne({ year, month, day, doctor})
        .then(resolve=>{
            response= 200
        })
        .catch(error=>{
            response= 500
        })
    return response;    
}

const updateTurnService = async (data)=>{
    try{
        let result = await Turns.updateOne({
            day:data.day,
            month: data.month,
            year:data.year,
            hour: data.hour,
            minute: data.minute
            },
            {
            $set: {
                status: 'busy',
                idpaciente: data.idpaciente,
                typetreatment: data.typetreatment,
                healthinsurance: data.healthinsurance,
                comment: data.comment,
            }    
            }
        )
        return result;

    }catch(e) {
        return 500
    }
}

//-funcion para grabar un turno de cualquier indole
const createTurnService = async (data)=>{
    try {
        let result = await Turns.create(data) 
        return result;
    }catch (e) {
        return 500
    }
}
//-funcion para ver si existe un turno determinado para un doctor determinado
const findTurnService = async (year, month, day, hour, minute, doctor) =>{
    try{
        let result = await Turns.findOne({year, month, day, hour, minute, doctor})
        return result
    }catch(e) {
        return 500;
    }
}

//aca estoy tratando de que para un medico en particular cuando busco desde cliente en turnero me devuelva algo
const getTurnService = async(year, month, idDoctor, day)=>{
    try {
        if (!day) {
            let result = await Turns.find({
                year, month, doctor: idDoctor
            })
            return result
        }
        let result = await Turns.find({
            year,
            month,
            day,
            doctor
        })
        return result;
    }catch(e) {
        return 500
    }
}


export {
    createTurnService,
    findTurnService,
    updateTurnService,
    getTurnService,
    deleteTurnService,
    deleteTurnServiceAll,
    activateDayService,
    deleteDisabledTurnService,
    deleteAntiquesRecordsDBService,
}