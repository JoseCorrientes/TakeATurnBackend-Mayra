import Doctors from '../models/doctors.model.js';

async function changePasswordDB (email, newPassword) {
    try {
        let result = await Doctors.findOneAndUpdate({email},{password: newPassword}, {new: true})
        if (result==null) return 500 
        else return result;
    }catch(e) {
        return 500
    }
}


async function findDoctorDB (data) {
    try {
        let result = await Doctors.find({email: data, active:true})
        return (result.length>0)?result[0]: 404
    }
    catch (e) { return 500}
}

async function modifyPasswordDB ({email, newPassword}) {
    try{
        let result = await Doctors.findOneAndUpdate({email: email}, {password: newPassword})
        if (result==null) return 500
        else return 200

    }catch(e) {
        return 500
    }
}

export {findDoctorDB, modifyPasswordDB, changePasswordDB};