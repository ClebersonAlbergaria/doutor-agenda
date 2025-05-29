import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageSubtitle,
  PageTitle,
} from "@/components/ui/page-conteiner";
import { auth } from "@/lib/auth";

import AddDoctorBotton from "./_components/add-doctor-botton";

const DoctorsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Médicos</PageTitle>
          <PageSubtitle>Gerencie os médicos da sua clínica</PageSubtitle>
        </PageHeaderContent>
        <PageActions>
          <AddDoctorBotton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <h1>Lista medicos</h1>
      </PageContent>
    </PageContainer>
  );
};

export default DoctorsPage;
