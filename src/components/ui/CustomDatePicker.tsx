import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { CalendarIcon, X, Calendar as CalendarCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

interface CustomDatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  minYear?: number;
  maxYear?: number;
}

const MONTHS_INDONESIAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = "Pilih tanggal (Default: Hari ini)",
  className,
  minYear = 2022,
  maxYear = 2040,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Track displayed month/year in calendar
  const [currentMonth, setCurrentMonth] = React.useState<Date>(() => value || new Date());
  
  // Track text input for manual typing (e.g. YYYY-MM-DD or DD/MM/YYYY)
  const [inputText, setInputText] = React.useState<string>(() => 
    value ? format(value, "yyyy-MM-dd") : ""
  );

  // Sync state when prop value changes
  React.useEffect(() => {
    if (value) {
      setCurrentMonth(value);
      setInputText(format(value, "yyyy-MM-dd"));
    } else {
      setInputText("");
    }
  }, [value]);

  // Generate Year options from minYear (2022) to maxYear (2040)
  const years = React.useMemo(() => {
    const startYear = Math.min(minYear, 2022);
    const endYear = Math.max(maxYear, 2040);
    const list: number[] = [];
    for (let y = startYear; y <= endYear; y++) {
      list.push(y);
    }
    return list;
  }, [minYear, maxYear]);

  // Handle Manual Text Typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setInputText(rawVal);

    if (!rawVal.trim()) {
      onChange(null);
      return;
    }

    // Try parsing YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD
    const formatsToTry = ["yyyy-MM-dd", "dd/MM/yyyy", "dd-MM-yyyy", "yyyy/MM/dd", "d/M/yyyy"];
    let parsedDate: Date | null = null;

    for (const fmt of formatsToTry) {
      const d = parse(rawVal, fmt, new Date());
      if (isValid(d) && d.getFullYear() >= minYear && d.getFullYear() <= maxYear) {
        parsedDate = d;
        break;
      }
    }

    if (parsedDate) {
      onChange(parsedDate);
      setCurrentMonth(parsedDate);
    }
  };

  // Handle Month Select Dropdown Change
  const handleMonthSelect = (monthIdxStr: string) => {
    const newMonthIdx = parseInt(monthIdxStr, 10);
    const newDate = new Date(currentMonth);
    newDate.setMonth(newMonthIdx);
    setCurrentMonth(newDate);
  };

  // Handle Year Select Dropdown Change
  const handleYearSelect = (yearStr: string) => {
    const newYear = parseInt(yearStr, 10);
    const newDate = new Date(currentMonth);
    newDate.setFullYear(newYear);
    setCurrentMonth(newDate);
  };

  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
      onChange(date);
      setInputText(format(date, "yyyy-MM-dd"));
      setIsOpen(false);
    }
  };

  const handleSetToday = () => {
    const today = new Date();
    onChange(today);
    setCurrentMonth(today);
    setInputText(format(today, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setInputText("");
  };

  return (
    <div className={cn("space-y-2 w-full", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex gap-2">
          {/* Main Button Trigger */}
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-background/50 border-border/60 hover:bg-accent/10",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
              {value ? (
                <span className="font-medium text-foreground">
                  {format(value, "d MMMM yyyy", { locale: idLocale })}
                </span>
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>

          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-10 w-10 text-muted-foreground hover:text-destructive shrink-0"
              title="Hapus Tanggal"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <PopoverContent className="w-[320px] p-4 bg-card/95 backdrop-blur-xl border-border/80 shadow-2xl rounded-xl z-50 space-y-3" align="start">
          {/* Manual Input Section */}
          <div className="space-y-1.5 border-b border-border/50 pb-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Ketik Tanggal Manual:</label>
              <span className="text-[10px] text-muted-foreground font-mono">YYYY-MM-DD</span>
            </div>
            <Input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Contoh: 2024-05-17 atau 17/05/2024"
              className="h-9 text-xs bg-background font-mono"
            />
          </div>

          {/* Month & Year Select Dropdowns */}
          <div className="flex gap-2 items-center justify-between">
            <Select
              value={currentMonth.getMonth().toString()}
              onValueChange={handleMonthSelect}
            >
              <SelectTrigger className="h-8 text-xs font-medium bg-secondary/50 border-border/50 flex-1">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent className="max-h-60 z-50">
                {MONTHS_INDONESIAN.map((m, idx) => (
                  <SelectItem key={idx} value={idx.toString()} className="text-xs">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentMonth.getFullYear().toString()}
              onValueChange={handleYearSelect}
            >
              <SelectTrigger className="h-8 text-xs font-medium bg-secondary/50 border-border/50 w-[100px]">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent className="max-h-60 z-50">
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()} className="text-xs">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Calendar Picker Component */}
          <div className="border border-border/40 rounded-lg p-1 bg-background/30 flex justify-center">
            <Calendar
              mode="single"
              selected={value || undefined}
              onSelect={handleSelectDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              fromYear={minYear}
              toYear={maxYear}
              initialFocus
            />
          </div>

          {/* Quick Action Footer */}
          <div className="flex items-center justify-between border-t border-border/50 pt-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSetToday}
              className="h-8 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 border-primary/30"
            >
              <CalendarCheckIcon className="w-3.5 h-3.5 mr-1" /> Hari Ini
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 text-xs text-muted-foreground"
            >
              Selesai
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
