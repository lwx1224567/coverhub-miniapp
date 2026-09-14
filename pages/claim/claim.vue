<template>
  <view class="collectionPage pageBg">
    <view v-if="isLoading" class="loadingState">
      <uni-load-more status="loading"></uni-load-more>
    </view>

    <view v-else-if="hasClaims" class="coverList">
      <view
        v-for="item in claimList"
        :key="item.coverId"
        class="coverCard"
        @tap="goPreview(item.coverId)"
      >
        <image :src="item.imageUrl" mode="aspectFill"></image>
        <view class="coverInfo">
          <view class="coverTitle">{{ item.title }}</view>
          <view class="category">{{ item.className }}</view>
          <view class="claimTime">领取时间：{{ item.claimedAtText }}</view>
        </view>
        <uni-icons type="right" size="17" color="#b2b5ba"></uni-icons>
      </view>
    </view>

    <view v-else class="emptyState">
      <uni-icons type="gift" size="54" color="#c5c8ce"></uni-icons>
      <view class="emptyTitle">还没有领取封面</view>
      <view class="emptyText">领取成功的封面会显示在这里</view>
      <button @tap="goFeatured">去精选看看</button>
    </view>

    <view class="safe-area-inset-bottom"></view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { apiGetCoversByIds } from '@/api/apis.js'
import { getClaimRecords } from '@/utils/claim.js'

const claimList = ref([])
const isLoading = ref(true)
const hasClaims = computed(() => claimList.value.length > 0)

async function loadClaims() {
  isLoading.value = true
  try {
    const records = getClaimRecords().sort((left, right) => right.claimedAt - left.claimedAt)
    const response = await apiGetCoversByIds(records.map(item => item.coverId))
    const covers = response && Array.isArray(response.data) ? response.data : []
    const coverMap = new Map(covers.map(item => [String(item._id || item.id), item]))

    claimList.value = records
      .map(record => {
        const cover = coverMap.get(String(record.coverId))
        if(!cover) return null

        return {
          coverId: String(record.coverId),
          imageUrl: cover.smallPicurl || cover.picurl || '',
          title: cover.title || '未命名封面',
          className: cover.className || '未分类',
          claimedAtText: formatClaimTime(record.claimedAt),
          cover
        }
      })
      .filter(Boolean)
  } catch (error) {
    claimList.value = []
    uni.showToast({ title: '领取记录加载失败', icon: 'none' })
  } finally {
    isLoading.value = false
  }
}

function formatClaimTime(timestamp) {
  const date = new Date(Number(timestamp))
  if(!timestamp || Number.isNaN(date.getTime())) return '时间未知'

  const pad = value => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function goPreview(id) {
  uni.setStorageSync('storageClassList', claimList.value.map(item => item.cover))
  uni.navigateTo({ url: `/pages/preview/preview?id=${id}` })
}

function goFeatured() {
  uni.switchTab({ url: '/pages/index/index' })
}

onShow(loadClaims)
</script>

<style lang="scss" scoped>
.collectionPage {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 24rpx 24rpx 50rpx;
}

.loadingState,
.emptyState {
  display: flex;
  min-height: 70vh;
  align-items: center;
  justify-content: center;
}

.coverList {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.coverCard {
  display: flex;
  align-items: center;
  gap: 22rpx;
  padding: 20rpx;
  border-radius: 18rpx;
  background: #fff;
  box-shadow: 0 8rpx 26rpx rgba(0, 0, 0, 0.05);

  image {
    flex-shrink: 0;
    width: 150rpx;
    height: 210rpx;
    border-radius: 12rpx;
  }
}

.coverInfo {
  flex: 1;
  min-width: 0;
}

.coverTitle {
  overflow: hidden;
  color: $text-font-color-1;
  font-size: 30rpx;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category {
  display: inline-flex;
  margin-top: 18rpx;
  padding: 7rpx 14rpx;
  border-radius: 8rpx;
  color: $brand-theme-color;
  font-size: 22rpx;
  background: rgba(40, 179, 137, 0.1);
}

.claimTime {
  margin-top: 18rpx;
  color: $text-font-color-3;
  font-size: 23rpx;
}

.emptyState {
  flex-direction: column;
  color: $text-font-color-2;

  .emptyTitle {
    margin-top: 24rpx;
    font-size: 32rpx;
    font-weight: 600;
  }

  .emptyText {
    margin-top: 12rpx;
    color: $text-font-color-3;
    font-size: 25rpx;
  }

  button {
    height: 72rpx;
    margin-top: 34rpx;
    padding: 0 38rpx;
    border-radius: 36rpx;
    color: #fff;
    font-size: 27rpx;
    line-height: 72rpx;
    background: $brand-theme-color;

    &::after {
      border: 0;
    }
  }
}
</style>
