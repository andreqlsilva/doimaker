// LOCAL STORAGE LIBRARY 

function saveObject(obj,key) {
  localStorage.setItem(key, JSON.stringify(obj));
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

