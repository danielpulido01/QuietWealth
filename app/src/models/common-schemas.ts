import { z } from "zod";

export const nonEmptyStringSchema = z.string().trim().min(1);

export const dateTimeStringSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Invalid date-time value.",
});

