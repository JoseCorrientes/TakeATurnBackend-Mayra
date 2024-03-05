import { sendEmailBrevo } from "../services/email.service.js";
import { sendEmailBrevoMultiple } from "../services/email.service.js";
import {
  createTurnService,
  findTurnService,
  getTurnService,
  deleteTurnService,
  deleteTurnServiceAll,
  activateDayService,
  deleteDisabledTurnService,
} from "../services/turns.service.js";
import weekday from "../tools/WeekDay.js";
import daysInAMonth from "../tools/daysInAMonth.js";
import { whatTurnIs } from "../tools/whatTurnIs.js";

//-Funcion disparada por el doctor para cancelar todos los turnos y luego inhabilitar ese DIA
const disableAllDay = async (req, res) => {
  let turns = req.body.data;
  let dayToDisable = req.body.dayToDisable;
  let doctorData = req.body.doctorData;
  let emailSended = false; //aca envio si se envio el email o no
  let canceledTurn = false; //aca envio si se pudo cancelar el turno original o no
  let disabledDay = false; //aca envio si se pudo inhabilitar el dia o no

  //si el dia no tiene turnos ocupados, solo se inhabilita
  if (turns.length < 1) {
    emailSended = true;
    canceledTurn = true;
    let data = {
      year: dayToDisable.year,
      month: dayToDisable.month,
      day: dayToDisable.day,
      hour: "00",
      minute: "00",
      hourIndex: 99,
      status: "offDuty",
      idpatient: "",
      typetreatment: "consulta",
      healthinsurance: "",
      email: "",
      comment: "",
      phone: "",
      doctor: doctorData.id,
    };

    let result2 = await createTurnService(data);
    if (result2 == 500)
      return res.status(200).json({
        status: { emailSended, canceledTurn, disabledDay: false },
        turns,
      });
    else
      return res.status(200).json({
        status: { emailSended, canceledTurn, disabledDay: true },
        turns,
      });
  } else {
    //si el dia tiene turnos ocupados se borra, envia mensajes e inhabilita
    //lo primero es llamar al servicio de borrado
    let day = dayToDisable.day;
    let month = dayToDisable.month;
    let year = dayToDisable.year;
    let doctor = doctorData.id;
    //primero borra todos los registros de turnos en db
    let result = await deleteTurnServiceAll(day, month, year, doctor);
    if (result == 500)
      return res.status(200).json({
        status: {
          canceledTurn,
          emailSended,
          disabledDay,
          turn: "",
        },
        message: "Turns were not erased",
      });
    if (result == 200) canceledTurn = true;

    let data = turns;
    let result2 = await sendEmailBrevoMultiple(
      data,
      "doctor",
      doctorData,
      "cancel"
    );
    //let result2=0;  //3
    if (result2 == turns.length) emailSended = true;

    let data1 = {
      year,
      month,
      day,
      hour: "00",
      minute: "00",
      hourIndex: 99,
      status: "offDuty",
      idpatient: "",
      typetreatment: "consulta",
      healthinsurance: "",
      email: "",
      comment: "",
      phone: "",
      doctor,
    };

    //simulo que no puede crear el inhabilitado en db
    let result3 = await createTurnService(data1);
    if (result3 !== 500) disabledDay = true;

    res.status(200).json({
      status: {
        canceledTurn,
        emailSended,
        disabledDay,
        turn: turns,
      },
      message: "End of the process",
    });
  }
};

