# GTM Advocacia — Cartão de Visitas (Prospecção Fria)

Cartão de visitas premium para prospecção fria. Frente como **hook** (manifesto que para a pessoa em 2 segundos), verso como **conversão** (contato direto com o sócio especialista via WhatsApp).

## Especificações

- **Tamanho final:** 90 × 50 mm (paisagem)
- **Com sangria:** 96 × 56 mm (sangria de 3 mm em todos os lados)
- **Margem segura:** 3 mm internos a partir do corte
- **Tipografia:** Playfair Display (display/serifa) + Inter (sans)
- **Paleta:**
  - `#1F3A35` verde escuro (fundo frente)
  - `#F1ECE0` bege (fundo verso)
  - `#8FC9B8` menta claro (acento sobre escuro)
  - `#5A8578` menta escuro (acento sobre claro)
  - `#F5F1E8` branco quebrado (texto sobre escuro)

## Arquivos para a gráfica

| Arquivo | Conteúdo |
|---|---|
| `gtm_prospec_GRAFICA_FINAL.pdf` | **PDF unificado de 2 páginas (frente + verso) — este é o que vai pra gráfica** |
| `gtm_prospec_front.pdf` | Frente isolada |
| `gtm_prospec_back.pdf` | Verso isolado |
| `gtm_prospec_front.svg` | Frente em SVG (editável) |
| `gtm_prospec_back.svg` | Verso em SVG (editável) |
| `gtm_prospec_preview.html` | Preview navegável dos dois lados (com guia de sangria opcional) |
| `assets/` | Logos processados + QR Codes em PNG |

### Sobre o espaço de cor

O PDF é gerado em **RGB com 3 mm de sangria, fontes embarcadas via Chromium** (Playfair Display + Inter como subsets). Para impressão profissional em CMYK, rode:

```bash
node scripts/convert_cmyk.js
```

Esse script usa **Ghostscript** (instale via [ghostscript.com](https://www.ghostscript.com/releases/gsdnld.html) ou no macOS: `brew install ghostscript`) e converte RGB → CMYK + sobrescreve o PDF final.

A maioria das gráficas de qualidade aceita PDFs RGB e faz a conversão com o perfil ICC da própria prensa (geralmente FOGRA39 ou SWOP), o que costuma render cores mais fiéis ao monitor do que uma conversão genérica feita por nós. **Se a gráfica pedir CMYK explicitamente**, rode o script acima.

## Os 3 sócios (verso)

| Sócio | Área | WhatsApp |
|---|---|---|
| João Giovanini | Direito Trabalhista | (61) 99945-4564 |
| Giovanna Trombini | Direito Digital | (61) 99695-8863 |
| Rafael Mansur | Direito do Servidor Público | (61) 99269-7534 |

Os QR Codes do verso já estão pré-preenchidos com mensagem contextual de WhatsApp para cada sócio.

## Regerar os arquivos

```bash
npm install
node scripts/build_logo_variants.js   # cria logos claro/escuro com fundo transparente
node scripts/trim_logos.js            # recorta as bordas transparentes
node scripts/build_qrcodes.js         # gera QR Codes WhatsApp
node scripts/build_svgs.js            # monta os SVGs finais
node scripts/render_pdf.js            # renderiza PDFs via Chromium (fontes embarcadas)
node scripts/merge_pdfs.js            # une frente+verso em um único PDF
node scripts/build_preview_html.js    # gera o preview HTML
# opcional, requer Ghostscript:
node scripts/convert_cmyk.js          # converte RGB → CMYK
```

## Checklist de produção

- [x] Logo localizado e usado nas duas versões de cor (claro/escuro), bordas transparentes
- [x] Sangria de 3 mm em ambos os lados
- [x] Fontes embarcadas no PDF (Playfair Display + Inter, subset)
- [x] 3 QR Codes gerados, alta correção (H), funcionais
- [x] PDFs com tamanho físico exato 96 × 56 mm
- [x] Sem sombras, gradientes, brilhos, emojis ou ícones decorativos
- [x] Headline com respiração visual (sem encostar nas margens)
- [ ] CMYK — rodar `node scripts/convert_cmyk.js` após instalar Ghostscript (gráficas geralmente aceitam RGB)
