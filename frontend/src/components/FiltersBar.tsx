import type { FiltrosResponse } from "@/api/types";
import { MunicipioMultiSelect } from "@/components/MunicipioMultiSelect";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useFiltersStore } from "@/store/filters";

export function FiltersBar({ options }: { options: FiltrosResponse }) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Filtros globais</CardTitle>
        <CardDescription>
          Afetam cards, gráficos e tabela. Rede padrão: Total (evita soma
          hierárquica).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="filtro-municipios">Municípios</Label>
            <MunicipioMultiSelect
              id="filtro-municipios"
              options={options.municipios}
              value={municipios}
              onChange={setMunicipios}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ano-inicio">Ano início</Label>
              <NativeSelect
                id="ano-inicio"
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano-fim">Ano fim</Label>
              <NativeSelect
                id="ano-fim"
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
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="ranking-ano">Ano do ranking / quebra</Label>
              <NativeSelect
                id="ranking-ano"
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
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="rede">Rede de ensino</Label>
              <NativeSelect
                id="rede"
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="etapa">Etapa de ensino</Label>
              <NativeSelect
                id="etapa"
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
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="variavel">Variável dos gráficos</Label>
              <NativeSelect
                id="variavel"
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="quebra">Quebra do 3º gráfico</Label>
              <NativeSelect
                id="quebra"
                className="w-full"
                value={quebraDimensao}
                onChange={(e) =>
                  setQuebraDimensao(e.target.value as "rede" | "etapa")
                }
              >
                <NativeSelectOption value="rede">
                  Por rede de ensino
                </NativeSelectOption>
                <NativeSelectOption value="etapa">
                  Por etapa de ensino
                </NativeSelectOption>
              </NativeSelect>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
