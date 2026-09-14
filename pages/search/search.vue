<template>
  <view class="searchPage pageBg">
    <view class="searchBar">
      <view class="inputBox">
        <uni-icons type="search" size="18" color="#999"></uni-icons>
        <input
          v-model="keyword"
          type="text"
          confirm-type="search"
          placeholder="搜索标题、标签或分类"
          @confirm="submitSearch"
        />
        <uni-icons
          v-if="keyword"
          type="clear"
          size="18"
          color="#aaa"
          @click="clearKeyword"
        ></uni-icons>
      </view>
      <button :disabled="isSearching" @click="submitSearch">
        {{isSearching ? '搜索中' : '搜索'}}
      </button>
    </view>

    <view v-if="!hasSearched" class="suggestions">
      <view v-if="searchHistory.length" class="section">
        <view class="sectionHeader">
          <text class="title">搜索历史</text>
          <text class="clear" @click="clearHistory">清空</text>
        </view>
        <view class="keywords">
          <view
            v-for="item in searchHistory"
            :key="item"
            class="keyword"
            @click="searchByKeyword(item)"
          >
            {{item}}
          </view>
        </view>
      </view>

      <view class="section">
        <view class="sectionHeader">
          <text class="title">热门搜索</text>
        </view>
        <view class="keywords">
          <view
            v-for="item in hotKeywords"
            :key="item"
            class="keyword hot"
            @click="searchByKeyword(item)"
          >
            {{item}}
          </view>
        </view>
      </view>
    </view>

    <view v-else class="searchResult">
      <view class="resultTitle">搜索结果（{{searchResults.length}}）</view>
      <uni-load-more v-if="isSearching" status="loading"></uni-load-more>
      <view v-else-if="searchResults.length" class="coverGrid">
        <view
          v-for="item in searchResults"
          :key="item._id"
          class="coverItem"
          @click="goPreview(item._id)"
        >
          <image :src="item.smallPicurl" mode="aspectFill"></image>
          <view class="coverTitle">{{item.title}}</view>
        </view>
      </view>
      <view v-else class="emptyState">
        <uni-icons type="search" size="42" color="#bbb"></uni-icons>
        <view>没有找到相关封面</view>
        <text>换个关键词试试吧</text>
      </view>
    </view>

    <view class="safe-area-inset-bottom"></view>
  </view>
</template>

<script setup>
  import {ref} from 'vue'
  import {apiSearchCovers} from '@/api/apis.js'

  const SEARCH_HISTORY_KEY = 'coverhubSearchHistory'
  const MAX_HISTORY_SIZE = 10
  const hotKeywords = ['新年', '国潮', '动漫', '情侣', '萌宠']

  const keyword = ref('')
  const isSearching = ref(false)
  const hasSearched = ref(false)
  const searchResults = ref([])

  const normalizeHistory = (value) => {
    if(!Array.isArray(value)) return []

    const normalizedKeywords = []
    const keywordKeys = new Set()
    value.forEach(item => {
      if(typeof item !== 'string') return
      const normalizedItem = item.trim()
      const keywordKey = normalizedItem.toLocaleLowerCase()
      if(!normalizedItem || keywordKeys.has(keywordKey)) return

      normalizedKeywords.push(normalizedItem)
      keywordKeys.add(keywordKey)
    })
    return normalizedKeywords.slice(0, MAX_HISTORY_SIZE)
  }

  const getStoredHistory = () => {
    try {
      return normalizeHistory(uni.getStorageSync(SEARCH_HISTORY_KEY))
    } catch (error) {
      return []
    }
  }

  const searchHistory = ref(getStoredHistory())

  const saveHistory = (value) => {
    const normalizedValue = value.toLocaleLowerCase()
    const nextHistory = [
      value,
      ...searchHistory.value.filter(item => item.toLocaleLowerCase() !== normalizedValue)
    ].slice(0, MAX_HISTORY_SIZE)
    searchHistory.value = nextHistory
    try {
      uni.setStorageSync(SEARCH_HISTORY_KEY, nextHistory)
    } catch (error) {}
  }

  const submitSearch = async () => {
    if(isSearching.value) return

    const trimmedKeyword = keyword.value.trim()
    keyword.value = trimmedKeyword
    if(!trimmedKeyword) return

    isSearching.value = true
    hasSearched.value = true
    try {
      const res = await apiSearchCovers(trimmedKeyword)
      searchResults.value = res && Array.isArray(res.data) ? res.data : []
      saveHistory(trimmedKeyword)
    } catch (err) {
      searchResults.value = []
      uni.showToast({
        title: '搜索失败，请稍后重试',
        icon: 'none'
      })
    } finally {
      isSearching.value = false
    }
  }

  const searchByKeyword = (value) => {
    keyword.value = value
    submitSearch()
  }

  const clearKeyword = () => {
    keyword.value = ''
    searchResults.value = []
    hasSearched.value = false
  }

  const clearHistory = () => {
    searchHistory.value = []
    uni.removeStorageSync(SEARCH_HISTORY_KEY)
  }

  const goPreview = (id) => {
    uni.setStorageSync('storageClassList', searchResults.value)
    uni.navigateTo({
      url: '/pages/preview/preview?id=' + id
    })
  }
</script>

<style lang="scss" scoped>
  .searchPage {
    padding: 24rpx 30rpx 50rpx;

    .searchBar {
      display: flex;
      align-items: center;
      gap: 18rpx;

      .inputBox {
        flex: 1;
        height: 76rpx;
        padding: 0 24rpx;
        border-radius: 38rpx;
        background: #fff;
        display: flex;
        align-items: center;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);

        input {
          flex: 1;
          height: 100%;
          padding: 0 16rpx;
          font-size: 28rpx;
        }
      }

      button {
        width: 128rpx;
        height: 72rpx;
        padding: 0;
        border-radius: 36rpx;
        background: $brand-theme-color;
        color: #fff;
        font-size: 28rpx;
        line-height: 72rpx;

        &::after {
          border: 0;
        }

        &[disabled] {
          opacity: 0.6;
        }
      }
    }

    .section {
      margin-top: 48rpx;

      .sectionHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24rpx;

        .title {
          color: $text-font-color-1;
          font-size: 34rpx;
          font-weight: 600;
        }

        .clear {
          color: $text-font-color-3;
          font-size: 26rpx;
        }
      }

      .keywords {
        display: flex;
        flex-wrap: wrap;
        gap: 18rpx;

        .keyword {
          padding: 14rpx 26rpx;
          border-radius: 32rpx;
          background: #fff;
          color: $text-font-color-2;
          font-size: 27rpx;
          box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.04);
        }

        .hot {
          color: $brand-theme-color;
          border: 1rpx solid rgba(40, 179, 137, 0.25);
        }
      }
    }

    .searchResult {
      margin-top: 40rpx;

      .resultTitle {
        margin-bottom: 24rpx;
        color: $text-font-color-2;
        font-size: 28rpx;
      }

      .coverGrid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20rpx;

        .coverItem {
          overflow: hidden;
          border-radius: 14rpx;
          background: #fff;
          box-shadow: 0 8rpx 26rpx rgba(0, 0, 0, 0.06);

          image {
            display: block;
            width: 100%;
            height: 440rpx;
          }

          .coverTitle {
            padding: 18rpx;
            overflow: hidden;
            color: $text-font-color-1;
            font-size: 28rpx;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }

      .emptyState {
        min-height: 500rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 18rpx;
        color: $text-font-color-2;
        font-size: 30rpx;

        text {
          color: $text-font-color-3;
          font-size: 26rpx;
        }
      }
    }
  }
</style>
