import SibApi from "sib-api-v3-sdk"


export async function sendEmailBrevo(data,sender, doctorData, typeOperation) {
    try{
    //sender puede ser doctor o patient 
    //typeOperation puede ser cancel o create o recoverPassword 

    const SibClient = SibApi.ApiClient.instance;
    SibClient.authentications['api-key'].apiKey=process.env.BREVO_API_PASS;

    const transactionEmailApi = new SibApi.TransactionalEmailsApi()
    let smtpMailData = new SibApi.SendSmtpEmail()

    smtpMailData.sender = {
        email: 'mayraarestiodontologa@gmail.com',
        name: 'Mayra Aresti Odontóloga - TURNOS'
    }


    smtpMailData.to = [{ email: data.email, name: data.idpatient}]
    smtpMailData.subject = (typeOperation=='create')
    ?'Creación de Turno Odontológico.'
    :(typeOperation=='recoverPassword')?'Recuperación de Contraseña.'
    :'Cancelación de Turno.'

    smtpMailData.htmlContent = (typeOperation=='create')?
    `<html><body>
    <h2>Hola <b>${data.idpatient.toUpperCase()}</b>!. Se ha reservado para Ud. el siguiente turno:</h2>
    <br>
    <p1><b>Fecha:</b> ${data.day}/${data.month}/${data.year}</p1> 
    <p1><b>Hora:</b> ${data.hour}:${data.minute}</p1> 
    <p>Lo espero...</p>
    <br>
    <p>${doctorData.title+doctorData.stringName}.</p>
    <hr>
    <p>Si por cualquier motivo no pudiera asistir le ruego cancele el turno a través de nuestra web: 
    <link
        href="https://odontoturn.vercel.app"
    >
    https://odontoturn.vercel.app
    </link>
    </p>
    </body>
    </html>`
    :(typeOperation=='cancel' && sender=='doctor')
    ?`<html><body>
    <h2>Hola <b>${data.idPatient.toUpperCase()}</b>!. Por motivo de fuerza mayor he cancelado su turno:</h2>
    <br>
    <p1><b>Fecha:</b> ${data.day}/${data.month}/${data.year}</p1> 
    <p1><b>Hora:</b> ${data['turnName'].slice(0,2)}:${data['turnName'].slice(2)}</p1> 
    <p>Por favor desde la página solicite un nuevo turno. Gracias.</p>
    <br>
    <p>${doctorData.title+doctorData.stringName}.</p>
    <hr>
    <p>Nuestra web: 
    <link
        href="https://odontoturn.vercel.app"
    >
    https://odontoturn.vercel.app
    </link>
    </p>
    </body>
    </html>`

    :`<html><body>
    <h2>Hola <b>${data.title} ${data.idpatient.toUpperCase()}</b>!.</h2> 
    Se le ha generado una nueva contraseña temporaria: <b>${doctorData.newPassword}</b>
    <br>
    
    <p>Ingrese con esa contraseña y cámbiela por una de su elección.</p>
    <br>
    <hr>
    </body>
    </html>`

    let result;
    await transactionEmailApi.sendTransacEmail(smtpMailData)
        .then(response=>
            result =200
        )
        .catch(error=>
            result = 500
        )    
    return result;       
} catch(e) { return e }
}


//funcion para mandar correos por el doctor a varios pacientes cuando inhabilita el dia completo
export async function sendEmailBrevoMultiple(data,sender, doctorData, typeOperation) {
    try{
    //sender puede ser doctor o patient 
    //typeOperation puede ser cancel o create  

    const SibClient = SibApi.ApiClient.instance;
    SibClient.authentications['api-key'].apiKey=process.env.BREVO_API_PASS;

    const transactionEmailApi = new SibApi.TransactionalEmailsApi()
    let smtpMailData = new SibApi.SendSmtpEmail()

    smtpMailData.sender = {
        email: 'mayraarestiodontologa@gmail.com',
        name: 'Mayra Aresti Odontóloga - TURNOS'
    }

    //proceso todos los turnos cancelados mandandoles un email de aviso
    let emailSended=0;
    for(let n=0; n<data.length; n++) {
        smtpMailData.to = [{ email: data[n].email, name: data[n].idPatient}];
        smtpMailData.subject = 'Cancelación de Turno.';

        smtpMailData.htmlContent = `<html><body>
        <h2>Hola <b>${data[n].idPatient.toUpperCase()}</b>!. Por motivo de fuerza mayor he cancelado su turno:</h2>
        <br>
        <p1><b>Fecha:</b> ${data[n].day}/${data[n].month}/${data[n].year}</p1> 
        <p1><b>Hora:</b> ${data[n]['turnName'].slice(0,2)}:${data[n]['turnName'].slice(2)}</p1> 
        <p>Por favor desde la página solicite un nuevo turno. Gracias.</p>
        <br>
        <p>${doctorData.title+doctorData.stringName}.</p>
        <hr>
        <p>Nuestra web: 
        <link
            href="https://odontoturn.vercel.app"
        >
        https://odontoturn.vercel.app
        </link>
        </p>
        </body>
        </html>`

        //pruebo generar el error de envio de email aca
        await transactionEmailApi.sendTransacEmail(smtpMailData)
        .then(response=>
                emailSended++
            )
        .catch(error=>
                emailSended=0
        )  
    }
    return emailSended
} catch(e) { return e }
}




















