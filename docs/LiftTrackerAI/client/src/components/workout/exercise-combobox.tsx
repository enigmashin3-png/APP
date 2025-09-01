import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
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

  const filtered = exercises.filter((ex) => ex.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          role="combobox"
          aria-expanded={open}
          placeholder="Search exercises..."
          value={selected ? selected.name : search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>No exercise found.</CommandEmpty>
            <CommandGroup>
              {filtered.map((ex) => (
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
                    className={cn("ml-auto h-4 w-4", value === ex.id ? "opacity-100" : "opacity-0")}
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
