---
title: Converter SRT para VTT Online — Legendas WebVTT
metaDescription: >-
  Converta legendas SRT para WebVTT para vídeo HTML5, Vimeo e players web. Corrige tempos, codificação e quebras
  de linha. Direto no navegador, grátis.
h1: Conversor de SRT para VTT
shortDescription: >-
  Converta legendas SRT em WebVTT, o formato aceito pelo elemento <track> do HTML5 e pelos players de vídeo na web.
intro: >-
  Para colocar legenda em um vídeo no seu site, em uma plataforma de cursos ou em um player HTML5, normalmente é
  preciso um arquivo WebVTT (.vtt), e não SRT. Só trocar a extensão não resolve: o VTT precisa do cabeçalho WEBVTT,
  de tempos com ponto e de alguns caracteres especiais escapados.


  Este conversor faz tudo isso automaticamente, direto no seu navegador. Você também pode deslocar todos os tempos
  quando a legenda estiver fora de sincronia e converter até 50 arquivos de uma vez — ou apenas colar o conteúdo
  do SRT.
steps:
- >-
  Arraste o arquivo SRT para o conversor, escolha com “Escolher arquivos” ou abra a aba “Colar texto” e cole o conteúdo.
- >-
  Se a legenda estiver fora de sincronia, abra Configurações e preencha “Deslocar todos os tempos” em milissegundos
  (valores positivos atrasam a legenda).
- >-
  Clique em “Converter para VTT”. No modo colar texto, o resultado aparece enquanto você digita.
- Copie o resultado ou baixe o arquivo .vtt.
sourceExplanation: >-
  SRT (SubRip) é o formato de legenda mais popular. É um arquivo de texto simples com número da legenda, intervalo
  de tempo com vírgula (00:01:02,500) e o texto. Quase todos os players de vídeo e editores leem SRT.
targetExplanation: >-
  WebVTT (.vtt) é o formato de legendas para vídeo na web. O arquivo começa com a linha WEBVTT, usa ponto nos tempos
  (00:01:02.500) e aceita posição, estilos CSS e nomes de quem fala. O elemento <track> do vídeo HTML5 só aceita
  WebVTT.
useCases:
- title: Vídeo no seu site
  text: >-
    Adicione legendas a vídeos HTML5 com o elemento <track>, que só aceita WebVTT.
- title: Plataformas de curso e players web
  text: >-
    Muitas plataformas de ensino e players de vídeo pedem legendas em .vtt.
- title: Legenda fora de sincronia
  text: >-
    Desloque todos os tempos de uma vez durante a conversão, sem editar linha por linha.
limitations:
- >-
  As tags <font color> do SRT não têm equivalente no WebVTT e são removidas.
- >-
  O SRT quase não tem posicionamento. Uma tag {\an8} no início da linha vira posição no topo da tela; outras tags
  de estilo ASS são removidas.
- >-
  As legendas são ordenadas pelo tempo de início; legendas que terminam antes de começar são corrigidas e informadas.
faq:
- q: Qual a diferença entre SRT e VTT?
  a: >-
    Principalmente o cabeçalho e os tempos. O WebVTT começa com “WEBVTT”, usa ponto (00:01:02.500) em vez de vírgula
    (00:01:02,500), deixa a numeração opcional e aceita posição, estilos CSS e identificação de quem fala.
- q: Posso só renomear o .srt para .vtt?
  a: >-
    Não. Os navegadores rejeitam arquivos sem o cabeçalho WEBVTT e com vírgula nos tempos. Os caracteres &, < e
    > também precisam ser escapados. A conversão cuida de tudo isso.
- q: Minha legenda mostra caracteres estranhos como Ã©. Dá para corrigir?
  a: >-
    Geralmente sim. Arquivos que não estão em UTF-8 são lidos como Windows-1252, a codificação antiga mais comum
    em legendas em português, e o VTT é salvo em UTF-8.
- q: O conversor traduz a legenda?
  a: >-
    Não. Ele só muda o formato do arquivo de SRT para VTT; o texto continua no idioma original.
---
