import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import { auth } from "@/lib/auth";

import FormClinic from "./components/form";

const ClinicFormPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }
  if (!session.user.plan) {
    redirect("/new-subscription");
  }
  return (
    <Dialog open>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crie sua clínica</DialogTitle>
          <DialogDescription>
            Preencha o formulário abaixo para criar sua clínica.
          </DialogDescription>
        </DialogHeader>
        <FormClinic />
      </DialogContent>
    </Dialog>
  );
};

export default ClinicFormPage;
