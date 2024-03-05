import Doctors from '../models/doctors.model.js';
import Turns from '../models/turns.model.js';
import { encryptData } from '../tools/crypto.js';

//Funcion que borra de la db un doctor en forma fisica
const deleteDoctorFromDBService= async (data)=>{
    try{
        let result =await Doctors.deleteOne({_id: data})
        if (result.deletedCount==1) return 200
        else return 500

    }catch(e) {
        return 500
    }

}

//Funcion para borrar de la db los turnos relacionados a un doctor especifico
const deleteTurnsDoctorFromDBService = async (data)=>{
    try{
        let result = await Turns.deleteMany({doctor: data})
        return 200
    }catch(e) {
        return 500
    }    
}


//Funcion que encuentra un administrador activo que no sea admin@gmail.com y lo pone en admin=false
const findAdminAndTurnedOffService = async()=>{
    try{
        let result2 = await Doctors.find({admin: true, active: true});
        if (result2.length>1) {
            let result = await Doctors.findOneAndUpdate ({admin:true, active: true,  email:{$ne: 'admin@gmail.com'} }, {admin: false}, {new:true})
            if (result==null) return 404
            else return 200
        }else return 200
    }catch (error) {
        return 500
    }
}


//Funcion que encuentra los datos de un administrador pasandole el id del mismo y pone admin en true y active en true
const findAdminService = async (id)=>{
   try{
    let result = await Doctors.findOneAndUpdate ({_id: id},{admin: true, active: true}, {new: true})
    if (result==null) return 404 
    else return 200
   }catch(error) {
        return 500
   }
}


//Funcion para activar o desactivar un doctor
const statusDoctorAdminService = async({email, active, admin})=>{
    try {
        let result = await Doctors.findOne({email, active})
        if (result==null) return 500;
        if (admin && active) return 400
        if (!admin && active) result.active=false;
        if (!active) result.active=true;
        let result2 = await result.save();
        if (result2==null) return 500
        else return 200
    }catch (error) {
        return 500
    }    
}

//ver manejo de try catch en el find
//Funcion que se fija si existe administrador y lo devuelve o crea una semilla admin y lo devuelve
const existAdminService = async ()=>{
    let creation;
    const result = await Doctors.find({
        active:true,
        admin:true,
    })
    let adminRecord;
    if (result.length>0) {
                        if (result.length==2) adminRecord = result.filter(x=>x.email!='admin@gmail.com')[0]
                        else adminRecord=result[0];
                        return {status:200,
                            password: adminRecord.password,
                            email: adminRecord.email,
                            email: adminRecord.email,
                            name: adminRecord.name,
                            lastName: adminRecord.lastName,
                            stringName: adminRecord.stringName,
                            title: adminRecord.title,
                            active: adminRecord.active,
                            admin: adminRecord.admin
                        }  //existe una semilla en la db
    }
    let messageResponse;
    if (result.length==0) {
        const adminSeed = {
            name: 'admin',
            lastName: 'admin',
            stringName: 'admin',
            title: 'Dra.',
            email: 'admin@gmail.com',
            password: 'U2FsdGVkX18Di0ibeV+Lviuyk72IsjieKUa4o5I3RjxQk4DSIK3KIugXQmEM5svx', //'adminadminadmin',
            active: true,
            admin: true
        }
        await Doctors.create(adminSeed)
        .then(resolve=>{
            //la semilla admin fue creada
            messageResponse = {status:201,
                password: adminSeed.password,
                email: adminSeed.email,
                name: adminSeed.name,
                lastName: adminSeed.lastName,
                stringName: adminSeed.stringName,
                title: adminSeed.title,
                active: adminSeed.active,
                admin: adminSeed.admin
            }
        })
        .catch(error=>{
            // la semilla admin no existia y no pudo ser creada tiene que reintenar
            messageResponse = {status:500, password: '', email: ''}
        })
    }
    return messageResponse;
}

