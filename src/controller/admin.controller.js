import { createDoctorAdmin, existAdminService, doctorsListService, doctorsAdminListService, statusDoctorAdminService, findAdminService, findAdminAndTurnedOffService, deleteTurnsDoctorFromDBService, deleteDoctorFromDBService } from "../services/admin.service.js";
import { findDoctorDB } from "../services/doctors.service.js";
import { decryptData, encryptData } from "../tools/crypto.js";
import jwt from 'jsonwebtoken'

//funcion para borrar fisicamente un doctor de la db y todos los turnos asociados
async function deleteDoctorAll (req, res) {
    let data = req.body.codedData
    let flatData = decryptData(data)

    let result = await deleteTurnsDoctorFromDBService(flatData);
    if (result==500) res.status(200).json({ status: 'Error', message: 'Error Deleting Turns'})
    else {
        let result2 = await deleteDoctorFromDBService(flatData);
        if (result2==200) res.status(200).json({status: 'Ok'})
        else res.status(200).json({ status: 'Error', message: 'Error Deleting Doctor'})
    }
}


//funcion para activar un nuevo administrador.
async function adminOn (req, res) {
    let data  = req.body
    let flatData = decryptData(data.data)
    let result = await findAdminAndTurnedOffService();
    if (result ==500 || result==404) res.status(200).json({ status: 'Error', message: 'Server Error'})
    else {
        let result2 = await findAdminService(flatData)
        if (result2 == 404 || result2==500) res.status(200).json({status: 'Error2', message: 'New Admin was not Actived'})
        else res.status(200).json({status: 'Ok'})
    }    
}

//funcion para cambiar el status de un medico activo-inactivo
async function changeStatus (req, res) {
    let data = req.body.sendEncryptData;
    let flatData = decryptData(data)
    let result = await statusDoctorAdminService(flatData)
    if (result==400) res.status(200).json({status: 'ErrorAdmin'})
    else if (result==200) res.status(200).json({status: 'Ok'})
    else res.status(200).json({status: 'Error'})
}

//funcion que logeal al administrador, primero se fija si existe un admin, si no existe crea el generico y luego recien trata de logearse
async function loginAdmin (req, res) {
    const {SECRET_JWT} = process.env;
    const user = req.body.user
    const userDecrypted = decryptData(user);

    let result = await existAdminService();

    if (result.status==500) return res.status(200).json({status: 'Error', message: 'Server Error Try Again'})
    else {
            const passwordUser=userDecrypted.password;
            const emailUser=userDecrypted.email;
            let data=result.password;
            const passwordDB = decryptData(data)

            const emailDB = result.email;
            let userToken={
                passwordDB,
                emailDB,
            }
            //si existe un administrador o se creo se sigue el proceso de verificacion
            if (passwordDB==passwordUser && emailDB==emailUser) {
                let token = jwt.sign(userToken,SECRET_JWT,{expiresIn: '2m'});
                
                let sendData={
                    email: emailDB,
                    name:result.name,
                    lastName: result.lastName,
                    stringName: result.stringName,
                    title: result.title,
                    active: result.active,
                    admin: result.admin,
                    password:result.password,
                    token
                }

                let encryptedSendData = encryptData(sendData);
                //devuelvo al front aprobado, con un mensaje y una data encriptada con token y datos del user
                res.status(200).json({ status: 'Ok',
                                    message: 'User Authenticated',
                                    data: encryptedSendData, 
                                    })
            
            }else {
                res.status(200).json({ status: 'Error', message: 'Invalid User'})
            }
    }        
}



//funcion para recuperar todos los doctores listados, pasandoles si queremos activos o inactivos o todos.
async function doctorsList (req, res){
    let active  = req.body.active
    let result = await doctorsListService(active);
    if (result.status==200) res.status(200).json({status: 200, data: result.data, message:''})
    else res.status(200).json({status:200, data: '', message: 'Server Error' })
}

//funcion para recuperar todos los doctores listados para el listado del administrador.
async function doctorsAdminList (req, res){
    let result = await doctorsAdminListService();
    if (result.status==200) {
        let codedResult = encryptData(result.data)
        res.status(200).json({status: 'Ok', data: codedResult, message:''})
    }
    else res.status(200).json({status:'Error', data: '', message: 'Server Error' })
}

//funcion para crear un nuevo doctor
async function createDoctor (req, res) {
    let data = decryptData(req.body.encodedData)
    //pedir un servicio para ver si existe el email
    const result = await findDoctorDB(data.email)
    if (result==500)  res.status(200).json({status: 'Error', message: 'Server Error' });
    else if (result!=404) res.status(200).json({status: 'Error', message: 'Email already exists' });
    else {
        const result2 = await createDoctorAdmin(data)
        if (result2==201) res.status(201).json({status: 'Ok', message: 'Doctor was Created' })
        else res.status(200).json({ status: 'Error', message: 'Server Error'})
    }
}




export {
    createDoctor,
    loginAdmin,
    doctorsList,
    doctorsAdminList,
    changeStatus,
    adminOn,
    deleteDoctorAll,
}