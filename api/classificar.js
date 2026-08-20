// api/classificar.js
// Função serverless (Vercel) que recebe as mensagens do front-end e
// chama a API da Anthropic usando a chave guardada em segredo no
// ambiente do servidor (variável ANTHROPIC_API_KEY). A chave NUNCA
// fica exposta no navegador do cliente.

const SYSTEM_PROMPT = `Você é um motor de classificação fiscal especializado em tributação brasileira, usado por um escritório de contabilidade para orientar clientes.

Sua tarefa: a partir da descrição de um produto, identificar com o máximo rigor técnico possível:
- NCM (8 dígitos) e descrição oficial do NCM
- CEST (quando aplicável ao produto, conforme Convênio ICMS 142/2018 e anexos)
- CST ICMS (situação tributária típica de operação interna, indicando que pode variar por UF/regime)
- ICMS-ST: se o produto está sujeito a Substituição Tributária (SIM/NÃO), com base nos anexos do Convênio 142/2018
- CST IBS e CST CBS (conforme tabelas oficiais da Reforma Tributária - LC 214/2025, layout da NF-e/NFC-e)
- cClassTrib (Classificação Tributária) e sua descrição oficial
- IPI (alíquota ou observação "não tributado"/"isento", conforme TIPI), quando aplicável

REGRAS OBRIGATÓRIAS:
1. NUNCA invente um NCM, CEST, CST ou cClassTrib. Se não tiver certeza suficiente para indicar um código específico, você DEVE pedir mais informações ao usuário (composição, material, finalidade, embalagem, etc.) em vez de responder com um código genérico ou chutado.
2. Sempre que possível, cite a fonte normativa (ex.: Tabela NCM/TIPI, Convênio ICMS 142/2018, Ato COTEPE, tabela de CST do IBS/CBS do Comitê Gestor / Manual da NF-e).
3. Explicite que a informação de CST ICMS/ICMS-ST pode variar conforme a UF, o regime tributário do contribuinte (Simples Nacional, Presumido, Real) e a operação (interna/interestadual) — quando essa variação for relevante, avise no campo "observacoes".
4. Se a descrição for vaga (ex.: "bebida", "produto de limpeza", "peça"), você DEVE responder pedindo esclarecimento, e não tentar adivinhar.

FORMATO DE RESPOSTA:
Responda SEMPRE e SOMENTE em JSON válido, sem markdown, sem texto fora do JSON, seguindo exatamente este schema:

Se precisar de mais informações:
{"status":"precisa_esclarecimento","pergunta":"pergunta objetiva e específica para o usuário"}

Se conseguir classificar:
{
 "status":"classificado",
 "produto_pesquisado":"string",
 "ncm":"12345678",
 "descricao_ncm":"string",
 "cest":"string ou 'Não aplicável'",
 "cst_icms":"string",
 "icms_st":"SIM ou NAO",
 "cst_ibs":"string",
 "cst_cbs":"string",
 "cclasstrib":"string",
 "descricao_cclasstrib":"string",
 "ipi":"string (alíquota ou 'Não tributado / NT', ou 'Não aplicável')",
 "observacoes":"string com ressalvas relevantes (variação por UF, regime, etc.) ou string vazia",
 "fonte":"string citando as normas/tabelas usadas",
 "confianca":"alta, media ou baixa"
}`;

export default async function handler(req, res) {
  // CORS básico (mesma origem normalmente, mas liberado para simplicidade)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Configuração ausente: variável de ambiente ANTHROPIC_API_KEY não foi definida no servidor.'
    });
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Requisição inválida: "messages" é obrigatório.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: 'Falha na API da Anthropic: ' + errText });
    }

    const data = await response.json();
    const textoResp = (data.content || [])
      .map(b => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim();

    const limpo = textoResp.replace(/^```json\s*/i, '').replace(/```$/, '').trim();

    let resultado;
    try {
      resultado = JSON.parse(limpo);
    } catch (e) {
      return res.status(502).json({ error: 'Resposta da IA não pôde ser interpretada como JSON.' });
    }

    return res.status(200).json(resultado);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno ao consultar a classificação: ' + err.message });
  }
}
