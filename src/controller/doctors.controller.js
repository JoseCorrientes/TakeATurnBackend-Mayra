import {changePasswordDB, findDoctorDB, modifyPasswordDB} from "../services/doctors.service.js";
import { encryptData, decryptData } from "../tools/crypto.js";
import jwt from 'jsonwebtoken'
import { secretPassword } from "../tools/secretPassword.js";
import { sendEmailBrevo } from "../services/email.service.js";


//funcion que logear al doctor
async function loginDoctor (req, res) {
    const {SECRET_JWT} = process.env;

    const user = req.body.user
    const userDecrypted = decryptData(user);
    let result = await findDoctorDB(userDecrypted.email);
    if (result==500) return res.status(200).json({status: 'Error', message: 'Server Error Try Again'})
    //return res.status(200).json({status: 'Error', message: 'Server Error Try Again'})
    if (result==404) return res.status(200).json({status: 'Error', message: 'Invalid User'})
    const passwordUser=userDecrypted.password;
    const emailUser=userDecrypted.email;
    const passwordDB = decryptData(result.password)
    const emailDB = result.email;
    let userToken={
        passwordDB,
        emailDB,
    }

    //Proceso de verificacion
    if (passwordDB==passwordUser && emailDB==emailUser) {
        let token = jwt.sign(userToken,SECRET_JWT,{expiresIn: '2m'});
        
        let sendData={
            id: result._id,
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

//funcion para cambiar el password de un doctor
async function changePassword(req, res) {
    const user=req.body
    let flatUser = decryptData(user.user)
    let result = await  findDoctorDB(flatUser.email)
    if (result==404) res.status(200).json({status: 'Error', message: 'User invalid'})
    let dbPassword = decryptData(result.password)
    let userPassword = decryptData(flatUser.password)
    let newPassword = decryptData(flatUser.newPassword)
    let email = flatUser.email;
    
    if (userPassword!=dbPassword) res.status(200).json({status: 'Error', message: 'Password Invalid'})
    else {
        let newDbPassword = encryptData(newPassword);

        let result2 = await modifyPasswordDB({email, newPassword: newDbPassword})
        if (result2==200) res.status(200).json({status: 'Ok', message: ''})
        else res.status(200).json({status: 'Error', message: 'Updated Invalid'})
    }
}

//funcion para recuperar la contraseña
async function recoverPassword (req, res) {
    let flatEmail = decryptData(req.body.codedData);
    let newPassword=secretPassword();
    let newCodedPassword = encryptData(newPassword);
    let result = await changePasswordDB(flatEmail, newCodedPassword);
    if (result==500) res.status(200).json({status: 'Error'})
    else {
        let data={email: result.email, idpatient: result.stringName, title: result.title}
        let doctorData={newPassword};
        let result2 = await sendEmailBrevo(data,'doctor', doctorData, 'recoverPassword')
        if (result2==200) res.status(200).json({status: 'Ok'}) 
        else res.status(200).json({status: 'Error'})
    }

}

export {loginDoctor, changePassword, recoverPassword}