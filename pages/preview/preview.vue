<template>
	<view class="preview" v-if="currentInfo">
		<view class="previewArea">
			<swiper class="swiper" circular :current="currentIndex" @change="swiperChange">
				<swiper-item v-for="(item, index) in classList" :key="item._id || item.id">
					<image
						v-if="readImgs.includes(index)"
						class="coverImage"
						:src="item.picurl"
						mode="aspectFill"
						@click="openImagePreview(index)"
					/>
				</swiper-item>
			</swiper>

			<view class="topBar" :style="{ paddingTop: getStatusBarHeight() + 'px' }">
				<view class="backButton" @click="goBack">
					<uni-icons type="left" size="24" color="#ffffff"></uni-icons>
				</view>
				<view class="pageCount">{{ currentIndex + 1 }} / {{ classList.length }}</view>
			</view>
		</view>

		<view class="detailPanel">
			<view class="heading">
				<text class="title">{{ currentInfo.title || '未命名封面' }}</text>
				<text class="category">{{ currentInfo.className || '未分类' }}</text>
			</view>

			<view class="section">
				<view class="sectionTitle">标签</view>
				<view class="tags" v-if="currentInfo.tabs && currentInfo.tabs.length">
					<text class="tag" v-for="tag in currentInfo.tabs" :key="tag">{{ tag }}</text>
				</view>
				<text class="emptyText" v-else>暂无标签</text>
			</view>

			<view class="section">
				<view class="sectionTitle">封面简介</view>
				<text class="description">{{ currentInfo.description || '暂无简介' }}</text>
			</view>

			<view class="stats">
				<view class="statItem">
					<text class="statValue">{{ currentInfo.claimCount ?? 0 }}</text>
					<text class="statLabel">领取人数</text>
				</view>
				<view class="statItem">
					<text class="statValue" :class="{ soldOut: isOutOfStock }">{{ currentInfo.stock ?? 0 }}</text>
					<text class="statLabel">剩余库存</text>
				</view>
			</view>

			<view class="metaList">
				<view class="metaRow">
					<text class="metaLabel">封面 ID</text>
					<text class="metaValue">{{ currentInfo._id || currentInfo.id || '暂无' }}</text>
				</view>
				<view class="metaRow">
					<text class="metaLabel">创建时间</text>
					<text class="metaValue">{{ formatDate(currentInfo.createTime) }}</text>
				</view>
			</view>
		</view>

		<view class="actionBar">
			<view class="actionInner">
				<button
					class="favoriteButton"
					:class="{ active: favoriteState }"
					@click="clickFavorite"
				>
					<uni-icons
						:type="favoriteState ? 'star-filled' : 'star'"
						size="22"
						:color="favoriteState ? '#ffffff' : '#e95865'"
					></uni-icons>
					<text>{{ favoriteState ? '已收藏' : '收藏' }}</text>
				</button>
				<button
					class="claimButton"
					:class="{ disabled: isOutOfStock, claimed: claimedState }"
					:disabled="isOutOfStock"
					@click="clickClaim"
				>
					{{ claimButtonText }}
				</button>
			</view>
		</view>
	</view>

	<view class="loading" v-else>
		<uni-load-more status="loading"></uni-load-more>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { apidetailWall } from '@/api/apis.js'
import { getStatusBarHeight } from '@/utils/system.js'
import { isFavorite, toggleFavorite } from '@/utils/favorite.js'
import { addClaimRecord, isClaimed } from '@/utils/claim.js'

const storageClassList = uni.getStorageSync('storageClassList') || []
const classList = ref(storageClassList.map(normalizeCover))
const currentIndex = ref(0)
const currentId = ref(null)
const currentInfo = ref(null)
const readImgs = ref([])
const favoriteState = ref(false)
const claimedState = ref(false)

const isOutOfStock = computed(() => Number(currentInfo.value?.stock || 0) <= 0)
const claimButtonText = computed(() => {
	if (isOutOfStock.value) return '已领完'
	return claimedState.value ? '已领取' : '立即领取'
})

function normalizeCover(item = {}) {
	return {
		...item,
		picurl: item.picurl || item.smallPicurl || ''
	}
}

function getCoverId(item = {}) {
	return String(item._id || item.id || '')
}

