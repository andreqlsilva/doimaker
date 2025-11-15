// MODELS AND VIEWS 
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
    this._value = null;
    this.view = this.render();
  }

  forceValue(propValue) { 
    this.value = propValue;
  }
  setValue(propValue) {
    this.value = this.validate(propValue);
  }

  get value() {
    if (this.view.value != null)
      this._value = this.view.value;
    return this._value;
  }

  set value(newValue) {
    if (this.validate(newValue)) {
      this._value = newValue;
      this.view.value = newValue;
    }
  }

  validate(propValue) { // nullify invalid data
    if (typeof propValue !== this.schema.type) {
      return null;
    }
    if (this.schema.oneOf) {
      if (propValue < 0) return null;
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
    const label = new LabelElement(this.label);
    let field;
    if (this.schema.oneOf) {
      field = new MenuInput();
      for (const option of this.schema.oneOf) {
        field.add(option.const, option.title);
      }
      field.html.addEventListener("change",
        () => this.setValue(field.value));
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
    const container = new InputBlock(label,field);
    return container;
  }
}

class DoiEntity {
  constructor(schemaName,requiredList) {
    if (!(schemaName in doiDefs))
      throw new Error("schemaName not found");
    if (!requiredList || !requiredList.length)
      throw new Error("requiredList required");
    this.schemaName = schemaName;
    this.requiredList = requiredList;
    for (const propName of Object.keys(doiDefs[this.schemaName])) {
      this.forceProp(propName,null);
    }
  }

  render() { // assign to this.view (in subclasses only)
    const container = new Block();
    //container.add(new H3Element(this.schemaName))
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

class RepList { 
  constructor() {
    this.inputs = [];
    this.view = new EditableList("Representantes");
    this.view.addBtn.setAction(() => this.add(''));
  }
  get list() {
    const representantes = [];
    for (const rep of this.inputs) {
      const ni = rep.value;
      if (Subject.validate(ni))
        representantes.push({"ni": ni});
    }
    return representantes;
  }
  add(ni) {
    const label = new LabelElement("CPF ou CNPJ: ");
    const field = new TextInput(ni);
    this.inputs.push(field);
    const repLine = new Row();
    repLine.add(label)
    repLine.add(field)
    const newRep = new ListEntry(repLine)
    this.view.add(newRep);
    newRep.delBtn.setAction (() => {
      this.inputs.splice(this.view.indexOf(newRep),1);
      this.view.removeItem(newRep);
    });
  }
}

class Subject extends DoiEntity {
  static entity = "Subject";
  static validate = (ni) => {
    return (CPF.validate(ni) || CNPJ.validate(ni));
  }
  constructor (position) {
    super(position,[
      "indicadorConjuge",
      "indicadorEspolio",
      "indicadorEstrangeiro",
      "indicadorNaoConstaParticipacaoOperacao",
      "indicadorNiIdentificado",
      "indicadorRepresentante"
    ]);
    this.reps = new RepList();
    this.view = this.render();
  }

  get representantes() {
    return this.reps.list;
  }

  render() {
    const container = super.render();
    container.add(this.reps.view);
    return container;
  }

  isConsistent() {
    return (this.indicadorNiIdentificado.value === true
      &&
      !this.representantes.some(rep => rep.ni === this.ni.value)
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

class SubjectList {
  constructor(title) {
    if (title === "Alienantes")
      this.position = "Alienante";
    else if (title === "Adquirentes")
      this.position = "Adquirente";
    else
      throw new Error("Invalid position.");
    this.pager = new Pager(title);
    this.items = new Map();
    this.menu = new MenuInput();
    this.menuEntries = new Map();
    this.menuCounter = 0;
    this.pager.addBtn.setAction(() => {
      this.add(new Subject(this.position));
    });
  }
  get view() { return this.pager; }
  get list() {
    const validSubjects = []; // TODO: validation? (here?)
    for (const subjectView of this.pager.pane.items) {
      const subj = this.items.get(subjectView);
      validSubjects.push(subj);
    }
    return validSubjects;
  }
  add(newSubj) {
    this.items.set(newSubj.view,newSubj);
    const currentNi = newSubj.ni.value || '';
    this.menu.add(this.menuCounter, currentNi);
    this.menuEntries.set(newSubj,this.menuCounter++);
    newSubj.ni.view.field.html.addEventListener("change", () => {
      this.menu.update(
        this.menuEntries.get(newSubj),
        newSubj.ni.value
      );
    });
    this.pager.addPage(newSubj.view);
    const newEntry = this.pager.nav.items[this.pager.nav.last];
    newEntry.delBtn.addAction(() => {
      this.items.delete(newSubj.view);
      this.menu.remove(this.menuEntries.get(newSubj));
      this.menuEntries.delete(newSubj);
    });
  }
  getSubjectByNi(ni) {
    for (const subject of this.items.values())
      if (subject.ni.value === ni) return subject;
  }
}

class Operacao {
  constructor(title,subjList) {
    this.inputs = new Map();
    this.menu = subjList.menu;
    const validTitle = title==null ? "Operação" : title;
    this.view = new EditableList(validTitle);
    this.view.addBtn.setAction (() => this.add());
  }
  get total() {
    let sum=0;
    for (const [subject, participation] of this.inputs.entries()) {
      sum+=Number(participation.value);
    }
    return sum;
  }
  get list() {
    const operacao = {};
    for (const subject of this.inputs.keys()) {
      const selectedId = subject.value;
      const selectedOption = subject.options[selectedId];
      if (!selectedId || !selectedOption) continue;
      const choice = selectedOption.textContent;
      const fraction = Number(this.inputs.get(subject).value);
      if (this.validate(choice,fraction))
        operacao[choice] = fraction;
    }
    return operacao;
  }
  add(loadedNi,loadedFraction) {
    const label1 = new LabelElement("Participante: ");
    const subject = new MenuInput();
    const populate = () => {
      subject.reset();
      Object.values(this.menu.options).forEach((option) => {
        subject.add(option.value, option.textContent);
      });
    }
    subject.html.addEventListener("click", () => {
      const previous = subject.value;
      populate();
      if (previous) subject.value = previous;
    });
    const label2 = new LabelElement("%: ");
    const participation = new NumberInput(loadedFraction);
    if (loadedNi) {
      populate();
      const matchingOption = Object.values(subject.options).find(
        opt => opt.textContent === loadedNi
      );
      if (matchingOption) subject.value = matchingOption.value;
    }
    this.inputs.set(subject, participation);
    const line = new Row();
    line.add(label1); line.add(subject);
    line.add(label2); line.add(participation);
    const newOp = new ListEntry(line);
    this.view.add(newOp);
    newOp.delBtn.setAction (() => {
      this.inputs.delete(subject);
      this.view.removeItem(newOp);
    });
  }
  validate(ni,fraction) {
    if (Subject.validate(ni)
        && typeof fraction === "number"
        && fraction>0 && fraction<=100)
      return true;
    else return false;
  }
  isValid() {
    return (this.total>=98 && this.total <=100);
  }
}

class MunicipioList {
  constructor() {
    const label = new LabelElement("Município: ");
    const field = new MenuInput();
    for (const codigo of Object.keys(municipiosIbge)) {
      field.add(codigo.substring(1),
        municipiosIbge[codigo][0]+'/'+municipiosIbge[codigo][1]);
    }
    this.view = new InputBlock(label,field);
  }
  get value() { return this.view.value; }
  set value(newCode) { this.view.value = newCode; }
}

class Imovel extends DoiEntity {
  static entity = "Imovel";
  constructor(alienantes, adquirentes) {
    super("Imovel",[
      "destinacao",
      "formaPagamento",
      "indicadorImovelPublicoUniao",
      "indicadorPagamentoDinheiro",
      "indicadorPermutaBens",
      "tipoOperacaoImobiliaria",
      "tipoParteTransacionada",
      "tipoServico",
      "valorParteTransacionada"
    ]);
    this.codigoIbge = new MunicipioList();
    this.alienantes = alienantes;
    this.adquirentes = adquirentes;
    this.alienacao = new Operacao("Alienação",this.alienantes);
    this.aquisicao = new Operacao("Aquisição",this.adquirentes);
    // this.outrosMunicipios = new MunicipioList();
    this.view = this.render();
  }

  
  get subjects() { return [
      ...this.adquirentes.list,
      ...this.alienantes.list
  ];}
  
  participantes(operacao) {
    const parts = [];
    const op = operacao.list;
    for (const ni of Object.keys(op)) {
      const subj = this.subjects.find(s => s.ni.value === ni);
      if (subj != null) {
        const part = { "ni": ni, participacao: op[ni] }
        for (const prop of Object.keys(subj)) {
          if (subj[prop] instanceof DoiProp) {
            if (subj[prop].value != 0
              || subj.requiredList.includes(prop))
              part[prop] = subj[prop].value;
          }
        }
        // business rules for subjects
        if (part.ni.length === 14) {
          delete part.indicadorConjuge;
        }
        if (part.indicadorConjuge) {
          if (!part.indicadorCpfConjugeIdentificado)
            part.indicadorCpfConjugeIdentificado = false;
          part.indicadorConjugeParticipa = false;
        }
        if (part.indicadorRepresentante) {
          part.representantes = subj.representantes;
        }
        parts.push(part);
      }
    }
    return parts;
  }

  get doi() {
    const doi = { "codigoIbge": this.codigoIbge.value };
    for (const propName of Object.keys(doiDefs[this.schemaName])) {
      if (this[propName].value!= 0
        || this.requiredList.includes(propName))
        doi[propName] = this[propName].value;
    }
    if (this.formaPagamento.value === "7")
      doi.indicadorAlienacaoFiduciaria = false;
    doi.alienantes = this.participantes(this.alienacao);
    doi.adquirentes = this.participantes(this.aquisicao);
    return doi;
  }

  render() {
    const container = new TitledBlock("Operação imobiliária");
    container.add(this.alienacao.view);
    container.add(this.aquisicao.view);
    container.add(this.codigoIbge.view);
    container.add(super.render());
    //TODO: add outrosMunicipios
    return container;
  }

  /*
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
*/
  isConsistent() {
    return (this.alienacao.isValid()
      && this.aquisicao.isValid());
  }
}

class ImovelList {
  constructor(act) {
    this.pager = new Pager("Imóveis");
    this.items = new Map();
    this.alienantes = act.alienantes;
    this.adquirentes = act.adquirentes;
    this.pager.addBtn.setAction(() =>
      this.add(new Imovel(this.alienantes, this.adquirentes)));
  }
  get view() { return this.pager; }
  get list() {
    const validImoveis = [];
    for (const imovelView of this.pager.pages.values()) {
      validImoveis.push(this.items.get(imovelView));
    }
    return validImoveis;
  }
  add(newImovel) {
    this.items.set(newImovel.view,newImovel);
    this.pager.addPage(newImovel.view);
    const newEntry = this.pager.nav.items[this.pager.nav.last];
    newEntry.delBtn.addAction(() => {
      this.items.delete(newImovel.view);
    });
  }
}

class Ato extends DoiEntity {
  static entity = "Ato";
  constructor() {
    super("Ato",[
      "dataLavraturaRegistroAverbacao",
      "dataNegocioJuridico",
      "tipoDeclaracao",
      "tipoServico",
    ]);
    this.alienantes = new SubjectList("Alienantes");
    this.adquirentes = new SubjectList("Adquirentes");
    this.imoveis = new ImovelList(this);
    this.view = this.render();
  }

  get alienantesList() { return this.alienantes.list; }
  get adquirentesList() { return this.adquirentes.list; }
  get imoveisList() { return this.imoveis.list; };
  get declaracoes() {
    const declaracoes = [];
    const doiList = this.imoveisList;
    const atoDoi = {};
    for (const propName of Object.keys(doiDefs[this.schemaName])) {
      if (this[propName].value != 0
          || this.requiredList.includes(propName)) {
          atoDoi[propName] = this[propName].value;
      }
    }
    for (const imovel of doiList) {
      declaracoes.push({...atoDoi, ...imovel.doi});
    }
    return declaracoes;
  }

  render() {
    const container = super.render();
    container.add(this.alienantes.view);
    container.add(this.adquirentes.view);
    container.add(this.imoveis.view);
    return container;
  }

  json() {
    return JSON.stringify({ "declaracoes": this.declaracoes });
  }

  // TODO
  isConsistent() { return true; }
}

// GLOBAL AND ENVIRONMENT VARIABLES

const doiDefs=JSON.parse(doiJson);

// CONTROLLER

class DoiMaker {
  constructor() {
    this.pager = new Pager("Atos");
    this.nav = this.pager.nav;
    this.entries = this.pager.nav.items;
    this.items = new Map();
    this.pager.addBtn.setAction(() => {
      const newAct = new Ato();
      this.items.set(newAct.view,newAct);
      this.pager.addPage(newAct.view);
      const newEntry = this.entries[this.nav.last];
      newEntry.delBtn.addAction(() => {
        this.items.delete(newAct.view); 
      });
    });
    this.saveButton = new ControlButton("Salvar");
    this.resumeButton = new ControlButton("Carregar");
    this.downloadButton = new ControlButton("Download");
    this.filePicker = new JsonFilePicker();
    this.uploadButton = new ControlButton("Upload");
    this.saveButton.setAction(() => this.save());
    this.downloadButton.setAction(() => this.download());
    this.resumeButton.setAction(() => this.resume());
    this.uploadButton.setAction(() => this.filePicker.trigger());
    this.filePicker.setAction(async () => this.upload());
    this.btnLine = new Row();
    this.btnLine.add(this.saveButton);
    this.btnLine.add(this.resumeButton);
    this.btnLine.add(this.downloadButton);
    this.btnLine.add(this.filePicker);
    this.filePicker.hide();
    this.btnLine.add(this.uploadButton);
    this.container = new TitledBlock("DOImaker");
    this.resetButton = new ControlButton("Reset");
    this.resetButton.addClass("ResetButton");
    this.colorButton = new ControlButton("🌗");
    this.colorButton.addClass("ColorButton");
    this.resetButton.setAction(() => this.empty());
    this.colorButton.setAction(() => this.switchColor());
    this.container.titleLine.add(this.resetButton);
    this.container.titleLine.add(this.colorButton);
    this.container.add(this.pager);
    this.container.add(this.btnLine);
  }
  get view() { return this.container; }
  get object() {
    const doiJson = [];
    for (const act of this.items.values()) {
      // TODO: maybe validate before this
      act.declaracoes.forEach((dec) => doiJson.push(dec));
    }
    return { "declaracoes": doiJson };
  }

  load(doiList) {
    this.empty();
    const acts = {}; // Livro+Folha
    doiList.forEach( (doi) => {
      const actId = doi.numeroLivro+':'+doi.folha;
      if (!acts[actId]) {
        const newAct = new Ato();
        for (const prop of Object.keys(newAct)) {
          if (newAct[prop] instanceof DoiProp)
            newAct[prop].setValue(doi[prop]);
        }
        newAct._subjectCache = {};
        acts[actId] = newAct;
      }
      const subjects = acts[actId]._subjectCache;
      doi.alienantes.forEach( (alienante) => {
        const ni = alienante.ni;
        if (!subjects[ni]) {
          const newAlienante = new Alienante();
          for (const prop of Object.keys(newAlienante)) {
            if (newAlienante[prop] instanceof DoiProp)
              newAlienante[prop].setValue(alienante[prop]);
          }
          if (alienante.representantes) {
            for (const rep of alienante.representantes)
            newAlienante.reps.add(rep.ni);
          }
          subjects[ni] = newAlienante;
          acts[actId].alienantes.add(newAlienante);
        }
      });
      doi.adquirentes.forEach( (adquirente) => {
        const ni = adquirente.ni;
        if (!subjects[ni]) {
          const newAdquirente = new Adquirente();
          for (const prop of Object.keys(newAdquirente)) {
            if (newAdquirente[prop] instanceof DoiProp)
              newAdquirente[prop].setValue(adquirente[prop]);
          }
          if (adquirente.representantes) {
            for (const rep of adquirente.representantes)
            newAdquirente.reps.add(rep.ni);
          }
          subjects[ni] = newAdquirente;
          acts[actId].adquirentes.add(newAdquirente);
        }
      });
      const newImovel = new Imovel(acts[actId].alienantes,
        acts[actId].adquirentes);
      newImovel.codigoIbge.value = doi.codigoIbge;
      for (const prop of Object.keys(newImovel)) {
        if (newImovel[prop] instanceof DoiProp) {
          newImovel[prop].setValue(doi[prop]);
        }
      }
      doi.alienantes.forEach( (alienante) => {
        newImovel.alienacao.add(alienante.ni,
          alienante.participacao);
      });
      doi.adquirentes.forEach( (adquirente) => {
        newImovel.aquisicao.add(adquirente.ni,
          adquirente.participacao);
      });
      acts[actId].imoveis.add(newImovel);
    });
    for (const act of Object.values(acts)) {
      this.items.set(act.view,act);
      this.pager.addPage(act.view);
      const newEntry = this.entries[this.nav.last];
      newEntry.delBtn.addAction(() => {
        this.items.delete(act.view); 
      });
    }
  }

  get json() { return JSON.stringify(this.object); }
  save() { saveObject(this.object,"draftDoi"); }
  download() { downloadObject(this.object,"doi.json"); }
  resume() { this.load(loadObject("draftDoi").declaracoes); }
  async upload() {
    const file = this.filePicker.file;
    if (!file) {
      console.log("No file selected.");
      return;
    }
    try {
      const obj = await readJson(file);
      if (obj && obj.declaracoes) {
        this.load(obj.declaracoes);
      }
      else {
        console.error("No DOI found.");
      }
    } catch (error) {
      console.error("Couldn't read file:", error);
    }
  }

  empty() {
    this.pager.empty();
    this.items = new Map();
  }

  switchColor() { document.body.classList.toggle("dark-mode"); }

  init() {
    document.getElementById("app").appendChild(this.view.html);
  }
}

// ENTRYPOINT

const doimaker = new DoiMaker();
doimaker.init();

