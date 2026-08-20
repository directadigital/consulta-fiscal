# Consulta Fiscal de Produtos — Directa Digital

Este pacote contém a aplicação completa (frontend + backend seguro) pronta para
publicar e apontar um subdomínio próprio (ex.: `consultafiscal.directadigital.com.br`).

## Estrutura

```
consulta-fiscal/
├── public/
│   └── index.html      → a página que o cliente vê (campo de busca + ficha)
├── api/
│   └── classificar.js  → backend que guarda a chave da API em segredo
├── package.json
└── LEIA-ME.md
```

## Passo a passo (usando Vercel — gratuito, sem precisar de TI)

### 1. Criar conta no Vercel
Acesse https://vercel.com e crie uma conta gratuita (pode entrar com e-mail ou GitHub).

### 2. Subir este projeto
Duas formas, escolha a mais fácil pra você:

**Opção A — sem linha de comando:**
1. Crie uma conta no GitHub (https://github.com) se ainda não tiver.
2. Crie um repositório novo e faça upload de todos os arquivos desta pasta
   (`public/`, `api/`, `package.json`).
3. No Vercel, clique em "Add New Project" → "Import Git Repository" → selecione
   esse repositório → "Deploy".

**Opção B — com linha de comando (se tiver alguém de TI por perto):**
```bash
npm install -g vercel
cd consulta-fiscal
vercel --prod
```

### 3. Configurar a chave da API (passo obrigatório e mais importante)
No painel do projeto no Vercel:
1. Vá em **Settings → Environment Variables**
2. Adicione:
   - Nome: `ANTHROPIC_API_KEY`
   - Valor: a chave de API da Anthropic da Directa Digital
     (gerada em https://console.anthropic.com → Settings → API Keys)
3. Salve e clique em **Redeploy** para aplicar.

> Essa chave nunca aparece no navegador do cliente — ela fica só no servidor.
> Nunca compartilhe essa chave por e-mail/WhatsApp; trate como senha.

### 4. Apontar o domínio da Directa Digital
No painel do projeto no Vercel:
1. Vá em **Settings → Domains**
2. Adicione o subdomínio desejado, ex.: `consultafiscal.directadigital.com.br`
3. O Vercel vai indicar um registro DNS (tipo CNAME) para você cadastrar no
   painel onde o domínio da Directa Digital está registrado (Registro.br,
   HostGator, Locaweb, etc.). Normalmente é:
   - Tipo: CNAME
   - Nome/Host: `consultafiscal`
   - Valor/Destino: `cname.vercel-dns.com`
4. Aguarde a propagação (geralmente de alguns minutos até 24h).

### 5. Testar
Acesse o subdomínio configurado e faça uma busca de teste (ex.: "cerveja lata
350ml") para confirmar que a ficha é exibida corretamente.

### 6. Enviar ao cliente
Depois de publicado, basta enviar o link (ex.:
`https://consultafiscal.directadigital.com.br`) por e-mail, WhatsApp, ou como
atalho/favorito no navegador do cliente. Não é necessário instalar nada.

---

## Observação técnica importante

A classificação fiscal é gerada por inteligência artificial com apoio no
conhecimento de normas oficiais (NCM/TIPI, Convênio ICMS 142/2018, tabelas de
CST/cClassTrib do IBS e CBS), mas **não consulta em tempo real** as bases
oficiais (Sistema Classif, portal da NF-e, CONFAZ). Trata-se de uma ferramenta
de apoio à decisão — a aplicação já orienta o cliente a confirmar com o
escritório antes de qualquer apuração ou emissão fiscal.

Para eliminar essa dependência e ter maior segurança jurídica, o próximo passo
recomendado é integrar uma base de dados própria (planilha/JSON com NCM, CEST,
CST, cClassTrib atualizados) para que a IA apenas interprete a linguagem do
cliente e busque nessa base — sem depender só do conhecimento treinado do
modelo.
