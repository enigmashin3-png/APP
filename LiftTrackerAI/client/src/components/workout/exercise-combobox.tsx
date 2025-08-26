 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/LiftTrackerAI/client/src/components/workout/exercise-combobox.tsx b/LiftTrackerAI/client/src/components/workout/exercise-combobox.tsx
index e7666fe4652fc85197971b995dbc19dff4a0f70e..31e557d9b03d3426cf5e6de7a5afe5fc608d9253 100644
--- a/LiftTrackerAI/client/src/components/workout/exercise-combobox.tsx
+++ b/LiftTrackerAI/client/src/components/workout/exercise-combobox.tsx
@@ -1,79 +1,90 @@
 import { useState } from "react";
-import { Input } from "@/components/ui/input";
+import { Button } from "@/components/ui/button";
 import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
 import {
   Command,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
   CommandList,
 } from "@/components/ui/command";
 
+import { Check, ChevronDown } from "lucide-react";
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
 
-  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
+  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
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
-        <Input
+        <Button
+          variant="outline"
           role="combobox"
           aria-expanded={open}
-
+          onKeyDown={handleKeyDown}
+          className="w-full justify-between"
+        >
+          {selected ? (
+            selected.name
+          ) : (
+            <span className="text-muted-foreground">Click to search exercises</span>
+          )}
+          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
+        </Button>
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
 
EOF
)