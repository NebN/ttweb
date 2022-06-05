import { stringIsEmpty } from '@/script/utils.js'
/**
 * Class used to avoid having to transform the input
 * from lines to string and viceversa continuously if not needed.
 */
class Text {

  _string = null
  _lines = null

  static fromString(string) {
    const t = new Text()
    t._string = string
    return t
  }

  static fromLines(lines) {
    const t = new Text()
    t._lines = lines
    return t
  }

  string() {
    if (this._string != null) {
      return this._string
    }
    this._string = this._lines.join('\n')
    return this.string()
  }

  lines() {
    if (this._lines != null) {
      return this._lines
    }
    this._lines = this._string.split('\n')
    return this.lines()
  }

  toString() {
    return this.string()
  }
}

class Flag {
  constructor(label, active) {
    this.label = label
    this.active = active
  }

  equals(that) {
    if (!that) {
      return false
    }
    
    return this.label === that.label && 
      this.active === that.active
  }
}
/**
 * Basically a function with Text as input and Text as output,
 * can be chained to other TextTransformation(s).
 */
class TextTransformation {
  flags = []

  apply(text) {
    return this._f(text)
  }

  chain(transformation) {
    if (transformation.isError()) {
      return transformation
    } else if (transformation.isEmpty()) {
      return this 
    } else {
      return new TextTransformationChain([this, transformation])
    }
  }

  toString() {
    throw new Error('toString not implemented')
  }

  isError() {
    return false
  }

  isEmpty() {
    return false
  }

  equals(that) {
    return that && this.toString() === that.toString()
  }

}

class InvalidTransformation extends TextTransformation {
  name = 'InvalidTransformation'

  constructor({ error: error }) {
    super()
    this.error = error
  }

  apply() {
    return Text.fromString(this.error)
  }

  chain(transformation) {
    if (!transformation.error) {
      return this
    } else {
      return new InvalidTransformation({ error: this.error + '\n' + transformation.error })
    }
  }

  isError() {
    return true
  }

  toString() {
    return 'InvalidTransformation ' + this.error
  }
}

class EmptyTransformation extends TextTransformation {
  name = 'EmptyTransformation'

  constructor() {
    super()
  }

  isEmpty() {
    return true
  }

  apply(text) {
    return text
  }

  toString() {
    return 'Nothing'
  }
}

class TextTransformationChain extends TextTransformation {
  name = 'TextTransformationChain'

  constructor(ts) {
    super()
    this._textTransformations = ts
  }

  chain(transformation) {
    if (!transformation.isEmpty()) {
      this._textTransformations.push(transformation)
    }
    return this
  }

  apply(text) {
    const errors = this._textTransformations.map(t => t.error).filter(t => Boolean(t))
    if (errors.length > 0) {
      return Text.fromLines(errors)
    } else {
      let res = text
      for (let i = 0; i < this._textTransformations.length; i++) {
        res = this._textTransformations[i].apply(res)
      }
      return res
    }
  }

  isError() {
    return this._textTransformations.some(t => t.isError())
  }

  toString() {
    return this._textTransformations.join(' | ')
  }
}

class Grep extends TextTransformation {
  name = 'Grep'

  constructor({ word: word }) {
    super()
    this.word = word
    this._f = text => Text.fromLines(text.lines().filter(line => line.includes(this.word)))
  }

  toString() {
    return 'Grep ' + this.word
  }
}

class Replace extends TextTransformation {
  name = 'Replace'


  constructor({ expression: expression, replacement: replacement }) {
    super()
    this.expression = expression
    const expressionRegex = new RegExp(expression, 'g')
    this.replacement = replacement
    this._f = text => Text.fromString(text.string().replace(expressionRegex, this.replacement.replace('\\n', '\n').replace('\\t', '\t')))
  }

  toString() {
    return 'Replace ' + this.expression + ' with ' + this.replacement
  }
}

class Sort extends TextTransformation {
  name = 'Sort'

  constructor() {
    super()
    this._f = text => Text.fromLines(text.lines().sort())
  }

  toString() {
    return 'Sort'
  }
}

class Distinct extends TextTransformation {
  name = 'Distinct'

