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
  #title;
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
  static className = "TextualElement";
  constructor(title) {
    super(title);
    this.html.textContent = this.title;
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
    return (newInput !== null
      && typeof newInput === "string"
      && (newInput === ""
        || !isNaN(Date.parse(newInput))
      );
  };
  constructor() {
    super("");
  }
}

class CheckboxInput extends UIComponent {
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

class MenuInput extends UIComponent {
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
    this.html.textContent = text ?? "Button"
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
  static tag = "div"; // each row takes up the whole width
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
  constructor(id) {
    super(id);
    this.line = null;
    this.delBtn = new ControlButton('-');
    // delete button action must be set by parent
  }
  setLine(line) {
    if (line.ui) {
      this.html.innerHTML = "";
      this.line = line;
      this.add(line);
      this.add(this.delBtn);
    }
    else throw new Error("Invalid line content.");
  }
}

class EditableList extends Block {
  static tag = "div";
  static className = "List";
  constructor(title) {
    super(title); 
    this.header = new Row();
    this.header.html.classList.add("ListHeader");
    this.title = new TextualElement(title ?? "List");
    this.header.add(this.title);
    this.addBtn = new ControlButton('+');
    this.header.add(this.addBtn);
    // addBtn action set by parent
    this.html.appendChild(this.header); // beware...
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
    if (newEntry instanceof ListEntry) {
      super.add(newEntry);
      const index = this.items.length - 1;
      newEntry.delBtn.setAction(() => this.removeItem(newEntry));
      newEntry.line.html.addEventListener("click",
        this.select(index));
    }
    else throw new Error("Invalid list entry.")
  }
}

class PagerPane extends Block {
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

class PagerNav extends EditableList {
  static tag = "div";
  static className = "PagerNav"
  constructor(id) {
    super(id);
    this.pane = new PagerPane();
  }
}

class Pager extends UIComponent {
  static tag = "div";
  static className = "Pager";
  constructor(id) {
    super(id);
    this.nav = new PagerNav();
    // nav.addBtn action set by parent
    this.html.appendChild(this.nav.html);
    this.pager = new PagerPane();
    this.html.appendChild(this.pager.html);
  }
  addPage(newPage) {
    if (newPage.ui) {
      const newPage = this.generate();
      this.pager.add(newPage);
    }
    else throw new Error("Invalid new page.");
  }
  deleteCurrent() {
    this.pager.remove(this.pager.current);
  }
}

