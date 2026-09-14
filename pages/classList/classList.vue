<template>
  <view class="classList">
    <view class="content">
      <navigator :url="'/pages/preview/preview?id=' + item._id" class="item" v-for="item in classList" :key="item._id">
        <image :src="item.smallPicurl" mode="aspectFill"></image>
      </navigator>
    </view>
    <view class="loadingLayout" v-if="loadStatus === 'loading' || classList.length || loadStatus === 'noMore'">
      <uni-load-more :status="loadStatus"></uni-load-more>
    </view>
  </view>
  <view class="safe-area-inset-bottom">
    
  </view>
</template>

<script setup>
  import {
    ref
  } from 'vue';
  import {
    apiGetClassList
  } from '../../api/apis';
  import {onLoad,onUnload,onReachBottom,onShareAppMessage,onShareTimeline} from "@dcloudio/uni-app"
  import {gotoHome} from '@/utils/common.js'
  const classList = ref([])
  const loadStatus = ref('loading')
  const queryParams = {
    pageNum:1,
    pageSize:2
  }
  let isLoading = false
  let pageName;
  onLoad((e)=>{
    let {id,name} = e
    if(!id) {
      return gotoHome()
    }
    queryParams.classid = id
    pageName = name
    uni.setNavigationBarTitle({
      title:name ? name + '封面' : '封面列表'
    })
    getClassList()
  })
  onReachBottom(()=>{
    if(loadStatus.value !== 'more' || isLoading) return;
    queryParams.pageNum++
    getClassList()
  })
  //获取分类列表
  const getClassList = async () => {
    if(isLoading) return
    isLoading = true
    loadStatus.value = 'loading'

    try {
      const res = await apiGetClassList(queryParams)
      const list = Array.isArray(res.data) ? res.data : []

      classList.value = [...classList.value, ...list]
      loadStatus.value = list.length < queryParams.pageSize ? 'noMore' : 'more'
      uni.setStorageSync('storageClassList', classList.value)
    } catch (error) {
      if(queryParams.pageNum > 1) queryParams.pageNum--
      loadStatus.value = 'more'
      uni.showToast({
        title: error?.errMsg || '加载失败，请重试',
        icon: 'none'
      })
    } finally {
      isLoading = false
    }
  }
  
  //分享给好友
  onShareAppMessage((e)=>{
    return {
      title:'CoverHub-' + pageName + '封面',
      path:'/pages/classList/classList?id=' + queryParams.classid + "&name=" + pageName
    }
  })
  //分享给朋友圈
  onShareTimeline(()=>{
    return {
      title:'CoverHub-' + pageName + '封面',
      query:'id=' + queryParams.classid + "&name=" + pageName
    }
  })
  
  onUnload(()=>{
    uni.removeStorageSync('storageClassList')
  })
</script>

<style lang="scss" scoped>
  .classList {
    .content {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 5rpx;
      padding: 5rpx;

      .item {
        height: 440rpx;

        image {
          width: 100%;
          height: 100%;
          display: block;
        }
      }
    }
  }
</style>
