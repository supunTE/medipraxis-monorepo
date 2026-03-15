import { getClientService, getSlotWindowService, getTaskService } from "../lib";
import type { APIContext } from "../types/api-context";

const DEBUG_USER_ID = "2a3c19b8-d352-4b30-a2ac-1cdf993d310c";

const SEED_REMINDERS = [
  { title: "Review patient notes - Dr. Silva", hour: 10, minute: 0 },
  { title: "Call pharmacy for prescription refill", hour: 10, minute: 5 },
  { title: "Prepare session materials", hour: 10, minute: 10 },
  { title: "Follow up with client on progress report", hour: 12, minute: 0 },
  { title: "Update treatment plan documentation", hour: 14, minute: 0 },
] as const;

const SEED_SLOT_WINDOWS = [
  {
    key: "morning",
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 40,
    totalSlots: 10,
    targetReservations: 4,
    note: "Debug morning appointment window",
    location: "Room A",
  },
  {
    key: "night",
    startHour: 19,
    startMinute: 0,
    endHour: 21,
    endMinute: 0,
    totalSlots: 5,
    targetReservations: 2,
    note: "Debug night appointment window",
    location: "Room B",
  },
] as const;

const SEED_CUSTOM_APPOINTMENTS = [
  {
    title: "Custom intake consultation",
    startHour: 13,
    startMinute: 0,
    endHour: 13,
    endMinute: 10,
    note: "Debug custom appointment outside slot windows",
  },
  {
    title: "Custom progress review",
    startHour: 16,
    startMinute: 30,
    endHour: 16,
    endMinute: 45,
    note: "Debug follow-up appointment outside slot windows",
  },
] as const;

type SeededReservation = {
  task_id: string;
  client_id: string;
  position: number | null;
  start: string;
  end: string;
};

type SeededSlotWindowResult = {
  key: string;
  slot_window_id: string;
  created: boolean;
  start: string;
  end: string;
  total_slots: number;
  existing_reservations: number;
  reservations_created: number;
  reservations: SeededReservation[];
};

type SeededCustomAppointmentResult = {
  task_id: string;
  title: string;
  created: boolean;
  start: string;
  end: string;
  client_id: string | null;
};

function buildDateAt(baseDate: Date, hour: number, minute: number) {
  const value = new Date(baseDate);
  value.setHours(hour, minute, 0, 0);
  return value;
}

