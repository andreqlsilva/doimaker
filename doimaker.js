/* DATA FUNCTIONS */

function saveObject(obj,key) {
  try {
    localStorage.setItem(key, JSON.stringify(obj));
  } catch (error) {
    throw(error);
  }
}

function loadObject(key) {
  const item = localStorage.getItem(key);
  try {
    if (!item) throw new Error(`No object with key ${key}.`)
    const obj = JSON.parse(localStorage.getItem(key));
    return obj;
  } catch (error) {
    throw(error);
  }
}

function downloadObject(obj,filename) {
  const content = JSON.stringify(obj,null,2);
  const file = new Blob([content], {type:'text/plain'});
  url = URL.createObjectURL(file);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function readJson(fileobj) {
  try {
    const content = await fileobj.text();
    return JSON.parse(content);
  } catch (error) {
    console.error("Couldn't read.")
    throw (error);
  }
}

/* UI COMPONENTS */

class TextElement {
  constructor(text) {
    this.html = document.createElement("p");
    this.html.setAttribute("class", "TextElement");
    this.setText(text);
  }
  setText(newText) {
    if (typeof newText === "string")
      this.html.textContent = newText;
    else throw Error("Invalid text.");
  }
}

class LabelElement {
  constructor(text) {
    this.html = document.createElement("label");
    this.html.setAttribute("class", "LabelElement");
    this.html.textContent = text ?? "label";
  }
  setText(newText) {
    if (typeof newText === "string")
      this.html.textContent = newText;
    else throw Error("Invalid label.");
  }
}

class TextInput { 
  constructor(defaultText) {
    this.html = document.createElement("input");
    this.html.setAttribute("type", "text");
    this.html.setAttribute("class", "TextInput");
    this.html.value = defaultText || "";
  }
  get value() {
    return this.html.value;
  }
  set value(newValue) {
    if (typeof newValue === "string") this.html.value = newValue;
    else throw new Error("Invalid string.");
  }
}

class NumberInput {
  constructor(defaultValue) {
    this.html = document.createElement("input");
    this.html.setAttribute("type", "number");
    this.html.setAttribute("class", "NumberInput");
    this.html.value = defaultValue || 0;
  }
  get value() {
    return this.html.value;
  }
  set value(newValue) {
    if (typeof newValue === "number") this.html.value = newValue;
    else throw new Error("Invalid number.");
  }
}

class CheckboxInput {
  constructor() {
    this.html = document.createElement("input");
    this.html.setAttribute("type", "checkbox");
    this.html.setAttribute("class", "CheckboxInput");
  }
  get value() {
    return this.html.checked;
  }
}


class DateInput {
  constructor() {
    this.html = document.createElement("input");
    this.html.setAttribute("type","date");
    this.html.setAttribute("class","DateInput");
    this.html.value = "";
  }
  get value() {
    return this.html.value;
  }
  set value(newValue) {
    if (typeof newValue === "string"
      && !isNaN(Date.parse(newValue))) {
      this.html.value = newValue;
    }
    else throw new Error("Invalid date.")
  }
}

class MenuInput {
  constructor() {
    this.html = document.createElement("select");
    this.html.setAttribute("class", "InputMenu");
    const voidOption = document.createElement("option");
    voidOption.value = 0;
    voidOption.textContent = "";
    this.html.appendChild(voidOption);
  }
  get value() {
    return [this.html.value, this.html.textContent];
  }
  add(newOption) {
    if (newOption.const && newOption.title) {
      const option = document.createElement("option");
      option.value = newOption.const;
      option.textContent = newOption.title;
      this.html.appendChild(option);
    }
    else throw new Error("Invalid new option {const, title}.");
  }
}

class FilePicker {
  constructor() {
    this.html = document.createElement("input");
    this.html.setAttribute("type", "file");
    this.html.setAttribute("class", "FilePicker");
  }
  get file() {
    return this.html.files[0];
  }
}

class ControlButton {
  constructor(text) {
    this.html = document.createElement("button");
    this.html.setAttribute("type", "button");
    this.html.setAttribute("class", "ControlButton");
    this.html.textContent = text ?? "Button"
  }
  setAction(actionFunction) {
    if (actionFunction instanceof Function) {
      console.log("here");
      this.html.addEventListener("click", actionFunction);
    }
  }
  trigger() { this.html.dispatchEvent(new Event('click')); }
}

class ColumnComponent {
  constructor() {
    this.html = document.createElement("div");
    this.html.setAttribute("class", "ColumnComponent");
  }
  add(newItem) {
    if (newItem instanceof Node) {
      //console.log(newItem);
      newItem.style.display = "block";
      this.html.appendChild(newItem);
    }
    else if (newItem.html) {
      newItem.html.style.display = "block";
      this.html.appendChild(newItem.html);
    }
  }
}

class RowComponent {
  constructor() {
    this.html = document.createElement("span");
    this.html.setAttribute("class", "RowComponent");
  }
  add(newItem) {
    if (newItem instanceof Node) {
      this.html.appendChild(newItem);
    }
    else if (newItem.html) {
      this.html.appendChild(newItem.html);
    }
  }
}

class PagerComponent {
  constructor() {
    this.current = 0;
    this.pages = [];
    this.default = null

    this.html = document.createElement("div");
    this.html.setAttribute("class", "PagerComponent");
    this.pageArea = document.createElement("div");
    this.pageArea.setAttribute("class", "PageArea");
    this.html.appendChild(this.pageArea);

    this.controls = new RowComponent();
    const newButton = new ControlButton("+");
    const delButton = new ControlButton("-");
    const prevButton = new ControlButton("<");
    const nextButton = new ControlButton(">");
    newButton.setAction(() => this.new());
    delButton.setAction(() => this.del());
    prevButton.setAction(() => this.prev());
    nextButton.setAction(() => this.next());
    this.controls.add(newButton.html);
    this.controls.add(delButton.html);
    this.controls.add(prevButton.html);
    this.controls.add(nextButton.html);
    this.html.appendChild(this.controls.html);
  }
  setDefault(defaultPage) {
    if (defaultPage instanceof Node) this.default = defaultPage;
    else throw new Error("Invalid default page.");
  }
  add(newPage) {
    let htmlPage = newPage;
    if (newPage.html) htmlPage = newPage.html;
    if (htmlPage instanceof Node) {
      this.pages.push(newPage);
      this.pageArea.appendChild(newPage);
      this.current = this.pages.length-1;
      this.select(this.current);
    }
    else throw new Error("Invalid new page.");
  }
  remove(index) {
    if (this.pages[index]) {
      this.pages.splice(index,1);
      if (this.current == index) {
        this.select((this.current ? this.current : 1) -1);
      }
      const newPageArea = document.createElement("div");
      newPageArea.setAttribute("class", "PagerComponent");
      for (const page of pages) newPageArea.appendChild(page);
      delete this.pageArea;
      this.pageArea = newPageArea;
      select(this.current);
      this.html.prepend(this.pageArea);
    }
    else throw new Error("Invalid page index.");
  }
  new() { this.add(this.default); }
  del() { this.remove(this.current); }
  select(index) {
    if (index < 0 || index >= this.pages.length)
      throw new Error("Invalid page index.");
    for (const p in this.pages) {
      //console.log(p);
      //console.log(index);
      if (p != index) {
        this.pages[p].style.display = 'none';
      }
      else {
        this.pages[p].style.display = 'block';
        //console.log(this.pages[p]);
      }
    }
    this.current = index;
  }
  prev() {
    if (this.current > 0) {
      this.current-=1;
      this.select(this.current);
    }
  }
  next() {
    if (this.current+1 < this.pages.length) {
      this.current+=1;
      this.select(this.current);
    }
  }
}

/* MODELS AND VIEWS */
class CPF {
  static validate(ni) {
    if (typeof ni !== "string") return false;
    if (!/^\d{11}$/.test(ni)) return false;

    // Reject CPFs with all digits the same (e.g. "11111111111")
    if (/^(\d)\1{10}$/.test(ni)) return false;

    const digits = ni.split("").map(d => parseInt(d, 10));

    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i);
    }
    let firstCheck = 11 - (sum % 11);
    if (firstCheck >= 10) firstCheck = 0;
    if (digits[9] !== firstCheck) return false;

    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * (11 - i);
    }
    let secondCheck = 11 - (sum % 11);
    if (secondCheck >= 10) secondCheck = 0;
    if (digits[10] !== secondCheck) return false;

    return true;
  }
}