//-Funcion disparada por el doctor para cancelar un turno y luego inhabilitar ese horario
const cancelAndDisable = async (req, res) => {
  let emailSended = false; //aca envio si se envio el email o no
  let canceledTurn = false; //aca envio si se pudo cancelar el turno original o no
  let disabledTurn = false; //aca envio si se pudo inhabilitar el turno original o no
  let turn = req.body.data; //aca uso los datos del turno para enviar al front si no puedo enviar el correo
  //Lo primero es llamar el servicio de borrado,
  let result = await deleteTurnService(req.body.data.dbId);
  
  if (result != 200)
    return res.status(200).json({
      status: {
        canceledTurn,
        emailSended,
        disabledTurn,
        turn,
      },
      message: "Turn was not erased",
    });
  if (result == 200) canceledTurn = true; //el turno original pudo ser borrado
  let data = req.body.data;
  let doctorData = req.body.loginDoctorData;
  let result2 = await sendEmailBrevo(data, "doctor", doctorData, "cancel");
  if (result2 == 200) emailSended = true;
  //si todo esta bien inhabilitar turno en db
  let data1 = {
    year: data.year,
    month: data.month,
    day: data.day,
    hour: data.turnName.slice(0, 2),
    minute: data.turnName.slice(2),
    hourIndex: data.index,
    status: "offDuty",
    idpatient: "",
    email: "",
    typetreatment: "consulta",
    healthinsurance: "",
    phone: "",
    doctor: data.doctor,
    comment: data.comment,
  };

  let result3 = await createTurnService(data1);
  if (result3 !== 500) disabledTurn = true;

  res.status(200).json({
    status: {
      canceledTurn,
      emailSended,
      disabledTurn,
      turn,
    },
    message: "End of the process",
  });
};

//-Funcion disparada por el doctor que inhabilita un turno
const disableTurn = async (req, res) => {
  let data = req.body;
  data.hourIndex = whatTurnIs(data.hour, data.minute);
  const result = await createTurnService(data);
  if (result == 500)
    res.status(200).json({ status: "Error", message: "Server Error" });
  else res.status(200).json({ status: "Ok", message: result });
};

//-Modificando puede ser disparada por el doctor o paciente y tiene que devolver un
//Funcion para borrar un turno
const deleteTurn = async (req, res) => {
  let result = await deleteTurnService(req.query._id);
  if (result == 200)
    return res.status(200).send({ status: "Ok", messagge: "Turn Erased" });
  else
    return res
      .status(500)
      .send({ status: "Error", messagge: "Turn Didn't Erase" });
};

//Funcion para borrar un turno desabilitado
const deleteDisabledTurn = async (req, res) => {
  let result = await deleteDisabledTurnService(req.body.data);
  if (result == 200)
    return res.status(200).send({ status: "Ok", messagge: "Turn Enabled" });
  else
    return res
      .status(500)
      .send({ status: "Error", messagge: "Turn can't be enabled" });
};

