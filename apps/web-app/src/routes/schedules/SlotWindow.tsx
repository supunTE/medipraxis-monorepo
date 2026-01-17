import { Button } from "@/components/ui/button";
import { BookmarkSimpleIcon } from "@phosphor-icons/react";

type SlotWindowProps = {
  id: string;
  time: string;
  clinic: string;
  address: string;
  slots: number;
  available: boolean;
  onReserve?: (id: string) => void;
};

export function SlotWindow({
  id,
  time,
  clinic,
  address,
  slots,
  available,
  onReserve,
}: SlotWindowProps) {
  return (
    <div className="mb-4 border-b border-mp-light-grey p-6 first:pt-0">
      {/* Time */}
      <p className="text-lg text-mp-dark-green mb-3 font-dm-sans">{time}</p>

      {/* Clinic Name */}
      <h3 className="text-2xl font-bold text-mp-dark-green font-lato">
        {clinic}
      </h3>

      {/* Address */}
      <p className="text-lg text-mp-dark-green mb-4 font-dm-sans">{address}</p>

      {/* Slots Count and Reserve Button in one row */}
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

        {/* Reserve Button */}
        {available && (
          <Button
            onClick={() => onReserve?.(id)}
            className="bg-mp-dark-green text-white px-8 py-2 rounded-md hover:bg-mp-dark-green/90 h-auto"
          >
            <BookmarkSimpleIcon className="w-5 h-5" />
            <span className="text-sm font-semibold font-lato">Reserve</span>
          </Button>
        )}
      </div>
    </div>
  );
}
