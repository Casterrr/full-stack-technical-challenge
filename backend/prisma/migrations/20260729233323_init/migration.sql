-- CreateTable
CREATE TABLE "educacao_registros" (
    "id" SERIAL NOT NULL,
    "co_mun" VARCHAR(7) NOT NULL,
    "no_mun" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "fonte" TEXT NOT NULL,
    "variavel" TEXT NOT NULL,
    "ensino_rede" TEXT NOT NULL,
    "ensino_tipo" TEXT NOT NULL,
    "valor" DECIMAL(18,4) NOT NULL,

    CONSTRAINT "educacao_registros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "educacao_registros_ano_variavel_ensino_rede_ensino_tipo_idx" ON "educacao_registros"("ano", "variavel", "ensino_rede", "ensino_tipo");

-- CreateIndex
CREATE INDEX "educacao_registros_co_mun_idx" ON "educacao_registros"("co_mun");

-- CreateIndex
CREATE INDEX "educacao_registros_variavel_ano_idx" ON "educacao_registros"("variavel", "ano");
