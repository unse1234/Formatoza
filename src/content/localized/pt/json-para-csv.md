---
title: Converter JSON para CSV Online — Pronto para Excel
metaDescription: >-
  Converta JSON em CSV direto no navegador. Achata objetos aninhados em colunas, com opção de ponto e vírgula e
  BOM UTF-8 para o Excel. Grátis e sem upload.
h1: Conversor de JSON para CSV
shortDescription: >-
  Transforme um array JSON em uma tabela CSV que abre no Excel e no Google Planilhas, com objetos aninhados virando
  colunas.
intro: >-
  Dados de APIs, exportações de sistemas e logs costumam vir em JSON, mas para analisar no Excel ou no Google Planilhas
  você precisa de uma tabela. Este conversor transforma um array de objetos JSON em CSV: cada objeto vira uma linha
  e cada chave vira uma coluna — tudo no seu navegador, sem enviar os dados.


  Objetos aninhados viram colunas com nomes como endereco.cidade. Para abrir direto no Excel em português, escolha
  ponto e vírgula como delimitador de saída e ative o BOM UTF-8 para que os acentos apareçam corretamente.
steps:
- >-
  Arraste o arquivo JSON para o conversor, escolha com “Escolher arquivos” ou cole o JSON na aba “Colar texto”.
- >-
  Em Configurações, escolha o delimitador de saída (vírgula ou ponto e vírgula), se quer achatar objetos aninhados
  e se deve adicionar o BOM UTF-8 para o Excel.
- >-
  Clique em “Converter para CSV”. Com texto colado, o resultado é atualizado enquanto você digita.
- Copie o CSV ou baixe o arquivo .csv.
sourceExplanation: >-
  JSON (JavaScript Object Notation) é o formato de dados padrão das APIs web e das aplicações JavaScript. Guarda
  objetos, listas, números, true/false e textos em estruturas aninhadas, e praticamente toda linguagem de programação
  lê e escreve JSON.
targetExplanation: >-
  CSV (valores separados por vírgula) é um formato de tabela em texto puro: cada linha é um registro e os campos
  são separados por um delimitador. Excel, Google Planilhas e bancos de dados exportam CSV. No Excel em português,
  como a vírgula é o separador decimal, o delimitador costuma ser ponto e vírgula.
useCases:
- title: Analisar respostas de API no Excel
  text: >-
    Transforme a resposta de uma API em planilha para filtrar, somar e montar gráficos.
- title: Relatórios e exportações
  text: >-
    Converta exportações JSON de sistemas e ferramentas em CSV para compartilhar com quem usa planilha.
- title: Importar em outros sistemas
  text: Muitos sistemas de e-commerce, CRM e marketing só importam CSV.
limitations:
- >-
  Listas dentro de um registro (tags, itens de pedido) viram texto JSON em uma única célula, por exemplo ["a","b"],
  porque uma tabela não tem como representar uma lista.
- >-
  Dados muito aninhados ou com estruturas muito diferentes entre si podem gerar muitas colunas quase vazias.
- >-
  O Excel pode reinterpretar valores ao abrir um CSV (datas, números longos, zeros à esquerda). Use a opção de BOM
  UTF-8 ou importe pelo menu Dados para controlar como o Excel lê o arquivo.
faq:
- q: Qual estrutura de JSON é esperada?
  a: >-
    Um array de objetos funciona melhor: [{…}, {…}]. O conversor também aceita um objeto que contenha esse array
    (usa o maior e avisa onde o encontrou), JSON Lines com um objeto por linha, ou um único objeto.
- q: Como os objetos aninhados são tratados?
  a: >-
    Eles viram colunas com nomes separados por ponto: {"endereco": {"cidade": "Recife"}} vira a coluna endereco.cidade.
    Desative o achatamento em Configurações para manter os objetos como texto JSON.
- q: Por que os acentos aparecem errados no Excel?
  a: >-
    Versões antigas do Excel supõem uma codificação antiga para arquivos CSV. Ative “Adicionar BOM UTF-8 para o
    Excel” para que ele reconheça UTF-8, ou abra o arquivo por Dados → De Texto/CSV.
- q: O que acontece se os registros tiverem chaves diferentes?
  a: >-
    Toda chave que aparece em qualquer registro vira uma coluna, na ordem em que aparece pela primeira vez. Registros
    sem aquela chave ficam com a célula vazia.
---