function preloadAround(index) {
	const total = classList.value.length
	if (!total) return

	const indexes = [index, (index - 1 + total) % total, (index + 1) % total]
	readImgs.value = [...new Set([...readImgs.value, ...indexes])]
}

function setCurrentCover(index) {
	const cover = classList.value[index]
	if (!cover) return

	currentIndex.value = index
	currentInfo.value = cover
	currentId.value = getCoverId(cover)
	favoriteState.value = isFavorite(currentId.value)
	claimedState.value = isClaimed(currentId.value)
	preloadAround(index)
}

function swiperChange(event) {
	setCurrentCover(event.detail.current)
}

function openImagePreview(index) {
	const urls = classList.value.map(item => item.picurl).filter(Boolean)
	const current = classList.value[index]?.picurl
	if (!current || !urls.length) return

	uni.previewImage({ current, urls })
}

async function loadCoverById(id) {
	const response = await apidetailWall({ id })
	const covers = Array.isArray(response.data) ? response.data : []
	classList.value = covers.map(normalizeCover)
}

onLoad(async (options = {}) => {
	const id = String(options.id || '')
	if (!id) {
		uni.showToast({ title: '缺少封面 ID', icon: 'none' })
		return
	}

	let index = classList.value.findIndex(item => getCoverId(item) === id)

	if (options.type === 'share' || index < 0) {
		try {
			await loadCoverById(id)
		} catch (error) {
			uni.showToast({ title: '封面加载失败', icon: 'none' })
			return
		}
		index = classList.value.findIndex(item => getCoverId(item) === id)
	}

	if (index < 0) {
		uni.showToast({ title: '未找到该封面', icon: 'none' })
		return
	}

	setCurrentCover(index)
})