//Funcion principal para recuperar los turnos de un mes dado para un medico dado
const getMonthTurn = async (req, res) => {
  try {
    //claveAdmin viene del administrador encriptada y si es correcta se devuelve
    //todos los horarios sin considerar idPatient

    const { year, month, userType, idDoctor, idPatient, emailPatient } =
      req.query;
    let yearNum = Number.parseInt(year);
    let monthNum = Number.parseInt(month);

    let turnMonthDB = [];
    // vinene number, number, string
    let days = daysInAMonth(year, month);
    for (let x = 0; x < days; x++) {
      let day = x + 1;
      turnMonthDB.push({
        type: "day",
        day: x + 1,
        offDuty: false,
        turns: [
          {
            turnName: "0800",
            status: "free",
            index: 0,
          },
          {
            turnName: "0830",
            status: "free",
            index: 1,
          },
          {
            turnName: "0900",
            status: "free",
            index: 2,
          },
          {
            turnName: "0930",
            status: "free",
            index: 3,
          },
          {
            turnName: "1000",
            status: "free",
            index: 4,
          },
          {
            turnName: "1030",
            status: "free",
            index: 5,
          },
          {
            turnName: "1100",
            status: "free",
            index: 6,
          },
          {
            turnName: "1130",
            status: "free",
            index: 7,
          },
          {
            turnName: "1200",
            status: "free",
            index: 8,
          },
          {
            turnName: "1230",
            status: "free",
            index: 9,
          },
          {
            turnName: "1300",
            status: "free",
            index: 10,
          },
          {
            turnName: "1330",
            status: "free",
            index: 11,
          },
          {
            turnName: "1400",
            status: "free",
            index: 12,
          },
          {
            turnName: "1430",
            status: "free",
            index: 13,
          },
          {
            turnName: "1500",
            status: "free",
            index: 14,
          },
          {
            turnName: "1530",
            status: "free",
            index: 15,
          },
          {
            turnName: "1600",
            status: "free",
            index: 16,
          },
          {
            turnName: "1630",
            status: "free",
            index: 17,
          },
          {
            turnName: "1700",
            status: "free",
            index: 18,
          },
          {
            turnName: "1730",
            status: "free",
            index: 19,
          },
          {
            turnName: "1800",
            status: "free",
            index: 20,
          },
          {
            turnName: "1830",
            status: "free",
            index: 21,
          },
          {
            turnName: "1900",
            status: "free",
            index: 22,
          },
          {
            turnName: "1930",
            status: "free",
            index: 23,
          },
          {
            turnName: "2000",
            status: "free",
            index: 24,
          },
          {
            turnName: "2030",
            status: "free",
            index: 25,
          },
          {
            turnName: "2100",
            status: "free",
            index: 26,
          },
          {
            turnName: "2130",
            status: "free",
            index: 27,
          },
          {
            turnName: "2200",
            status: "free",
            index: 28,
          },
          {
            turnName: "2230",
            status: "free",
            index: 29,
          },
        ],
      });
    }
    const result = await getTurnService(year, month, idDoctor);
    if (result == 500)
      return res.status(200).json({
        status: "Error",
        message: "No se pudo recuperar los turnos guardados.",
      });
    //aca voy a guardar los dias que tienen turno del paciente buscado
    let dayWithOwnTurns = [];
    result.forEach((item) => {
      if (
        item.hourIndex != 99 &&
        item.status != "offDuty" &&
        ((item.email == emailPatient && userType == "patient") ||
          userType == "doctor")
      ) {
        dayWithOwnTurns.push(item.day);
      }
    });
    //aca va la rutina que recorre result y va guardando lo obtenido en el turnMonthDB
    result.forEach((item) => {
      if (item.hourIndex == 99) turnMonthDB[item.day - 1].offDuty = true;
      else {
        let turn = item.hour + item.minute;
        //desplazarse por turnMontDB hasta encontrar el dia exacto
        let indexBase = -1;
        do {
          indexBase++;
        } while (
          turnMonthDB[indexBase].type != "day" ||
          (turnMonthDB[indexBase].type == "day" &&
            turnMonthDB[indexBase].day != item.day)
        );
        let ordinal;
        switch (turn) {
          case "0800":
            ordinal = 0;
            break;
          case "0830":
            ordinal = 1;
            break;
          case "0900":
            ordinal = 2;
            break;
          case "0930":
            ordinal = 3;
            break;
          case "1000":
            ordinal = 4;
            break;
          case "1030":
            ordinal = 5;
            break;
          case "1100":
            ordinal = 6;
            break;
          case "1130":
            ordinal = 7;
            break;
          case "1200":
            ordinal = 8;
            break;
          case "1230":
            ordinal = 9;
            break;
          case "1300":
            ordinal = 10;
            break;
          case "1330":
            ordinal = 11;
            break;
          case "1400":
            ordinal = 12;
            break;
          case "1430":
            ordinal = 13;
            break;
          case "1500":
            ordinal = 14;
            break;
          case "1530":
            ordinal = 15;
            break;
          case "1600":
            ordinal = 16;
            break;
          case "1630":
            ordinal = 17;
            break;
          case "1700":
            ordinal = 18;
            break;
          case "1730":
            ordinal = 19;
            break;
          case "1800":
            ordinal = 20;
            break;
          case "1830":
            ordinal = 21;
            break;
          case "1900":
            ordinal = 22;
            break;
          case "1930":
            ordinal = 23;
            break;
          case "2000":
            ordinal = 24;
            break;
          case "2030":
            ordinal = 25;
            break;
          case "2100":
            ordinal = 26;
            break;
          case "2130":
            ordinal = 27;
            break;
          case "2200":
            ordinal = 28;
            break;
          default:
            ordinal = 29;
        }
        //Esto es si biene un turno offDuty
        if (item.status == "offDuty") {
          turnMonthDB[indexBase]["turns"][item.hourIndex] = {
            turnName: item.hour + item.minute,
            status: "offDuty",
            index: ordinal,
          };
          //esto es si viene un turno regular ocupado y se tiene que mostrar los datos de paciente
          //porque el que mira es un doctor, o porque el que mira es paciente que ve sus datos
        } else if (userType == "doctor" || item.email == emailPatient) {
          turnMonthDB[indexBase]["turns"][item.hourIndex] = {
            index: ordinal,
            turnName: item.hour + item.minute,
            status: userType == "doctor" ? "busy" : "busyOwner",
            day: item.day,
            month: item.month,
            year: item.year,
            idPatient: item.idpatient,
            typeTreatment: item.typetreatment,
            ealthInsurance: item.healthinsurance,
            comment: item.comment,
            email: item.email,
            phone: item.phone,
            dbId: item._id,
            doctor: item.doctor,
          };
          //Esto es si el paciente que ve los datos no es el mismo de estos datos, solo se
          //le muestra que el turno esta busy pero no los datos
        } else {
          turnMonthDB[indexBase]["turns"][item.hourIndex] = {
            ...turnMonthDB[indexBase]["turns"][item.hourIndex],
            status: "busy",
          };
        }
      }
    });
    let calendar = [];

    let scrollPosition = weekday(year, month, "01"); //lugares vacias a agregar en la grilla de 7*6 antes de los dias regualares
    for (let x = 0; x < scrollPosition; x++) {
      calendar.push({
        type: "blank",
        day: 0,
      });
    }
    turnMonthDB.forEach((item) => {
      let newObject = item;
      newObject.type = "day";
      calendar.push(newObject);
    });

    for (let x = calendar.length; x < 42; x++) {
      calendar.push({
        type: "blank",
      });
    }

    return res
      .status(200)
      .json({ status: "Ok", data: calendar, data2: dayWithOwnTurns });
  } catch (e) {
    return res.status(500).json({
      status: "Error",
      message: "No se pudo recuperar los turnos guardados.",
    });
  }
};

