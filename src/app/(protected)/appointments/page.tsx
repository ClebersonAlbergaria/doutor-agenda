import { eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageSubtitle,
  PageTitle,
} from "@/components/ui/page-conteiner";
import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { CreateAppointmentDialog } from "./_components/create-appointment-dialog";
import { appointmentsTableColumns } from "./_components/table-columns";

export default async function AppointmentsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }
  if (!session.user.plan) {
    redirect("/new-subscription");
  }

  const appointments = await db.query.appointmentsTable.findMany({
    where: eq(appointmentsTable.clinicId, session.user.clinic.id),
    with: {
      doctor: true,
      patient: true,
    },
  });

  const doctors = await db.query.doctorsTable.findMany({
    orderBy: (doctors, { asc }) => [asc(doctors.name)],
  });

  const patients = await db.query.patientsTable.findMany({
    orderBy: (patients, { asc }) => [asc(patients.name)],
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Agendamentos</PageTitle>
          <PageSubtitle>Gerencie os agendamentos da clínica</PageSubtitle>
        </PageHeaderContent>
        <PageActions>
          <CreateAppointmentDialog doctors={doctors} patients={patients}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo agendamento
            </Button>
          </CreateAppointmentDialog>
        </PageActions>
      </PageHeader>
      <PageContent>
        <DataTable columns={appointmentsTableColumns} data={appointments} />
      </PageContent>
    </PageContainer>
  );
}
