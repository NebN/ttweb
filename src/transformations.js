/**
 * Class used to avoid having to transform the input
 * from lines to string and viceversa continuously if not needed.
 */
class Text {

  #_string = null
  #_lines = null

  static fromString(string) {
    let t = new Text()
    t.#_string = string
    return t
  }

  static fromLines(lines) {
    let t = new Text()
    t.#_lines = lines
    return t
  }

  string() {
    if (this.#_string != null) {
      return this.#_string
    }
    this.#_string = this.#_lines.join('\n')
    return this.string()
  }

  lines() {
    if (this.#_lines != null) {
      return this.#_lines
    }
    this.#_lines = this.#_string.split('\n')
    return this.lines()
  }

  toString = function () {
    return this.string();
  }
}

class Flag {
  constructor(label, active) {
    this.label = label
    this.active = active
  }
}
/**
 * Basically a function with Text as input and Text as output,
 * can be chained to other Transformation(s).
 */
class Transformation {
  flags = []

  apply(text) {
    if (this.error != null) {
      throw new Error(this.error)
    }
    return this._f(text)
  }

  chain(transformation) {
    if (this.error != null) {
      return this
    }
    if (transformation.error != null) {
      return transformation
    }
    return new CustomTransformation(t => transformation.apply(this.apply(t)))
  }

}

class InvalidTransformation extends Transformation {
  constructor(error) {
    super()
    this.error = error
  }
}

class CustomTransformation extends Transformation {
  constructor(f) {
    super()
    this._f = f
  }
}

class Grep extends Transformation {
  constructor(code) {
    super()
    let regex = /^\s*grep\s+"(.*?)"\s*/
    let matches = code.match(regex)
    let word = matches[1]
    this._f = text => Text.fromLines(text.lines().filter(line => line.includes(word)))
    this.flags = [
      new Flag('i', false),
      new Flag('o', false),
      new Flag('v', false)
    ]
  }
}

class Replace extends Transformation {
  constructor(code) {
    super()
    const regex = /^\s*replace\s+"(.*?)"\s+with\s+"(.*?)"\s*/
    const matches = code.match(regex)
    const expression = new RegExp(matches[1], 'g')
    const replacement = matches[2]
    this._f = text => Text.fromString(text.string().replace(expression, replacement.replace('\\n', '\n').replace('\\t', '\t')))
  }
}

class Sort extends Transformation {
  constructor() {
    super()
    this._f = text => Text.fromLines(text.lines().sort())
    this.flags = [
      new Flag('r', false)
    ]
  }
}

class Distinct extends Transformation {
  constructor() {
    super()
    this._f = text => Text.fromLines(Array.from(new Set(text.lines())))
  }
}

class Strip extends Transformation {
  constructor() {
    super()
    this._f = text => Text.fromLines(text.lines().filter(line => line.trim()))
  }
}

  /**
   * join
   * split
   * prepend/append
   * groups?
   * format
   * keep
   * remove
   * cut
   */

  
export default {

  transformations: [
    { keyword: 'grep', transformation: code => new Grep(code) },
    { keyword: 'replace', transformation: code => new Replace(code) },
    { keyword: 'sort', transformation: code => new Sort(code) },
    { keyword: 'distinct', transformation: code => new Distinct(code) },
    { keyword: 'strip', transformation: code => new Strip(code) }
  ],

  parseTransformation(code) {

    try {
      const keyword = code.match(/^\s*(\w+)\s*/)[1] // index 1 is first capture group

      const t = this.transformations.find(t => t.keyword == keyword)

      if (t != null) {
        return t.transformation(code)
      } else {
        return new InvalidTransformation(keyword + ' is not a valid keyword')
      }
    } catch (error) { // TODO custom error inside each transformation, with a better explanation of what is incorrect
      return new InvalidTransformation(code + ' is not a valid transformation\n' + error)
    }
  },

  transform(transformation, input) {
    if (transformation.error != null) {
      return transformation.error
    }
    if (!input) {
      return ''
    }
    try {
      return transformation.apply(Text.fromString(input)).string()
    } catch (error) {
      return error
    }
  }
}