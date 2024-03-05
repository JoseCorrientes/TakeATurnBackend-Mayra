//0 - sunday  //6-saturday


const weekday = (year, month, day) =>{
    let fecha = `${year}-${month}-${day}`
    let fechanew = new Date(fecha)
    return fechanew.getUTCDay();
}

export default weekday;
