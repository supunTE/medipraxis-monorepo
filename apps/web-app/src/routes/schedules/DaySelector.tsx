type DaySelectorProps = {
  numberOfDays: number;
  selectedDay: number;
  onDaySelect: (index: number) => void;
};

type DayOption = {
  day: string;
  date: number;
  month: number;
  year: number;
  isToday: boolean;
};

export function DaySelector({
  numberOfDays,
  selectedDay,
  onDaySelect,
}: DaySelectorProps) {
  // Generate days starting from today
  const generateDays = (): DayOption[] => {
    const days: DayOption[] = [];
    const today = new Date();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < numberOfDays; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      days.push({
        day: dayNames[currentDate.getDay()] as string,
        date: currentDate.getDate(),
        month: currentDate.getMonth(),
        year: currentDate.getFullYear(),
        isToday: i === 0,
      });
    }

    return days;
  };

  const days = generateDays();

  return (
    <div className="mb-10">
      <div className="flex gap-2 sm:justify-center overflow-x-auto pb-8">
        {days.map((dayOption, index) => (
          <button
            key={index}
            onClick={() => onDaySelect(index)}
            className={`relative flex flex-col items-center justify-center shrink-0 p-4 rounded-2xl transition-colors w-20 h-24 ${
              selectedDay === index ? "bg-mp-green" : "bg-mp-light-green"
            }`}
          >
            <span className="text-lg font-normal text-mp-dark-green font-dm-sans">
              {dayOption.day}
            </span>
            <span className="text-3xl font-bold text-mp-dark-green font-lato leading-none">
              {dayOption.date}
            </span>
            {dayOption.isToday && (
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-mp-dark-green font-dm-sans text-md whitespace-nowrap">
                Today
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
