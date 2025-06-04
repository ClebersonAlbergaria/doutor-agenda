import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { createAppointment } from "@/actions/create-appointment";
import { getAvailableTimes } from "@/actions/get-available-times";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doctorsTable, patientsTable } from "@/db/schema";
import { cn } from "@/lib/utils";

const createAppointmentSchema = z.object({
  patientId: z.string().min(1, {
    message: "Paciente é obrigatório.",
  }),
  doctorId: z.string().min(1, {
    message: "Médico é obrigatório.",
  }),
  appointmentPrice: z.number().min(1, {
    message: "Valor da consulta é obrigatório.",
  }),
  date: z.date({
    message: "Data é obrigatória.",
  }),
  time: z.string().min(1, {
    message: "Horário é obrigatório.",
  }),
});

type CreateAppointmentFormValues = z.infer<typeof createAppointmentSchema>;

interface CreateAppointmentFormProps {
  doctors: (typeof doctorsTable.$inferSelect)[];
  patients: (typeof patientsTable.$inferSelect)[];
  onSuccess: () => void;
}

export function CreateAppointmentForm({
  doctors,
  patients,
  onSuccess,
}: CreateAppointmentFormProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<
    typeof doctorsTable.$inferSelect | null
  >(null);

  const form = useForm<CreateAppointmentFormValues>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      appointmentPrice: 0,
      date: undefined,
      time: "",
    },
  });

  const { watch, setValue } = form;
  const doctorId = watch("doctorId");
  const selectedDate = watch("date");

  const { data: availableTimes } = useQuery({
    queryKey: ["available-times", doctorId, selectedDate],
    queryFn: () =>
      getAvailableTimes({
        doctorId: doctorId,
        date: dayjs(selectedDate).format("YYYY-MM-DD"),
      }),
    enabled: !!doctorId && !!selectedDate,
  });

  const createAppointmentAction = useAction(createAppointment, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso");
      onSuccess();
    },
    onError: () => {
      toast.error("Erro ao criar agendamento");
    },
  });

  useEffect(() => {
    if (doctorId) {
      const doctor = doctors.find((d) => d.id === doctorId);
      setSelectedDoctor(doctor ?? null);
      if (doctor) {
        setValue("appointmentPrice", doctor.appointmentPriceInCents);
      }
    } else {
      setSelectedDoctor(null);
    }
  }, [doctorId, doctors, setValue]);

  // Reset time when doctor or date changes
  useEffect(() => {
    setValue("time", "");
  }, [doctorId, selectedDate, setValue]);

  function onSubmit(data: CreateAppointmentFormValues) {
    createAppointmentAction.execute({
      ...data,
      appointmentPriceInCents: data.appointmentPrice * 100,
    });
  }

  const isDateAvailable = (date: Date) => {
    if (!doctorId) return false;
    const selectedDoctor = doctors.find((doctor) => doctor.id === doctorId);
    if (!selectedDoctor) return false;
    const dayOfWeek = date.getDay();
    return (
      dayOfWeek >= selectedDoctor?.availableFromWeekDay &&
      dayOfWeek <= selectedDoctor?.availableToWeekDay
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paciente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Médico</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um médico" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="appointmentPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor da consulta</FormLabel>
              <FormControl>
                <NumericFormat
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value.floatValue);
                  }}
                  decimalScale={2}
                  fixedDecimalScale
                  decimalSeparator=","
                  thousandSeparator="."
                  prefix="R$ "
                  allowNegative={false}
                  disabled={!selectedDoctor}
                  customInput={Input}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                      disabled={!selectedDoctor}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() || !isDateAvailable(date)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedDoctor || !selectedDate}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !selectedDoctor
                          ? "Selecione um médico primeiro"
                          : !selectedDate
                            ? "Selecione uma data primeiro"
                            : "Selecione um horário"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableTimes?.data?.map((time) => (
                    <SelectItem
                      key={time.value}
                      value={time.value}
                      disabled={!time.available}
                    >
                      {time.label} {!time.available && "(Indisponível)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={createAppointmentAction.status === "executing"}
        >
          {createAppointmentAction.status === "executing"
            ? "Criando..."
            : "Criar agendamento"}
        </Button>
      </form>
    </Form>
  );
}
