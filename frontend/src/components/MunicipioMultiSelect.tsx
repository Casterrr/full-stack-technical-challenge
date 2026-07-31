import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { MunicipioFiltro } from "@/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MunicipioMultiSelectProps {
  options: MunicipioFiltro[];
  value: string[];
  onChange: (coMuns: string[]) => void;
  id?: string;
  /** Oculta dica/badges extras — útil no header compacto */
  compact?: boolean;
}

export function MunicipioMultiSelect({
  options,
  value,
  onChange,
  id,
  compact = false,
}: MunicipioMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedSet = useMemo(() => new Set(value), [value]);
  const allSelected =
    options.length > 0 && options.every((m) => selectedSet.has(m.coMun));
  const someSelected = value.length > 0 && !allSelected;

  const selectedLabels = useMemo(() => {
    const byCode = new Map(options.map((m) => [m.coMun, m.noMun]));
    return value
      .map((code) => byCode.get(code))
      .filter((name): name is string => Boolean(name));
  }, [options, value]);

  function toggle(coMun: string) {
    if (selectedSet.has(coMun)) {
      onChange(value.filter((code) => code !== coMun));
      return;
    }
    onChange([...value, coMun]);
  }

  function toggleAll() {
    if (allSelected) {
      onChange([]);
      return;
    }
    onChange(options.map((m) => m.coMun));
  }

  function clearSelection() {
    onChange([]);
  }

  const triggerLabel =
    value.length === 0
      ? "Todos os municípios"
      : allSelected
        ? `Todos (${options.length})`
        : value.length === 1
          ? (selectedLabels[0] ?? "1 município")
          : `${value.length} municípios`;

  return (
    <div className={cn(compact ? "min-w-0" : "space-y-2")}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Selecionar municípios"
            className={cn(
              "w-full justify-between px-3 font-normal",
              compact ? "h-7 gap-1 px-2.5 text-[0.8rem]" : "h-auto min-h-9 py-2",
            )}
          >
            <span className="truncate text-left">{triggerLabel}</span>
            <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(20rem,var(--radix-popover-trigger-width))] min-w-[16rem] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Buscar município…" />
            <CommandList>
              <CommandEmpty>Nenhum município encontrado.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="__marcar_todas__"
                  onSelect={toggleAll}
                  className="gap-2"
                >
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={toggleAll}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Marcar todas"
                  />
                  <span className="font-medium">Marcar todas</span>
                  {allSelected ? (
                    <CheckIcon className="ml-auto size-4 opacity-60" />
                  ) : null}
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Municípios">
                {options.map((municipio) => {
                  const checked = selectedSet.has(municipio.coMun);
                  return (
                    <CommandItem
                      key={municipio.coMun}
                      value={`${municipio.noMun} ${municipio.coMun}`}
                      onSelect={() => toggle(municipio.coMun)}
                      className="gap-2"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggle(municipio.coMun)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Selecionar ${municipio.noMun}`}
                      />
                      <span className="truncate">{municipio.noMun}</span>
                      <span className="ml-auto font-mono text-xs text-muted-foreground">
                        {municipio.coMun}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {!compact && value.length > 0 && !allSelected ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {value.slice(0, 4).map((code) => {
            const label =
              options.find((m) => m.coMun === code)?.noMun ?? code;
            return (
              <Badge
                key={code}
                variant="secondary"
                className="max-w-40 gap-1 pr-1"
              >
                <span className="truncate">{label}</span>
                <button
                  type="button"
                  className={cn(
                    "rounded-sm p-0.5 hover:bg-muted-foreground/20",
                  )}
                  aria-label={`Remover ${label}`}
                  onClick={() => toggle(code)}
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            );
          })}
          {value.length > 4 ? (
            <Badge variant="outline">+{value.length - 4}</Badge>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={clearSelection}
          >
            Limpar
          </Button>
        </div>
      ) : null}
      {!compact && (value.length === 0 || allSelected) ? (
        <p className="text-xs text-muted-foreground">
          Nenhum marcado = todos os municípios.
        </p>
      ) : null}
    </div>
  );
}
