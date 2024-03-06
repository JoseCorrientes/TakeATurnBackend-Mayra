import test from './test.route.js'
import { decryptData, encryptData } from '../tools/crypto.js'




import express  from 'express'
import turns from './turns.route.js'
import mails from './mails.route.js'
import admin from './admin.route.js'
import doctors from './doctors.route.js';
import Doctors from '../models/doctors.model.js'



const app = express()

app.use('/turns', turns)
app.use('/mails', mails)
app.use('/test', test);
app.use('/admin', admin);               //ruta del administrador superusuario
app.use('/doctors', doctors);           //ruta del doctor comun usuario 


//de mantenimiento luego borrar
app.post('/en', async (req, res)=>{
    console.log('Estas en la ruta de encriptar')
    const {pass} = req.body
    const result = encryptData(req.body.pass)
    res.status(200).json({status: 'Ok', message: result})
})
app.get('/de', (req, res)=>{
    console.log('Estas en la ruta de deencriptar')
    const {pass} = req.body
    const result = decryptData(req.body.pass)
    res.status(200).json({status: 'Ok', message: result})
})

app.get('/dbtest', async (req,res)=>{
    try{
        let result = await Doctors.find({})
        res.status(200).json({data: result})
    }catch(e) {
        res.status(200).json({msg: "ErrorDB", data: 'e'})
    }
    
})

export default app;