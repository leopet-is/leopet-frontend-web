
export const esCedulaValida = (cedula: string = ''): boolean => {
  if (typeof cedula !== 'string' || !/^\d{10}$/.test(cedula)) return false;
  const digits = cedula.split('').map(Number);
  const codigo = parseInt(cedula.slice(0, 2), 10);
  
  if (!(codigo >= 1 && codigo <= 24) && codigo !== 30) return false;
  if (digits[2] === 6) return false;
  
  const pesos = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const suma = digits.slice(0, 9).reduce((acc, digit, index) => {
    const producto = digit * pesos[index];
    return acc + (producto > 9 ? producto - 9 : producto);
  }, 0);
  
  const digitoVerificador = (10 - (suma % 10)) % 10;
  return digitoVerificador === digits[9];
};

export const esTelefonoEcuador = (telefono: string = ''): boolean => {
  if (typeof telefono !== 'string') return false;
  return /^09\d{8}$/.test(telefono) || /^0[2-7]\d{7}$/.test(telefono);
};