# CoverHub

CoverHub 是一个基于 uni-app 与 Vue 3 开发的微信红包封面精选小程序 MVP。项目使用本地 Mock 数据与本地图片，可在不依赖远程接口的情况下演示完整业务闭环。

## 已实现功能

- 首页精选、分类浏览与分页列表
- 按标题、标签、分类搜索及搜索历史
- 封面详情、Swiper 切换与分享
- 本地收藏与领取记录
- 我的收藏与我的领取
- Canvas 分享海报、预览与保存相册

## 技术栈

- uni-app
- Vue 3 Composition API
- 微信小程序
- uni-ui
- 本地 Storage
- 本地 Mock 数据

## 数据说明

业务数据位于 `mock/data.js`，封面图片位于 `static/covers/`。当前版本不连接远程 API、uniCloud 或真实微信红包封面领取接口；收藏和领取记录仅保存在当前设备的小程序 Storage 中。

## 本地运行

1. 使用 HBuilderX 打开项目。
2. 选择“运行到小程序模拟器 → 微信开发者工具”。
3. 在微信开发者工具中编译并按业务流程进行验证。

编译产物位于 `unpackage/`，该目录已由 `.gitignore` 忽略。
