# Documentos

## Manual de acesso ao painel

`manual-acesso-painel.pdf` — para todo mundo que vai usar o painel: como entrar,
ativar a verificação em duas etapas, guardar os códigos de backup e publicar.
Tem uma página com espaço para a pessoa anotar os próprios códigos, então vale
imprimir em vez de só enviar o arquivo.

A fonte é o `.html` ao lado. Para regerar depois de editar:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$PWD/docs/manual-acesso-painel.pdf" \
  "file://$PWD/docs/manual-acesso-painel.html"
```

O manual cita textos que aparecem na interface (`Ativar`, `Guardei os códigos em
lugar seguro`, `Perdi o acesso — usar código de backup`). Ao mudar esses rótulos
no painel, atualize o manual junto — um passo a passo que não bate com a tela
gera mais chamado do que documento nenhum.
