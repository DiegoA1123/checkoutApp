export function luhnCheck(num: string) {
  const digits = num.replace(/\D/g, "");
  let sum = 0,
    alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return digits.length >= 13 && sum % 10 === 0;
}

export function detectBrand(
  num: string,
): "VISA" | "MASTERCARD" | "Detectando..." {
  const d = num.replace(/\D/g, "");
  if (/^4/.test(d)) return "VISA";
  if (/^(5[1-5])/.test(d) || /^(22[2-9]|2[3-7])/.test(d)) return "MASTERCARD";
  return "Detectando...";
}
