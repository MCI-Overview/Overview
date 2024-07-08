export const nricRegex = /^[STFGM]\d{7}[A-Z]$/i;
export const contactRegex = /^[89]\d{7}$/;
export const dateRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

export function sanitizeContact(contact: string) {
  let res = contact.replace(/\s/g, "");
  if (res.startsWith("+65")) res = res.slice(3);
  if (res.startsWith("65")) res = res.slice(2);

  return res;
}
