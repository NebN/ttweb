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

/**
 * Basically a function with Text as input and Text as output,
 * can be chained to other Transformation(s).
 */
class Transformation {
  constructor(f, error=null) {
    this._f = f
    this.error = error
  }

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
    return new Transformation(t => transformation.apply(this.apply(t)))
  }

  static error(message) {
    return new Transformation(null, message)
  }
}

function replace(code) {
  let regex = /^\s*replace\s+"(.*?)"\s+with\s+"(.*?)"\s*/
  let matches = code.match(regex)
  let expression = new RegExp(matches[1], 'g')
  let replacement = matches[2]
  return new Transformation(text => Text.fromString(text.string().replace(expression, replacement.replace('\\n', '\n').replace('\\t', '\t'))))
}

function grep(code) {
  let regex = /^\s*grep\s+"(.*?)"\s*/
  let matches = code.match(regex)
  let word = matches[1]
  return new Transformation(text => Text.fromLines(text.lines().filter(line => line.includes(word))))
}

function sort() {
  return new Transformation(text => Text.fromLines(text.lines().sort()))
}

function distinct() {
  return new Transformation(text => Text.fromLines(Array.from(new Set(text.lines()))))
}

function strip() {
  return new Transformation(text => Text.fromLines(text.lines().filter(line => line.trim())))
}

const transformations = [
  {keyword: 'replace', f: replace },
  {keyword: 'grep', f: grep },
  {keyword: 'sort', f: sort },
  {keyword: 'distinct', f: distinct },
  {keyword: 'strip', f: strip }
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
]

export default {

  keywords: transformations.map(t => t.keyword),

  parseTransformation(code) {

    try {
      const keyword = code.match(/^\s*(\w+)\s*/)[1] // index 1 is first capture group

      const t = transformations.find(t => t.keyword == keyword)

      if (t != null) {
        return t.f(code)
      } else {
        return Transformation.error(keyword + ' is not a keyword.')
      }
    } catch (error) {
      return Transformation.error(code + ' is not a valid transformation\n' + error)
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