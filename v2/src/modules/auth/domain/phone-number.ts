import { z } from "zod";

export const moroccanPhoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s().-]/g, ""))
  .transform((value) => {
    if (value.startsWith("00212")) {
      return `+212${value.slice(5)}`;
    }
    if (value.startsWith("0")) {
      return `+212${value.slice(1)}`;
    }
    return value;
  })
  .pipe(
    z.string().regex(/^\+212[67]\d{8}$/, {
      message: "Saisissez un numero mobile marocain valide.",
    }),
  );

export function normalizeMoroccanPhone(value: string) {
  return moroccanPhoneSchema.parse(value);
}