//Ruta para crear turno el paciente y que el se envie un recordatorio a su correo propio
const patientCreate = async (req, res) => {
  let created = false;
  let emailed = false;
  let data = req.body.data;
  let user = req.body.user;
  let result = await findTurnService(
    data.year,
    data.month,
    data.day,
    data.hour,
    data.minute,
    data.doctor
  );


  if (result == 500) {
    return res
      .status(500)
      .json({ status: "Error", data: { created, emailed } });
  }


  if (result !== null) {
    return res
      .status(500)
      .json({ status: "Error", data: { created, emailed } });
  }
  data.hourIndex = whatTurnIs(data.hour, data.minute);
  let result2 = await createTurnService(data);

  if (result2 == 500) {
    return res
      .status(500)
      .json({ status: "Error", data: { created, emailed } });
  } else created = true;
  let patientData = {};
  let doctorData = user;
  let result3 = await sendEmailBrevo(data, "patient", doctorData, "create");

  if (result3 == 200) emailed = true;
  res.status(200).json({ status: "Ok", data: { created, emailed } });
};

//-Ruta para crear turno el doctor
const doctorCreate = async (req, res) => {
  let created = false;
  let emailed = false;
  let data = req.body.data;
  let doctor = req.body.doctor;
  let result = await findTurnService(
    data.year,
    data.month,
    data.day,
    data.hour,
    data.minute,
    data.doctor
  );

  if (result == 500) {
    return res
      .status(500)
      .json({ status: "Error", data: { created, emailed } });
  }
  if (result !== null) {
    return res
      .status(500)
      .json({ status: "Error", data: { created, emailed } });
  }
  //data.hourIndex = whatTurnIs(data.hour, data.minute);
  let result2 = await createTurnService(data);
  if (result2 == 500) {
    return res
      .status(500)
      .json({ status: "Error", data: { created, emailed } });
  } else created = true;
  let doctorData = doctor;
  let result3 = await sendEmailBrevo(data, "doctor", doctorData, "create");
  if (result3 == 200) emailed = true;
  if (emailed)
    res.status(200).json({ status: "Ok", data: { created, emailed } });
  else
    res
      .status(200)
      .json({ status: "Ok", data: { created, emailed }, toStore: data });
};

//-Function para activar un dia inactivado por doctor
const activateDay = async (req, res) => {
  const result = await activateDayService(req.body.data);
  if (result == 200)
    return res
      .status(200)
      .json({ status: "Ok", message: "The Day was activated" });
  else
    return res.status(200).json({ status: "Error", message: "Server Error" });
};

export {
  patientCreate,
  doctorCreate,
  getMonthTurn,
  deleteTurn,
  activateDay,
  disableTurn,
  deleteDisabledTurn,
  cancelAndDisable,
  disableAllDay,
};
