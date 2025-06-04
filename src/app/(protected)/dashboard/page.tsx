import { eq } from "drizzle-orm";
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
import { usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { DatePickerWithRange } from "./components/date-picker";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }

  const clinics = await db.query.usersToClinicsTable.findMany({
    where: eq(usersToClinicsTable.userId, session.user.id),
  });
  if (clinics.length === 0) {
    redirect("/clinic-form");
  }
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageSubtitle>Gerencie os pacientes da sua clínica</PageSubtitle>
        </PageHeaderContent>
        <PageActions>
          <DatePickerWithRange />
        </PageActions>
      </PageHeader>
      <PageContent>
        <h1>Dashboard</h1>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;
