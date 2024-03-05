import {Router} from 'express'
import { loginAdmin, createDoctor, doctorsList, doctorsAdminList, changeStatus, adminOn, deleteDoctorAll } from '../controller/admin.controller.js';
const router = Router();

//ruta para conectarse el administrador primero tiene que ver si existe alguien cargado como administrador sino lo crea automaticamente
router.post('/login', loginAdmin);
router.post('/create', createDoctor)
router.post('/doctorsList', doctorsList )
router.post('/doctorsAdminList', doctorsAdminList )
router.put('/active', changeStatus )
router.put('/adminOn', adminOn)
router.post('/deleteDoctorAll', deleteDoctorAll)


export default router;
