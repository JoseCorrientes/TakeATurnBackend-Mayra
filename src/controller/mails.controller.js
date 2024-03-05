import { sendEmailBrevo} from "../services/email.service.js"


//-funcion llamada cuando se cancela el turno desde el doctor.
async function sendMailAboutCancelTurn (req, res) {
    const data = req.body.data
    const sender = req.body.sender
    const doctorData = req.body.loginDoctorData;
    let result = await sendEmailBrevo(data, sender, doctorData, 'cancel')  
    if (result==200)return res.status(200).json({status: 'Ok', message: 'email sended'})
    else return res.status(200).json({status: 'Error', message:"email wasn't sended"})
}


export {sendMailAboutCancelTurn  }