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
    const obj = JSON.parse(item);
    return obj;
  } catch (error) {
    throw(error);
  }
}

function downloadObject(obj,filename) {
  const content = JSON.stringify(obj,null,2);
  const file = new Blob([content], {type:'text/plain'});
  const url = URL.createObjectURL(file);

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

class UIComponent { // extend only
  static tag = "p";
  static className = "UIComponent";
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
  setId(id) { if (id) this.html.setAttribute("id",id); }
}

class DisplayElement extends UIComponent { // also extend only
  static tag = "p";
  static className = "DisplayElement";
  constructor(title) {
    super();
    this.title = title;
  }
  get title() { return this._title; }
  set title(newTitle) {
    this._title = newTitle ?? "[title]";
  }
}

class TextualElement extends DisplayElement {
  static tag = "p";
  static className = "TextualElement";
  constructor(title) {
    super(title);
    this.html.textContent = this.title; 
  }
  set title(newTitle) {
    this._title = newTitle ?? "[title]";
    this.html.textContent = this._title;
  }
}

class LabelElement extends TextualElement {
  static tag = "label";
  static className = "LabelElement";
}

class HElement extends TextualElement { // extend-only
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

class InputElement extends UIComponent {
  static tag = "input";
  static type = "text";
  static className = "InputElement";
  static isValid = (newInput) => {
    return (newInput != null);
  }
  #defaultValue;
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
    if (newInput == null || newInput === "") return false;
    const n = Number(newInput);
    return (Number.isFinite(n))
  };
  constructor(defaultValue) {
    super(defaultValue ?? 0);
  }
}

class DateInput extends InputElement {
  static type = "date";
  static className = "DateInput";
  static isValid = (newInput) => {
    return (newInput != null
      && typeof newInput === "string"
      && (newInput === ""
        || !isNaN(Date.parse(newInput)))
    );
  };
  constructor() {
    super("");
  }
}

class CheckboxInput extends UIComponent {
  static tag = "input";
  static className = "CheckboxInput";
  constructor() {
    super();
    this.html.setAttribute("type", "checkbox");
  }
  set value(newValue) {
    if (typeof newValue === "boolean")
      this.html.checked = newValue;
  }
  get value() {
    return this.html.checked;
  }
}

class MenuInput extends UIComponent {
  static tag = "select";
  static className = "MenuInput";
  constructor() {
    super();
    this.options = {};
    const voidOption = document.createElement("option");
    voidOption.value = "0";
    voidOption.textContent = "";
    this.html.appendChild(voidOption);
  }
  get value() { return this.html.value; }
  add(code, title) {
    if (code != null && title != null) {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = title;
      this.options[code]=option;
      this.html.appendChild(option);
    }
    else throw new Error("Invalid new option.");
  }
  remove(code) {
    if (this.options[code] == null)
      throw new Error("Option does not exist.");
    this.html.removeChild(this.options[code]);
    delete this.options[code];
  }
}

class FilePicker extends UIComponent {
  static tag = "input";
  static className = "FilePicker";
  constructor() {
    super();
    this.html.setAttribute("type", "file");
  }
  get file() {
    return this.html.files[0];
  }
}

class ControlButton extends UIComponent {
  static tag = "button";
  static className = "ControlButton";
  constructor(text) {
    super();
    this.html.setAttribute("type", "button");
    this.html.textContent = text ?? "Button";
  }
  setAction(actionFunction) {
    if (actionFunction instanceof Function) {
      this.html.addEventListener("click", actionFunction);
    }
  }
  trigger() { this.html.click(); }
}

class Block extends UIComponent {
  static tag = "div";
  static className = "Block";
  constructor() {
    super();
    this.items = [];
    this.last = -1;
  }
  add(newItem) {
    if (newItem?.ui) {
      this.items.push(newItem);
      this.html.appendChild(newItem.html);
      this.last += 1;
    }
    else throw new Error("Invalid new entry.");
  }
  remove(index) {
    if (index == null || index<0 || index>this.last)
      throw new Error("Invalid index.");
    this.html.removeChild(this.items[index].html);
    this.items.splice(index,1);
    this.last -= 1;
  }
  indexOf(item) {
    const index = this.items.indexOf(item);
    if (index === -1) throw new Error("Item not found.");
    return index;
  }
  removeItem(item) { this.remove(this.indexOf(item)); }
}

class Row extends Block {
  static tag = "div"; // each row takes up the whole width
  static className = "Row";
  add(newItem) {
    super.add(newItem);
    newItem.html.style.display = "inline";
  }
}

class Form extends Block {
  static tag = "div";
  static className = "Form";
  add(newItem) {
    super.add(newItem);
    newItem.html.style.display = "block";
  }
}

class DualPane extends UIComponent {
  static tag = "div";
  static className = "DualPane";
  constructor() {
    super();
    const left = new Block();
    this.setPane(left,"left");
    this.html.appendChild(left.html);
    const right = new Block();
    this.setPane(right,"right");
    this.html.appendChild(right.html);
  }
  setPane(pane,side) {
    if (pane == null || !pane.ui)
      throw new Error("Invalid pane.");
    this[side]=pane;
  }
  setLeft(pane) {
    this.setPane(pane,'left');
    this.html.replaceChild(pane.html, this.html.firstChild);
  }
  setRight(pane) {
    this.setPane(pane,'right');
    this.html.replaceChild(pane.html, this.html.lastChild);
  }
}

class ListEntry extends Row {
  static className = "ListEntry";
  constructor(line) {
    super();
    if (line == null || !line.ui)
      throw new Error("Invalid line.");
    this.line = line;
    this.add(line);
    this.delBtn = new ControlButton('-');
    // delete button action must be set by parent
    this.add(this.delBtn);
  }
}

class TitledBlock extends Block {
  static className = "TitledBlock";
  constructor(title) {
    super();
    this.titleLine = new Row();
    this.titleLine.html.classList.add("BlockTitle");
    this.title = new TextualElement(title ?? "[title]");
    this.titleLine.add(this.title);
    this.add(this.titleLine);
  }
}

class EditableList extends TitledBlock {
  static className = "EditableList";
  constructor(title) {
    super(title); 
    this.addBtn = new ControlButton('+');
    // addBtn action set by parent
    this.titleLine.add(this.addBtn);
    this.current = -1;
  }
  reset() {
    this.items.forEach((item)=>item.unpick());
  }
  select(index) {
    if (index == null || index<0 || index>this.last)
      throw new Error("Invalid index.");
    if (this.current >= 0)
      this.items[this.current].unpick();
    this.items[index].pick();
    this.current = index;
  }
  add(newEntry) {
    if (newEntry != null && newEntry instanceof ListEntry) {
      super.add(newEntry);
      newEntry.delBtn.setAction(() => this.removeItem(newEntry));
      newEntry.line.html.addEventListener("click",
        () => this.select(this.indexOf(newEntry)));
    }
    else throw new Error("Invalid list entry.")
  }
  remove(index) {
    super.remove(index);
    this.current = -1;
    this.reset();
  }
}

class PagerPane extends Block {
  static className = "Pager";
  constructor() {
    super();
    this.current = -1;
  }
  select(index) {
    if (this.last < 0) return;
    if (index == null || index<0 || index>this.last)
      throw new Error("Invalid index.");
    if (this.current >= 0)
      this.items[this.current].hide(); 
    this.items[index].show();
    this.current = index;
  }
  add(newPage) {
    super.add(newPage);
    newPage.hide();
  }
  remove(index) {
    super.remove(index);
    if (index < this.current) this.current -= 1;
    else if (index === this.current) {
      // list empty
      if (this.last < 0) this.current = -1;
      // list not empty, removed first
      else if (index === 0) this.select(0); 
      // list not empty, removed non-first
      else this.select(index-1);
    }
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

class PagerNav extends EditableList {
  static className = "PagerNav"
  constructor(title) {
    super(title);
    this.pane = new PagerPane();
    this.pageCounter = 0;
  }
  select(index) {
    if (index === 0) return;
    super.select(index);
    this.pane.select(index - 1);
  }
  add(page) {
    this.pane.add(page);
    const idLine = new TextualElement(++this.pageCounter);
    const entry = new ListEntry(idLine);
    super.add(entry);
  }
  remove(index) {
    super.remove(index);
    this.items.slice(1).forEach(
      (entry, i) => entry.line.html.textContent = i + 1
    );
    this.pane.remove(index-1); // indexing mismatch due to header
    this.pageCounter-=1;
  }
}

class Pager extends DualPane {
  static className = "Pager";
  constructor(title) {
    super();
    this.nav = new PagerNav(title);
    // nav.addBtn action set by parent
    this.setLeft(this.nav);
    this.setRight(this.nav.pane);
  }
  addPage(newPage) {
    if (newPage?.ui) this.nav.add(newPage);
    else throw new Error("Invalid new page.");
  }
  removeCurrent() {
    this.nav.remove(this.nav.current);
  }
}