class CNPJ {
  static validate(ni) {
    if (typeof ni !== "string") return false;
    if (!/^\d{14}$/.test(ni)) return false;

    // Reject CNPJs with all digits the same
    if (/^(\d)\1{13}$/.test(ni)) return false;

    const digits = ni.split("").map(d => parseInt(d, 10));

    // Weights for first check digit (positions 1-12)
    const weight1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    // Weights for second check digit (positions 1-13)
    const weight2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    // Calculate first check digit
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += digits[i] * weight1[i];
    }
    let firstCheck = sum % 11;
    firstCheck = firstCheck < 2 ? 0 : 11 - firstCheck;
    if (digits[12] !== firstCheck) return false;

    // Calculate second check digit
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += digits[i] * weight2[i];
    }
    let secondCheck = sum % 11;
    secondCheck = secondCheck < 2 ? 0 : 11 - secondCheck;
    if (digits[13] !== secondCheck) return false;

    return true;
  }
}

class DoiProp {
  constructor(schemaName,propName) {
    const definitions = doiDefs[schemaName];
    if (!definitions) throw new Error("schemaName does not exist");
    if (typeof propName !== "string")
      throw new Error("propName is required and must be a string.")
    this.schema = definitions[propName];
    if (!this.schema)
      throw new Error(`Property ${propName} does not exist.`)
    this.name = propName;
    this.label = this.schema.description; 
    this.value = null;
    this.view = this.render();
  }

  forceValue(propValue) { this.value = propValue; }
  setValue(propValue) { this.value = this.validate(propValue); }

  validate(propValue) { // nullify invalid data
    if (typeof propValue !== this.schema.type) {
      return null;
    }
    if (this.schema.oneOf) {
      for (const option of this.schema.oneOf) {
        if (propValue === option.const) {
          return propValue;
        }
      }
      return null;
    }
    else {
      if (this.schema.maxLength
        && propValue.length > this.schema.maxLength) {
        return null;
      }
      if (this.schema.minLength
        && propValue.length < this.schema.minLength) {
        return null;
      }
      if (this.schema.format
        && !isFormatted(propValue,this.schema.format)) {
        return null;
      }
      return propValue;
    }

    function isFormatted(value,format) {
      if (format === "date") {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value)) return false;

        const date = new Date(value);
        if (isNaN(date.getTime())) return false;
        return true;
      }
      else if (format === "int32") {
        return (Number.isInteger(value)
          && 0< value && value < 100000000);
      }
      else throw new Error("Impossible flow.");
    }
  }

  render() {
    const container = new ColumnComponent();
    container.add(new LabelElement(this.label));
    let field;
    if (this.schema.oneOf) {
      field = new MenuInput();
      for (const option of this.schema.oneOf) field.add(option);
      field.html.addEventListener("change",
        () => this.setValue(field.value[0]));
    }
    else {
      if (this.schema.format === "date") 
        field = new DateInput();
      else if (this.schema.type === "boolean")
        field = new CheckboxInput();
      else if (this.schema.type === "number")
        field = new NumberInput();
      else if (this.schema.type === "string")
        field = new TextInput();
      else throw new Error("Invalid input type.");
      field.html.addEventListener("input",
        () => this.setValue(field.value));
    }
    container.add(field);
    return container;
  }
}

