"use server";

import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  date: z.date(),
  appointmentPriceInCents: z.number(),
});

export const createAppointment = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (!session?.user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    const [appointment] = await db
      .insert(appointmentsTable)
      .values({
        id: crypto.randomUUID(),
        patientId: parsedInput.patientId,
        doctorId: parsedInput.doctorId,
        date: dayjs(parsedInput.date).format("YYYY-MM-DD"),
        appointmentPriceInCents: parsedInput.appointmentPriceInCents,
        clinicId: session.user.clinic.id,
      })
      .returning();

    revalidatePath("/appointments");
    return appointment;
  });
