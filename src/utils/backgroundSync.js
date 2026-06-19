export function sync() { navigator.serviceWorker.ready.then(reg => reg.sync.register('sync')).catch(err => console.error(err)); }
