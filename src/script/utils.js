import { h } from 'vue'
import { NAlert } from 'naive-ui'

export function stringIsEmpty(string) {
  return (string == null || string.length == 0 || string.trim().length == 0)
}

export function arrayEquals(a, b) {
  if (a === b) {
    return true
  }
  
  if (a.length != b.length) {
    return false
  }
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] != b[i]) {
        return false
    }
  }

  return true
}

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
function cyrb53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
  h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1>>>0);
}

export function objectEquals(a, b, equalityFunction = (o1, o2) => o1 === o2) {
  return (a == null) == (b == null) && (a == null || equalityFunction(a, b))
}

export const renderMessage = (props) => {
  const { type } = props;
  return h(NAlert, {
      closable: props.closable,
      onClose: props.onClose,
      type: type === "loading" ? "default" : type,
      title: props.content,
      style: {
      boxShadow: "var(--n-box-shadow)",
      maxWidth: "calc(100vw - 32px)",
      width: "480px"
      },
  }, {
      default: () => null
  });
};

export function readFile(file, finishedCallback, progressCallback=null) {
  const reader = new FileReader();

  if (progressCallback != null) {
    reader.onprogress = e => {
      progressCallback(e.loaded / e.total)
    }
  }
  
  reader.onload = e => {
    finishedCallback(e.target.result)
  }

  reader.readAsText(file)
}