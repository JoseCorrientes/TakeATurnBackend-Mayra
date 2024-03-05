import {Router} from 'express'
import { patientCreate, doctorCreate, getMonthTurn, deleteTurn,  activateDay, disableTurn, deleteDisabledTurn, cancelAndDisable, disableAllDay } from '../controller/turns.controller.js'
// import { patientCreate, doctorCreate, getMonthTurn, deleteTurn, deleteTurnAll, activateDay, disableTurn, deleteDisabledTurn, cancelAndDisable, disableAllDay } from '../controller/turns.controller.js'
import { sendMailAboutCancelTurn } from '../controller/mails.controller.js'
const router = Router()

//router.post('/', createTurn)

router.post('/patientCreate', patientCreate ) //ruta para crear turno el paciente
router.post('/doctorCreate', doctorCreate)  //ruta para crear turno el doctor


router.get('/', getMonthTurn)
router.post('/disable', disableTurn)
router.delete('/', deleteTurn)
// router.delete('/all', deleteTurnAll)
router.delete('/disabled', deleteDisabledTurn)
router.post('/disableAllDay', disableAllDay)
router.post('/',sendMailAboutCancelTurn )
router.post('/activateDay', activateDay);

router.delete('/cancelAndDisable', cancelAndDisable)


export default router;
































// import {Router} from 'express'
// import { createTurn, getMonthTurn, deleteTurn, deleteTurnAll, activateDay, disableTurn, deleteDisabledTurn } from '../controller/turns.controller.js'
// import { sendMailAboutCancelTurn } from '../controller/mails.controller.js'
// const router = Router()

// router.post('/', createTurn)


// router.get('/', getMonthTurn)
// router.post('/disable', disableTurn)
// router.delete('/', deleteTurn)
// router.delete('/all', deleteTurnAll)
// router.delete('/disabled', deleteDisabledTurn)
// router.post('/',sendMailAboutCancelTurn )
// router.post('/activateDay', activateDay);


// export default router;