class DoiEntity {
  constructor(schemaName,requiredList) {
    if (!schemaName in doiDefs)
      throw new Error("schemaName not found");
    if (!requiredList || !requiredList.length)
      throw new Error("requiredList required");
    this.schemaName = schemaName;
    this.requiredList = requiredList;
    for (const propName of Object.keys(doiDefs[this.schemaName])) {
 //     console.log(propName);
      this.forceProp(propName,null);
    }
    this.view = this.render();
  }

  render() {
    const container = new ColumnComponent();
    container.add(new TextElement(this.schemaName))
    for (const propName of Object.keys(this)) {
      if (this[propName] instanceof DoiProp) {
        container.add(this[propName].view);
      }
    }
    return container;
  }

  forceProp(propName, propValue) {
    this[propName] = new DoiProp(
      this.schemaName, propName);
    this[propName].forceValue(propValue);
//    console.log(this[propName]);
  }

  setProp(propName, propValue) {
    this[propName] = new DoiProp(
      this.schemaName, propName);
    this[propName].setValue(propValue);
  }

  isComplete() {
    const requiredProps = new Set(this.requiredList);
    for (const propName in this) {
      const prop = this[propName];
      // ignore properties outside of schema
      if (!(prop instanceof DoiProp)) continue;
      if (!prop.validate(prop.value)) return false;
      if (requiredProps.has(prop.name)) {
        requiredProps.delete(prop.name);
      }
    }
    return requiredProps.size === 0;
  }

  isConsistent() { return true; }

  isValid() {
    return this.isComplete() && this.isConsistent();
  }
}

class Subject extends DoiEntity {
  static entity = "Subject";
  #representantes;
  constructor (position) {
    super(position,[
      "indicadorEspolio",
      "indicadorEstrangeiro",
      "indicadorNaoConstaParticipacaoOperacao",
      "indicadorNiIdentificado"
    ]);
    this.#representantes=new Set();
  }

  get representantes() {
    return Array.from(this.#representantes);
  }

  addRepresentante(ni) {
    if (CPF.validate(ni) || CNPJ.validate(ni)) {
      this.representantes.add(ni);
      return true;
    }
    return false;
  }

  removeRepresentante(ni) {
    this.representantes.delete(ni);
  }

  isConsistent() {
    return (this.indicadorNiIdentificado.value === true
      &&
      !this.representantes.includes(this.ni.value)
      &&
      (!this.indicadorEspolio.value
        || this.cpfInventariante.value)
      &&
      (!this.indicadorConjuge.value 
        || (this.indicadorCpfConjugeIdentificado.value
          && this.regimeBens.value))
    );
  }
}

class Alienante extends Subject {
  static entity = "Alienante";
  constructor() { super("Alienante"); }
}

class Adquirente extends Subject {
  static entity = "Adquirente";
  constructor() { super("Adquirente"); }
}

class Operacao {
  constructor() {
    this.total=0;
  }

  addPerson(person,fraction) {
    if (
      person instanceof Subject
      && typeof fraction === "number"
      && !this[person.ni.value]
      && fraction>0
      && fraction<=100) {
      this[person.ni.value]=fraction;
      this.total+=fraction;
    }
  }

  removePerson(ni) {
    if (this[ni]) {
      this.total-=this[ni];
      delete this[ni];
    }
  }

  isValid() {
    return (this.total>=98 && this.total <=100);
  }
}

class Imovel extends DoiEntity {
  #alienacao;
  #aquisicao;
  #outrosMunicipios;
  static entity = "Imovel";
  constructor() {
    super("Imovel",[
      "dataLavraturaRegistroAverbacao",
      "dataNegocioJuridico",
      "destinacao",
      "formaPagamento",
      "indicadorImovelPublicoUniao",
      "indicadorPagamentoDinheiro",
      "indicadorPermutaBens",
      "tipoDeclaracao",
      "tipoOperacaoImobiliaria",
      "tipoParteTransacionada",
      "tipoServico",
      "valorParteTransacionada"
    ]);
    this.#alienacao = new Operacao();
    this.#aquisicao = new Operacao();
    this.#outrosMunicipios = new Set();
  }

