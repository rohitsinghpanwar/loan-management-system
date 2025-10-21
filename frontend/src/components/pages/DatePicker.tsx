"use client"

import { useState } from "react"
import { format, subYears, isBefore } from "date-fns"
import CalendarIcon from "../../assets/calendar 1.svg"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function DatePicker({
  value,
  onChange,
}: {
  value?: Date
  onChange: (date: Date | undefined) => void
}) {
  const [open, setOpen] = useState(false)

  const today = new Date()
  const minAgeDate = subYears(today, 18) // Latest valid birthday (18 years ago)
  const minDate = new Date(1900, 0, 1)   // Earliest selectable date

  const handleSelect = (date: Date | undefined) => {
    if (!date) return

    if (isBefore(date, minAgeDate)) {
      onChange(date)
      setOpen(false)
    } else {
      toast.info("You must be at least 18 years old")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"ghost"}
          className={cn(
            "w-full justify-between text-left font-semibold p-0 hover:bg-transparent hover:text-muted-foreground",
            !value && "text-muted-foreground"
          )}
        >
          {value ? format(value, "dd-MM-yyyy") : <span>DD-MM-YYYY</span>}
          <img src={CalendarIcon} alt="calendar icon" className="w-5 h-5"/>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={minAgeDate} // open calendar showing 18 years ago
          min={minDate}              // earliest selectable date
          max={minAgeDate}           // latest selectable date
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}
