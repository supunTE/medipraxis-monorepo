import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { BookmarkSimpleIcon, XIcon } from "@phosphor-icons/react";

type SlotWindowProps = {
  id: string;
  time: string;
  clinic: string;
  address: string;
  slots: number;
  available: boolean;
  isReserved?: boolean;
  isReserving?: boolean;
  isCancelling?: boolean;
  onReserve?: (id: string) => void;
  onCancel?: (id: string) => void;
};

export function SlotWindow({
  id,
  time,
  clinic,
  address,
  slots,
  available,
  isReserved = false,
  isReserving = false,
  isCancelling = false,
  onReserve,
  onCancel,
}: SlotWindowProps) {
  return (
    <div className="mb-4 border-b border-mp-light-grey sm:px-2 py-6 first:pt-0">
      {/* Time */}
      <p className="text-lg text-mp-dark-green mb-3 font-dm-sans">{time}</p>

      {/* Clinic Name */}
      <h3 className="text-2xl font-bold text-mp-dark-green font-lato">
        {clinic}
      </h3>

      {/* Address */}
      <p className="text-lg text-mp-dark-green mb-4 font-dm-sans">{address}</p>

      {/* Slots Count and Buttons in one row */}
      <div className="flex items-center justify-between">
        {/* Slots Count */}
        <div className="flex items-center gap-4">
          <div
            className={`px-6 py-2 rounded-lg ${
              available ? "bg-mp-light-green" : "bg-mp-danger"
            }`}
          >
            <span className="text-4xl font-bold text-mp-dark-green font-lato">
              {slots.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="text-lg text-mp-dark-green font-dm-sans">
            {available ? "Slots Available" : "Slots Unavailable"}
          </span>
        </div>

        {/* Reserve/Cancel Button */}
        {available && (
          <div>
            {isReserved ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={isCancelling}
                    variant="destructive"
                    className="px-8 py-2 rounded-md h-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XIcon className="w-5 h-5" />
                    <span className="text-sm font-semibold font-lato">
                      {isCancelling ? "Cancelling..." : "Cancel Reservation"}
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <div className="bg-gray-50 p-4 rounded-md border">
                        <p className="text-sm font-semibold text-mp-dark-green mb-1">
                          {time}
                        </p>
                        <p className="text-base font-bold text-mp-dark-green">
                          {clinic}
                        </p>
                        <p className="text-sm text-gray-600">{address}</p>
                      </div>
                      <p className="text-sm text-pretty">
                        Are you sure you want to cancel this reservation? Please
                        note that you will have to wait some time before making
                        your next reservation.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onCancel?.(id)}
                      className="bg-mp-danger hover:bg-mp-danger/90 text-white"
                    >
                      Yes, Cancel It
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={isReserving}
                    className="bg-mp-dark-green text-white px-8 py-2 rounded-md hover:bg-mp-dark-green/90 h-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BookmarkSimpleIcon className="w-5 h-5" />
                    <span className="text-sm font-semibold font-lato">
                      {isReserving ? "Reserving..." : "Reserve"}
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reserve Appointment</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <div className="bg-gray-50 p-4 rounded-md border">
                        <p className="text-sm font-semibold text-mp-dark-green mb-1">
                          {time}
                        </p>
                        <p className="text-base font-bold text-mp-dark-green">
                          {clinic}
                        </p>
                        <p className="text-sm text-gray-600">{address}</p>
                      </div>
                      <p className="text-sm text-pretty">
                        Are you sure you want to reserve this appointment slot?
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onReserve?.(id)}
                      className="bg-mp-dark-green hover:bg-mp-dark-green/90 text-white"
                    >
                      Reserve
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
