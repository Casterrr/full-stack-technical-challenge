import type { ReactNode } from "react";
import type { FiltrosResponse } from "@/api/types";
import { MunicipioMultiSelect } from "@/components/MunicipioMultiSelect";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { useFiltersStore } from "@/store/filters";

interface FiltersFieldsProps {
  options: FiltrosResponse;
  className?: string;
  idPrefix?: string;
  /** `inline` = header compacto; `stack` = sheet mobile em coluna */
  layout?: "inline" | "stack";
}

function Field({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>{children}</div>
  );
}

export function FiltersFields({
  options,
  className,
  idPrefix = "filtro",
  layout = "inline",
}: FiltersFieldsProps) {
  const {
    municipios,
    anoInicio,
    anoFim,
    rede,
    etapa,
    variavel,
    rankingAno,
    quebraDimensao,
    setMunicipios,
    setAnoInicio,
    setAnoFim,
    setRede,
    setEtapa,
    setVariavel,
    setRankingAno,
    setQuebraDimensao,
  } = useFiltersStore();

  const id = (name: string) => `${idPrefix}-${name}`;
  const stack = layout === "stack";

  return (
    <div
      className={cn(
        stack
          ? "flex flex-col gap-3"
          : "flex w-full flex-wrap items-end gap-x-2 gap-y-2",
        className,
      )}
    >
      <Field
        className={stack ? "w-full" : "min-w-[11rem] flex-[2_1_11rem]"}
      >
        <Label htmlFor={id("municipios")}>Municípios</Label>
        <MunicipioMultiSelect
          id={id("municipios")}
          options={options.municipios}
          value={municipios}
          onChange={setMunicipios}
          compact={!stack}
        />
      </Field>

      <Field className={stack ? "w-full" : "min-w-[4.5rem] flex-[0.6_1_4.5rem]"}>
        <Label htmlFor={id("ano-inicio")}>Início</Label>
        <NativeSelect
          id={id("ano-inicio")}
          size="sm"
          className="w-full"
          value={anoInicio ?? ""}
          onChange={(e) =>
            setAnoInicio(e.target.value ? Number(e.target.value) : null)
          }
        >
          <NativeSelectOption value="">—</NativeSelectOption>
          {options.anos.map((ano) => (
            <NativeSelectOption key={ano} value={ano}>
              {ano}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>

      <Field className={stack ? "w-full" : "min-w-[4.5rem] flex-[0.6_1_4.5rem]"}>
        <Label htmlFor={id("ano-fim")}>Fim</Label>
        <NativeSelect
          id={id("ano-fim")}
          size="sm"
          className="w-full"
          value={anoFim ?? ""}
          onChange={(e) =>
            setAnoFim(e.target.value ? Number(e.target.value) : null)
          }
        >
          <NativeSelectOption value="">—</NativeSelectOption>
          {options.anos.map((ano) => (
            <NativeSelectOption key={ano} value={ano}>
              {ano}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>

      <Field className={stack ? "w-full" : "min-w-[4.5rem] flex-[0.6_1_4.5rem]"}>
        <Label htmlFor={id("ranking-ano")}>Ano rank.</Label>
        <NativeSelect
          id={id("ranking-ano")}
          size="sm"
          className="w-full"
          value={rankingAno ?? ""}
          onChange={(e) =>
            setRankingAno(e.target.value ? Number(e.target.value) : null)
          }
        >
          <NativeSelectOption value="">—</NativeSelectOption>
          {options.anos.map((ano) => (
            <NativeSelectOption key={ano} value={ano}>
              {ano}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>

      <Field className={stack ? "w-full" : "min-w-[7rem] flex-[1.2_1_7rem]"}>
        <Label htmlFor={id("rede")}>Rede</Label>
        <NativeSelect
          id={id("rede")}
          size="sm"
          className="w-full"
          value={rede}
          onChange={(e) => setRede(e.target.value)}
        >
          {options.redes.map((item) => (
            <NativeSelectOption key={item} value={item}>
              {item}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>

      <Field className={stack ? "w-full" : "min-w-[8rem] flex-[1.4_1_8rem]"}>
        <Label htmlFor={id("etapa")}>Etapa</Label>
        <NativeSelect
          id={id("etapa")}
          size="sm"
          className="w-full"
          value={etapa}
          onChange={(e) => setEtapa(e.target.value)}
        >
          <NativeSelectOption value="">Todas</NativeSelectOption>
          {options.etapas.map((item) => (
            <NativeSelectOption key={item} value={item}>
              {item}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>

      <Field className={stack ? "w-full" : "min-w-[8rem] flex-[1.4_1_8rem]"}>
        <Label htmlFor={id("variavel")}>Variável</Label>
        <NativeSelect
          id={id("variavel")}
          size="sm"
          className="w-full"
          value={variavel}
          onChange={(e) => setVariavel(e.target.value)}
        >
          {options.variaveis.map((item) => (
            <NativeSelectOption key={item} value={item}>
              {item}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>

      <Field className={stack ? "w-full" : "min-w-[6.5rem] flex-[1_1_6.5rem]"}>
        <Label htmlFor={id("quebra")}>Quebra</Label>
        <NativeSelect
          id={id("quebra")}
          size="sm"
          className="w-full"
          value={quebraDimensao}
          onChange={(e) =>
            setQuebraDimensao(e.target.value as "rede" | "etapa")
          }
        >
          <NativeSelectOption value="rede">Por rede</NativeSelectOption>
          <NativeSelectOption value="etapa">Por etapa</NativeSelectOption>
        </NativeSelect>
      </Field>
    </div>
  );
}
