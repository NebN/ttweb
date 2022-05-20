import { parseTransformation } from "@/script/transformations"
import { stringIsEmpty } from "@/script/utils.js"
import { v4 as uuidv4 } from "uuid";
import { arrayEquals } from "./utils";

export class LineOfCodeModel {

  _code = null
  _transformation = null

  constructor(code) {
    this.id = LineOfCodeModel.nextId()
    this.setCode(code)
    this.partialResult = null
  }

  static lastId = 0
  static nextId() {
    return LineOfCodeModel.lastId++;
  }

  static jsonReplacer() {
    return (k, v) => {
      if (k === '_transformation') return undefined
      else return v
    }
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

export class TTab {

  static DEFAULT_NAME = 'Untitled Transformation'

  constructor({ id=uuidv4(), name=TTab.DEFAULT_NAME, lines=[new LineOfCodeModel('')], selected=false }) {
    this.id = id
    this.name = name
    this.lines = lines
    this.selected = selected
    this.linesWhenLastSaved = this.lines.map(l => l._code)
  }

  isDirty() {
    return !arrayEquals(this.lines.map(l => l._code), this.linesWhenLastSaved)
  }

  saved() {
    this.linesWhenLastSaved = this.lines.map(l => l._code)
  }

  static fromObject(parsed) {
    const lines = parsed.lines.map(l => new LineOfCodeModel(l._code))
    return new TTab({
      id: parsed.id,
      name: parsed.name,
      lines: lines,
      selected: parsed.selected,
      dirty: parsed.dirty,
    })
  }

  transformation() {
    return this.lines.map(l => l.getTransformation()).reduce((a, b) => a.chain(b))
  }

  isDefault() {
    return this.name === TTab.DEFAULT_NAME && this.lines.every(l => l.isEmpty())
  }

  toString() {
    return this.id + ', ' + this.name + ', ' + this.lines
  }
}