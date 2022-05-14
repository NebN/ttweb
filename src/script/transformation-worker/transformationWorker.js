// Demo how to import in the worker
import { deserializeTransformation, transform } from '/src/script/transformations.js'

onmessage = e => {
  const { input, transformation } = e.data
  const t = deserializeTransformation(transformation)
  postMessage(transform(t, input))
}