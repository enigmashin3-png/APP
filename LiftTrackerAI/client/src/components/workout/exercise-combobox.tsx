import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Exercise } from "@shared/schema";

interface ExerciseComboboxProps {
  exercises: Exercise[];
  value: string;
  onChange: (value: string) => void;
}

export function ExerciseCombobox({ exercises, value, onChange }: ExerciseComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = exercises.find((ex) => ex.id === value);

  const handleOpen = () => setOpen(true);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      handleOpen();
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setSearch(e.key);
      }
      if (e.key === "Backspace") {
        setSearch("");
      }
      e.preventDefault();
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <Input
          role="combobox"
          aria-expanded={open}
          className="w-full"
          value={selected ? selected.name : ""}
          placeholder="Select exercise"
          readOnly
          onFocus={handleOpen}
          onKeyDown={handleKeyDown}
        />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search exercises..."
            autoFocus
            value={search}
            onValueChange={setSearch}
          />
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
                    setSearch("");
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

