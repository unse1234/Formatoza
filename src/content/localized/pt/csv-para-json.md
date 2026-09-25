---
title: Converter CSV para JSON Online — Sem Upload
metaDescription: >-
  Converta CSV em um array JSON de objetos. Detecta o delimitador, trata campos entre aspas e informa linhas com
  erro. Cole ou solte arquivos — sem upload.
h1: Conversor de CSV para JSON
shortDescription: >-
  Transforme linhas de CSV em um array JSON de objetos, com detecção de delimitador e aviso claro sobre linhas com
  problema.
intro: >-
  Quando você precisa levar uma planilha exportada do Excel ou de um banco de dados para uma API, uma aplicação
  JavaScript ou um banco NoSQL, o formato esperado é JSON. Este conversor transforma CSV em um array de objetos
  JSON usando os nomes das colunas da primeira linha como chaves — tudo dentro do seu navegador.


  O delimitador é detectado automaticamente, inclusive o ponto e vírgula que o Excel em português usa, e vírgulas
  ou quebras de linha dentro de aspas são tratadas corretamente. Você pode soltar arquivos ou colar o CSV; os dados
  não são enviados a nenhum servidor.
steps:
- >-
  Arraste o arquivo CSV para o conversor, escolha com “Escolher arquivos” ou cole os dados na aba “Colar texto”.
- >-
  Se precisar, ajuste em Configurações o delimitador, se a primeira linha tem os nomes das colunas, a detecção de
  números e a indentação.
- >-
  Clique em “Converter para JSON”. Com texto colado, o resultado é atualizado enquanto você digita.
- Copie o JSON ou baixe o arquivo .json.
sourceExplanation: >-
  CSV (valores separados por vírgula) é um formato de tabela em texto puro: cada linha é um registro e os campos
  são separados por um delimitador. Excel, Google Planilhas e bancos de dados exportam CSV. No Excel em português,
  como a vírgula é o separador decimal, o delimitador costuma ser ponto e vírgula.
targetExplanation: >-
  JSON (JavaScript Object Notation) é o formato de dados padrão das APIs web e das aplicações JavaScript. Guarda
  objetos, listas, números, true/false e textos em estruturas aninhadas, e praticamente toda linguagem de programação
  lê e escreve JSON.
useCases:
- title: Enviar dados para APIs e apps
  text: >-
    Transforme listas de produtos ou clientes exportadas do Excel na estrutura JSON que APIs REST e aplicações JavaScript
    esperam.
- title: Dados de teste
  text: >-
    Converta rapidamente tabelas de teste em JSON para usar no ambiente de desenvolvimento.
- title: Bancos NoSQL
  text: >-
    Prepare dados para importar em bancos baseados em JSON, como MongoDB ou Firebase.
limitations:
- >-
  CSV não tem aninhamento. JSON aninhado só é gerado com a opção “Aninhar nomes de colunas com ponto”, que transforma
  colunas como address.city em objetos.
- >-
  Datas continuam como texto, exatamente como estão escritas, porque o CSV não informa de forma confiável o formato
  usado.
- >-
  Valores só viram número quando não há perda, então 1,50 e 1.50, 1e3, +55 e IDs muito longos continuam como texto.
- >-
  Células vazias viram texto vazio (""), e não null, para não inventar informação.
faq:
- q: Como fica o JSON gerado?
  a: >-
    Com linha de cabeçalho, um array de objetos: [{"id": 1, "nome": "Ana"}, …]. Se você desligar o cabeçalho em
    Configurações, sai um array de arrays, um por linha.
- q: Meu CSV usa ponto e vírgula. Funciona?
  a: >-
    Sim. O delimitador é detectado automaticamente, e você pode forçar vírgula, ponto e vírgula, tabulação ou barra
    vertical em Configurações.
- q: Por que meu número continua como texto?
  a: >-
    Números só são convertidos se voltam idênticos quando escritos de novo, para que nenhum dado mude. Zeros à esquerda
    ou à direita, sinais de mais, notação científica e inteiros grandes demais para o JavaScript continuam como
    texto.
- q: O que acontece com colunas repetidas ou sem nome?
  a: >-
    Chaves JSON precisam ser únicas, então repetições ganham um sufixo (nome, nome_2) e cabeçalhos vazios viram
    column_1, column_2 e assim por diante.
---