//funcion para devolver la lista de doctores para el login de paciente para hace el select del medico
const doctorsListService = async (status)=>{
    let messageResponse;
    let result =[];

    await Doctors.find({active: status})
    .then(resolve=>{
        resolve.forEach(item=>{ 
            if (item.email!='admin@gmail.com') {
                result.push({
                    id: (item._id).toString(),
                    stringName: item.stringName,
                    email: item.email,
                    lastName: item.lastName,
                    name: item.name,
                    title: item.title,
                    stringName: item.stringName,
                })
            }
        })
        messageResponse={status:200, data:result}
    })
    .catch(error=>{
        messageResponse={status:500, data:error}
    })

    return messageResponse;

}

//funcion doctorList para el administrador mostrar doctores
const doctorsAdminListService = async ()=>{
    let result =[];
    let messageResponse;
    await Doctors.find()
    .then(resolve=>{
        resolve.forEach(item=>{ 
            if (item.email!='admin@gmail.com') {
                result.push({
                    id: (item._id).toString(),
                    stringName: item.stringName,
                    email: item.email,
                    lastName: item.lastName,
                    name: item.name,
                    title: item.title,
                    stringName: item.stringName,
                    active: item.active,
                    admin: item.admin
                })
            }
        })
        messageResponse={status:200, data:result}
    })
    .catch(error=>{
        messageResponse={status:500, data:' '}
    })
    return messageResponse;

}

const createDoctorAdmin = async (data)=>{
    const {name, lastName, stringName, title, email, password, active, admin} = data;
    const encryptedPassword = encryptData(password)
    let response;
    const data1 = {
        name,
        lastName,
        stringName,
        title,
        email,
        password: encryptedPassword,
        active,
        admin
    }

    await Doctors.create(data1)
    .then((resolve) => {
         response = 201
    })
    .catch ((error)=>{
        response = 500
    })
    return response;
}  



export {
    existAdminService,
    createDoctorAdmin,
    doctorsListService,
    doctorsAdminListService,
    statusDoctorAdminService,
    findAdminService,
    findAdminAndTurnedOffService,
    deleteTurnsDoctorFromDBService,
    deleteDoctorFromDBService,
}











// import Doctors from '../models/doctors.model.js';
// import Turns from '../models/turns.model.js';
// import { encryptData } from '../tools/crypto.js';

// //Funcion que borra de la db un doctor en forma fisica
// const deleteDoctorFromDBService= async (data)=>{
//     try{
//         let result =await Doctors.deleteOne({_id: data})
//         if (result.deletedCount==1) return 200
//         else return 500

//     }catch(e) {
//         return 500
//     }

// }

// //Funcion para borrar de la db los turnos relacionados a un doctor especifico
// const deleteTurnsDoctorFromDBService = async (data)=>{
//     try{
//         let result = await Turns.deleteMany({doctor: data})
//         return 200
//     }catch(e) {
//         return 500
//     }    
// }


// //Funcion que encuentra un administrador activo que no sea admin@gmail.com y lo pone en admin=false
// const findAdminAndTurnedOffService = async()=>{
//     try{
//         let result = await Doctors.findOneAndUpdate ({admin:true, active: true,  email:{$ne: 'admin@gmail.com'} }, {admin: false}, {new:true})
//         if (result==null) return 404
//         else return 200

//     }catch (error) {
//         return 500
//     }
// }


// //Funcion que encuentra los datos de un administrador pasandole el id del mismo y pone admin en true y active en true
// const findAdminService = async (id)=>{
//    try{
//     let result = await Doctors.findOneAndUpdate ({_id: id},{admin: true, active: true}, {new: true})
//     if (result==null) return 404 
//     else return 200
//    }catch(error) {
//         return 500
//    }
// }


// //Funcion para activar o desactivar un doctor
// const statusDoctorAdminService = async({email, active, admin})=>{
//     try {
//         let result = await Doctors.findOne({email, active})
//         if (result==null) return 500;
//         if (admin && active) return 400
//         if (!admin && active) result.active=false;
//         if (!active) result.active=true;
//         let result2 = await result.save();
//         if (result2==null) return 500
//         else return 200
//     }catch (error) {
//         return 500
//     }    
// }

