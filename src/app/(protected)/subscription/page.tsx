import {
  PageActions,
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageSubtitle,
  PageTitle,
} from "@/components/ui/page-conteiner";

import SubscriptionPlan from "./_components/subscription-plan";

const SubscriptionPage = () => {
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
        <SubscriptionPlan />
      </PageContent>
    </PageContainer>
  );
};

export default SubscriptionPage;
