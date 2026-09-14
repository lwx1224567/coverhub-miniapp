export const CLAIM_STORAGE_KEY = 'coverhub_claim_records'

function normalizeCoverId(coverId) {
  if(typeof coverId !== 'string' && typeof coverId !== 'number') return ''
  return String(coverId).trim()
}

function normalizeClaimRecords(value) {
  if(!Array.isArray(value)) return []

  const coverIds = new Set()
  return value.reduce((records, item) => {
    if(!item || typeof item !== 'object') return records

    const coverId = normalizeCoverId(item.coverId)
    if(!coverId || coverIds.has(coverId)) return records

    const claimedAt = Number(item.claimedAt)
    records.push({
      coverId,
      claimedAt: Number.isFinite(claimedAt) && claimedAt > 0 ? claimedAt : 0
    })
    coverIds.add(coverId)
    return records
  }, [])
}

function saveClaimRecords(records) {
  const normalizedRecords = normalizeClaimRecords(records)
  uni.setStorageSync(CLAIM_STORAGE_KEY, normalizedRecords)
  return normalizedRecords
}

export function getClaimRecords() {
  try {
    return normalizeClaimRecords(uni.getStorageSync(CLAIM_STORAGE_KEY))
  } catch (error) {
    return []
  }
}

export function getClaimRecord(coverId) {
  const normalizedId = normalizeCoverId(coverId)
  if(!normalizedId) return null

  return getClaimRecords().find(item => item.coverId === normalizedId) || null
}

export function isClaimed(coverId) {
  return Boolean(getClaimRecord(coverId))
}

export function addClaimRecord(coverId) {
  const normalizedId = normalizeCoverId(coverId)
  if(!normalizedId) return null

  const records = getClaimRecords()
  const existingRecord = records.find(item => item.coverId === normalizedId)
  if(existingRecord) return existingRecord

  const record = {
    coverId: normalizedId,
    claimedAt: Date.now()
  }
  saveClaimRecords([...records, record])
  return record
}