// //ver manejo de try catch en el find
// //Funcion que se fija si existe administrador y lo devuelve o crea una semilla admin y lo devuelve
// const existAdminService = async ()=>{
//     let creation;
//     const result = await Doctors.find({
//         active:true,
//         admin:true,
//     })
//     let adminRecord;
//     if (result.length>0) {
//                         if (result.length==2) adminRecord = result.filter(x=>x.email!='admin@gmail.com')[0]
//                         else adminRecord=result[0];
//                         return {status:200,
//                             password: adminRecord.password,
//                             email: adminRecord.email,
//                             email: adminRecord.email,
//                             name: adminRecord.name,
//                             lastName: adminRecord.lastName,
//                             stringName: adminRecord.stringName,
//                             title: adminRecord.title,
//                             active: adminRecord.active,
//                             admin: adminRecord.admin
//                         }  //existe una semilla en la db
//     }
//     let messageResponse;
//     if (result.length==0) {
//         const adminSeed = {
//             name: 'admin',
//             lastName: 'admin',
//             stringName: 'admin',
//             title: 'Dra.',
//             email: 'admin@gmail.com',
//             password: 'U2FsdGVkX18Di0ibeV+Lviuyk72IsjieKUa4o5I3RjxQk4DSIK3KIugXQmEM5svx', //'adminadminadmin',
//             active: true,
//             admin: true
//         }
//         await Doctors.create(adminSeed)
//         .then(resolve=>{
//             //la semilla admin fue creada
//             messageResponse = {status:201,
//                 password: adminSeed.password,
//                 email: adminSeed.email,
//                 name: adminSeed.name,
//                 lastName: adminSeed.lastName,
//                 stringName: adminSeed.stringName,
//                 title: adminSeed.title,
//                 active: adminSeed.active,
//                 admin: adminSeed.admin
//             }
//         })
//         .catch(error=>{
//             // la semilla admin no existia y no pudo ser creada tiene que reintenar
//             messageResponse = {status:500, password: '', email: ''}
//         })
//     }
//     return messageResponse;
// }

// //funcion para devolver la lista de doctores para el login de paciente para hace el select del medico
// const doctorsListService = async (status)=>{
//     let messageResponse;
//     let result =[];

//     await Doctors.find({active: status})
//     .then(resolve=>{
//         resolve.forEach(item=>{ 
//             if (item.email!='admin@gmail.com') {
//                 result.push({
//                     id: (item._id).toString(),
//                     stringName: item.stringName,
//                     email: item.email,
//                     lastName: item.lastName,
//                     name: item.name,
//                     title: item.title,
//                     stringName: item.stringName,
//                 })
//             }
//         })
//         messageResponse={status:200, data:result}
//     })
//     .catch(error=>{
//         messageResponse={status:500, data:error}
//     })

//     return messageResponse;

// }

// //funcion doctorList para el administrador mostrar doctores
// const doctorsAdminListService = async ()=>{
//     let result =[];
//     let messageResponse;
//     await Doctors.find()
//     .then(resolve=>{
//         resolve.forEach(item=>{ 
//             if (item.email!='admin@gmail.com') {
//                 result.push({
//                     id: (item._id).toString(),
//                     stringName: item.stringName,
//                     email: item.email,
//                     lastName: item.lastName,
//                     name: item.name,
//                     title: item.title,
//                     stringName: item.stringName,
//                     active: item.active,
//                     admin: item.admin
//                 })
//             }
//         })
//         messageResponse={status:200, data:result}
//     })
//     .catch(error=>{
//         messageResponse={status:500, data:' '}
//     })
//     return messageResponse;

// }

// const createDoctorAdmin = async (data)=>{
//     const {name, lastName, stringName, title, email, password, active, admin} = data;
//     const encryptedPassword = encryptData(password)
//     let response;
//     const data1 = {
//         name,
//         lastName,
//         stringName,
//         title,
//         email,
//         password: encryptedPassword,
//         active,
//         admin
//     }

