import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/hooks/useAuth";
import { UserRound, Factory } from "lucide-react";

export function RoleToggle() {
  const { role, switchRole } = useAuth();

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-muted/50 border border-border">
      <span className="hidden sm:inline text-xs text-muted-foreground">Viewing as</span>
      <ToggleGroup
        type="single"
        value={role}
        onValueChange={(val) => val && switchRole(val as "procurement" | "supplier")}
        className="flex items-center gap-1"
      >
        <ToggleGroupItem
          value="procurement"
          aria-label="Procurement view"
          className="flex items-center gap-1 px-2 sm:px-3"
        >
          <Factory className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-xs">Procurement</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="supplier" aria-label="Supplier view" className="flex items-center gap-1 px-2 sm:px-3">
          <UserRound className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-xs">Supplier</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

