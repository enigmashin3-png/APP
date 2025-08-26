import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Exercise } from "@shared/schema";

interface ExerciseComboboxProps {
  exercises: Exercise[];
  value: string;
  onChange: (value: string) => void;
}

export function ExerciseCombobox({ exercises, value, onChange }: ExerciseComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = exercises.find((ex) => ex.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected ? (
            selected.name
          ) : (
            <span className="text-muted-foreground">Click to search exercises</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search exercises..." />
          <CommandList>
            <CommandEmpty>No exercise found.</CommandEmpty>
            <CommandGroup>
              {exercises.map((ex) => (
                <CommandItem
                  key={ex.id}
                  value={ex.name}
                  onSelect={() => {
                    onChange(ex.id);
                    setOpen(false);
                  }}
                >
                  {ex.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === ex.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default ExerciseCombobox;

