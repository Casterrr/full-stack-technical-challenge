import type { FiltrosResponse } from "../api/types";
import { useFiltersStore } from "../store/filters";

const fieldClass =
  "w-full rounded-md border border-line bg-paper-elevated px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

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
    <section className="rounded-xl border border-line bg-paper-elevated p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <h2 className="font-display text-lg font-semibold">Filtros globais</h2>
        <p className="text-sm text-ink-muted">
          Afetam cards, gráficos e tabela. Rede padrão: Total (evita soma
          hierárquica).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Municípios</span>
          <select
            multiple
            value={municipios}
            onChange={(e) =>
              setMunicipios(
                Array.from(e.target.selectedOptions).map((o) => o.value),
              )
            }
            className={`${fieldClass} min-h-28`}
            aria-label="Municípios (múltipla seleção)"
          >
            {options.municipios.map((m) => (
              <option key={m.coMun} value={m.coMun}>
                {m.noMun}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-ink-muted">
            Vazio = todos. Segure Ctrl/Cmd para múltiplos.
          </span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Ano início</span>
            <select
              value={anoInicio ?? ""}
              onChange={(e) =>
                setAnoInicio(e.target.value ? Number(e.target.value) : null)
              }
              className={fieldClass}
            >
              <option value="">—</option>
              {options.anos.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Ano fim</span>
            <select
              value={anoFim ?? ""}
              onChange={(e) =>
                setAnoFim(e.target.value ? Number(e.target.value) : null)
              }
              className={fieldClass}
            >
              <option value="">—</option>
              {options.anos.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </label>
          <label className="col-span-2 block text-sm">
            <span className="mb-1 block font-medium">Ano do ranking / quebra</span>
            <select
              value={rankingAno ?? ""}
              onChange={(e) =>
                setRankingAno(e.target.value ? Number(e.target.value) : null)
              }
              className={fieldClass}
            >
              <option value="">—</option>
              {options.anos.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Rede de ensino</span>
            <select
              value={rede}
              onChange={(e) => setRede(e.target.value)}
              className={fieldClass}
            >
              {options.redes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Etapa de ensino</span>
            <select
              value={etapa}
              onChange={(e) => setEtapa(e.target.value)}
              className={fieldClass}
            >
              <option value="">Todas</option>
              {options.etapas.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Variável dos gráficos</span>
            <select
              value={variavel}
              onChange={(e) => setVariavel(e.target.value)}
              className={fieldClass}
            >
              {options.variaveis.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Quebra do 3º gráfico</span>
            <select
              value={quebraDimensao}
              onChange={(e) =>
                setQuebraDimensao(e.target.value as "rede" | "etapa")
              }
              className={fieldClass}
            >
              <option value="rede">Por rede de ensino</option>
              <option value="etapa">Por etapa de ensino</option>
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