function formatDateOnly(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayDateString() {
  return formatDateOnly(new Date());
}

function pickNextClient(
  clients: Array<{ client_id: string }>,
  cursor: { index: number },
  excludedIds: Set<string>
) {
  for (let offset = 0; offset < clients.length; offset++) {
    const candidate = clients[(cursor.index + offset) % clients.length];

    if (candidate && !excludedIds.has(candidate.client_id)) {
      cursor.index = (cursor.index + offset + 1) % clients.length;
      return candidate;
    }
  }

  return null;
}

export class DebugController {
  static async seedReminders(c: APIContext) {
    try {
      const taskService = getTaskService(c);

      const now = new Date();
      const todayBase = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      const created = [];

      for (const def of SEED_REMINDERS) {
        const startDate = new Date(todayBase);
        startDate.setHours(def.hour, def.minute, 0, 0);

        const endDate = new Date(todayBase);
        endDate.setTime(startDate.getTime() + 30 * 60 * 1000);

        const task = await taskService.createTask({
          task_title: def.title,
          user_id: DEBUG_USER_ID,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          set_alarm: false,
          created_by: "PRACTITIONER",
        });

        created.push(task);
      }

      return c.json({
        message: `Created ${created.length} debug reminders for today`,
        user_id: DEBUG_USER_ID,
        reminders: created.map((t) => ({
          id: t.task_id,
          title: t.task_title,
          start: t.start_date,
          end: t.end_date,
        })),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to seed reminders";
      return c.json({ error: message }, 500);
    }
  }

  static async seedAppointments(c: APIContext) {
    try {
      const clientService = getClientService(c);
      const slotWindowService = getSlotWindowService(c);
      const taskService = getTaskService(c);

      const clients = await clientService.getAllClients(DEBUG_USER_ID);

      if (clients.length === 0) {
        return c.json(
          {
            error:
              "No clients found for the debug practitioner. Create at least one client before seeding appointments.",
          },
          400
        );
      }

      const now = new Date();
      const todayBase = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const today = formatDateOnly(todayBase);

      const existingSlotWindows =
        await slotWindowService.getAllSlotWindowsByUserId(DEBUG_USER_ID, today);
      const existingAppointments = await taskService.getAllTasks(
        DEBUG_USER_ID,
        "APPOINTMENT",
        undefined,
        undefined,
        today
      );

      const clientCursor = { index: 0 };
      const slotWindows: SeededSlotWindowResult[] = [];

      for (const seed of SEED_SLOT_WINDOWS) {
        const startDate = buildDateAt(
          todayBase,
          seed.startHour,
          seed.startMinute
        );
        const endDate = buildDateAt(todayBase, seed.endHour, seed.endMinute);
        const startIso = startDate.toISOString();
        const endIso = endDate.toISOString();

        let slotWindow = existingSlotWindows.find(
          (item) => item.start_date === startIso && item.end_date === endIso
        );

        const wasCreated = !slotWindow;

        if (!slotWindow) {
          slotWindow = await slotWindowService.createAppointmentSlotWindow({
            user_id: DEBUG_USER_ID,
            start_date: startIso,
            end_date: endIso,
            total_slots: seed.totalSlots,
            slots_filled: 0,
            note: seed.note,
            location: seed.location,
          });
          existingSlotWindows.push(slotWindow);
        }

        const activeWindowAppointments = existingAppointments.filter(
          (appointment) =>
            appointment.slot_window_id === slotWindow.slot_window_id &&
            appointment.task_status_name !== "CANCELLED"
        );

        const reservedClientIds = new Set(
          activeWindowAppointments
            .map((appointment) => appointment.client_id)
            .filter((clientId): clientId is string => Boolean(clientId))
        );

        const createdReservations: SeededReservation[] = [];
        const reservationTarget = Math.min(
          seed.targetReservations,
          slotWindow.total_slots
        );

        for (
          let count = activeWindowAppointments.length;
          count < reservationTarget;
          count++
        ) {
          const client = pickNextClient(
            clients,
            clientCursor,
            reservedClientIds
          );

          if (!client) {
            break;
          }

          const position = await slotWindowService.reserveSlotFromSlotWindow(
            slotWindow.slot_window_id
          );

          const appointment =
            await taskService.reserveAppointmentFromSlotWindow(
              slotWindow.slot_window_id,
              slotWindow.start_date,
              slotWindow.end_date,
              slotWindow.total_slots,
              position,
              DEBUG_USER_ID,
              client.client_id
            );

          reservedClientIds.add(client.client_id);
          createdReservations.push({
            task_id: appointment.task_id,
            client_id: client.client_id,
            position: appointment.appointment_number,
            start: appointment.start_date,
            end: appointment.end_date,
          });
        }

        slotWindows.push({
          key: seed.key,
          slot_window_id: slotWindow.slot_window_id,
          created: wasCreated,
          start: slotWindow.start_date,
          end: slotWindow.end_date,
          total_slots: slotWindow.total_slots,
          existing_reservations: activeWindowAppointments.length,
          reservations_created: createdReservations.length,
          reservations: createdReservations,
        });
      }

      const customAppointments: SeededCustomAppointmentResult[] = [];

      for (const seed of SEED_CUSTOM_APPOINTMENTS) {
        const startDate = buildDateAt(
          todayBase,
          seed.startHour,
          seed.startMinute
        );
        const endDate = buildDateAt(todayBase, seed.endHour, seed.endMinute);
        const startIso = startDate.toISOString();
        const endIso = endDate.toISOString();

        const existingCustomAppointment = existingAppointments.find(
          (appointment) =>
            !appointment.slot_window_id &&
            appointment.task_title === seed.title &&
            appointment.start_date === startIso &&
            appointment.end_date === endIso &&
            appointment.task_status_name !== "CANCELLED"
        );

        if (existingCustomAppointment) {
          customAppointments.push({
            task_id: existingCustomAppointment.task_id,
            title: existingCustomAppointment.task_title,
            created: false,
            start: existingCustomAppointment.start_date,
            end: existingCustomAppointment.end_date,
            client_id: existingCustomAppointment.client_id,
          });
          continue;
        }

        const client = pickNextClient(clients, clientCursor, new Set());

        if (!client) {
          break;
        }

        const appointment = await taskService.debugCreateCustomAppointment({
          task_title: seed.title,
          user_id: DEBUG_USER_ID,
          client_id: client.client_id,
          start_date: startIso,
          end_date: endIso,
          note: seed.note,
          set_alarm: false,
          created_by: "PRACTITIONER",
        });

        customAppointments.push({
          task_id: appointment.task_id,
          title: appointment.task_title,
          created: true,
          start: appointment.start_date,
          end: appointment.end_date,
          client_id: appointment.client_id,
        });
      }

      return c.json({
        message: "Seeded debug appointment slot windows and appointments",
        user_id: DEBUG_USER_ID,
        date: today,
        slot_windows: slotWindows,
        custom_appointments: customAppointments,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to seed appointments";
      return c.json({ error: message }, 500);
    }
  }

  static async deleteTodayReminders(c: APIContext) {
    try {
      const taskService = getTaskService(c);
      const today = getTodayDateString();

      const reminders = await taskService.getAllTasks(
        DEBUG_USER_ID,
        "REMINDER",
        undefined,
        undefined,
        today
      );

      const deletedTaskIds = reminders.map((reminder) => reminder.task_id);
      const deletedIds =
        await taskService.debugDeleteTasksByIds(deletedTaskIds);

      return c.json({
        message: `Deleted ${deletedIds.length} reminders for today`,
        user_id: DEBUG_USER_ID,
        date: today,
        deleted_task_ids: deletedIds,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete reminders";
      return c.json({ error: message }, 500);
    }
  }

  static async deleteTodayAppointments(c: APIContext) {
    try {
      const taskService = getTaskService(c);
      const slotWindowService = getSlotWindowService(c);
      const today = getTodayDateString();

      const appointments = await taskService.getAllTasks(
        DEBUG_USER_ID,
        "APPOINTMENT",
        undefined,
        undefined,
        today
      );
      const slotWindows = await slotWindowService.getAllSlotWindowsByUserId(
        DEBUG_USER_ID,
        today
      );

      const deletedTaskIds = appointments.map(
        (appointment) => appointment.task_id
      );
      const deletedSlotWindowIds = slotWindows.map(
        (slotWindow) => slotWindow.slot_window_id
      );
      const deletedTaskResults =
        await taskService.debugDeleteTasksByIds(deletedTaskIds);
      const deletedSlotWindowResults =
        await slotWindowService.debugDeleteSlotWindowsByIds(
          deletedSlotWindowIds
        );

      return c.json({
        message:
          "Deleted appointment tasks and appointment slot windows for today",
        user_id: DEBUG_USER_ID,
        date: today,
        deleted_task_ids: deletedTaskResults,
        deleted_slot_window_ids: deletedSlotWindowResults,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete appointments and slot windows";
      return c.json({ error: message }, 500);
    }
  }
}