  constructor() {
    super()
    this._f = text => Text.fromLines(Array.from(new Set(text.lines())))
  }

  toString() {
    return 'Distinct'
  }
}

class Strip extends TextTransformation {
  name = 'Strip'

  constructor() {
    super()
    this._f = text => Text.fromLines(text.lines().filter(line => line.trim()))
  }

  toString() {
    return 'Strip'
  }
}

class Join extends TextTransformation {
  name = 'Join'

  constructor({ joiner: joiner }) {
    super()
    this.joiner = joiner
    this._f = text => Text.fromString(text.lines().join(this.joiner))
  }

  toString() {
    return 'Join ' + this.joiner
  }
}

class Split extends TextTransformation {
  name = 'Split'

  constructor({ splitter: splitter }) {
    super()
    this.splitter = splitter
    this._f = text => Text.fromLines(text.string().split(this.splitter))
  }

  toString() {
    return 'Split ' + this.splitter
  }
}

export const transformations = [
  { 
    keyword: 'grep', parse: code => {
      const regex = /^\s*grep\s+"(.*?)"\s*/
      const matches = code.match(regex)
      const word = matches[1]
      return new Grep({ word: word }) 
    }
  },
  { 
    keyword: 'replace', parse: code => {
      const regex = /^\s*replace\s+"(.*?)"\s+with\s+"(.*?)"\s*/
      const matches = code.match(regex)
      const expression = matches[1]
      const replacement = matches[2]
      return new Replace({
        expression: expression, 
        replacement: replacement
      }) 
    }
  },
  { 
    keyword: 'sort', parse: () => {
      return new Sort() 
    }
  },
  { 
    keyword: 'distinct', parse: () => {
      return new Distinct() 
    }
  },
  { 
    keyword: 'strip', parse: () => {
      return new Strip() 
    }
  },
  { 
    keyword: 'join', parse: code => {
      const regex = /^\s*join\s+"(.*?)"\s*/
      const matches = code.match(regex)
      const joiner = matches[1]
      return new Join({ joiner: joiner }) 
    }
  },
  { 
    keyword: 'split', parse: code => {
      const regex = /^\s*split\s+"(.*?)"\s*/
      const matches = code.match(regex)
      const splitter = matches[1]
      return new Split({ splitter: splitter }) 
    }
  }
]

export function parseTransformation(code) {
  if (stringIsEmpty(code)) {
    return new EmptyTransformation()
  }

  try {
    const keyword = code.match(/^\s*(\w+)\s*/)[1] // index 1 is first capture group

    const t = transformations.find(t => t.keyword == keyword)

    if (t != null) {
      return t.parse(code)
    } else {
      return new InvalidTransformation({ error: keyword + ' is not a valid keyword' })
    }
  } catch (error) { // TODO custom error inside each transformation, with a better explanation of what is incorrect
    // console.log(error)
    return new InvalidTransformation({ error: code + ' is not a valid transformation\n' + error })
  }
}

export function transform(transformation, input) {
  if (transformation.error != null) {
    return transformation.error
  } else {
    return transformation.apply(Text.fromString(input)).string()
  }
}

export function serializeTransformation(transformation) {
  if (transformation.name == 'TextTransformationChain') {
    transformation._textTransformations.forEach(t => {
    })
  } 
  const stringified = JSON.stringify(transformation)
  return stringified
}

function deserializeParsed(parsed) {
  switch(parsed.name) {
    case 'EmptyTransformation':
      return new EmptyTransformation()
    case 'InvalidTransformation':
      return new InvalidTransformation(parsed)
    case 'Grep':
      return new Grep(parsed)
    case 'Replace':
      return new Replace(parsed)
    case 'Sort':
      return new Sort()
    case 'Distinct':
      return new Distinct()
    case 'Strip':
      return new Strip()
    case 'Join':
      return new Join(parsed)
    case 'Split':
      return new Split(parsed)
    case 'TextTransformationChain':
      const ts = parsed._textTransformations.map(t => deserializeParsed(t))
      return new TextTransformationChain(ts)
    default:
      console.log("can't deserialize 🤔", parsed)
  }
}

export function deserializeTransformation(serialized) {
  const parsed = JSON.parse(serialized)
  return deserializeParsed(parsed)
}