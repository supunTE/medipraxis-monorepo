import { useCancelAppointment } from "@/services/ShareableCalendarLink/useCancelAppointment";
import { useReserveAppointment } from "@/services/ShareableCalendarLink/useReserveAppointment";
import { useShareableCalendarLink } from "@/services/ShareableCalendarLink/useShareableCalendarLink";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DaySelector } from "./DaySelector";
import { SlotWindow } from "./SlotWindow";

export const Route = createFileRoute("/schedules/$id")({
  component: ScheduleDetail,
});

function ScheduleDetail() {
  const { id } = Route.useParams();
  const [selectedDay, setSelectedDay] = useState(0); // Start with today (index 0)

  // TODO: Get client_id from authentication context or local storage
  // For now, using a placeholder. This should be replaced with actual client authentication
  const clientId = "4231411e-efa4-4a1c-8e05-bf16f93c542d";

  // Fetch shareable calendar link data with slot windows
  const { data, isLoading, error } = useShareableCalendarLink(id, clientId);

  // Reserve appointment mutation
  const reserveAppointment = useReserveAppointment({
    linkId: id,
    onSuccess: () => {
      toast.success("Your appointment has been booked successfully!");
    },
    onError: (errorMessage) => {
      toast.error(errorMessage);
    },
  });

  // Cancel appointment mutation
  const cancelAppointment = useCancelAppointment({
    linkId: id,
    clientId,
    onSuccess: () => {
      toast.success("Your appointment has been cancelled successfully.");
    },
    onError: (errorMessage) => {
      toast.error(errorMessage);
    },
  });

  // Filter slot windows for the selected day
  const filteredSlotWindows = useMemo(() => {
    if (!data?.success || !data.data.slotWindows) return [];

    const today = new Date();
    const selectedDate = new Date(today);
    selectedDate.setDate(today.getDate() + selectedDay);
    selectedDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);

    return data.data.slotWindows.filter((slot) => {
      const slotDate = new Date(slot.start_date);
      return slotDate >= selectedDate && slotDate < nextDay;
    });
  }, [data, selectedDay]);

  // Format time range from ISO datetime
  const formatTimeRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatTime = (date: Date) => {
      const hours = date.getHours();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${displayHours}${ampm}`;
    };

    return `${formatTime(start)}-${formatTime(end)}`;
  };

  // Handle appointment reservation
  const handleReserve = (slotWindowId: string) => {
    if (!clientId) {
      toast.error(
        "Please log in or create an account to book your appointment"
      );
      return;
    }

    reserveAppointment.mutate({
      slot_window_id: slotWindowId,
      client_id: clientId,
    });
  };

  // Handle appointment cancellation
  const handleCancel = (slotWindowId: string) => {
    const taskId = data?.data.clientReservedAppointments?.[slotWindowId];

    if (!taskId) {
      toast.error("Unable to cancel this appointment");
      return;
    }

    cancelAppointment.mutate({
      task_id: taskId,
      slot_window_id: slotWindowId,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mp-white px-6 py-8 max-w-2xl mx-auto">
        <div className="text-center text-mp-dark-green font-dm-sans">
          Loading available appointments...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mp-white px-6 py-8 max-w-2xl mx-auto">
        <div className="text-center text-red-600 font-dm-sans">
          Unable to load appointments. Please try again later.
        </div>
      </div>
    );
  }

  const doctorName = data?.data?.user
    ? `Dr. ${data.data.user.first_name} ${data.data.user.last_name}`
    : "Doctor";

  const numberOfDays = data?.data?.visible_days_ahead || 7;

  return (
    <div className="min-h-screen bg-mp-white px-6 py-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-mp-dark-green mb-4 font-lato">
          Appointment
        </h1>

        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-lg text-mp-dark-green font-dm-sans">
            to consult
          </span>
          <button className="bg-mp-green px-6 py-2 rounded-md hover:bg-mp-green/90 transition-colors">
            <span className="text-lg font-semibold text-mp-dark-green font-lato">
              {doctorName}
            </span>
          </button>
        </div>
      </div>

      {/* Day Selector - Single Row */}
      <DaySelector
        numberOfDays={numberOfDays}
        selectedDay={selectedDay}
        onDaySelect={setSelectedDay}
      />

      {/* Time Slots */}
      <div className="space-y-8">
        {filteredSlotWindows.length === 0 ? (
          <div className="text-center text-mp-dark-green font-dm-sans">
            No appointments available for this day.
          </div>
        ) : (
          filteredSlotWindows.map((slot) => {
            const availableSlots = slot.total_slots - slot.slots_filled;
            const isReserved =
              data?.data.clientReservedSlotWindowIds?.includes(
                slot.slot_window_id
              ) ?? false;
            return (
              <SlotWindow
                key={slot.slot_window_id}
                id={slot.slot_window_id}
                time={formatTimeRange(slot.start_date, slot.end_date)}
                clinic={slot.location || "Clinic"}
                address={slot.note || "Address not provided"}
                slots={availableSlots}
                available={availableSlots > 0}
                isReserved={isReserved}
                isReserving={reserveAppointment.isPending}
                isCancelling={cancelAppointment.isPending}
                onReserve={handleReserve}
                onCancel={handleCancel}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
