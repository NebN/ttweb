let currentWorker;

onmessage = e => {
  if (currentWorker != null) {
    currentWorker.terminate()
  }
  currentWorker = new Worker(new URL('./transformationWorker.js', import.meta.url));
  currentWorker.postMessage(e.data)
  currentWorker.onmessage = e => {
    postMessage(e.data)
  }
}