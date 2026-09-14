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
				<button class="posterButton" @tap="generatePoster">
					<uni-icons type="image" size="21" color="#28b389"></uni-icons>
					<text>{{ posterButtonText }}</text>
				</button>
				<button
					class="claimButton"
					:class="{ disabled: isOutOfStock, claimed: claimedState }"
					@tap="handleClaim"
				>
					{{ claimButtonText }}
				</button>
			</view>
		</view>

		<canvas canvas-id="posterCanvas" id="posterCanvas" class="posterCanvas"></canvas>

		<view v-if="posterVisible" class="posterMask" @tap="closePoster">
			<view class="posterDialog" @tap.stop>
				<view class="posterHeader">
					<text>分享海报</text>
					<uni-icons type="closeempty" size="22" color="#666666" @tap="closePoster"></uni-icons>
				</view>
				<image class="posterImage" :src="posterPath" mode="aspectFit"></image>
				<view class="posterActions">
					<button class="previewButton" @tap="previewPoster">全屏预览</button>
					<button class="saveButton" @tap="savePoster">保存到相册</button>
				</view>
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
const isGenerating = ref(false)
const isSavingPoster = ref(false)
const posterPath = ref('')
const posterCoverId = ref('')
const posterVisible = ref(false)

const POSTER_WIDTH = 750
const POSTER_HEIGHT = 1200
const POSTER_CANVAS_ID = 'posterCanvas'
const POSTER_ASYNC_TIMEOUT = 10000

const isOutOfStock = computed(() => Number(currentInfo.value?.stock || 0) <= 0)
const claimButtonText = computed(() => {
	if (isOutOfStock.value) return '已领完'
	return claimedState.value ? '已领取' : '立即领取'
})
const posterButtonText = computed(() => isGenerating.value ? '生成中' : '生成海报')

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
	if (posterCoverId.value && posterCoverId.value !== currentId.value) {
		posterPath.value = ''
		posterCoverId.value = ''
		posterVisible.value = false
	}
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

function handleClaim() {
	if (!currentInfo.value || !currentId.value) return

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

function normalizeLocalImagePath(path = '') {
	const imagePath = String(path || '').trim()
	if (!imagePath) return ''

	const lowerPath = imagePath.toLowerCase()
	if (
		lowerPath.startsWith('http://') ||
		lowerPath.startsWith('https://') ||
		lowerPath.startsWith('wxfile://') ||
		lowerPath.startsWith('file://') ||
		lowerPath.startsWith('blob:')
	) {
		return imagePath
	}

	return imagePath.startsWith('/') ? imagePath : `/${imagePath}`
}

function getImageInfo(src) {
	return new Promise((resolve, reject) => {
		const normalizedSrc = normalizeLocalImagePath(src)
		let settled = false
		const finish = (handler, value) => {
			if (settled) return
			settled = true
			clearTimeout(timeoutId)
			handler(value)
		}
		const timeoutId = setTimeout(() => {
			finish(reject, new Error('封面图片加载超时'))
		}, POSTER_ASYNC_TIMEOUT)

		try {
			uni.getImageInfo({
				src: normalizedSrc,
				success: result => finish(resolve, result),
				fail: error => {
					console.error('[poster] getImageInfo failed:', normalizedSrc, error)
					finish(reject, error)
				}
			})
		} catch (error) {
			finish(reject, error)
		}
	})
}

function drawImageCover(context, imagePath, imageInfo, x, y, width, height) {
	const sourceWidth = Number(imageInfo.width)
	const sourceHeight = Number(imageInfo.height)
	if (!sourceWidth || !sourceHeight) throw new Error('封面图片尺寸无效')

	const sourceRatio = sourceWidth / sourceHeight
	const targetRatio = width / height
	let sourceX = 0
	let sourceY = 0
	let cropWidth = sourceWidth
	let cropHeight = sourceHeight

	if (sourceRatio > targetRatio) {
		cropWidth = sourceHeight * targetRatio
		sourceX = (sourceWidth - cropWidth) / 2
	} else {
		cropHeight = sourceWidth / targetRatio
		sourceY = (sourceHeight - cropHeight) / 2
	}

	context.drawImage(
		imagePath,
		sourceX,
		sourceY,
		cropWidth,
		cropHeight,
		x,
		y,
		width,
		height
	)
}

function truncateText(context, text, maxWidth) {
	const suffix = '...'
	let output = String(text || '')
	if (context.measureText(output).width <= maxWidth) return output

	while (output && context.measureText(output + suffix).width > maxWidth) {
		output = output.slice(0, -1)
	}
	return output + suffix
}

function drawWrappedText(context, text, x, y, maxWidth, lineHeight, maxLines) {
	const characters = Array.from(String(text || ''))
	const lines = []
	let line = ''

	for (let index = 0; index < characters.length; index++) {
		const nextLine = line + characters[index]
		if (context.measureText(nextLine).width <= maxWidth) {
			line = nextLine
			continue
		}

		if (lines.length === maxLines - 1) {
			lines.push(truncateText(context, line + characters.slice(index).join(''), maxWidth))
			line = ''
			break
		}

		lines.push(line)
		line = characters[index]
	}

	if (line && lines.length < maxLines) lines.push(line)
	lines.slice(0, maxLines).forEach((item, index) => {
		context.fillText(item, x, y + index * lineHeight)
	})
	return lines.length
}

function fillRoundedRect(context, x, y, width, height, radius) {
	const safeRadius = Math.min(radius, width / 2, height / 2)
	context.beginPath()
	context.moveTo(x + safeRadius, y)
	context.lineTo(x + width - safeRadius, y)
	context.quadraticCurveTo(x + width, y, x + width, y + safeRadius)
	context.lineTo(x + width, y + height - safeRadius)
	context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height)
	context.lineTo(x + safeRadius, y + height)
	context.quadraticCurveTo(x, y + height, x, y + height - safeRadius)
	context.lineTo(x, y + safeRadius)
	context.quadraticCurveTo(x, y, x + safeRadius, y)
	context.closePath()
	context.fill()
}

