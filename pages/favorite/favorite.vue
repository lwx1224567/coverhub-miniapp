<template>
  <view class="collectionPage pageBg">
    <view v-if="isLoading" class="loadingState">
      <uni-load-more status="loading"></uni-load-more>
    </view>

    <view v-else-if="hasFavorites" class="coverList">
      <view
        v-for="item in coverList"
        :key="item.coverId"
        class="coverCard"
        @tap="goPreview(item.coverId)"
      >
        <image :src="item.imageUrl" mode="aspectFill"></image>
        <view class="coverInfo">
          <view class="coverTitle">{{ item.title }}</view>
          <view class="coverMeta">
            <text class="category">{{ item.className }}</text>
            <text v-if="item.firstTag" class="tag">{{ item.firstTag }}</text>
          </view>
        </view>
        <button class="removeButton" @tap.stop="cancelFavorite(item.coverId)">取消收藏</button>
      </view>
    </view>

    <view v-else class="emptyState">
      <uni-icons type="star" size="54" color="#c5c8ce"></uni-icons>
      <view class="emptyTitle">还没有收藏封面</view>
      <view class="emptyText">收藏喜欢的封面后会显示在这里</view>
      <button @tap="goFeatured">去精选看看</button>
    </view>

    <view class="safe-area-inset-bottom"></view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { apiGetCoversByIds } from '@/api/apis.js'
import { getFavoriteIds, removeFavorite } from '@/utils/favorite.js'

const coverList = ref([])
const isLoading = ref(true)
const hasFavorites = computed(() => coverList.value.length > 0)

function createCoverViewModel(item = {}) {
  return {
    coverId: String(item._id || item.id || ''),
    imageUrl: item.smallPicurl || item.picurl || '',
    title: item.title || '未命名封面',
    className: item.className || '未分类',
    firstTag: Array.isArray(item.tabs) && item.tabs.length ? item.tabs[0] : '',
    cover: item
  }
}

async function loadFavorites() {
  isLoading.value = true
  try {
    const favoriteIds = getFavoriteIds()
    const response = await apiGetCoversByIds(favoriteIds)
    const list = response && Array.isArray(response.data) ? response.data : []
    coverList.value = list.map(createCoverViewModel)
  } catch (error) {
    coverList.value = []
    uni.showToast({ title: '收藏列表加载失败', icon: 'none' })
  } finally {
    isLoading.value = false
  }
}

function cancelFavorite(id) {
  try {
    removeFavorite(id)
    coverList.value = coverList.value.filter(item => item.coverId !== String(id))
    uni.showToast({ title: '已取消收藏', icon: 'none' })
  } catch (error) {
    uni.showToast({ title: '取消收藏失败，请重试', icon: 'none' })
  }
}

function goPreview(id) {
  uni.setStorageSync('storageClassList', coverList.value.map(item => item.cover))
  uni.navigateTo({ url: `/pages/preview/preview?id=${id}` })
}

function goFeatured() {
  uni.switchTab({ url: '/pages/index/index' })
}

onShow(loadFavorites)
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

.coverMeta {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 22rpx;

  text {
    padding: 7rpx 14rpx;
    border-radius: 8rpx;
    color: $text-font-color-3;
    font-size: 22rpx;
    background: #f3f4f6;
  }

  .category {
    color: $brand-theme-color;
    background: rgba(40, 179, 137, 0.1);
  }
}

.removeButton {
  flex-shrink: 0;
  height: 58rpx;
  margin: 0;
  padding: 0 18rpx;
  border-radius: 30rpx;
  color: #e95865;
  font-size: 23rpx;
  line-height: 58rpx;
  background: #fff0f2;

  &::after {
    border: 0;
  }
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