//     await Doctors.create(data1)
//     .then((resolve) => {
//          response = 201
//     })
//     .catch ((error)=>{
//         response = 500
//     })
//     return response;
// }  



// export {
//     existAdminService,
//     createDoctorAdmin,
//     doctorsListService,
//     doctorsAdminListService,
//     statusDoctorAdminService,
//     findAdminService,
//     findAdminAndTurnedOffService,
//     deleteTurnsDoctorFromDBService,
//     deleteDoctorFromDBService,
// }
















// import Doctors from '../models/doctors.model.js';
// import { encryptData } from '../tools/crypto.js';

// const existAdminService = async ()=>{
//     let creation;
   
//     const result = await Doctors.find({
//         active:true,
//         admin:true,
//     })
//     if (result.length>0) return {status:200,
//                                 password: result[0].password,
//                                 email: result[0].email,
//                                 email: result[0].email,
//                                 name: result[0].name,
//                                 lastName: result[0].lastName,
//                                 stringName: result[0].stringName,
//                                 title: result[0].title,
//                                 active: result[0].active,
//                                 admin: result[0].admin
                            
                            
//                             }  //existe una semilla en la db


//     let messageResponse;
//     if (result.length==0) {
//         console.log('trata de crear la semilla')
//         const adminSeed = {
//             name: 'admin',
//             lastName: 'admin',
//             stringName: 'admin',
//             title: 'Dra.',
//             email: 'admin@gmail.com',
//             password: 'U2FsdGVkX18Di0ibeV+Lviuyk72IsjieKUa4o5I3RjxQk4DSIK3KIugXQmEM5svx', //'admin',
//             active: true,
//             admin: true
//         }
//         await Doctors.create(adminSeed)
//         .then(resolve=>{
//             //la semilla admin fue creada
//             console.log('la semilla fue creada')
//             messageResponse = {status:201,
//                 password: adminSeed.password,
//                 email: adminSeed.email,
//                 name: adminSeed.name,
//                 lastName: adminSeed.lastName,
//                 stringName: adminSeed.stringName,
//                 title: adminSeed.title,
//                 active: adminSeed.active,
//                 admin: adminSeed.admin
//             }
//         })
//         .catch(error=>{
//             console.log('la se milla no pudo ser creada')
//             // la semilla admin no existia y no pudo ser creada tiene que reintenar
//             messageResponse = {status:500, password: '', email: ''}
//         })
//     }
//     return messageResponse;
// }


// const doctorsListService = async (status)=>{
//     let messageResponse;
//     let result =[];

//     await Doctors.find({active: status})
//     .then(resolve=>{
//         resolve.forEach(item=>{ 
//             if (item.email!='admin@gmail.com') {
//                 result.push({
//                     id: (item._id).toString(),
//                     stringName: item.stringName,
//                     email: item.email,
//                     lastName: item.lastName,
//                     name: item.name,
//                     title: item.title,
//                     stringName: item.stringName,
//                 })
//             }
//         })
//         messageResponse={status:200, data:result}
//     })
//     .catch(error=>{
//         console.log(error);
//         messageResponse={status:500, data:error}
//     })

//     return messageResponse;

// }











// const createDoctorAdmin = async (data)=>{
//     const {name, lastName, stringName, title, email, password, active, admin} = data;
//     const encryptedPassword = encryptData(password)
//     let response;
//     const data1 = {
//         name,
//         lastName,
//         stringName,
//         title,
//         email,
//         password: encryptedPassword,
//         active,
//         admin
//     }

//     await Doctors.create(data1)
//     .then((resolve) => {
//         console.log('Se creo correctamente')
//          response = 201
//     })
//     .catch ((error)=>{
//         console.log( 'Hubo un error en la creacion')
//         response = 500
//     })
//     return response;


// }  



// export {
//     existAdminService,
//     createDoctorAdmin,
//     doctorsListService
// }