function drawPoster(context, imagePath, imageInfo, cover) {
	context.setFillStyle('#fff8f3')
	context.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT)

	context.setFillStyle('#202124')
	context.setFontSize(46)
	context.fillText('CoverHub', 60, 72)
	context.setFillStyle('#8a5b53')
	context.setFontSize(25)
	context.fillText('微信红包封面精选', 60, 116)

	context.setFillStyle('#f0e4dc')
	context.fillRect(68, 143, 614, 574)
	context.save()
	context.beginPath()
	context.rect(75, 150, 600, 560)
	context.clip()
	drawImageCover(context, imagePath, imageInfo, 75, 150, 600, 560)
	context.restore()

	context.setFillStyle('#202124')
	context.setFontSize(42)
	const titleLineCount = drawWrappedText(context, cover.title || '未命名封面', 60, 772, 630, 50, 2)

	const metaItems = []
	const metaCandidates = [cover.className || '未分类', ...(Array.isArray(cover.tabs) ? cover.tabs : [])]
	metaCandidates.forEach(item => {
		const value = String(item || '').trim()
		if (value && !metaItems.includes(value)) metaItems.push(value)
	})
	const coverMeta = metaItems.slice(0, 2).join(' · ')
	const metaY = 828 + Math.max(0, titleLineCount - 1) * 50
	context.setFillStyle('#8a5b53')
	context.setFontSize(27)
	context.fillText(truncateText(context, coverMeta, 630), 60, metaY)

	const shareCardY = Math.max(900, metaY + 42)
	context.setFillStyle('#ffffff')
	fillRoundedRect(context, 60, shareCardY, 630, 164, 22)
	context.setFillStyle('#df4d5b')
	context.setFontSize(30)
	context.fillText('精选红包封面，分享给好友看看', 92, shareCardY + 62)
	context.setFillStyle('#7a7f87')
	context.setFontSize(24)
	context.fillText('微信搜索 CoverHub', 92, shareCardY + 116)

	context.setFillStyle('#b58b82')
	context.setFontSize(20)
	context.fillText('CoverHub · 把心意分享给重要的人', 60, 1142)
}

function commitCanvas(context) {
	return new Promise((resolve, reject) => {
		let settled = false
		const finish = (handler, value) => {
			if (settled) return
			settled = true
			clearTimeout(timeoutId)
			handler(value)
		}
		const timeoutId = setTimeout(() => {
			finish(reject, new Error('Canvas 绘制超时'))
		}, POSTER_ASYNC_TIMEOUT)

		try {
			context.draw(false, () => finish(resolve))
		} catch (error) {
			finish(reject, error)
		}
	})
}

function exportPoster() {
	return new Promise((resolve, reject) => {
		let settled = false
		const finish = (handler, value) => {
			if (settled) return
			settled = true
			clearTimeout(timeoutId)
			handler(value)
		}
		const timeoutId = setTimeout(() => {
			finish(reject, new Error('海报导出超时'))
		}, POSTER_ASYNC_TIMEOUT)

		try {
			uni.canvasToTempFilePath({
				canvasId: POSTER_CANVAS_ID,
				x: 0,
				y: 0,
				width: POSTER_WIDTH,
				height: POSTER_HEIGHT,
				destWidth: POSTER_WIDTH,
				destHeight: POSTER_HEIGHT,
				fileType: 'jpg',
				quality: 0.92,
				success: result => finish(resolve, result.tempFilePath),
				fail: error => finish(reject, error)
			})
		} catch (error) {
			finish(reject, error)
		}
	})
}

