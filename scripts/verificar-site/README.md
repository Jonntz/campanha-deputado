# Verificação do site no navegador

Abre o site num Chrome de verdade, via DevTools Protocol, e confere o que um
teste por HTTP não enxerga: fonte carregada, imagens carregadas, rolagem
horizontal, acordeão das propostas, lightbox, vídeos, carrossel, scrollspy,
menu do celular — e qualquer erro de JavaScript ou violação de CSP no console.

Existe porque dois defeitos deste projeto passaram por testes que só falavam
HTTP: uma CSP que impedia o React de hidratar e uma variável de ambiente
ausente. Nenhum dos dois aparece sem JavaScript rodando.

Sem dependências; precisa do Google Chrome instalado (caminho do macOS em
`cdp.mjs`) e do site rodando.

```bash
pnpm --filter site build && pnpm --filter site start   # em outro terminal
pnpm verificar:site
```

As capturas (topo, galeria e página inteira, em 1440px e 390px) ficam em
`.verificacao/`, que o Git ignora. `BASE=https://…` aponta para outro endereço.
