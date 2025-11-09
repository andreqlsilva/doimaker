// BEGIN SCHEMA
const doiJson = `{
  "Ato": {
    "tipoDeclaracao": {
      "info" : "TipoDeclaracao",
      "description": "Tipo da declaração",
      "type": "string",
      "oneOf": [
        {
          "const": "0",
          "title": "Original"
        }
      ]
    },
    "tipoServico" : {
      "info": "TipoServico",
      "type": "string",
      "description": "Selecionar o tipo de serviço executado em relação à operação imobiliária declarada",
      "oneOf": [
        {
          "const": "1",
          "title": "Notarial"
        },
        {
          "const": "2",
          "title": "Registro de Imóveis"
        },
        {
          "const": "3",
          "title": "Registro de títulos e documentos"
        }
      ]
    },
    "tipoAto": {
      "info" : "TipoAto",
      "description": "Selecionar o tipo do ato em função do tipo de cartório",
      "type": "string",
      "oneOf": [
        {
          "const": "1",
          "title": "Escritura"
        },
        {
          "const": "2",
          "title": "Procuração"
        },
        {
          "const": "3",
          "title": "Averbação"
        },
        {
          "const": "4",
          "title": "Registro"
        },
        {
          "const": "5",
          "title": "Registros para fins de publicidade"
        },
        {
          "const": "6",
          "title": "Registro para fins de conservação"
        }
      ]
    },
    "dataLavraturaRegistroAverbacao": {
      "type": "string",
      "format": "date",
      "description": "Informar a data de lavratura / registro / averbação"
    },
    "dataNegocioJuridico": {
      "type": "string",
      "format": "date",
      "description": "Informar a data da celebração do negócio jurídico"
    },
    "numeroLivro": {
      "type": "string",
      "description": "Informar o número do livro em que o ato foi escriturado ou o título foi registrado",
      "maxLength": 7
    },
    "folha": {
      "type": "string",
      "description": "Páginas/Folhas (indicar nº início-fim)",
      "maxLength": 7
    },
    "matriculaNotarialEletronica": {
      "type": "string",
      "description": "Informar a Matrícula Notarial Eletrônica (MNE). Formato: CCCCCCAAAAMMDDNNNNNNNNDD.",
      "maxLength": 24
    },
    "retificacaoAto": {
      "type": "boolean",
      "description": "Informar se na operação atual houve retificação de ato anteriormente declarado"
    }
  },
  "Adquirente": {
    "ni": {
      "type": "string",
      "description": "Identificador da parte",
      "minLength": 11,
      "maxLength": 14
    },
    "indicadorNiIdentificado": {
      "type": "boolean",
      "description": "Informar se consta CPF da(s) parte(s) no documento (título a ser registrado, matrícula/transcrição, escritura pública etc)"
    },
    "motivoNaoIdentificacaoNi": {
      "info": "TipoMotivoNaoIdentificacaoNiParte",
      "description": "Informar o motivo da ausência do CPF da parte",
      "type": "string",
      "oneOf": [
        {
          "const": "1",
          "title": "Sem CPF/CNPJ - Decisão Judicial"
        },
        {
          "const": "2",
          "title": "Não consta no documento"
        }
      ]
    },
    "indicadorConjuge": {
      "type": "boolean",
      "description": "Informar se o adquirente possui cônjuge"
    },
    "indicadorConjugeParticipa": {
      "type": "boolean",
      "description": "Informar se o cônjuge participa da operação"
    },
    "indicadorCpfConjugeIdentificado": {
      "type": "boolean",
      "description": "Informar se consta o CPF do cônjuge no documento (título a ser registrado, matrícula/transcrição,escritura pública etc)"
    },
    "cpfConjuge": {
      "type": "string",
      "description": "Informar o CPF do cônjuge que consta no documento (título a ser registrado, matrícula/transcrição,escritura pública etc)",
      "minLength": 11,
      "maxLength": 11
    },
    "regimeBens": {
      "info": "RegimeBens",
      "description": "Informar o regime de bens no casamento",
      "type": "string",
      "oneOf": [
        {
          "const": "1",
          "title": "Separação de Bens"
        },
        {
          "const": "2",
          "title": "Comunhão Parcial de Bens"
        },
        {
          "const": "3",
          "title": "Comunhão Universal de Bens"
        },
        {
          "const": "4",
          "title": "Participação Final nos Aquestos"
        }
      ]
    },
    "indicadorEspolio": {
      "type": "boolean",
      "description": "Informar se a aquisição foi feita em nome de espólio."
    },
    "cpfInventariante": {
      "type": "string",
      "description": "CPF do Inventariante",
      "minLength": 11,
      "maxLength": 11
    },
    "indicadorEstrangeiro": {
      "type": "boolean",
      "description": "Informar se o adquirente é estrangeiro"
    },
    "indicadorNaoConstaParticipacaoOperacao": {
      "type": "boolean",
      "description": "Indicador que sinaliza que o percentual de participação não consta nos documentos"
    },
    "indicadorRepresentante": {
      "type": "boolean",
      "description": "Indicador que sinaliza que o adquirente outorgou mandato a pessoa física ou jurídica para representá-lo na operação imobiliária informada pela serventia"
    }
  },
  "Alienante": {
    "ni": {
      "type": "string",
      "description": "Identificador da parte",
      "minLength": 11,
      "maxLength": 14
    },
    "indicadorNiIdentificado": {
      "type": "boolean",
      "description": "Informar se consta CPF da(s) parte(s) no documento (título a ser registrado, matrícula/transcrição, escritura pública etc)"
    },
    "motivoNaoIdentificacaoNi": {
      "info": "TipoMotivoNaoIdentificacaoNiParte",
      "description": "Informar o motivo da ausência do CPF da parte",
      "type": "string",
      "oneOf": [
        {
          "const": "1",
          "title": "Sem CPF/CNPJ - Decisão Judicial"
        },
        {
          "const": "2",
          "title": "Não consta no documento"
        }
      ]
    },
    "indicadorConjuge": {
      "type": "boolean",
      "description": "Informar se o alienante possui cônjuge"
    },
    "indicadorConjugeParticipa": {
      "type": "boolean",
      "description": "Informar se o cônjuge participa da operação"
    },
    "indicadorCpfConjugeIdentificado": {
      "type": "boolean",
      "description": "Informar se consta o CPF do cônjuge no documento (título a ser registrado, matrícula/transcrição,escritura pública etc)"
    },
    "cpfConjuge": {
      "type": "string",
      "description": "Informar o CPF do cônjuge que consta no documento (título a ser registrado, matrícula/transcrição,escritura pública etc)",
      "minLength": 11,
      "maxLength": 11
    },
    "regimeBens": {
      "info": "RegimeBens",
      "description": "Informar o regime de bens no casamento",
      "type": "string",
      "oneOf": [
        {
          "const": "1",
          "title": "Separação de Bens"
        },
        {
          "const": "2",
          "title": "Comunhão Parcial de Bens"
        },
        {
          "const": "3",
          "title": "Comunhão Universal de Bens"
        },
        {
          "const": "4",
          "title": "Participação Final nos Aquestos"
        }
      ]
    },
    "indicadorEspolio": {
      "type": "boolean",
      "description": "Informar se a alienação foi feita por espólio."
    },
    "cpfInventariante": {
      "type": "string",
      "description": "CPF do Inventariante",
      "minLength": 11,
      "maxLength": 11
    },
    "indicadorEstrangeiro": {
      "type": "boolean",
      "description": "Informar se o alienante é estrangeiro"
    },
    "indicadorNaoConstaParticipacaoOperacao": {
      "type": "boolean",
      "description": "Indicador que sinaliza que o percentual de participação não consta nos documentos"
    },
    "indicadorRepresentante": {
      "type": "boolean",
      "description": "Indicador que sinaliza que o(s) alienante(s) outorgou (aram) mandato a pessoa física ou jurídica para representá-lo(s) na operação imobiliária informada pela serventia"
    }
  },
  "Imovel": {
    "codigoIbge": {
      "type": "string",
      "description": "Informar o código IBGE do município onde se localiza o imóvel",
      "maxLength": 7
    },
    "destinacao": {
      "info": "Destinacao",
      "type": "string",
      "description": "Indica se o imóvel é rual ou urbano",
      "oneOf": [
        {
          "const": "1",
          "title": "Urbano"
        },
        {
          "const": "3",
          "title": "Rural"
        }
      ]
    },
    "tipoImovel": {
      "description": "Classificação de acordo com o uso finalistico da UI",
      "info": "TipoImovel",
      "type": "string",
      "oneOf": [
        {
          "const": "15",
          "title": "Loja"
        },
        {
          "const": "31",
          "title": "Galpão"
        },
        {
          "const": "65",
          "title": "Apartamento"
        },
        {
          "const": "67",
          "title": "Casa"
        },
        {
          "const": "69",
          "title": "Fazenda/Sítio/Chácara"
        },
        {
          "const": "71",
          "title": "Terreno/Fração"
        },
        {
          "const": "89",
          "title": "Outros"
        },
        {
          "const": "90",
          "title": "Sala"
        },
        {
          "const": "91",
          "title": "Conjunto de salas"
        },
        {
          "const": "92",
          "title": "Sobreloja"
        },
        {
          "const": "93",
          "title": "Vaga de Garagem"
        },
        {
          "const": "94",
          "title": "Laje"
        },
        {
          "const": "95",
          "title": "Estacionamento"
        },
        {
          "const": "96",
          "title": "Barraco"
        }
      ]
    },
    "tipoLogradouro": {
      "type": "string",
      "description": "Tipo logradouro do endereço do imóvel",
      "maxLength": 30
    },
    "nomeLogradouro": {
      "type": "string",
      "description": "Logradouro do endereço do imóvel",
      "maxLength": 150
    },
    "complementoEndereco": {
      "type": "string",
      "description": "Complemento do endereço do imóvel",
      "maxLength": 100
    },
    "numeroImovel": {
      "type": "string",
      "description": "Número do endereço do imóvel",
      "maxLength": 10
    },
    "complementoNumeroImovel": {
      "type": "string",
      "description": "Complemente do número do endereço do imóvel",
      "maxLength": 10
    },
    "bairro": {
      "type": "string",
      "description": "Bairro do endereço do imóvel",
      "maxLength": 150
    },
    "localizacao": {
      "type": "string",
      "description": "Informar dados que possam ajudar na localização do imóvel, tais como: distrito, povoado, colônia, núcleo, rodovia/km, ramal, gleba, lote, etc. Exemplo: Partindo da Sede do Município,margem esquerda da BR 101, Km 60",
      "maxLength": 200
    },
    "cep": {
      "type": "string",
      "description": "CEP do endereço do imóvel",
      "maxLength": 8
    },
    "indicadorAreaLoteNaoConsta": {
      "type": "boolean",
      "description": "Indicador de que a área do imóvel não consta nos Documentos. Vide Observações"
    },
    "areaImovel": {
      "type": "number",
      "description": "Área do lote urbano em m2 ou área do imóvel rural em ha conforme matrícula. (máx. 13 inteiros e 2 casas)."
    },
    "indicadorAreaConstruidaNaoConsta": {
      "type": "boolean",
      "description": "Indicador de que a área de construção do imóvel não consta nos Documentos"
    },
    "areaConstruida": {
      "type": "number",
      "description": "Área Construída (m2). Informar de acordo com a matrícula. Até o limite de 12 inteiros e 4 casas decimais. Preenchimento em m2"
    },
    "matricula": {
      "type": "string",
      "description": "Informar o número de ordem da matrícula do imóvel",
      "maxLength": 7
    },
    "inscricaoMunicipal": {
      "type": "string",
      "description": "Código da inscrição imobiliária",
      "maxLength": 45
    },
    "cib": {
      "type": "string",
      "description": "Informar o código do imóvel no Cadastro Imobiliário Brasileiro (CIB). Cálculo do DV quando os caracteres originais são exclusivamente numéricos:algoritimo utilizado pelo Nirf, segundo a regra do Módulo 11. Cálculo do DV quando os caracteres originais não são exclusivamente numéricos: a) para cada caractere codificado, o seu valor será multiplicado pela sequência de fatores 4,3,9,5,7,1, e 8; b) a soma dos produtos será dividida por 31",
      "maxLength": 8
    },
    "codigoIncra": {
      "type": "string",
      "description": "Informar o código do imóvel no Sistema Nacional de Cadastro Rural (SNCR)",
      "maxLength": 13
    },
    "denominacao": {
      "type": "string",
      "description": "Informar o nome do imóvel rural que consta no documento (título a ser registrado, matrícula/transcrição,escritura pública etc), caso exista",
      "maxLength": 200
    },
    "codigoNacionalMatricula": {
      "type": "string",
      "description": "Informar o Código Nacional de Matrícula (CNM). Formato: CCCCCCLNNNNNNNDD - O CNM informado será validado através do DV informado, seguindo o algoritmo módulo 97 base 10, conforme norma ISO 7064:2023",
      "maxLength": 16
    },
    "transcricao": {
      "type": "number",
      "format": "int32",
      "description": "Informar o número de ordem da transcrição. Até o limite de 8 inteiros"
    },
    "tipoOperacaoImobiliaria": {
      "description": "Selecionar o tipo de operação imobiliária dentre as opções da caixa",
      "info":"TipoOperacaoImobiliaria",
      "type": "string",
      "oneOf": [
        {
          "const": "11",
          "title": "Compra e Venda"
        },
        {
          "const": "13",
          "title": "Permuta"
        },
        {
          "const": "55",
          "title": "Doação em adiantamento da legítima"
        },
        {
          "const": "67",
          "title": "Doação, exceto em Adiantamento de Legítima"
        },
        {
          "const": "15",
          "title": "Adjudicação"
        },
        {
          "const": "19",
          "title": "Dação em Pagamento"
        },
        {
          "const": "21",
          "title": "Distrato de Negócio"
        },
        {
          "const": "31",
          "title": "Procuração em Causa Própria"
        },
        {
          "const": "33",
          "title": "Promessa de Compra e Venda"
        },
        {
          "const": "35",
          "title": "Promessa de Cessão de Direitos"
        },
        {
          "const": "37",
          "title": "Cessão de Direitos"
        },
        {
          "const": "39",
          "title": "Outros"
        },
        {
          "const": "41",
          "title": "Alienação por iniciativa particular ou leilão judicial"
        },
        {
          "const": "45",
          "title": "Incorporação e loteamento"
        },
        {
          "const": "47",
          "title": "Integralização/Subscrição de capital"
        },
        {
          "const": "56",
          "title": "Aforamento"
        },
        {
          "const": "57",
          "title": "Casamento em comunhão universal de bens"
        },
        {
          "const": "58",
          "title": "Cisão total ou parcial"
        },
        {
          "const": "59",
          "title": "Compra e venda de imóvel gravado por enfiteuse"
        },
        {
          "const": "60",
          "title": "Concessão de Direito Real de Uso (CDRU)"
        },
        {
          "const": "61",
          "title": "Concessão de Uso Especial para Fins de Moradia (CUEM)"
        },
        {
          "const": "62",
          "title": "Consolidação da Propriedade em Nome do Fiduciário"
        },
        {
          "const": "63",
          "title": "Desapropriação para fins de Reforma Agrária"
        },
        {
          "const": "64",
          "title": "Desapropriação, exceto para Reforma Agrária"
        },
        {
          "const": "65",
          "title": "Direito de laje"
        },
        {
          "const": "66",
          "title": "Direito de superfície"
        },
        {
          "const": "68",
          "title": "Incorporação"
        },
        {
          "const": "69",
          "title": "Inventário"
        },
        {
          "const": "70",
          "title": "Part. Separação/Divórcio/União Estável"
        },
        {
          "const": "71",
          "title": "Retorno de Capital Próprio na Extinção de Pessoa Jurídica"
        },
        {
          "const": "72",
          "title": "Retorno de Capital Próprio, exceto na Extinção de Pessoa Jurídica"
        },
        {
          "const": "73",
          "title": "Título de Domínio - TD"
        },
        {
          "const": "74",
          "title": "Usucapião"
        }
      ]
    },
    "descricaoOutrasOperacoesImobiliarias": {
      "type": "string",
      "description": "Descrever a operação imobiliária se o valor selecionado na caixa for 'Outras Operações Imobiliárias'",
      "maxLength": 30
    },
    "indicadorPermutaBens": {
      "type": "boolean",
      "description": "Informar se houve permuta de bens na operação imobiliária"
    },
    "tipoParteTransacionada": {
      "description": "Selecionar se a informação da parte transacionada do  imóvel será em percentual ou área",
      "info": "TipoParteTransacionada",
      "type": "string",
      "oneOf": [
        {
          "const": "1",
          "title": "%"
        },
        {
          "const": "2",
          "title": "ha/m²"
        }
      ]
    },
    "valorParteTransacionada": {
      "type": "number",
      "description": "Informar a quantidade de metros/hectares ou o percentual que foi objeto da operação imobiliária, conforme opção no campo tipoParteTransacionada. Até o limite de 18 inteiros e 2 casas decimais"
    },
    "indicadorNaoConstaValorOperacaoImobiliaria": {
      "type": "boolean",
      "description": "Assinalar a caixa se o valor da operação imobiliária não constar do documento"
    },
    "valorOperacaoImobiliaria": {
      "type": "number",
      "description": "Informar o valor da operação imobiliária. Até o limite de 18 inteiros e 2 casas decimais"
    },
    "indicadorNaoConstaValorBaseCalculoItbiItcmd": {
      "type": "boolean",
      "description": "Assinalar a caixa se o valor da base de cálculo do ITBI/ITCMD não constar do documento"
    },
    "valorBaseCalculoItbiItcmd": {
      "type": "number",
      "description": "Informar o valor da base de cálculo do ITBI ou do ITCMD. Até o limite de 18 inteiros e 2 casas decimais"
    },
    "formaPagamento": {
      "info":"FormaPagamento",
      "type": "string",
      "description": "Selecionar a forma de pagamento dentre as opções da caixa",
      "oneOf": [
        {
          "const": "5",
          "title": "Quitado à vista"
        },
        {
          "const": "10",
          "title": "Quitado a prazo"
        },
        {
          "const": "11",
          "title": "Quitado sem informação da forma de pagamento"
        },
        {
          "const": "7",
          "title": "A prazo"
        },
        {
          "const": "9",
          "title": "Não de aplica"
        }
      ]
    },
    "indicadorAlienacaoFiduciaria": {
      "type": "boolean",
      "description": "Informar se o imóvel foi objeto de alienação fiduciária na operação"
    },
    "valorPagoAteDataAto": {
      "type": "number",
      "description": "Informar o valor pago até a data do ato. Este campo somente deve ser  incluído se a opção 'A prazo' do campo 'forma de pagamento' for escolhida. Até o limite de 18 inteiros e 2 casas decimais"
    },
    "mesAnoUltimaParcela": {
      "type": "string",
      "format": "date",
      "description": "Informar o mês e o ano de vencimento da última parcela para pagamento a prazo"
    },
    "indicadorPagamentoDinheiro": {
      "type": "boolean",
      "description": "Informar se houve pagamento em dinheiro"
    },
    "valorPagoMoedaCorrenteDataAto": {
      "type": "number",
      "description": "Informar o valor pago em espécie até a data do ato. Este campo somente deve ser  incluído se a informação no campo “indicadorPagamentoDinheiro” for True. Até o limite de 18 inteiros e 2 casas decimais"
    },
    "indicadorImovelPublicoUniao": {
      "type": "boolean",
      "description": "Informar se o imóvel objeto da operação imobiliária é imóvel público da União"
    },
    "registroImobiliarioPatrimonial": {
      "type": "string",
      "description": "Informar a identificação do imóvel no cadastro da Secretaria de Patrimônio da União (SPU), ou seja, o número do Registro Imobiliário Patrimonial (RIP)",
      "minLength": 13,
      "maxLength": 13
    },
    "certidaoAutorizacaoTransferencia": {
      "type": "string",
      "description": "Informar o número da Certidão de Autorização para Transferência (CAT) emitida pela Secretaria de Patrimônio da União (SPU)",
      "maxLength": 11
    }
  }
}`;

