export function safeMerge(target, source) { for (let key in source) { if (key === '__proto__' || key === 'constructor') continue; target[key] = source[key]; } return target; }
