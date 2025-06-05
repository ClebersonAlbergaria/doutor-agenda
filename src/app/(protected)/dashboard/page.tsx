import dayjs from "dayjs";
import { and, count, eq, gte, lte, sum } from "drizzle-orm";
import { Calendar, DollarSign, Stethoscope, Users } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageSubtitle,
  PageTitle,
} from "@/components/ui/page-conteiner";
import { PageContainer } from "@/components/ui/page-conteiner";
import { db } from "@/db";
import {
  appointmentsTable,
  doctorsTable,
  patientsTable,
  usersToClinicsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

import { DatePicker } from "./components/date-picker";
import { StatusCard } from "./components/status-card";

interface DashboardPageProps {
  searchParams: Promise<{
    from: string;
    to: string;
  }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const clinics = await db.query.usersToClinicsTable.findMany({
    where: eq(usersToClinicsTable.userId, session.user.id),
  });
  if (clinics.length === 0) {
    redirect("/clinic-form");
  }

  const { from, to } = await searchParams;
  if (!from || !to) {
    redirect(
      `/dashboard?from=${dayjs().format("YYYY-MM-DD")}&to=${dayjs().add(1, "month").format("YYYY-MM-DD")}`,
    );
  }

  const [[totalRevenue], [totalAppointments], [totalPatients], [totalDoctors]] =
    await Promise.all([
      db
        .select({
          total: sum(appointmentsTable.appointmentPriceInCents),
        })
        .from(appointmentsTable)
        .where(
          and(
            eq(appointmentsTable.clinicId, session.user.clinic.id),
            gte(appointmentsTable.date, new Date(from)),
            lte(appointmentsTable.date, new Date(to)),
          ),
        ),
      db
        .select({
          total: count(),
        })
        .from(appointmentsTable)
        .where(
          and(
            eq(appointmentsTable.clinicId, session.user.clinic.id),
            gte(appointmentsTable.date, new Date(from)),
            lte(appointmentsTable.date, new Date(to)),
          ),
        ),
      db
        .select({
          total: count(),
        })
        .from(patientsTable)
        .where(eq(patientsTable.clinicId, session.user.clinic.id)),
      db
        .select({
          total: count(),
        })
        .from(doctorsTable)
        .where(eq(doctorsTable.clinicId, session.user.clinic.id)),
    ]);

  const formatCurrency = (value: bigint | number | null) => {
    if (!value) return "R$ 0";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value) / 100);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageSubtitle>Gerencie os pacientes da sua clínica</PageSubtitle>
        </PageHeaderContent>
        <PageActions>
          <DatePicker />
        </PageActions>
      </PageHeader>
      <PageContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatusCard
            icon={<DollarSign className="text-primary h-4 w-4" />}
            title="Faturamento"
            value={formatCurrency(totalRevenue.total)}
          />
          <StatusCard
            icon={<Calendar className="text-primary h-4 w-4" />}
            title="Agendamentos"
            value={totalAppointments.total ?? 0}
          />
          <StatusCard
            icon={<Users className="text-primary h-4 w-4" />}
            title="Pacientes"
            value={totalPatients.total ?? 0}
          />
          <StatusCard
            icon={<Stethoscope className="text-primary h-4 w-4" />}
            title="Médicos"
            value={totalDoctors.total ?? 0}
          />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;
