export const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="space-y-7 p-7">{children}</div>;
};

export const PageHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center justify-between">{children}</div>;
};

export const PageHeaderContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="flex items-center gap-3">{children}</div>;
};

export const PageTitle = ({ children }: { children: React.ReactNode }) => {
  return <h1 className="text-2xl font-bold">{children}</h1>;
};

export const PageSubtitle = ({ children }: { children: React.ReactNode }) => {
  return <h2 className="text-lg font-medium">{children}</h2>;
};

export const PageActions = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center gap-3">{children}</div>;
};

export const PageContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col gap-4">{children}</div>;
};
