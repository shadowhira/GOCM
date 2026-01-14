import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon, Clock } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Component con: Time Picker
type TimePickerProps = {
  hours: number;
  minutes: number;
  onTimeChange: (hours: number, minutes: number) => void;
  hasError?: boolean;
};

function TimePicker({
  hours,
  minutes,
  onTimeChange,
  hasError,
}: TimePickerProps) {
  const t = useTranslations();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-32 justify-between font-normal",
            hasError && "border-destructive"
          )}
        >
          <Clock className="h-4 w-4 opacity-50" />
          {`${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`}
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="end">
        <div className="flex gap-2 items-center">
          <div className="space-y-2">
            <Label className="text-xs">{t("hour")}</Label>
            <Input
              type="number"
              min="0"
              max="23"
              value={hours}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                const clampedValue = Math.min(23, Math.max(0, value));
                e.target.value = clampedValue.toString();
                onTimeChange(clampedValue, minutes);
              }}
              className="w-20 text-center"
            />
          </div>
          <span className="text-2xl font-light mt-6">:</span>
          <div className="space-y-2">
            <Label className="text-xs">{t("minute")}</Label>
            <Input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                const clampedValue = Math.min(59, Math.max(0, value));
                e.target.value = clampedValue.toString();
                onTimeChange(hours, clampedValue);
              }}
              className="w-20 text-center"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Component con: Date Time Picker
type DateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label: string;
  placeholder?: string;
};

export default function DateTimePicker({
  value,
  onChange,
  error,
  label,
  placeholder,
}: DateTimePickerProps) {
  const t = useTranslations();
  const [isDateOpen, setIsDateOpen] = useState(false);
  const dateValue = value ? new Date(value) : undefined;
  const hours = dateValue ? dateValue.getHours() : 0;
  const minutes = dateValue ? dateValue.getMinutes() : 0;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      date.setHours(hours, minutes);
      onChange(date.toISOString());
    }
    setIsDateOpen(false);
  };

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    const date = dateValue || new Date();
    date.setHours(newHours, newMinutes);
    onChange(date.toISOString());
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium block">
        {label}
        <span className="text-destructive ml-1">*</span>
      </label>
      <div className="flex gap-2">
        <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "flex-1 justify-between font-normal",
                !dateValue && "text-muted-foreground",
                error && "border-destructive"
              )}
            >
              {dateValue
                ? format(dateValue, "dd/MM/yyyy", { locale: vi })
                : placeholder || t("selectDate")}
              <ChevronDownIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-3xs overflow-hidden p-0" align="start">
            <Calendar
              className="w-3xs"
              mode="single"
              selected={dateValue}
              captionLayout="dropdown"
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>

        <TimePicker
          hours={hours}
          minutes={minutes}
          onTimeChange={handleTimeChange}
          hasError={!!error}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
