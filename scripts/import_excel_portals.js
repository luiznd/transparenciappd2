/**
 * Importa dados de uma planilha Excel para MongoDB (bd: portalDB, coleção: portals)
 * Uso:
 *   1) Instalar dependências (na raiz do projeto):
 *      npm install xlsx mongodb
 *   2) Definir MONGO_URI no ambiente (ex.: "mongodb://localhost:27017" ou sua URI online)
 *   3) Executar:
 *      node scripts/import_excel_portals.js "E:\\Neoway\\ENTREGA ITAÚ - RELATÓRIO BOTS [SD e PPD2] (13).xlsx" --headerRow=2 [--dateFmt=dd/MM/yyyy]
 *
 * Observações:
 * - Processa TODAS as abas da planilha. Por padrão, considera que os cabeçalhos estão na linha 2 (1-indexado);
 *   você pode alterar com --headerRow=<n>.
 * - O script tenta mapear automaticamente as colunas da planilha para o schema Portal (de/para),
 *   gera um relatório com o mapeamento detectado em scripts/last_import_map.json.
 * - Status: se o valor da coluna de status for "OK" (case-insensitive) => OK (verde); caso contrário => ERROR (vermelho)
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

// Campos do schema Portal (backend-go/model/portal.go)
// Ajuste os nomes de colunas conforme a planilha (possíveis variações por acentuação e espaços)
const COLUMN_MAP = {
  _id: ['_id', 'id', 'ID'],
  referencia: ['referencia', 'Referência', 'aba', 'ref'],
  portal: [
    'portal', 'Portal',
    'bot', 'Bot', 'BOT',
    'Nome do Bot', 'Nome Bot',
    'Portal/Bot', 'Portal - Bot',
    'Fonte', 'Origem',
    'Serviço', 'Servico', 'Serviços', 'Servicos',
    'Serviço/Bot', 'Servicos/Bot', 'Serviços/Bot',
    'Sistema', 'Produto', 'Aplicação', 'Aplicacao'
  ],
  esfera: ['esfera', 'Esfera'],
  mesAnoEnvio: ['mesAnoEnvio', 'Mês/Ano Envio', 'Mes/Ano Envio', 'Mês/Ano de Envio', 'Mes/Ano de Envio', 'Mês/Ano de Envio'],
  mesAnoReferencia: [
    'mesAnoReferencia',
    'Mês/Ano Referência', 'Mes/Ano Referencia',
    'Mês/Ano de referência (Competência do envio atual)',
    'Mes/Ano de referencia (Competencia do envio atual)','Mês/Ano de referência (Competência do envio atual)'
  ],
  volumeFonte: ['volumeFonte', 'Volume Fonte', 'Volume da fonte'],
  volumetriaDados: ['volumetriaDados', 'Volumetria Dados','Volumetria de agregação (Dados)'],
  volumetriaServicos: ['volumetriaServicos', 'Volumetria Serviços', 'Volumetria Servicos','Volumetria a ser enviada (Serviços)'],
  indiceDados: ['indiceDados', 'Índice Dados', 'Indice Dados','Índice agregação (Dados)'],
  indiceServicos: ['indiceServicos', 'Índice Serviços', 'Indice Servicos','Índice agregação (Serviços)'],
  volumeCpfsUnicosDados: ['volumeCpfsUnicosDados', 'Volume CPFs Únicos (Dados)', 'Volume CPFs Unicos (Dados)','Volume cpfs únicos (Dados)'],
  volumeCpfsUnicosServicos: ['volumeCpfsUnicosServicos', 'Volume CPFs Únicos (Serviços)', 'Volume CPFs Unicos (Servicos)','Volume cpfs únicos (Serviços)'],
  mediaMovelCpfsUnicos: ['mediaMovelCpfsUnicos', 'Média Móvel CPFs Únicos', 'Media Movel CPFs Unicos','Média Móvel CPFs únicos (últimos 12 meses)'],
  ultimoMesEnviado: ['ultimoMesEnviado', 'Último Mês Enviado', 'Ultimo Mes Enviado','Último mês enviado'],
  ultimaReferencia: ['ultimaReferencia', 'Última Referência', 'Ultima Referencia','Última referência enviada'],
  ultimaVolumetriaEnviada: ['ultimaVolumetriaEnviada', 'Última Volumetria Enviada', 'Ultima Volumetria Enviada','Última Volumetria Total enviada'],
  mediaMovelUltimos12Meses: ['mediaMovelUltimos12Meses', 'Média Móvel (Últimos 12 Meses)', 'Media Movel (Ultimos 12 Meses)','Média Móvel Total (últimos 12 meses)'],
  media: ['media', 'Média', 'Media','Média Histórica Total'],
  minimo: ['minimo', 'Mínimo', 'Minimo','Mínimo Total'],
  mesCompetenciaMinimo: ['mesCompetenciaMinimo', 'Mês Competência Mínimo', 'Mes Competencia Minimo','Mês competência Mínimo'],
  maximo: ['maximo', 'Máximo', 'Maximo','Máximo'],
  mesCompetenciaMaximo: ['mesCompetenciaMaximo', 'Mês Competência Máximo', 'Mes Competencia Maximo','Mês competência Máximo'],
  percentualVolumetriaUltima: ['percentualVolumetriaUltima', '% Volumetria vs Última', '% Volumetria vs Ultima','% Volumetria vs última volumetria enviada'],
  percentualVolumetriaMediaMovel: ['percentualVolumetriaMediaMovel', '% Volumetria vs Média Móvel', '% Volumetria vs Media Movel','% Volumetria vs Média Móvel'],
  percentualVolumetriaMedia: ['percentualVolumetriaMedia', '% Volumetria vs Média', '% Volumetria vs Media','% Volumetria vs Média'],
  percentualVolumetriaMinimo: ['percentualVolumetriaMinimo', '% Volumetria vs Mínimo', '% Volumetria vs Minimo','% Volumetria vs Mínimo'],
  percentualVolumetriaMaximo: ['percentualVolumetriaMaximo', '% Volumetria vs Máximo', '% Volumetria vs Maximo','% Volumetria vs Máximo'],
  pulouCompetencia: ['pulouCompetencia', 'Pulou Competência?', 'Pulou Competencia?','Pulou competência?'],
  defasagemNosDados: ['defasagemNosDados', 'Defasagem nos Dados?', 'Defasagem nos Dados','Há defasagem nos dados?'],
  novosDados: ['novosDados', 'Novos Dados?', 'Novos Dados','Com novos dados?'],
  status: ['status', 'Status'],
  observacaoTimeDados: ['observacaoTimeDados', 'Observação Time Dados', 'Observacao Time Dados','Observação - Time Dados'],
  enviar: ['enviar', 'Enviar?', 'Enviar','Enviar?']
};

function removeDiacritics(str) {
  try {
    return String(str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } catch (_) {
    return String(str || '');
  }
}

function normalizeHeader(h) {
  return removeDiacritics(String(h || '').trim().toLowerCase());
}

function findHeaderIndex(headersOriginal, headersNormalized, keys) {
  const keysNorm = keys.map(k => normalizeHeader(k));
  for (let i = 0; i < headersNormalized.length; i++) {
    const h = headersNormalized[i];
    if (keysNorm.includes(h)) {
      return { index: i, header: headersOriginal[i] };
    }
  }
  return { index: -1, header: null };
}

function pickValue(row, headersOriginal, headersNormalized, keys) {
  const { index } = findHeaderIndex(headersOriginal, headersNormalized, keys);
  return index >= 0 ? row[index] : undefined;
}

function toInt(v) {
  if (v == null || v === '') return undefined;
  if (typeof v === 'number') return Math.round(v);
  const s = String(v).replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, '');
  const n = parseFloat(s);
  return Number.isFinite(n) ? Math.round(n) : undefined;
}

function toFloat(v) {
  if (v == null || v === '') return undefined;
  if (typeof v === 'number') return v;
  const s = String(v).replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, '');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : undefined;
}

function toBool(v) {
  const s = String(v || '').trim().toLowerCase();
  return s === 'true' || s === 'sim' || s === 'yes' || s === '1' || s === 'y';
}

// Preserva o status exatamente como vem da planilha (sem forçar OK/ERROR)
function computeStatusRaw(v) {
  return String(v || '').trim();
}

// Extrai a data (ddMMyyyy) do nome da aba e retorna formatada conforme dateFmt (dd/MM/yyyy por padrão)
function extractDeliveryDate(sheetName, dateFmt = 'dd/MM/yyyy') {
  const str = String(sheetName || '');
  const m = str.match(/(\d{8})/);
  if (m) {
    const raw = m[1];
    const dd = raw.slice(0, 2);
    const mm = raw.slice(2, 4);
    const yyyy = raw.slice(4, 8);
    // Suporte a formatos: dd/MM/yyyy (padrão), dd/MM/yy, dd/MM/yyy
    switch (String(dateFmt).trim()) {
      case 'dd/MM/yy':
        return `${dd}/${mm}/${yyyy.slice(-2)}`;
      case 'dd/MM/yyy':
        // Atenção: ano com 3 dígitos irá produzir, p.ex., 2025 => 025
        return `${dd}/${mm}/${yyyy.slice(-3)}`;
      case 'dd/MM/yyyy':
      default:
        return `${dd}/${mm}/${yyyy}`;
    }
  }
  return '';
}

// Gera um hash estável para _id a partir de (dataEntrega + portal + mesAnoReferencia)
// Fallback: quando portal ou mesAnoReferencia (ou deliveryDate) estiverem vazios, inclui (sheetName + rowIndex)
// para garantir unicidade entre linhas com campos incompletos.
function computeHashedId({ deliveryDate, portal, mesAnoReferencia, sheetName, rowIndex }) {
  const core = `${String(deliveryDate || '').trim()}|${String(portal || '').trim()}|${String(mesAnoReferencia || '').trim()}`;
  let base = core;
  const missingDelivery = !String(deliveryDate || '').trim();
  const missingPortal = !String(portal || '').trim();
  const missingRef = !String(mesAnoReferencia || '').trim();
  if (missingDelivery || missingPortal || missingRef) {
    base = `${core}|${String(sheetName || '').trim()}|row:${Number.isFinite(rowIndex) ? rowIndex : -1}`;
  }
  return crypto.createHash('sha1').update(base, 'utf8').digest('hex');
}

async function main() {
  const argv = process.argv.slice(2);
  const filePath = argv[0];
  const headerRowArg = (argv.find(a => a.startsWith('--headerRow=')) || '').split('=')[1];
  const headerRowOneIndexed = headerRowArg ? parseInt(headerRowArg, 10) : 2; // default: linha 2
  const headerRowZeroIndexed = Math.max(0, (Number.isFinite(headerRowOneIndexed) ? headerRowOneIndexed : 2) - 1);
  if (!filePath) {
    console.error('Uso: node scripts/import_excel_portals.js <caminho_para_planilha.xlsx> [--headerRow=N]');
    process.exit(1);
  }
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    console.error(`Arquivo não encontrado: ${abs}`);
    process.exit(1);
  }

  const wb = XLSX.readFile(abs);
  const sheetNames = wb.SheetNames || [];
  if (!sheetNames.length) {
    console.error('Arquivo Excel não possui abas.');
    process.exit(1);
  }

  const dryRun = argv.some(a => a === '--dryRun');
  const reset = argv.some(a => a === '--reset');
  const sampleCountArg = (argv.find(a => a.startsWith('--sampleCount=')) || '').split('=')[1];
  const sampleCount = sampleCountArg ? parseInt(sampleCountArg, 10) : 5; // amostra padrão: 5 por aba
  const dateFmtArg = (argv.find(a => a.startsWith('--dateFmt=')) || '').split('=')[1] || 'dd/MM/yyyy';
  let client = null;
  let col = null;
  if (!dryRun) {
    // Conexão Mongo
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('portalDB');
    col = db.collection('portals');
    if (reset) {
      const before = await col.countDocuments();
      const res = await col.deleteMany({});
      console.log(`Coleção 'portals' resetada. Removidos: ${res.deletedCount} (existiam ${before}).`);
    }
  } else {
    console.log('Executando em modo DRY RUN: nenhum dado será inserido, apenas o relatório de mapeamento será gerado.');
  }

  // Opcional: limpar coleção antes
  // await col.deleteMany({});

  let totalDocs = 0;
  let totalUpserts = 0;
  const mappingReport = [];
  const samplesReport = [];

  for (const sheetName of sheetNames) {
    const sheet = wb.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (!Array.isArray(json) || json.length <= headerRowZeroIndexed) {
      console.warn(`Aba "${sheetName}" vazia ou sem cabeçalhos na linha ${headerRowOneIndexed}. Pulando.`);
      continue;
    }

    const headersOriginal = (json[headerRowZeroIndexed] || []).map(h => String(h || ''));
    const headersNormalized = headersOriginal.map(normalizeHeader);
    const rows = json.slice(headerRowZeroIndexed + 1);

    // Construir relatório de mapeamento de/para para esta aba
    const fieldMap = {};
    for (const [field, keys] of Object.entries(COLUMN_MAP)) {
      const { index, header } = findHeaderIndex(headersOriginal, headersNormalized, keys);
      fieldMap[field] = header || null;
    }
    mappingReport.push({ sheet: sheetName, headerRow: headerRowOneIndexed, detected_map: fieldMap });

    const docs = [];
    const idSet = new Set();
    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      const row = rows[rIdx];
      if (!row || row.every(c => c == null || String(c).trim() === '')) continue;

      const sheetDeliveryDate = extractDeliveryDate(sheetName, dateFmtArg); // dd/MM/yyyy extraído do nome da aba
      const portalVal = pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.portal) || '';
      const mesAnoEnvioVal = pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.mesAnoEnvio) || '';
      const mesAnoRefVal = pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.mesAnoReferencia) || '';
      // dataEntrega deve vir do campo "Mês/Ano Envio" da planilha; caso ausente, usar a data extraída do nome da aba
      const dataEntregaVal = mesAnoEnvioVal || sheetDeliveryDate;
      const hashedId = computeHashedId({ deliveryDate: dataEntregaVal, portal: portalVal, mesAnoReferencia: mesAnoRefVal, sheetName, rowIndex: rIdx });

      const doc = {
        _id: hashedId,
        // Referência da listagem: alinhar com dataEntrega (Mês/Ano Envio), caindo para a data extraída do nome da aba caso vazio
        referencia: dataEntregaVal || sheetDeliveryDate ||
          pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.referencia) ||
          pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.mesAnoReferencia) ||
          pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.mesAnoEnvio) ||
          pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.ultimaReferencia) ||
          pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.ultimoMesEnviado) ||
          '',
        dataEntrega: dataEntregaVal,
        portal: portalVal,
        esfera: pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.esfera) || '',
        mesAnoEnvio: mesAnoEnvioVal,
        mesAnoReferencia: mesAnoRefVal,
        volumeFonte: toInt(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.volumeFonte)),
        volumetriaDados: toInt(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.volumetriaDados)),
        volumetriaServicos: toInt(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.volumetriaServicos)),
        indiceDados: toFloat(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.indiceDados)),
        indiceServicos: toFloat(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.indiceServicos)),
        volumeCpfsUnicosDados: toInt(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.volumeCpfsUnicosDados)),
        volumeCpfsUnicosServicos: toInt(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.volumeCpfsUnicosServicos)),
        mediaMovelCpfsUnicos: toInt(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.mediaMovelCpfsUnicos)),
        ultimoMesEnviado: pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.ultimoMesEnviado) || '',
        ultimaReferencia: pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.ultimaReferencia) || '',
        ultimaVolumetriaEnviada: toInt(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.ultimaVolumetriaEnviada)),
        mediaMovelUltimos12Meses: toInt(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.mediaMovelUltimos12Meses)),
        media: toInt(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.media)),
        minimo: toInt(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.minimo)),
        mesCompetenciaMinimo: pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.mesCompetenciaMinimo) || '',
        maximo: toInt(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.maximo)),
        mesCompetenciaMaximo: pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.mesCompetenciaMaximo) || '',
        percentualVolumetriaUltima: toFloat(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.percentualVolumetriaUltima)),
        percentualVolumetriaMediaMovel: toFloat(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.percentualVolumetriaMediaMovel)),
        percentualVolumetriaMedia: toFloat(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.percentualVolumetriaMedia)),
        percentualVolumetriaMinimo: toFloat(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.percentualVolumetriaMinimo)),
        percentualVolumetriaMaximo: toFloat(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.percentualVolumetriaMaximo)),
        pulouCompetencia: toBool(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.pulouCompetencia)),
        defasagemNosDados: toBool(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.defasagemNosDados)),
        novosDados: toBool(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.novosDados)),
        status: computeStatusRaw(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.status)),
        observacaoTimeDados: pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.observacaoTimeDados) || '',
        enviar: toBool(pickValue(row, headersOriginal, headersNormalized, COLUMN_MAP.enviar)),
      };

      idSet.add(doc._id);
      docs.push(doc);
    }

    if (!docs.length) {
      console.warn(`Aba "${sheetName}" não possui linhas válidas para importação.`);
      continue;
    }

    // Construir amostra para esta aba
    const sheetSamples = docs.slice(0, Math.max(0, sampleCount)).map(d => ({
      _id: d._id,
      dataEntrega: d.dataEntrega,
      referencia: d.referencia,
      portal: d.portal,
      mesAnoReferencia: d.mesAnoReferencia,
      mesAnoEnvio: d.mesAnoEnvio,
      esfera: d.esfera,
      status: d.status,
    }));
    samplesReport.push({
      sheet: sheetName,
      sampleCount: sheetSamples.length,
      uniqueIdCount: idSet.size,
      totalDocs: docs.length,
      samples: sheetSamples,
    });

    let inserted = 0;
    if (!dryRun) {
      for (const d of docs) {
        await col.updateOne({ _id: d._id }, { $set: d }, { upsert: true });
        inserted++;
      }
    }
    console.log(`Aba: ${sheetName} | Linhas processadas: ${docs.length} | Upserts: ${inserted}${dryRun ? ' (dry-run)' : ''}`);
    totalDocs += docs.length;
    totalUpserts += inserted;
  }

  if (mappingReport.length) {
    try {
      const report = {
        file: abs,
        headerRow: headerRowOneIndexed,
        sheets: mappingReport,
        totals: { processedRows: totalDocs, upserts: totalUpserts },
        generatedAt: new Date().toISOString(),
      };
      const outPath = path.join(__dirname, 'last_import_map.json');
      fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8');
      console.log(`Relatório de mapeamento gerado em: ${outPath}`);
    } catch (e) {
      console.warn('Falha ao escrever relatório de mapeamento:', e.message);
    }
  }

  if (samplesReport.length) {
    try {
      const sampleOutPath = path.join(__dirname, 'last_import_sample.json');
      fs.writeFileSync(sampleOutPath, JSON.stringify({ file: abs, headerRow: headerRowOneIndexed, sheets: samplesReport, generatedAt: new Date().toISOString() }, null, 2), 'utf-8');
      console.log(`Amostra de registros gerada em: ${sampleOutPath}`);
    } catch (e) {
      console.warn('Falha ao escrever amostra de registros:', e.message);
    }
  }

  console.log(`Total geral | Linhas processadas: ${totalDocs} | Upserts: ${totalUpserts}`);

  if (client) {
    // Se solicitado, limpar a coleção ANTES do processamento. Como já concluímos o processamento acima,
    // precisamos mover esse reset para o início para realmente excluir antes de inserir.
    // Implementação correta: executar o reset logo após conectar.
    await client.close();
  }
}

main().catch(err => {
  console.error('Falha ao importar a planilha:', err);
  process.exit(1);
});