async function generatePoster() {
	if (isGenerating.value) return
	if (!currentInfo.value || !currentId.value || !currentInfo.value.picurl) {
		uni.showToast({ title: '当前封面不存在', icon: 'none' })
		return
	}

	const cover = { ...currentInfo.value }
	const coverId = currentId.value
	posterVisible.value = false
	posterPath.value = ''
	posterCoverId.value = ''
	isGenerating.value = true
	uni.showLoading({ title: '生成中', mask: true })
	let generateError = null

	try {
		const rawImagePath = cover.picurl
		const normalizedImagePath = normalizeLocalImagePath(rawImagePath)
		console.log('[poster] raw image:', rawImagePath)
		console.log('[poster] normalized image:', normalizedImagePath)
		if (!normalizedImagePath) throw new Error('封面图片路径无效')

		const imageInfo = await getImageInfo(normalizedImagePath)
		console.log('[poster] imageInfo.path:', imageInfo.path)
		const drawableImagePath = normalizedImagePath.startsWith('/static/')
			? normalizedImagePath
			: normalizeLocalImagePath(imageInfo.path || normalizedImagePath)
		console.log('[poster] drawable image:', drawableImagePath)
		if (!drawableImagePath) throw new Error('封面图片不可绘制')
		const context = uni.createCanvasContext(POSTER_CANVAS_ID)
		if (!context) throw new Error('Canvas 创建失败')

		drawPoster(context, drawableImagePath, imageInfo, cover)
		await commitCanvas(context)
		const tempFilePath = await exportPoster()
		if (!tempFilePath) throw new Error('海报导出失败')

		posterPath.value = tempFilePath
		posterCoverId.value = coverId
		posterVisible.value = true
	} catch (error) {
		generateError = error
		console.error('[poster] generate failed:', error)
	} finally {
		uni.hideLoading()
		isGenerating.value = false
	}

	if (generateError) {
		uni.showToast({ title: '海报生成失败', icon: 'none' })
	}
}

function closePoster() {
	posterVisible.value = false
}

function previewPoster() {
	if (!posterPath.value) return
	uni.previewImage({ current: posterPath.value, urls: [posterPath.value] })
}

function saveImageToAlbum(filePath) {
	return new Promise((resolve, reject) => {
		uni.saveImageToPhotosAlbum({
			filePath,
			success: resolve,
			fail: reject
		})
	})
}

function isAlbumPermissionError(error = {}) {
	const message = String(error.errMsg || error.message || '').toLowerCase()
	return message.includes('auth') || message.includes('authorize') || message.includes('permission') || message.includes('deny')
}

function showAlbumPermissionGuide() {
	uni.showModal({
		title: '需要相册权限',
		content: '需要相册权限才能保存图片，请前往设置开启。',
		confirmText: '去设置',
		success: result => {
			if (result.confirm) uni.openSetting()
		}
	})
}

async function savePoster() {
	if (isSavingPoster.value || !posterPath.value) return
	isSavingPoster.value = true
	uni.showLoading({ title: '保存中', mask: true })

	try {
		await saveImageToAlbum(posterPath.value)
		uni.showToast({ title: '已保存到相册', icon: 'success' })
	} catch (error) {
		if (isAlbumPermissionError(error)) {
			showAlbumPermissionGuide()
		} else {
			uni.showToast({ title: '保存失败，请重试', icon: 'none' })
		}
	} finally {
		isSavingPoster.value = false
		uni.hideLoading()
	}
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
	.posterButton {
		gap: 8rpx;
		border: 1px solid rgba(40, 179, 137, 0.45);
		color: $brand-theme-color;
		background: rgba(40, 179, 137, 0.08);
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

.posterCanvas {
	position: fixed;
	left: -10000px;
	top: 0;
	width: 750px;
	height: 1200px;
	pointer-events: none;
}

.posterMask {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	z-index: 30;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx 0;
	background: rgba(0, 0, 0, 0.68);
}

.posterDialog {
	box-sizing: border-box;
	width: 650rpx;
	padding: 28rpx;
	border-radius: 24rpx;
	background: #fff;

	.posterHeader {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 22rpx;
		color: $text-font-color-1;
		font-size: 31rpx;
		font-weight: 600;
	}

	.posterImage {
		display: block;
		width: 100%;
		height: 760rpx;
		border-radius: 14rpx;
		background: #f6f6f6;
	}

	.posterActions {
		display: flex;
		gap: 18rpx;
		margin-top: 24rpx;

		button {
			flex: 1;
			height: 76rpx;
			margin: 0;
			border-radius: 38rpx;
			font-size: 27rpx;
			line-height: 76rpx;

			&::after {
				border: 0;
			}
		}

		.previewButton {
			color: $brand-theme-color;
			background: rgba(40, 179, 137, 0.1);
		}

		.saveButton {
			color: #fff;
			background: $brand-theme-color;
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
