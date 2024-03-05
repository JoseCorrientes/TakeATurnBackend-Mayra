const daysInAMonth = (year, month) => {
  // 30 noviembre, abril, junio, septiembre
  let year2=parseInt(year)
  let month2 = parseInt(month)  
  if ([4,6, 9, 11].includes(month2)) return 30;
  //31 los otros excepto febrero
  if ([1, 3, 5, 7, 8, 10, 12].includes(month2)) return 31;
  if (year2 % 400 == 0) return 29;
  else if (year2 % 4 == 0 && year2 % 100 != 0) return 29;
  return 28;
};

export default daysInAMonth;
