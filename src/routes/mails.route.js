import { Router } from "express";
import { sendMailAboutCancelTurn  } from "../controller/mails.controller.js";
// import { sendMailAboutCancelTurn, sendMailAboutCreateTurn  } from "../controller/mails.controller.js";

const router = Router();

router.post('/cancelTurn', sendMailAboutCancelTurn)
// router.post('/createTurn', sendMailAboutCreateTurn)    



export default router;













// import { Router } from "express";
// import { sendMailAboutCancelTurn, sendMailAboutCreateTurn  } from "../controller/mails.controller.js";

// const router = Router();

// router.post('/toProfessional', sendMailAboutCancelTurn)
// router.post('/toPatient', sendMailAboutCreateTurn)    



// export default router;