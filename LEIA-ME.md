# Consulta Fiscal de Produtos — Directa Digital (v2, sem IA)

Esta versão NÃO usa inteligência artificial nem depende de chave de API paga.
A busca acontece 100% no navegador do cliente, usando as tabelas oficiais que
vocês enviaram (NCM, TIPI, CEST, cClassTrib), carregadas como arquivos de dados
dentro do próprio site.

**Vantagens desta versão:**
- Gratuita — sem custo por consulta, para sempre
- Sem risco de "invenção" de dados pela IA
- Mais rápida (não depende de nenhum serviço externo)
- Mais simples de publicar (é um site 100% estático)

## O que mudou desde a versão anterior

- **Removido:** backend (`api/classificar.js`), chamada à IA, variável de
  ambiente `ANTHROPIC_API_KEY`.
- **Removido:** ICMS, CST ICMS e ICMS-ST (não incluídos, pois variam por
  estado — ver observação abaixo).
- **Adicionado:** pasta `public/dados/` com as tabelas NCM, TIPI, CEST e
  cClassTrib em formato JSON, geradas a partir dos arquivos que vocês
  enviaram.
- **CEST e cClassTrib** aparecem como **sugestões por palavra-chave**, com
  aviso de que devem ser confirmadas pelo contador — não existe uma tabela
  oficial de correspondência direta entre NCM e essas classificações.

## Estrutura

```
consulta-fiscal-v2/
├── public/
│   ├── index.html          → a página que o cliente vê
│   ├── logo.png             → logo da Directa Digital
│   └── dados/
│       ├── ncm.json         → tabela NCM vigente (com descrição hierárquica)
│       ├── tipi.json        → alíquotas de IPI por NCM
│       ├── cest.json        → tabela CEST (Convênio ICMS 142/2018)
│       └── cclasstrib.json  → tabela cClassTrib / CST IBS-CBS (LC 214/2025)
└── package.json
```

## Passo a passo de publicação (Vercel — igual ao anterior, mas mais simples)

### 1. Suba este projeto para o GitHub
Repita o processo já feito antes: crie/atualize o repositório e envie todos
os arquivos desta pasta (`public/` completa, incluindo a subpasta `dados`, e
`package.json`).

> Se você já tem o repositório da versão anterior, pode simplesmente
> substituir os arquivos antigos por estes (apague a pasta `api/` antiga,
> ela não é mais necessária).

### 2. Publique no Vercel
Se o projeto já estava conectado ao Vercel, basta fazer o upload dos novos
arquivos no GitHub — o Vercel republica automaticamente. Caso contrário,
repita: **Add New → Project → Import → Deploy**.

### 3. Não é necessário configurar nenhuma chave de API
Esta versão não precisa da variável `ANTHROPIC_API_KEY`. Se ela já estiver
configurada de uma tentativa anterior, pode deixá-la ou removê-la — não faz
diferença, pois o site não usa mais nenhuma IA.

### 4. Apontar o domínio da Directa Digital
Mesmo processo já explicado: **Settings → Domains** no Vercel, e um registro
CNAME no painel onde o domínio está registrado.

### 5. Testar
Acesse o site e busque, por exemplo:
- "cerveja lata 350ml"
- "parafuso de aço inox"
- "sabão em pó"

## Sobre os campos exibidos

| Campo | Como é obtido |
|---|---|
| NCM | Correspondência direta na Tabela NCM vigente (as 3 melhores opções são mostradas) |
| IPI | Direto da TIPI, pelo código NCM encontrado |
| CEST | Sugestão por palavra-chave na tabela de CEST — **confirmar** |
| cClassTrib / CST IBS-CBS | Sugestão por palavra-chave — **confirmar com o contador**, pois depende da situação jurídica da operação (LC 214/2025), não apenas do produto |

## Sobre o ICMS (removido)

O ICMS, CST ICMS e ICMS-ST não foram incluídos porque variam por estado (26
UFs + DF), com regras, alíquotas e protocolos próprios. Se no futuro
quiserem incluir isso, será necessário estruturar uma tabela por estado —
posso ajudar a montar isso quando tiverem interesse.
