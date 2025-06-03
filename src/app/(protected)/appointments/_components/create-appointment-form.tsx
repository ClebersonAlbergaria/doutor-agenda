import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { createAppointment } from "@/actions/create-appointment";
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
  });

  const { watch, setValue } = form;
  const doctorId = watch("doctorId");
  const selectedDate = watch("date");

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

  const availableTimeSlots = useMemo(() => {
    if (!selectedDoctor) return [];

    const fromTime = selectedDoctor.availableFromTime;
    const toTime = selectedDoctor.availableToTime;

    const [fromHour, fromMinute] = fromTime.split(":").map(Number);
    const [toHour, toMinute] = toTime.split(":").map(Number);

    const slots: string[] = [];
    let currentHour = fromHour;
    let currentMinute = fromMinute;

    while (
      currentHour < toHour ||
      (currentHour === toHour && currentMinute <= toMinute)
    ) {
      slots.push(
        `${currentHour.toString().padStart(2, "0")}:${currentMinute
          .toString()
          .padStart(2, "0")}`,
      );

      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }

    return slots;
  }, [selectedDoctor]);

  function onSubmit(data: CreateAppointmentFormValues) {
    createAppointmentAction.execute({
      ...data,
      appointmentPriceInCents: data.appointmentPrice * 100,
    });
  }

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
                  customInput={Input}
                  value={field.value ? field.value / 100 : ""}
                  onValueChange={(values) => {
                    field.onChange(
                      values.floatValue ? values.floatValue * 100 : 0,
                    );
                  }}
                  disabled={!selectedDoctor}
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  decimalSeparator=","
                  thousandSeparator="."
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
                    disabled={(date) => {
                      if (!selectedDoctor) return true;
                      const day = date.getDay();
                      return (
                        day < selectedDoctor.availableFromWeekDay ||
                        day > selectedDoctor.availableToWeekDay
                      );
                    }}
                    initialFocus
                    locale={ptBR}
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
                  {availableTimeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
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
