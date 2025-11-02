# Configuração do Google Cloud Storage (GCS)

Este documento explica como configurar o sistema para usar o Google Cloud Storage como fonte de dados em vez do MongoDB.

## Pré-requisitos

1. Conta no Google Cloud Platform
2. Bucket criado no Google Cloud Storage
3. Arquivo CSV com dados dos portais no bucket
4. Credenciais de serviço do GCP

## Formato do Arquivo CSV

O arquivo CSV deve usar **ponto e vírgula (;)** como separador de campos e conter os seguintes campos (primeira linha como cabeçalho):

```csv
referencia;portal;esfera;mesAnoEnvio;mesAnoReferencia;volumeFonte;volumetriaDados;volumetriaServicos;indiceDados;indiceServicos;volumeCpfsUnicosDados;volumeCpfsUnicosServicos;mediaMovelCpfsUnicos;ultimoMesEnviado;ultimaReferencia;ultimaVolumetriaEnviada;mediaMovelUltimos12Meses;media;minimo;mesCompetenciaMinimo;maximo;mesCompetenciaMaximo;percentualVolumetriaUltima;percentualVolumetriaMediaMovel;percentualVolumetriaMedia;percentualVolumetriaMinimo;percentualVolumetriaMaximo;pulouCompetencia;defasagemNosDados;novosDados;status;observacaoTimeDados;enviar
```

### Exemplo de linha de dados:
```csv
2024-01;Portal Exemplo;Federal;2024-01;2024-01;1000;500;300;0.85;0.75;250;150;200;2024-01;2024-01;500;450;400;100;2023-12;800;2024-02;95.5;88.2;92.1;75.3;105.8;false;false;true;Ativo;Dados atualizados;true
```

## Configuração

### 1. Credenciais do Google Cloud

1. Crie uma conta de serviço no Google Cloud Console
2. Baixe o arquivo JSON das credenciais
3. Coloque o arquivo em um local seguro no servidor

### 2. Variáveis de Ambiente

Para usar o GCS, configure as seguintes variáveis de ambiente no `docker-compose.yml`:

```yaml
environment:
  DATA_SOURCE: "gcs"
  GCS_BUCKET_NAME: "seu-bucket-name"
  GCS_FILE_NAME: "portals.csv"
  GOOGLE_APPLICATION_CREDENTIALS: "/path/to/service-account.json"
```

### 3. Volume para Credenciais (Docker)

Adicione um volume no `docker-compose.yml` para montar o arquivo de credenciais:

```yaml
volumes:
  - ./backend-go:/app
  - /path/to/local/service-account.json:/app/service-account.json:ro
```

E configure a variável:
```yaml
GOOGLE_APPLICATION_CREDENTIALS: "/app/service-account.json"
```

## Exemplo de Configuração Completa

```yaml
backend-go:
  build:
    context: .
    dockerfile: Dockerfile.backend-go      
  ports:
    - "8081:8081"
  volumes:
    - ./backend-go:/app
    - ./gcp-credentials.json:/app/gcp-credentials.json:ro
  environment:
    DATA_SOURCE: "gcs"
    GCS_BUCKET_NAME: "meu-bucket-portals"
    GCS_FILE_NAME: "dados-portals.csv"
    GOOGLE_APPLICATION_CREDENTIALS: "/app/gcp-credentials.json"
```

## Permissões Necessárias

A conta de serviço precisa das seguintes permissões:
- `Storage Object Viewer` no bucket específico
- Ou `Storage Admin` para acesso completo

## Testando a Configuração

1. Configure as variáveis de ambiente
2. Reinicie o container: `docker-compose up --build`
3. Verifique os logs para confirmar que o GCS foi inicializado:
   ```
   Fonte de dados configurada: gcs
   Inicializando GCS Portal Repository...
   GCS Portal Repository inicializado (bucket: meu-bucket, file: dados.csv)
   ```
4. Teste a API: `GET http://localhost:8081/api/portals`

## Limitações

- O GCS repository é **somente leitura**
- Operações de inserção (`InsertPortal`) não são suportadas
- Para adicionar dados, atualize o arquivo CSV no bucket

## Troubleshooting

### Erro de Autenticação
- Verifique se o arquivo de credenciais está no caminho correto
- Confirme que a conta de serviço tem as permissões necessárias

### Erro de Bucket/Arquivo
- Verifique se o bucket existe e está acessível
- Confirme que o arquivo CSV existe no bucket
- Verifique se o nome do arquivo está correto

### Erro de Parsing CSV
- Confirme que o separador é ponto e vírgula (;)
- Verifique se a primeira linha contém os cabeçalhos corretos
- Confirme que não há linhas vazias ou mal formatadas