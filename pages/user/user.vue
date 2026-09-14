<template>
  <view class="userLayout pageBg">
    <view :style="{ height: getNavBarHeight() + 'px' }"></view>

    <view class="userInfo">
      <view class="avatar">
        <uni-icons type="gift-filled" size="52" color="#ffffff"></uni-icons>
      </view>
      <view class="brandName">CoverHub</view>
      <view class="brandIntro">微信红包封面精选</view>
    </view>

    <view class="section">
      <view class="list">
        <navigator class="row" url="/pages/favorite/favorite">
          <view class="left">
            <uni-icons type="star-filled" size="20"></uni-icons>
            <view class="text">我的收藏</view>
          </view>
          <view class="right">
            <view class="count">{{ favoriteCount }}</view>
            <uni-icons type="right" size="15"></uni-icons>
          </view>
        </navigator>

        <navigator class="row" url="/pages/claim/claim">
          <view class="left">
            <uni-icons type="gift-filled" size="20"></uni-icons>
            <view class="text">我的领取</view>
          </view>
          <view class="right">
            <view class="count">{{ claimCount }}</view>
            <uni-icons type="right" size="15"></uni-icons>
          </view>
        </navigator>

        <view class="row contactRow">
          <view class="left">
            <uni-icons type="chatboxes-filled" size="20"></uni-icons>
            <view class="text">联系客服</view>
          </view>
          <view class="right">
            <uni-icons type="right" size="15"></uni-icons>
          </view>
          <!-- #ifdef MP-WEIXIN -->
          <button open-type="contact">联系客服</button>
          <!-- #endif -->
        </view>
      </view>
    </view>

    <view class="safe-area-inset-bottom"></view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getNavBarHeight } from '@/utils/system.js'
import { getFavoriteIds } from '@/utils/favorite.js'
import { getClaimRecords } from '@/utils/claim.js'

const favoriteCount = ref(0)
const claimCount = ref(0)

function refreshCounts() {
  favoriteCount.value = getFavoriteIds().length
  claimCount.value = getClaimRecords().length
}

onShow(refreshCounts)
</script>

<style lang="scss" scoped>
.userLayout {
  min-height: 100vh;
  box-sizing: border-box;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));

  .userInfo {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 54rpx 0 34rpx;

    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 150rpx;
      height: 150rpx;
      border: 6rpx solid rgba(255, 255, 255, 0.85);
      border-radius: 50%;
      background: linear-gradient(135deg, #45c89c, #28b389);
      box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);
    }

    .brandName {
      padding: 22rpx 0 6rpx;
      color: $text-font-color-1;
      font-size: 42rpx;
      font-weight: 700;
    }

    .brandIntro {
      color: $text-font-color-3;
      font-size: 27rpx;
    }
  }

  .section {
    width: 690rpx;
    margin: 34rpx auto;
    overflow: hidden;
    border: 1px solid #eee;
    border-radius: 16rpx;
    background: #fff;
    box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.05);
  }

  .row {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 108rpx;
    padding: 0 30rpx;
    border-bottom: 1px solid #eee;
    background: #fff;

    &:last-child {
      border-bottom: 0;
    }

    .left,
    .right {
      display: flex;
      align-items: center;
    }

    .left {
      :deep(.uni-icons) {
        color: $brand-theme-color !important;
      }

      .text {
        padding-left: 20rpx;
        color: $text-font-color-2;
        font-size: 29rpx;
      }
    }

    .right {
      gap: 16rpx;

      .count {
        min-width: 48rpx;
        color: $text-font-color-3;
        font-size: 27rpx;
        text-align: right;
      }
    }
  }

  .contactRow button {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }
}
</style>
