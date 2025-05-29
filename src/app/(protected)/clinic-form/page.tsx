import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";

import FormClinic from "./components/form";

const ClinicFormPage = () => {
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
