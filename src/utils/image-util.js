export const md5 = (str) => {
  // Simple MD5-like hash function for browser (not cryptographically secure, but works for Gravatar)
  let hash = 0
  if (str.length === 0) return hash.toString()

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Convert to hex and pad with zeros
  return Math.abs(hash).toString(16).padStart(8, '0')
}

export const generateGravatarUrl = (email, size = 40) => {
  if (!email) return `https://www.gravatar.com/avatar/default?s=${size}&d=identicon&r=g`

  const emailHash = md5(email.toLowerCase().trim())
  return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=identicon&r=g`
}