function formatDate(value) {
	if (!value) return '暂无'
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return String(value)

	const pad = number => String(number).padStart(2, '0')
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function clickFavorite() {
	if (!currentId.value) return

	try {
		favoriteState.value = toggleFavorite(currentId.value)
		uni.showToast({
			title: favoriteState.value ? '收藏成功' : '已取消收藏',
			icon: 'none'
		})
	} catch (error) {
		favoriteState.value = isFavorite(currentId.value)
		uni.showToast({
			title: '收藏操作失败，请重试',
			icon: 'none'
		})
	}
}

function clickClaim() {
	if (isOutOfStock.value) {
		uni.showToast({ title: '该封面暂无库存', icon: 'none' })
		return
	}
	if (isClaimed(currentId.value)) {
		claimedState.value = true
		uni.showToast({ title: '该封面已领取', icon: 'none' })
		return
	}

	uni.showModal({
		title: '确认领取',
		content: `确认领取“${currentInfo.value?.title || '当前'}”红包封面吗？`,
		confirmText: '确认领取',
		success: result => {
			if (!result.confirm) return

			try {
				const record = addClaimRecord(currentId.value)
				if (!record) throw new Error('领取记录无效')

				claimedState.value = true
				uni.showToast({ title: '领取成功', icon: 'success' })
			} catch (error) {
				claimedState.value = isClaimed(currentId.value)
				uni.showToast({ title: '领取失败，请重试', icon: 'none' })
			}
		}
	})
}

function goBack() {
	uni.navigateBack({
		fail: () => {
			uni.reLaunch({ url: '/pages/index/index' })
		}
	})
}

function getShareTitle() {
	return currentInfo.value?.title
		? `CoverHub · ${currentInfo.value.title}`
		: 'CoverHub 红包封面'
}

function getSharePath() {
	return `/pages/preview/preview?id=${currentId.value || ''}&type=share`
}

onShareAppMessage(() => ({
	title: getShareTitle(),
	path: getSharePath()
}))

onShareTimeline(() => ({
	title: getShareTitle(),
	query: `id=${currentId.value || ''}&type=share`
}))
</script>

<style lang="scss" scoped>
.preview {
	min-height: 100vh;
	box-sizing: border-box;
	padding-bottom: calc(150rpx + env(safe-area-inset-bottom));
	background: #f5f6f8;
}

.previewArea {
	position: relative;
	height: 62vh;
	min-height: 720rpx;
	max-height: 1100rpx;
	background: #171717;
	.swiper,
	.coverImage {
		width: 100%;
		height: 100%;
		display: block;
	}
}

.topBar {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	z-index: 2;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
	padding-left: 28rpx;
	padding-right: 28rpx;
	padding-bottom: 20rpx;
	background: linear-gradient(180deg, rgba(0, 0, 0, 0.5), transparent);
}

.backButton,
.pageCount {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 72rpx;
	background: rgba(0, 0, 0, 0.35);
	backdrop-filter: blur(10px);
}

.backButton {
	width: 72rpx;
	border-radius: 50%;
}

.pageCount {
	box-sizing: border-box;
	min-width: 112rpx;
	padding: 0 24rpx;
	border-radius: 36rpx;
	color: #fff;
	font-size: 26rpx;
}

.detailPanel {
	position: relative;
	z-index: 1;
	box-sizing: border-box;
	margin-top: -28rpx;
	padding: 42rpx 32rpx 36rpx;
	border-radius: 28rpx 28rpx 0 0;
	background: #fff;
}

.heading {
	display: flex;
	align-items: flex-start;
	gap: 20rpx;
	.title {
		flex: 1;
		min-width: 0;
		color: #202124;
		font-size: 42rpx;
		font-weight: 700;
		line-height: 1.35;
		word-break: break-all;
	}
	.category {
		flex-shrink: 0;
		max-width: 180rpx;
		box-sizing: border-box;
		padding: 10rpx 20rpx;
		border-radius: 24rpx;
		overflow: hidden;
		color: #e35b67;
		font-size: 24rpx;
		text-overflow: ellipsis;
		white-space: nowrap;
		background: #fff0f2;
	}
}

.section {
	margin-top: 36rpx;
	.sectionTitle {
		margin-bottom: 18rpx;
		color: #303133;
		font-size: 30rpx;
		font-weight: 600;
	}
}

.tags {
	display: flex;
	flex-wrap: wrap;
	gap: 14rpx;
	.tag {
		padding: 10rpx 20rpx;
		border-radius: 8rpx;
		color: #666;
		font-size: 24rpx;
		background: #f3f4f6;
	}
}

.description,
.emptyText {
	color: #606266;
	font-size: 28rpx;
	line-height: 1.75;
	word-break: break-all;
}

.emptyText {
	color: #a8abb2;
}

.stats {
	display: flex;
	margin-top: 38rpx;
	padding: 28rpx 0;
	border-radius: 18rpx;
	background: #f8f8fa;
	.statItem {
		position: relative;
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		& + .statItem::before {
			content: '';
			position: absolute;
			left: 0;
			top: 8rpx;
			bottom: 8rpx;
			width: 1px;
			background: #e5e6eb;
		}
	}
	.statValue {
		color: #303133;
		font-size: 36rpx;
		font-weight: 700;
		&.soldOut {
			color: #c0c4cc;
		}
	}
	.statLabel {
		margin-top: 8rpx;
		color: #909399;
		font-size: 24rpx;
	}
}

.metaList {
	margin-top: 26rpx;
	.metaRow {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 30rpx;
		padding: 18rpx 0;
		border-bottom: 1px solid #f0f1f2;
	}
	.metaLabel {
		flex-shrink: 0;
		color: #909399;
		font-size: 26rpx;
	}
	.metaValue {
		color: #4e5969;
		font-size: 26rpx;
		text-align: right;
		word-break: break-all;
	}
}

.actionBar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 10;
	padding-bottom: env(safe-area-inset-bottom);
	border-top: 1px solid rgba(0, 0, 0, 0.06);
	background: rgba(255, 255, 255, 0.96);
	.actionInner {
		display: flex;
		gap: 20rpx;
		box-sizing: border-box;
		height: 132rpx;
		padding: 20rpx 28rpx;
	}
	button {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 92rpx;
		margin: 0;
		border-radius: 46rpx;
		font-size: 30rpx;
		font-weight: 600;
		line-height: 1;
		&::after {
			border: 0;
		}
	}
	.favoriteButton {
		gap: 10rpx;
		border: 1px solid #f06a75;
		color: #e95865;
		background: #fff;
		&.active {
			color: #fff;
			background: #e95865;
		}
	}
	.claimButton {
		color: #fff;
		background: linear-gradient(135deg, #f27a82, #df4d5b);
		&.claimed {
			color: #df4d5b;
			background: #fff0f2;
		}
		&.disabled {
			color: #fff;
			background: #c8c9cc;
		}
	}
}

.loading {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	background: #f5f6f8;
}
</style>
