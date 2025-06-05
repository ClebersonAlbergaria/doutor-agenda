import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

export const StatusCard = ({ icon, title, value }: StatusCardProps) => {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <div className="bg-primary/10 h-8 w-8 rounded-full p-2">{icon}</div>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};
