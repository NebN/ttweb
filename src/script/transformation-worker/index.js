const worker = new Worker(new URL('./workerManager.js', import.meta.url));

const send = message => worker.postMessage(message)

export default {
  worker,
  send
}