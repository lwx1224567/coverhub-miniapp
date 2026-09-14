export const FAVORITE_STORAGE_KEY = 'coverhub_favorite_ids'

function normalizeId(id) {
  if(typeof id !== 'string' && typeof id !== 'number') return ''
  return String(id).trim()
}

function normalizeFavoriteIds(value) {
  if(!Array.isArray(value)) return []

  return [...new Set(value.map(normalizeId).filter(Boolean))]
}

function saveFavoriteIds(ids) {
  const normalizedIds = normalizeFavoriteIds(ids)
  uni.setStorageSync(FAVORITE_STORAGE_KEY, normalizedIds)
  return normalizedIds
}

export function getFavoriteIds() {
  try {
    return normalizeFavoriteIds(uni.getStorageSync(FAVORITE_STORAGE_KEY))
  } catch (error) {
    return []
  }
}

export function isFavorite(id) {
  const normalizedId = normalizeId(id)
  return normalizedId ? getFavoriteIds().includes(normalizedId) : false
}

export function addFavorite(id) {
  const normalizedId = normalizeId(id)
  const favoriteIds = getFavoriteIds()
  if(!normalizedId || favoriteIds.includes(normalizedId)) return favoriteIds

  return saveFavoriteIds([...favoriteIds, normalizedId])
}

export function removeFavorite(id) {
  const normalizedId = normalizeId(id)
  if(!normalizedId) return getFavoriteIds()

  return saveFavoriteIds(getFavoriteIds().filter(item => item !== normalizedId))
}

export function toggleFavorite(id) {
  const normalizedId = normalizeId(id)
  if(!normalizedId) return false

  const favoriteIds = getFavoriteIds()
  const nextState = !favoriteIds.includes(normalizedId)
  const nextIds = nextState
    ? [...favoriteIds, normalizedId]
    : favoriteIds.filter(item => item !== normalizedId)

  saveFavoriteIds(nextIds)
  return nextState
}
