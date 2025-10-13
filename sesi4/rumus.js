// Hafiz Hamdani - Tugas Sesi 4
export function kalkulator(angka1, angka2, operator) {
  switch (operator) {
    case "+":
      return angka1 + angka2;
    case "-":
      return angka1 - angka2;
    case "*":
      return angka1 * angka2;
    case "/":
      if (angka2 === 0) {
        return "Tidak bisa dibagi dengan nol!";
      }
      return angka1 / angka2;
    default:
      return "Operator tidak valid!";
  }
}