//RESGUARDO 20240131 ANTES DE ENVIAR CREAR TURNO POR UN USUARIO O POR DOCTOR
// import SibApi from "sib-api-v3-sdk"


// export async function sendEmailBrevo(data,sender, doctorData, typeOperation) {
// // export default async function sendEmailBrevo(data,destination) {
//     try{

//         // console.log('datos que llegan a sendemal brevo en services')
//         // console.log('data: ')
//         // console.log(data);
//         // console.log(`sender:  ${sender}`)
//         // console.log(`type of operation: ${typeOperation}`)
//         // console.log('doctor data:')
//         // console.log(doctorData)
//         // console.log(('----------------------------------'))


//     //sender puede ser doctor o patient 
//     //typeOperation puede ser cancel o create  

//     const SibClient = SibApi.ApiClient.instance;
//     SibClient.authentications['api-key'].apiKey=process.env.BREVO_API_PASS;

//     const transactionEmailApi = new SibApi.TransactionalEmailsApi()
//     let smtpMailData = new SibApi.SendSmtpEmail()

//     smtpMailData.sender = {
//         email: 'mayraarestiodontologa@gmail.com',
//         name: 'Mayra Aresti Odontóloga - TURNOS'
//     }



//     smtpMailData.to = (sender=='doctor')
//     ?[{ email: data.email, name: data.idPatient}]
//     :[{ email: doctorData.email, name: doctorData.title+doctorData.stringName}]



//     smtpMailData.subject = (typeOperation=='create')
//     ?'Creación de Turno Odontológico.'
//     :'Cancelación de Turno.'

//     smtpMailData.htmlContent = (typeOperation=='create' && sender=='doctor')?
//     `<html><body>
//     <h2>Hola <b>${data.idPatient.toUpperCase()}</b>!. Se ha reservado para Ud. el siguiente turno:</h2>
//     <br>
//     <p1><b>Fecha:</b> ${data.day}/${data.month}/${data.year}</p1> 
//     <p1><b>Hora:</b> ${data.hour}/${data.minute}</p1> 
//     <p>Lo espero...</p>
//     <br>
//     <p>${doctorData.title+doctorData.stringName}.</p>
//     <hr>
//     <p>Si por cualquier motivo no pudiera asistir le ruego cancele el turno a través de nuestra web: 
//     <link
//         href="https://odontoturn.vercel.app"
//     >
//     https://odontoturn.vercel.app
//     </link>
//     </p>
//     </body>
//     </html>`
//     :(typeOperation=='cancel' && sender=='doctor')
//     ?`<html><body>
//     <h2>Hola <b>${data.idPatient.toUpperCase()}</b>!. Por motivo de fuerza mayor he cancelado su turno:</h2>
//     <br>
//     <p1><b>Fecha:</b> ${data.day}/${data.month}/${data.year}</p1> 

//     <p1><b>Hora:</b> ${data['turnName'].slice(0,2)}:${data['turnName'].slice(2)}</p1> 

//     <p>Por favor desde la página solicite un nuevo turno. Gracias.</p>
//     <br>
//     <p>${doctorData.title+doctorData.stringName}.</p>
//     <hr>
//     <p>Nuestra web: 
//     <link
//         href="https://odontoturn.vercel.app"
//     >
//     https://odontoturn.vercel.app
//     </link>
//     </p>
//     </body>
//     </html>`
//     :'<html></html>'
    