  get alienacao() { return this.#alienacao; }
  get aquisicao() { return this.#aquisicao; }
  get outrosMunicipios() {
    return Array.from(this.#outrosMunicipios);
  }

  setAlienante(alienanteObj,participacao) {
    if (this.#alienacao[alienanteObj.ni.value])
      this.#alienacao.removePerson(alienanteObj.ni.value);
    this.#alienacao.addPerson(alienanteObj,participacao)
  }

  removeAlienante(ni) { this.#alienacao.removePerson(ni); }

  setAdquirente(adquirenteObj,participacao) {
    if (this.#aquisicao[adquirenteObj.ni.value])
      this.#aquisicao.removePerson(adquirenteObj.ni.value);
    this.#aquisicao.addPerson(adquirenteObj,participacao)
  }

  removeAdquirente(ni) { this.#aquisicao.removePerson(ni); }

  addMunicipio(codigoIbge) {
    if (typeof codigoIbge === "string"
      && /^\d{7}$/.test(codigoIbge))
      this.#outrosMunicipios.add(codigoIbge);
  }

  removeMunicipio(codigoIbge) {
    if (typeof codigoIbge === "string"
      && /^\d{7}$/.test(codigoIbge))
      this.#outrosMunicipios.delete(codigoIbge);
  }

  isConsistent() {
    return (this.#alienacao.isValid()
      && this.#aquisicao.isValid());
  }
}

class Ato extends DoiEntity {
  #alienantes;
  #adquirentes;
  #imoveis;
  static entity = "Ato";
  constructor() {
    super("Ato",[
      "dataLavraturaRegistroAverbacao",
      "dataNegocioJuridico",
      "tipoDeclaracao",
      "tipoServico",
    ]);
    this.#alienantes = new Set();
    this.#adquirentes = new Set();
    this.#imoveis = new Set();
  }

  get alienantes() { return Array.from(this.#alienantes); };
  get adquirentes() { return Array.from(this.#adquirentes); };
  get imoveis() { return Array.from(this.#imoveis) };

  // TODO: implement render() which calls super.render(),
  // then appends alienante, adquirente, imovel renders
  // (Note: consider doing the same in those classes too)

  includeAlienante(alienanteObj) {
    if (alienanteObj instanceof Alienante 
      && alienanteObj.isValid()) {
      this.#alienantes.add(alienanteObj);
    }
  }

  getAlienanteByNi(ni) {
    for (const person of this.#alienantes) {
      if (person.ni.value == ni) return person;
    }
    return null;
  }

  removeAlienante(alienanteObj) {
    this.#alienantes.delete(alienanteObj);
  }

  includeAdquirente(adquirenteObj) {
    if (adquirenteObj instanceof Adquirente
      && adquirenteObj.isValid())
      this.#adquirentes.add(adquirenteObj);
  }

  getAdquirenteByNi(ni) {
    for (const person of this.#adquirentes) {
      if (person.ni.value == ni) return person;
    }
    return null;
  }

  removeAdquirente(adquirenteObj) {
    this.#adquirentes.delete(adquirenteObj);
  }

  addImovel(imovelObj) {
    if (imovelObj instanceof Imovel
      && imovelObj.isValid())
      this.#imoveis.add(imovelObj);
  }

  removeImovel(imovelObj) { this.#imoveis.delete(imovelObj); }

  // TODO: check if participating subjects do belong to act
  isConsistent() { return true; }

  generateDoi(imovel) {
    const doiObj = {};
    for (const prop in this) {
      if (this[prop] instanceof DoiProp) {
        doiObj[prop] = this[prop].value;
      }
    }
    for (const prop in imovel) {
      if (this[prop] instanceof DoiProp) {
        doiObj[prop] = imovel[prop].value;
      }
    }
    doiObj.alienantes=[];
    for (const ni in imovel.alienacao) {
      const alienante = { "participacao": imovel.alienacao[ni] };
      const person = this.getAlienanteByNi(ni);
      for (const prop in person) {
        if (prop instanceof DoiProp)
          alienante[prop.name] = person[prop].value;
      }
      doiObj.alienantes.push(alienante);
    }
    doiObj.adquirentes=[];
    for (const ni in imovel.aquisicao) {
      const adquirente = { "participacao": imovel.aquisicao[ni] };
      const person = this.getAdquirenteByNi(ni);
      for (const prop in person) {
        if (prop instanceof DoiProp)
          adquirente[prop] = person[prop].value;
      }
      doiObj.adquirentes.push(adquirente);
    }
    return doiObj;
  }
}

// BEGIN SCHEMA
const doiJson = `{
  "Adquirente": {
    "cpfConjuge": {
      "type": "string",
      "description": "Informar o CPF do cônjuge que consta no documento (título a ser registrado, matrícula/transcrição,escritura pública etc)",
      "minLength": 11,
      "maxLength": 11
    },
    "cpfInventariante": {
      "type": "string",
      "description": "CPF do Inventariante",
      "minLength": 11,
      "maxLength": 11
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
    "indicadorEspolio": {
      "type": "boolean",
      "description": "Informar se a aquisição foi feita em nome de espólio."
    },
    "indicadorEstrangeiro": {
      "type": "boolean",
      "description": "Informar se o adquirente (s) é estrangeiro"
    },
    "indicadorNaoConstaParticipacaoOperacao": {
      "type": "boolean",
      "description": "Indicador que sinaliza que o percentual de participação não consta nos documentos"
    },
    "indicadorNiIdentificado": {
      "type": "boolean",
      "description": "Informar se consta CPF da(s) parte(s) no documento (título a ser registrado, matrícula/transcrição, escritura pública etc)"
    },
    "indicadorRepresentante": {
      "type": "boolean",
      "description": "Indicador que sinaliza que o(s) alienante(s) outorgou (aram) mandato a pessoa física ou jurídica para representá-lo(s) na operação imobiliária informada pela serventia"
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
    "ni": {
      "type": "string",
      "description": "Identificador da parte",
      "minLength": 11,
      "maxLength": 14
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
    }
  },
  "Alienante": {
    "cpfConjuge": {
      "type": "string",
      "description": "Informar o CPF do cônjuge que consta no documento (título a ser registrado, matrícula/transcrição, escritura pública etc)",
      "minLength": 11,
      "maxLength": 11
    },
    "cpfInventariante": {
      "type": "string",
      "description": "CPF do Inventariante",
      "minLength": 11,
      "maxLength": 11
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
    "indicadorEspolio": {
      "type": "boolean",
      "description": "Informar se a aquisição foi feita em nome de espólio."
    },
    "indicadorEstrangeiro": {
      "type": "boolean",
      "description": "Informar se o adquirente (s) é estrangeiro"
    },
    "indicadorNaoConstaParticipacaoOperacao": {
      "type": "boolean",
      "description": "Indicador que sinaliza que o percentual de participação não consta nos documentos"
    },
    "indicadorNiIdentificado": {
      "type": "boolean",
      "description": "Informar se consta CPF da(s) parte(s) no documento (título a ser registrado, matrícula/transcrição, escritura pública etc)"
    },
    "indicadorRepresentante": {
      "type": "boolean",
      "description": "Indicador que sinaliza que o(s) alienante(s) outorgou (aram) mandato a pessoa física ou jurídica para representá-lo(s) na operação imobiliária informada pela serventia"
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
    "ni": {
      "type": "string",
      "description": "Identificador da parte",
      "minLength": 11,
      "maxLength": 14
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
    }
  },
  "Ato": {
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
    "existeDoiAnterior": {
      "type": "boolean",
      "description": "Informar se consta a expressão 'Emitida a DOI' no título registrado"
    },
    "folha": {
      "type": "string",
      "description": "Páginas/Folhas (indicar nº início-fim)",
      "maxLength": 7
    },
    "matriculaNotarialEletronica": {
      "type": "string",
      "description": "Informar a Matrícula Notarial Eletrônica (MNE). Formato: CCCCCCAAAAMMDDNNNNNNNNDD - A MNE deve ser validada através do DV informado, seguindo o algoritmo módulo 97 base 10, conforme norma ISO 7064:2023",
      "maxLength": 24
    },
    "naturezaTitulo": {
      "info" : "NaturezaTitulo",
      "type": "string",
      "description": "Informar a natureza do título registrado",
      "oneOf": [
        {
          "const": "1",
          "title": "Instrumento particular com força de escritura pública"
        },
        {
          "const": "2",
          "title": "Escritura Pública"
        },
        {
          "const": "3",
          "title": "Título Judicial"
        },
        {
          "const": "4",
          "title": "Contratos ou termos administrativos"
        },
        {
          "const": "5",
          "title": "Atos autênticos de países estrangeiros"
        }
      ]
    },
    "numeroLivro": {
      "type": "string",
      "description": "Informar o número do livro em que o ato foi escriturado ou o título foi registrado",
      "maxLength": 7
    },
    "retificacaoAto": {
      "type": "boolean",
      "description": "Informar se na operação atual houve retificação de ato anteriormente declarado"
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
    "tipoLivro": {
      "info" : "TipoLivro",
      "type": "string",
      "description": "Selecionar o livro em que o ato foi escriturado dentre as opções da caixa",
      "oneOf": [
        {
          "const": "1",
          "title": "Lv.2-Registro Geral(matrícula)"
        },
        {
          "const": "2",
          "title": "Transcrição das Transmissões"
        }
      ]
    }
  },
  "Imovel": {
    "areaConstruida": {
      "type": "number",
      "description": "Área Construída (m2). Informar de acordo com a matrícula. Até o limite de 12 inteiros e 4 casas decimais. Preenchimento em m2"
    },
    "areaImovel": {
      "type": "number",
      "description": "Área do lote urbano em m2 ou área do imóvel rural em ha conforme matrícula. (máx. 13 inteiros e 2 casas)."
    },
    "bairro": {
      "type": "string",
      "description": "Bairro do endereço do imóvel",
      "maxLength": 150
    },
    "cep": {
      "type": "string",
      "description": "CEP do endereço do imóvel",
      "maxLength": 8
    },
    "certidaoAutorizacaoTransferencia": {
      "type": "string",
      "description": "Informar o número da Certidão de Autorização para Transferência (CAT) emitida pela Secretaria de Patrimônio da União (SPU)",
      "maxLength": 11
    },
    "cib": {
      "type": "string",
      "description": "Informar o código do imóvel no Cadastro Imobiliário Brasileiro (CIB). Cálculo do DV quando os caracteres originais são exclusivamente numéricos:algoritimo utilizado pelo Nirf, segundo a regra do Módulo 11. Cálculo do DV quando os caracteres originais não são exclusivamente numéricos: a) para cada caractere codificado, o seu valor será multiplicado pela sequência de fatores 4,3,9,5,7,1, e 8; b) a soma dos produtos será dividida por 31",
      "maxLength": 8
    },
    "codigoIbge": {
      "type": "string",
      "description": "Informar o código IBGE do município onde se localiza o imóvel",
      "maxLength": 7
    },
    "codigoIncra": {
      "type": "string",
      "description": "Informar o código do imóvel no Sistema Nacional de Cadastro Rural (SNCR)",
      "maxLength": 13
    },
    "codigoNacionalMatricula": {
      "type": "string",
      "description": "Informar o Código Nacional de Matrícula (CNM). Formato: CCCCCCLNNNNNNNDD - O CNM informado será validado através do DV informado, seguindo o algoritmo módulo 97 base 10, conforme norma ISO 7064:2023",
      "maxLength": 16
    },
    "complementoEndereco": {
      "type": "string",
      "description": "Complemento do endereço do imóvel",
      "maxLength": 100
    },
    "complementoNumeroImovel": {
      "type": "string",
      "description": "Complemente do número do endereço do imóvel",
      "maxLength": 10
    },
    "denominacao": {
      "type": "string",
      "description": "Informar o nome do imóvel rural que consta no documento (título a ser registrado, matrícula/transcrição,escritura pública etc), caso exista",
      "maxLength": 200
    },
    "descricaoOutrasOperacoesImobiliarias": {
      "type": "string",
      "description": "Descrever a operação imobiliária se o valor selecionado na caixa for 'Outras Operações Imobiliárias'",
      "maxLength": 30
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
    "indicadorAreaConstruidaNaoConsta": {
      "type": "boolean",
      "description": "Indicador de que a área de construção do imóvel não consta nos Documentos"
    },
    "indicadorAreaLoteNaoConsta": {
      "type": "boolean",
      "description": "Indicador de que a área do imóvel não consta nos Documentos. Vide Observações"
    },
    "indicadorImovelPublicoUniao": {
      "type": "boolean",
      "description": "Informar se o imóvel objeto da operação imobiliária é imóvel público da União"
    },
    "indicadorNaoConstaValorBaseCalculoItbiItcmd": {
      "type": "boolean",
      "description": "Assinalar a caixa se o valor da base de cálculo do ITBI/ITCMD não constar do documento"
    },
    "indicadorNaoConstaValorOperacaoImobiliaria": {
      "type": "boolean",
      "description": "Assinalar a caixa se o valor da operação imobiliária não constar do documento"
    },
    "indicadorPagamentoDinheiro": {
      "type": "boolean",
      "description": "Informar se houve pagamento em dinheiro"
    },
    "indicadorPermutaBens": {
      "type": "boolean",
      "description": "Informar se houve permuta de bens na operação imobiliária"
    },
    "inscricaoMunicipal": {
      "type": "string",
      "description": "Código da inscrição imobiliária",
      "maxLength": 45
    },
    "localizacao": {
      "type": "string",
      "description": "Informar dados que possam ajudar na localização do imóvel, tais como: distrito, povoado, colônia, núcleo, rodovia/km, ramal, gleba, lote, etc. Exemplo: Partindo da Sede do Município,margem esquerda da BR 101, Km 60",
      "maxLength": 200
    },
    "matricula": {
      "type": "string",
      "description": "Informar o número de ordem da matrícula do imóvel",
      "maxLength": 7
    },
    "numeroRegistro": {
      "type": "string",
      "description": "Informar o número de ordem do registro do título",
      "maxLength": 30
    },
    "numeroRegistroAverbacao": {
      "type": "string",
      "description": "Informar o número do registro/averbação",
      "maxLength": 7
    },
    "mesAnoUltimaParcela": {
      "type": "string",
      "format": "date",
      "description": "Informar o mês e o ano de vencimento da última parcela para pagamento a prazo"
    },
    "nomeLogradouro": {
      "type": "string",
      "description": "Logradouro do endereço do imóvel",
      "maxLength": 150
    },
    "numeroImovel": {
      "type": "string",
      "description": "Número do endereço do imóvel",
      "maxLength": 10
    },
    "registroImobiliarioPatrimonial": {
      "type": "string",
      "description": "Informar a identificação do imóvel no cadastro da Secretaria de Patrimônio da União (SPU), ou seja, o número do Registro Imobiliário Patrimonial (RIP)",
      "minLength": 13,
      "maxLength": 13
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
          "const": "15",
          "title": "Adjudicação"
        },
        {
          "const": "19",
          "title": "Doação em Pagamento"
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
          "const": "55",
          "title": "Doação em adiantamento da legítima"
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
          "const": "67",
          "title": "Doação, exceto em Adiantamento de Legítima"
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
    "transcricao": {
      "type": "number",
      "format": "int32",
      "description": "Informar o número de ordem da transcrição. Até o limite de 8 inteiros"
    },
    "valorBaseCalculoItbiItcmd": {
      "type": "number",
      "description": "Informar o valor da base de cálculo do ITBI ou do ITCMD. Até o limite de 18 inteiros e 2 casas decimais"
    },
    "valorOperacaoImobiliaria": {
      "type": "number",
      "description": "Informar o valor da operação imobiliária. Até o limite de 18 inteiros e 2 casas decimais"
    },
    "valorPagoAteDataAto": {
      "type": "number",
      "description": "Informar o valor pago até a data do ato. Este campo somente deve ser  incluído se a opção 'A prazo' do campo 'forma de pagamento' for escolhida. Até o limite de 18 inteiros e 2 casas decimais"
    },
    "valorPagoMoedaCorrenteDataAto": {
      "type": "number",
      "description": "Informar o valor pago em espécie até a data do ato. Este campo somente deve ser  incluído se a informação no campo “indicadorPagamentoDinheiro” for True. Até o limite de 18 inteiros e 2 casas decimais"
    },
    "valorParteTransacionada": {
      "type": "number",
      "description": "Informar a quantidade de metros/hectares ou o percentual que foi objeto da operação imobiliária, conforme opção no campo tipoParteTransacionada. Até o limite de 18 inteiros e 2 casas decimais"
    }
  }
}`;
// END SCHEMA
const doiDefs=JSON.parse(doiJson);

class PropField { // with empty defaults
  constructor(id, doiProp) {
    if (!id) throw new Error("id required.");
    this.id = id;
    if (!(doiProp instanceof DoiProp))
      throw new Error("Fields must correspond to DOI props.");
    this.model = doiProp;
    this.validator = new ValidationMarker(`${id}-validator`);
    const schema = doiProp.schema;
    if (schema.oneOf) { // InputMenu
      this.options = {};
      for (const option of schema.oneOf)
        this.options[option.const] = option.value;
      this.view = new InputMenu(this.id, this.options);
      this.view.html.addEventListener("change", () => this.update());
    }
    else if (doiProp.schema.type === "boolean") { // CheckField
      this.view = new CheckboxInput(this.id);
      this.validator.html.style.display = "none"; // no ValidationMarker
    }
    else {
      if (schema.type === "string") {
        if (schema.format === "date") { // DateField
          this.view = new DateInput(this.id)
        }
        else this.view = new TextInput(this.id);
      }
      else if (doiProp.schema.type === "number") { // NumberField
        this.view = new NumberInput(this.id);
      }
      this.view.html.addEventListener("input", () => this.update());
    }
  }
  update() { 
    this.model.setValue(this.view.value);
    if (this.model.value) this.validator.accept();
    else this.validator.reject();
    return (this.model.value == null);
  }
  get container() {
    const container = document.createElement("div");
    const containerId = `${this.id}-label`;
    container.setAttribute("id", containerId);
    container.setAttribute("class", "PropField");
    const title = new Label(`${this.id}-label`, this.model.label);
    title.addToSection(containerId);
    this.view.addToSection(containerId);
    this.validator.addToSection(containerId);
    return container;
  }
//  register() { document.body.appendChild(this.container); }
  show() { this.view.show(); this.validator.show(); }
  hide() { this.view.hide(); this.validator.hide(); }
  toggle() { this.view.toggle(); this.validator.toggle(); }
}

class RepsBox { // MVC-in-one
  constructor(id) {
    if (!id) throw new Error("id required.");
    this.id = id;
    this.pager = new Pager(`${id}-pager`,[]);
    this.addRepPage();
  }

  addRepPage() {
    const newRepPage = document.createElement("div");
    newRepPage.setAttribute("class","RepPage");
    const label = new Label(`${this.id}-ni-label`,"CPF ou CNPJ");
    const input = new TextInput(`${this.id}-ni-input`,"");
    newRepPage.appendChild(label.html);
    newRepPage.appendChild(input.html);
    this.pager.add(newRepPage);
  }

  get reps() {
    const niList = [];
    for (const page of this.pager.pages) {
      const input = page.getElementsByTagName("input")[0];
      if (input.value && input.value.length > 0)
        niList.push(input.value);
    }
    return niList;
  }

  get container() {
    const container = document.createElement("div");
    const controls = document.createElement("span");
    controls.setAttribute("id",`${this.id}-controls`);
    controls.setAttribute("class","PagerControls");
    const prevButton = new ControlButton(`${this.id}-prev`,"←");
    prevButton.setAction(() => this.pager.previous());
    controls.appendChild(prevButton.html);
    const nextButton = new ControlButton(`${this.id}-next`,"→");
    nextButton.setAction(() => this.pager.next);
    controls.appendChild(nextButton.html);
    const addButton = new ControlButton(`${this.id}-add`,"+");
    addButton.setAction(() => this.addRepPage);
    controls.appendChild(addButton.html);
    const removeButton = new ControlButton(`${this.id}-remove`,"-");
    removeButton.setAction(() => this.pager.pop);
    controls.appendChild(removeButton.html);
    container.appendChild(this.pager.html);
    container.appendChild(controls);
    return container;
  }
}

class SubjectBox { 
  constructor(id, position) {
    if (!id)
      throw new Error("id required.");
    this.id = id;
    if (position === "Alienante")
      this.model = Alienante.model();
    else if (position === "Adquirente")
      this.model = Adquirente.model();
    else throw new Error("Invalid position.");
    this.position = position;
    const container = document.createElement("div");
    container.setAttribute("class","SubjectBox");
    this.view = [];
    for (const prop of Object.entries(this.model)) {
      if (prop instanceof DoiProp)
        this.view.push(new PropField(`${id}-${prop.name}`,prop));
    }
    this.reps = new RepsBox(`${id}-reps`);
  }

  get container() {
    const container = document.createElement("div");
    const containerId = `${this.id}-box`;
    container.setAttribute("id", containerId);
    container.setAttribute("class", "SubjectBox");
    const title =
      new TextComponent(`${this.id}-title`, this.position);
    title.addToSection(containerId);
    this.view.forEach((propField) => {
      container.appendChild(propField.container);
    });
    container.appendChild(this.reps.container);
    return container;
  }
}


class OperationBox { // Soon: 
  constructor(id, label) {
    if (!id) throw new Error("id required.");
    this.id = id;
    this.serial=0;
    this.label = label // Alienante or Adquirente
    this.pager = new Pager(`${id}-pager`,[]);
    this.subjects = [];
    this.addOpPage();
  }

  update(subjectList) { this.subjects = subjectList; }

  addOpPage() {
    const newOpPage = document.createElement("div");
    newOpPage.setAttribute("class","OpPage");
    const nilabel = new Label(
      `${this.id}-ni-label-${this.serial}`, this.label);
    const ni = new InputMenu(
      `${this.id}-subject-${this.serial}`, this.subjects);
    ni.html.setAttribute("class", "operation-subject");
    const partlabel = new Label(
      `${this.id}-part-label-${this.serial}`,"Participação");
    const part = new NumberInput(
      `${this.id}-part-${this.serial}`);
    this.serial+=1;
    part.html.setAttribute("class", "operation-part");
    newOpPage.appendChild(nilabel.html);
    newOpPage.appendChild(ni.html);
    newOpPage.appendChild(partlabel.html);
    newOpPage.appendChild(part.html);
    this.pager.add(newOpPage);
  }

  get operation() {
    const participations = {};
    for (const page of this.pager.pages) {
      const subject =
        page.getElementsByClassName(`operation-subject`)[0].value;
      const participation =
        page.getElementsByClassName(`operation-part`)[0].value;
      participations[subject] = participation;
    }
    return participations;
  }

  get container() {
    const container = document.createElement("div");
    const controls = document.createElement("span");
    controls.setAttribute("id",`${this.id}-controls`);
    controls.setAttribute("class","PagerControls");
    const prevButton = new ControlButton(`${this.id}-prev`,"←");
    prevButton.setAction(() => this.pager.previous());
    controls.appendChild(prevButton.html);
    const nextButton = new ControlButton(`${this.id}-next`,"→");
    nextButton.setAction(() => this.pager.next());
    controls.appendChild(nextButton.html);
    const addButton = new ControlButton(`${this.id}-add`,"+");
    addButton.setAction(() => this.addRepPage());
    controls.appendChild(addButton.html);
    const removeButton = new ControlButton(`${this.id}-remove`,"-");
    removeButton.setAction(() => this.pager.pop());
    controls.appendChild(removeButton.html);
    container.appendChild(this.pager.html);
    container.appendChild(controls);
    return container;
  }
}

class RealtyBox {
  constructor(id) {
    if (!id)
      throw new Error("id required.");
    this.model = Imovel.model();
    const container = document.createElement("div");
    container.setAttribute("class","RealtyBox");
    this.view = [];
    for (const prop of Object.entries(this.model)) {
      if (prop instanceof DoiProp)
        this.view.push(new PropField(`${id}-${prop.name}`,prop));
    }
    this.alienacao = new OperationBox(
      `${this.id}-alienacao`,"Alienante");
    this.aquisicao = new OperationBox(
      `${this.id}-aquisicao`,"Adquirente");
  }

  get container() {
    const container = document.createElement("div");
    const containerId = `${this.id}-box`;
    container.setAttribute("id", containerId);
    container.setAttribute("class", "RealtyBox");
    this.view.forEach((propField) => {
      container.appendChild(propField.container);
    });
    container.appendChild(this.alienacao.container);
    container.appendChild(this.aquisicao.container);
    return container;
  }
}

class App {
  constructor() {
    this.saveButton = new ControlButton("Salvar");
    this.resumeButton = new ControlButton("Carregar");
    this.downloadButton = new ControlButton("Download");
    this.uploadButton = new ControlButton("Upload");
    this.saveButton.setAction(() => this.save());
    this.resumeButton.setAction(() => this.resume());
    this.downloadButton.setAction(() => this.download());
    this.uploadButton.setAction(() => this.upload());
//    this.idlist = [];
    const act = new Ato();
    this.acts = [act];
    this.pager = new PagerComponent();
    this.pager.setDefault(act.view.html);
    this.pager.new();
    this.view = this.render();
  }

  new() {
    const act = new Ato();
    this.acts.push(act);
    this.pager.new();
  }

  add(act) {
    this.acts.push(act);
    this.pager.add(act.view.html);
  }

  load(doiList) { 
    const actIdList = [];
    const actList = [];
    for (const doi of doiList) {
      const actId = `${doi.numeroLivro}-${doi.folha}`;
      if (actIdList.has(actId))
        ato = actList[actIdList.indexOf(actId)];
      else {
        ato = new Ato();
        actList.push(ato);
        actIdList.push(actId);
      }
      const imovel = new Imovel();
      ato.addImovel(imovel);
      for (const propName in Object.keys(doi)) {
        if (propName === 'alienantes') {
          // TODO: add subject to ato and operation to imovel... 
        }
        else if (propName === 'adquirentes') {
          // TODO: add subject to ato and operation to imovel... 
        }
        else if (imovel.schema.hasOwnProperty(propName)) {
          imovel.setProp(propName, doi[propName]);
        }
        else if (ato.schema.hasOwnProperty(propName)) {
          ato.setProp(propName, doi[propName]);
        }
        else throw new Error("Unknown property.");
      }

    }
    for (const prop in doiObject) {
      if (this[prop] instanceof DoiProp) {
        doiObj[prop] = this[prop].value;
      }
    }
    for (const prop in imovel) {
      if (this[prop] instanceof DoiProp) {
        doiObj[prop] = imovel[prop].value;
      }
    }
    doiObj.alienantes=[];
    for (const ni in imovel.alienacao) {
      const alienante = { "participacao": imovel.alienacao[ni] };
      const person = this.getAlienanteByNi(ni);
      for (const prop in person) {
        if (prop instanceof DoiProp)
          alienante[prop.name] = person[prop].value;
      }
      doiObj.alienantes.push(alienante);
    }
    doiObj.adquirentes=[];
    for (const ni in imovel.aquisicao) {
      const adquirente = { "participacao": imovel.aquisicao[ni] };
      const person = this.getAdquirenteByNi(ni);
      for (const prop in person) {
        if (prop instanceof DoiProp)
          adquirente[prop] = person[prop].value;
      }
      doiObj.adquirentes.push(adquirente);
    }
    return doiObj;
  }

  render() {
    const container = new ColumnComponent;
    container.add(this.pager);
    container.add(this.saveButton);
    container.add(this.resumeButton);
    container.add(this.downloadButton);
    container.add(this.uploadButton);
    return container.html;
  }

  get object() {
    const doiObj = { "declaracoes": [] };
    for (const act of this.acts) {
      for (const imovel of act.imoveis) {
        doiObj.declaracoes.push(act.generateDoi(imovel));
      }
    }
    return doiObj;
  }

  save() { saveObject(this.object,"draftDoi"); }
  resume() { loadObject("draftDoi"); }
  download() { downloadObject(this.object,"doi.json"); }
  upload() { this.load(readJson("doi.json").declaracoes); }

  init() {
    document.getElementById("app").appendChild(this.view);
  }
}

const doimaker = new App();
doimaker.init();

