import { Router } from "express";
import { loginDoctor, changePassword, recoverPassword } from "../controller/doctors.controller.js";

const router = Router()


router.post('/login',loginDoctor);
router.put('/changePassword', changePassword)
router.put('/recoverPassword', recoverPassword)

export default router;