//     // smtpMailData.htmlContent = (destination=='professional')
//     // ?`<html><body>
//     // <h1>Cancelación de Turno</h1>
//     // <br>
//     // <p1><b>Id. del Paciente:</b> ${data.idPatient}</p1> 
//     // <p1><b>Email:</b> ${data.email}</p1> 
//     // <p1><b>Teléfono:</b> ${data.phone}</p1> 
//     // <hr>
//     // <h2>Turno Cancelado:</h2>
//     // <p1><b>Fecha:</b> ${data.day}/${data.month}/${data.year}</p1> 
//     // <p1><b>Hora:</b> ${data.turnName.slice(0,2)}:${data.turnName.slice(2)}</p1> 
//     // <hr>
//     // <p1>Cancelado el ${data.canceledDate} a las ${data.canceledHour}</p1>
//     // </body>
//     // </html>`
    
//     // :`<html><body>
//     // <h2>Hola <b>${data.idpatient.toUpperCase()}</b>!. Se ha reservado para Ud. el siguiente turno:</h2>
//     // <br>
//     // <p1><b>Fecha:</b> ${data.day}/${data.month}/${data.year}</p1> 
//     // <p1><b>Hora:</b> ${data.hour}/${data.minute}</p1> 
//     // <p>Lo espero...</p>
//     // <br>
//     // <p>La Doctora.</p>
//     // <hr>
//     // <p>Si por cualquier motivo no pudiera asistir le ruego cancele el turno a través de nuestra web: 
//     // <link
//     //     href="https://odontoturn.vercel.app"
//     // >
//     // https://odontoturn.vercel.app
//     // </link>
//     // </p>
//     // </body>
//     // </html>`'

//     let result;
//     await transactionEmailApi.sendTransacEmail(smtpMailData)
//         .then(response=>
//             result =200
//         )
//         .catch(error=>
//             result = 500
//         )    
//     return result;       
//     // return result = 500
    
// } catch(e) { return e }
    

// }



// //funcion para mandar correos por el doctor a varios pacientes cuando inhabilita el dia completo
// export async function sendEmailBrevoMultiple(data,sender, doctorData, typeOperation) {
//     try{


//         console.log('datos que llegan a sendemal brevo multiple en services')
//         console.log('data: ')
//         console.log(data);
//         console.log(`sender:  ${sender}`)
//         console.log(`type of operation: ${typeOperation}`)
//         console.log('doctor data:')
//         console.log(doctorData)
//         console.log(('----------------------------------'))


//     //sender puede ser doctor o patient 
//     //typeOperation puede ser cancel o create  

//     const SibClient = SibApi.ApiClient.instance;
//     SibClient.authentications['api-key'].apiKey=process.env.BREVO_API_PASS;

//     const transactionEmailApi = new SibApi.TransactionalEmailsApi()
//     let smtpMailData = new SibApi.SendSmtpEmail()

//     smtpMailData.sender = {
//         email: 'mayraarestiodontologa@gmail.com',
//         name: 'Mayra Aresti Odontóloga - TURNOS'
//     }

//     //proceso todos los turnos cancelados mandandoles un email de aviso
//     let emailSended=0;
//     for(let n=0; n<data.length; n++) {
//         console.log(`mando a ${data[n].email}`);
//         smtpMailData.to = [{ email: data[n].email, name: data[n].idPatient}];

//         smtpMailData.subject = 'Cancelación de Turno.';

//         smtpMailData.htmlContent = `<html><body>
//         <h2>Hola <b>${data[n].idPatient.toUpperCase()}</b>!. Por motivo de fuerza mayor he cancelado su turno:</h2>
//         <br>
//         <p1><b>Fecha:</b> ${data[n].day}/${data[n].month}/${data[n].year}</p1> 

//         <p1><b>Hora:</b> ${data[n]['turnName'].slice(0,2)}:${data[n]['turnName'].slice(2)}</p1> 

//         <p>Por favor desde la página solicite un nuevo turno. Gracias.</p>
//         <br>
//         <p>${doctorData.title+doctorData.stringName}.</p>
//         <hr>
//         <p>Nuestra web: 
//         <link
//             href="https://odontoturn.vercel.app"
//         >
//         https://odontoturn.vercel.app
//         </link>
//         </p>
//         </body>
//         </html>`

//         let result;
//         await transactionEmailApi.sendTransacEmail(smtpMailData)
//         .then(response=>
//                 emailSended++
//                 //result =200
//             )
//         .catch(error=>
//                 result = 500
//         )  

//     }

//     console.log('la cantidad de correos mandados correctas es: ');
//     console.log(emailSended)
//     console.log( '+++++++++++++++++++')
    
//     return emailSended
//     // let result;
//     // await transactionEmailApi.sendTransacEmail(smtpMailData)
//     //     .then(response=>
//     //         result =200
//     //     )
//     //     .catch(error=>
//     //         result = 500
//     //     )    
//     // return result;       
    
    
//     // return result = 500
    
// } catch(e) { return e }
    

// }

