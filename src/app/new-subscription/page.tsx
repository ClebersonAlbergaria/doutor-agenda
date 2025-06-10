import { headers } from "next/headers";
import { redirect } from "next/navigation";

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

import SubscriptionPlan from "../(protected)/subscription/_components/subscription-plan";

const SubscriptionPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageSubtitle>Tenha uma visão geral da sua clínica.</PageSubtitle>
        </PageHeaderContent>
        <PageActions>
          <h1>Assinatura</h1>
        </PageActions>
      </PageHeader>
      <PageContent>
        <SubscriptionPlan
          active={session.user.plan === "essential"}
          userEmail={session.user.email}
        />
      </PageContent>
    </PageContainer>
  );
};

export default SubscriptionPage;
