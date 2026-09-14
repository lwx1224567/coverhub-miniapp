import {
  bannerList,
  categoryList,
  coverList,
  noticeList,
  recommendedCoverIds,
  userInfo
} from '@/mock/data.js'

const clone = (data) => JSON.parse(JSON.stringify(data))

const success = (data = null) => Promise.resolve({
  errCode: 0,
  errMsg: '操作成功',
  data: clone(data)
})

const failure = (message) => Promise.reject({
  errCode: 400,
  errMsg: message,
  data: null
})

export function apiGetBanner() {
  return success(bannerList)
}
export function apiGetRandom() {
  const recommendations = recommendedCoverIds
    .map(id => coverList.find(item => item._id === id))
    .filter(Boolean)
  return success(recommendations)
}
export function apiGetNotice(data = {}) {
  return success(data.select ? noticeList.slice(0, 1) : noticeList)
}

export function apiGetClassify(data = {}){
  const pageSize = data.select ? 6 : Number(data.pageSize) || categoryList.length
  return success(categoryList.slice(0, pageSize))
}

export function apiGetClassList(data = {}){
  const pageNum = Math.max(1, Number(data.pageNum) || 1)
  const pageSize = Math.max(1, Number(data.pageSize) || 12)
  const start = (pageNum - 1) * pageSize
  const list = coverList.filter(item => item.classid === data.classid)
  return success(list.slice(start, start + pageSize))
}

export function apiSearchCovers(keyword = ''){
  const normalizedKeyword = String(keyword).trim().toLocaleLowerCase()
  if(!normalizedKeyword) return success([])

  const results = coverList.filter(item => {
    const searchableValues = [item.title, item.className, ...(item.tabs || [])]
    return searchableValues.some(value =>
      String(value).toLocaleLowerCase().includes(normalizedKeyword)
    )
  })
  return success(results)
}

export function apiGetCoversByIds(ids = []){
  if(!Array.isArray(ids)) return success([])

  const normalizedIds = [...new Set(ids.map(id => String(id).trim()).filter(Boolean))]
  const results = normalizedIds
    .map(id => coverList.find(item => String(item._id || item.id) === id))
    .filter(Boolean)
  return success(results)
}

export function apiGetSetUpScore(data = {}){
  const target = coverList.find(item => item._id === data.wallId && item.classid === data.classid)
  return target ? success({ wallId: data.wallId, userScore: data.userScore }) : failure('封面不存在')
}

export function apiWriteDownload(data = {}){
  const target = coverList.find(item => item._id === data.wallId && item.classid === data.classid)
  return target ? success({ wallId: data.wallId }) : failure('封面不存在')
}

export function apidetailWall(data = {}){
  const target = coverList.find(item => item._id === data.id)
  return target ? success([target]) : failure('封面不存在')
}

export function apiUserInfo(data = {}){
  return success(userInfo)
}
