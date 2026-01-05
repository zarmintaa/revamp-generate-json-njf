export function getCryptoRandom(length) {
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (num) => (num % 10).toString()).join('')
}