// LOCAL STORAGE LIBRARY 

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

// FRONTEND LIBRARY 

class UIElement { // extend only
  static tag = "p";
  static className = "UIElement";
  constructor() {
    this.ui = true;
    this.html = document.createElement(this.constructor.tag)
    this.html.classList.add(this.constructor.className);
  }
  show() { this.html.hidden = false; }
  hide() { this.html.hidden = true; }
  toggle() { this.html.hidden = !this.html.hidden; }
  pick() { this.html.classList.add("picked"); }
  unpick() { this.html.classList.remove("picked"); }
}

class DisplayElement extends UIElement {
  static tag = "p";
  static className = "UIElement";
  constructor(title) {
    super();
    this.title = title;
  }
  get title() { return this.#title; }
  set title(newTitle) {
    this.#title = newTitle ?? "[title]";
  }
}

class TextualElement extends DisplayElement {
  static tag = "p";
  static className = "UIElement";
  constructor(title) {
    super(title);
    this.html.textContent = title;
  }
}

class LabelElement extends TextualElement {
  static tag = "label";
  static className = "LabelElement";
}

class HElement extends TextualElement {
  static className = "HeaderElement";
}

class H1Element extends HElement { 
  static tag = "h1";
}

class H2Element extends HElement {
  static tag = "h2";
}

class H3Element extends HElement {
  static tag = "h3";
}

class InputElement extends UIElement {
  static tag = "input";
  static type = "text";
  static className = "InputElement";
  static isValid = (newInput) => {
    return true;
  }
  constructor(defaultValue) {
    super();
    this.html.setAttribute("type", this.constructor.type);
    this.defaultValue = defaultValue;
    this.value = defaultValue;
  }
  get value() { return this.html.value; }
  set value(newValue) {
    if (this.constructor.isValid(newValue))
      this.html.value = newValue;
    else throw new Error("Invalid value.");
  }
  get defaultValue() { return this.#defaultValue; }
  set defaultValue(newDefault) {
    if (this.constructor.isValid(newDefault))
      this.#defaultValue = newDefault;
    else throw new Error("Invalid default.");
  }
  reset() { this.html.value = this.defaultValue; }
  isValid() { return this.constructor.isValid(this.value); }
}

class TextInput extends InputElement { 
  static type = "text";
  static className = "TextInput";
  static isValid = (newInput) => {
    return (typeof newInput === "string");
  };
  constructor(defaultText) {
    super(defaultText);
  }
}

class NumberInput extends InputElement {
  static type = "number";
  static className = "NumberInput";
  static isValid = (newInput) => {
    return (typeof newInput === "number");
  };
  constructor(defaultValue) {
    super(defaultValue);
  }
}

class DateInput extends InputElement {
  static type = "date";
  static className = "DateInput";
  static isValid = (newInput) => {
    return (typeof newInput === "string"
      && !isNaN(Date.parse(newInput)));
  };
  constructor() {
    super("");
  }
}

class CheckboxInput extends UIElement {
  constructor() {
    super();
    this.html = document.createElement("input");
    this.html.setAttribute("type", "checkbox");
    this.html.classList.add("CheckboxInput");
  }
  get value() {
    return this.html.checked;
  }
}

class MenuInput extends UIElement {
  constructor() {
    super();
    this.options = {};
    this.html = document.createElement("select");
    this.html.classList.add("InputMenu");
    const voidOption = document.createElement("option");
    voidOption.value = 0;
    voidOption.textContent = "";
    this.html.appendChild(voidOption);
  }
  get value() { return this.html.value; }
  add(code, title) {
    if (code && title) {
      this.options[code] = document.createElement("option");
      option.value = code;
      option.textContent = title;
      this.html.appendChild(option);
    }
    else throw new Error("Invalid new option.");
  }
  remove(code) {
    this.html.removeChild(this.options[code]);
    delete this.options[code];
  }
}

class FilePicker extends UIElement {
  static tag = "input";
  static class = "FilePicker";
  constructor() {
    super();
    this.html.setAttribute("type", "file");
  }
  get file() {
    return this.html.files[0];
  }
}

class ControlButton extends UIElement {
  constructor(text) {
    super();
    this.html = document.createElement("button");
    this.html.setAttribute("type", "button");
    this.html.classList.add("ControlButton");
    this.html.textContent = text ?? "Button"
  }
  setAction(actionFunction) {
    if (actionFunction instanceof Function) {
      this.html.addEventListener("click", actionFunction);
    }
  }
  trigger() { this.html.dispatchEvent(new Event('click')); }
}

class UIComponent extends UIElement {
  constructor(id) { // id will be optional
    super();
    this.id = id;
    this.html.setAttribute("id", this.id);
  }
}

class Block extends UIComponent {
  static tag = "div";
  static className = "Block";
  constructor(id) {
    super(id);
    this.items = [];
  }
  add(newItem) {
    if (newItem.ui) {
      this.items.push(newItem);
      this.html.appendChild(newItem.html);
    }
    else throw new Error("Invalid new entry.");
  }
  remove(index) {
    if (index == null || index<0 || index>this.last)
      throw new Error("Invalid index.");
    this.html.removeChild(this.items[index].html);
    this.items.splice(index,1);
  }
  indexOf(item) {
    const index = this.items.indexOf(item);
    if (index === -1) throw new Error("Item not found.");
    return index;
  }
  removeItem(item) { this.remove(this.items.indexOf(item)); }
}

class Row extends Block {
  static tag = "span";
  static className = "Row";
  constructor(id) { super(id); }
  add(newItem) {
    super.add(newItem);
    newItem.html.style.display = "inline";
  }
}

class Form extends Block {
  static tag = "div";
  static className = "Form";
  constructor(id) { super(id); }
  add(newItem) {
    super.add(newItem);
    newItem.html.style.display = "block";
  }
}

class DualPane extends UIComponent {
  // TODO...
}

class ListEntry extends Row {
  // TODO... with embedded button as prop
}

class List extends Block {
  static tag = "div";
  static className = "List";
  constructor(id) {
    super(id); 
    this.current = null;
    this.last = -1;
  }
  reset() {
    this.items.forEach((item)=>item.unpick());
  }
  select(index) {
    if (index == null || index<0 || index>this.last)
      throw new Error("Invalid index.");
    this.items[index].pick();
    this.items[this.current].unpick();
    this.current = index;
  }
  add(newEntry) {
    // TODO...
  }
  remove(index) {
    // TODO...
    reset();
  }
}

class EditableList extends UIComponent {
  // TODO...
}

class Pager extends Block {
  static tag = "div";
  static className = "Pager";
  constructor(id) {
    super(id);
    this.current = null
    this.last = -1;
  }
  select(index) {
    if (index == null || index<0 || index>this.last)
      throw new Error("Invalid index.");
    this.items[this.current].hide();
    this.items[index].show();
    this.current = index;
  }
  add(newPage) {
    if (newItem.ui) {
      this.items.push(newItem);
      this.last += 1;
      newItem.hide();
      this.html.appendChild(newItem.html);
    }
    else throw new Error("Invalid new page.");
  }
  remove(index) {
    super.remove(index);
    this.last = this.items.length - 1;
    if (this.current === index && this.current > 0)
      this.select(this.current-=1);
  }
  toFirst() { this.select(0); }
  toLast() { this.select(this.last); }
  next() {
    if (this.current < this.last)
      this.select(this.current+1);
  }
  prev() {
    if (this.current > 0)
      this.select(this.current-1);
  }
}

class PagerNav extends UIComponent {
  static tag = "div";
  static className = "PagerComponent";
  constructor(id) {
    super(id);
    this.generate = null;
    this.pager = new Pager();
    this.html.appendChild(this.pager.html);
    this.controls = new Row();
    this.addBtn = new ControlButton("+");
    this.addBtn.setAction(this.addPage());
    this.delBtn = new ControlButton("-");
    this.delBtn.setAction(this.delPage());
    this.prevBtn = new ControlButton("<");
    this.prevBtn.setAction(this.pager.prev());
    this.nextBtn = new ControlButton(">");
    this.nextBtn.setAction(this.pager.next());
    this.controls.add(this.addBtn);
    this.controls.add(this.delBtn);
    this.controls.add(this.prevBtn);
    this.controls.add(this.nextBtn);
    this.html.appendChild(this.controls.html);
  }
  setFactory(factory) { // zero-arity factory
    if (factory instanceof Function)
      this.generate = factory;
  }
  addPage() {
    const newPage = this.generate();
    this.pager.add(newPage);
  }
  delPage() {
    this.pager.remove(this.pager.current);
  }
}

// -------- OLD:

class UIComponent extends UIElement {
  constructor(className) {
    super();
    this.name = null;
    this.value = null;
    this.items = null;
    this.html = document.createElement("div");
    this.html.classList.add(className ?? "UIComponent");
  }
  validate(content) {
    if (!content?.ui
      || (content?.items == null
        && (content?.name == null || content?.value == null)
      throw new Error("Invalid content.");
    return true;
  }
}

// UI COMPONENTS
// Every view must be one a component,
// as they return names and values
// which interface with the models
// *Conventions:
// => Everyone provides .name, .value, .items
// => Singletons have non-null .name, .value
// => Compounds have non-null .items[]
// => .items have non-null .items[] OR .name, .value

class ColumnComponent extends UIComponent { 
  constructor(className) {
    super(className ?? "ColumnComponent");
    this.items = [];
  }
  add(newItem) {
    if (newItem instanceof UIComponent) {
      newItem.html.style.display = "block";
      this.items.push(newItem);
      this.html.appendChild(newItem.html);
    }
  }
  remove(item) {
    if (!this.items.includes(item))
      throw new Error("Item not found");
    this.items.splice(this.items.indexOf(item),1);
    this.html.removeChild(item.html);
  }
}

class RowComponent extends UIComponent { 
  constructor(className) {
    super(className ?? "RowComponent");
    this.items = [];
  }
  add(newItem) {
    if (newItem instanceof UIComponent)) {
      newItem.html.style.display = "inline";
      this.items.push(newItem);
      this.html.appendChild(newItem.html);
    }
  }
  remove(item) {
    if (!this.items.includes(item))
      throw new Error("Item not found");
    this.items.splice(this.items.indexOf(item),1);
    this.html.removeChild(item.html);
  }
}

class EditableList extends ColumnComponent {
  constructor() { super("ListComponent"); }
  addItem(item) {
    if (item instanceof UIComponent) {
      const element = new RowComponent("ListEntry");
      element.add(item);
      const delButton = new ControlButton('x');

      // TODO: What?
      delButton.setAction(() => this.remove(element));

      element.add(delButton);
      this.items.push(element);
      this.html.appendChild(element.html);
    }
  }
}

class LabeledInput extends UIComponent {
  constructor(name,labelElement,inputElement) {
    super("LabeledInput");
    if (typeof name === "string") this.name = name;
    else throw new Error("Invalid name.");
    this.name = name;
    if (labelElement instanceof LabelElement) {
      this.label = labelElement;
      this.html.appendChild(labelElement.html);
    }
    else throw new Error("Invalid label element.");
    if (inputElement instanceof InputElement) {
      this.input = inputElement;
      this.html.appendChild(inputElement.html);
    }
    else throw new Error("Invalid input element.");
  }
}

class DualPane extends UIComponent {
  constructor() {
    super("DualPane");
    this.left = document.createElement("div");
    this.left.setAttribute("class","LeftPane");
    this.right = document.createElement("div");
    this.right.setAttribute("class","RightPane");
    this.container = document.createElement("div");
    this.container.setAttribute("class","DualPaneContainer");
    this.html = this.container.html;
  }
  setLeft(component) {
    if (this.validate(component)) {
      this.items[0] = component;
      component.html.style.display = "block";
      this.left.appendChild(component.html);
    }
  }
  setRight(component) {
    if (this.validate(component)) {
      this.items[1] = component;
      component.html.style.display = "block";
      this.right.appendChild(component.html);
    }
  }
}

class PagerComponent {
  constructor() {
    this.current = 0;
    this.pages = [];

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
  add(newPage) {
    let htmlPage = newPage;
    if (newPage.html) htmlPage = newPage.html;
    if (htmlPage instanceof Node) {
      this.pages.push(htmlPage);
      this.pageArea.appendChild(htmlPage);
      this.current = this.pages.length-1;
      this.select(this.current);
    }
    else throw new Error("Invalid new page.");
  }
  remove(index) {
    if (this.pages.length < 2) return;
    if (this.pages.length > index) {
      const deleted = this.pages[index];
      this.pages.splice(index,1);
      if (this.current == index) 
        this.select((this.current ? this.current : 1) -1);
      this.pageArea.removeChild(deleted);
    }
    else throw new Error("Invalid page index.");
  }
  del() { this.remove(this.current); }
  select(index) {
    if (index < 0 || index >= this.pages.length)
      throw new Error("Invalid page index.");
    for (const p in this.pages) {
      if (p != index) {
        this.pages[p].style.display = 'none';
      }
      else {
        this.pages[p].style.display = 'block';
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

// CONTROLLER

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
    const container = new ColumnComponent();
    container.add(this.pager);
    const controlRow = new RowComponent();
    controlRow.add(this.saveButton);
    controlRow.add(this.resumeButton);
    controlRow.add(this.downloadButton);
    controlRow.add(this.uploadButton);
    container.add(controlRow);
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

// ENTRYPOINT

const doimaker = new App();
//doimaker.init();

