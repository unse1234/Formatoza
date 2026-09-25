---
title: Converter VTT para SRT Online — Legendas WebVTT
metaDescription: >-
  Converta legendas WebVTT para SRT para editores de vídeo, players e plataformas. Posições, notas e estilos tratados
  de forma limpa. Direto no navegador.
h1: Conversor de VTT para SRT
shortDescription: >-
  Converta legendas WebVTT baixadas da web em SRT para editores de vídeo, players e outras plataformas.
intro: >-
  Legendas baixadas de sites de vídeo, cursos online ou reuniões gravadas costumam vir em WebVTT (.vtt). Já editores
  de vídeo, players de TV e muitos players de computador trabalham melhor com SRT. Este conversor transforma VTT
  em SRT no seu navegador, sem enviar o arquivo para lugar nenhum.


  O cabeçalho WEBVTT, blocos NOTE, estilos CSS e ajustes de posição que o SRT não suporta são removidos, e o texto
  e os tempos de cada legenda são mantidos. Converta até 50 arquivos de uma vez ou cole o conteúdo do VTT.
steps:
- >-
  Arraste o arquivo VTT para o conversor, escolha com “Escolher arquivos” ou cole o conteúdo na aba “Colar texto”.
- >-
  Se a legenda estiver fora de sincronia, preencha “Deslocar todos os tempos” (em milissegundos) em Configurações.
- >-
  Clique em “Converter para SRT”. No modo colar texto, o resultado aparece na hora.
- Copie o resultado ou baixe o arquivo .srt.
sourceExplanation: >-
  WebVTT (.vtt) é o formato de legendas para vídeo na web. O arquivo começa com a linha WEBVTT, usa ponto nos tempos
  (00:01:02.500) e aceita posição, estilos CSS e nomes de quem fala. O elemento <track> do vídeo HTML5 só aceita
  WebVTT.
targetExplanation: >-
  SRT (SubRip) é o formato de legenda mais popular. É um arquivo de texto simples com número da legenda, intervalo
  de tempo com vírgula (00:01:02,500) e o texto. Quase todos os players de vídeo e editores leem SRT.
useCases:
- title: Edição de vídeo
  text: >-
    Leve legendas da web para CapCut, Premiere Pro, DaVinci Resolve e outros editores que usam SRT.
- title: Assistir offline
  text: Players de TV, celular e computador leem SRT com mais confiabilidade.
- title: Arquivar aulas e reuniões
  text: Guarde as legendas de aulas e reuniões online no formato mais comum.
limitations:
- >-
  Estilos WebVTT (CSS ::cue, classes), regiões e a maioria das configurações de posição não existem no SRT e são
  removidos.
- >-
  Nomes de quem fala dentro de tags <v> são removidos; fica só o texto falado.
- Blocos de comentário NOTE não são copiados.
faq:
- q: O que acontece com estilos e posições do WebVTT?
  a: >-
    O SRT não consegue representá-los, então eles são removidos. A exceção são legendas posicionadas no topo da
    tela, marcadas com {\an8}, uma tag que muitos players entendem.
- q: Funciona com as legendas automáticas do YouTube?
  a: >-
    Sim, mas as legendas automáticas repetem frases em trechos sobrepostos, e o SRT também terá essas repetições.
- q: Qual codificação o SRT usa?
  a: >-
    UTF-8, com quebras de linha do Windows (CRLF), para máxima compatibilidade com players e editores.
---
