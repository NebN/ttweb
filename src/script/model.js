import { parseTransformation } from "@/script/transformations"
import { stringIsEmpty } from "@/script/utils.js"

export class TransformationChain {

  constructor({ id=null, name, lines=[''], selected=false, dirty=false }) {
    this.id = id
    this.name = name
    this.lines = lines
    this.selected = selected
    this.dirty = dirty
    this.linesWhenLastSaved = this.lines
  }

  toString() {
    return this.id + ', ' + this.name + ', ' + this.lines
  }
}

export class LineOfCodeModel {

  _code = null
  _transformation = null

  constructor(id, code) {
    this.id = id
    this.setCode(code)
    this.partialResult = null
  }

  getCode() {
    return this._code
  }
  
  setCode(code) {
    this._code = code
    this._transformation = parseTransformation(code)  
  }

  getTransformation() {
    return this._transformation
  }

  isError() {
    return this._transformation ? Boolean(this._transformation.error) : false
  }

  isEmpty() {
    return stringIsEmpty(this._code)
  }
  
  toString() {
    return this._code
  }
}
