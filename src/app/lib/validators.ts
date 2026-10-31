
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

const esProvincia = (digits: string): boolean => {
  const codigo = parseInt(digits.slice(0, 2), 10);
  return codigo >= 1 && codigo <= 24;
};

const modulo11 = (
  digits: number[],
  pesos: number[]
): number => {
  const suma = digits.reduce(
    (acc, digit, index) => acc + digit * pesos[index],
    0
  );

  const residuo = suma % 11;
  const digitoVerificador = 11 - residuo;

  if (digitoVerificador === 11) return 0;
  if (digitoVerificador === 10) return -1;

  return digitoVerificador;
};



export const esRucValido = (ruc = ''): boolean => {
  if (!/^\d{13}$/.test(ruc)) return false;
  if (!esProvincia(ruc)) return false;

  const digits = ruc.split('').map(Number);
  const tercerDigito = digits[2];
  const establecimiento = parseInt(ruc.slice(-3), 10);

  if (establecimiento < 1) return false;

  if (tercerDigito <= 5) {
    return esCedulaValida(ruc.slice(0, 10));
  }

  if (tercerDigito === 9) {
    const verificador = modulo11(
      digits.slice(0, 9),
      [4, 3, 2, 7, 6, 5, 4, 3, 2]
    );

    return verificador === digits[9];
  }

  if (tercerDigito === 6) {
    const verificador = modulo11(
      digits.slice(0, 8),
      [3, 2, 7, 6, 5, 4, 3, 2]
    );

    return verificador === digits[8];
  }

  return false;
};