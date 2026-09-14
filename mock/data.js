const DAY = 24 * 60 * 60 * 1000
const now = Date.now()

const cover = ({
  id,
  title,
  classid,
  className,
  image,
  tabs,
  description,
  claimCount,
  stock,
  daysAgo,
  score
}) => ({
  _id: id,
  id,
  title,
  classid,
  className,
  smallPicurl: image,
  picurl: image,
  tabs,
  description,
  claimCount,
  stock,
  createTime: now - daysAgo * DAY,
  updateTime: now - daysAgo * DAY,
  nickname: 'CoverHub 精选',
  score,
  userScore: 0
})

export const bannerList = [
  { _id: 'banner-new-year', picurl: '/static/covers/new-year.jpg' },
  { _id: 'banner-guochao', picurl: '/static/covers/guochao.jpg' },
  { _id: 'banner-festival', picurl: '/static/covers/festival.jpg' }
]

export const categoryList = [
  { _id: 'new-year', name: '新年', picurl: '/static/covers/new-year.jpg', updateTime: now - DAY },
  { _id: 'guochao', name: '国潮', picurl: '/static/covers/guochao.jpg', updateTime: now - 2 * DAY },
  { _id: 'anime', name: '动漫', picurl: '/static/covers/anime.jpg', updateTime: now - 3 * DAY },
  { _id: 'couple', name: '情侣', picurl: '/static/covers/couple.jpg', updateTime: now - 4 * DAY },
  { _id: 'pets', name: '萌宠', picurl: '/static/covers/pets.jpg', updateTime: now - 5 * DAY },
  { _id: 'minimal', name: '极简', picurl: '/static/covers/minimal.jpg', updateTime: now - 6 * DAY },
  { _id: 'festival', name: '节日', picurl: '/static/covers/festival.jpg', updateTime: now - 7 * DAY }
]

export const coverList = [
  cover({ id: 'cover-001', title: '新岁纳福', classid: 'new-year', className: '新年', image: '/static/covers/new-year.jpg', tabs: ['新年', '喜庆', '好运'], description: '红金灯彩与祥云元素组成的新年主题红包封面。', claimCount: 1286, stock: 420, daysAgo: 1, score: 4.9 }),
  cover({ id: 'cover-002', title: '灯火迎春', classid: 'new-year', className: '新年', image: '/static/covers/new-year.jpg', tabs: ['春节', '灯笼', '红色'], description: '温暖灯火映照新春氛围，适合节日期间使用。', claimCount: 986, stock: 315, daysAgo: 2, score: 4.8 }),
  cover({ id: 'cover-003', title: '岁岁欢喜', classid: 'new-year', className: '新年', image: '/static/covers/new-year.jpg', tabs: ['祝福', '团圆', '金色'], description: '以团圆和祝福为主题的红金配色封面。', claimCount: 756, stock: 280, daysAgo: 3, score: 4.7 }),
  cover({ id: 'cover-004', title: '山河锦绣', classid: 'guochao', className: '国潮', image: '/static/covers/guochao.jpg', tabs: ['国潮', '山水', '祥云'], description: '传统山水、飞鹤与现代构图融合的国潮封面。', claimCount: 1120, stock: 360, daysAgo: 2, score: 4.9 }),
  cover({ id: 'cover-005', title: '东方云起', classid: 'guochao', className: '国潮', image: '/static/covers/guochao.jpg', tabs: ['东方', '云纹', '雅致'], description: '东方云纹与日轮元素构成的雅致红包封面。', claimCount: 834, stock: 250, daysAgo: 4, score: 4.7 }),
  cover({ id: 'cover-006', title: '鹤舞长风', classid: 'guochao', className: '国潮', image: '/static/covers/guochao.jpg', tabs: ['飞鹤', '青绿', '传统'], description: '青绿山色与飞鹤意象，呈现轻盈国风气质。', claimCount: 643, stock: 198, daysAgo: 6, score: 4.6 }),
  cover({ id: 'cover-007', title: '星光派送员', classid: 'anime', className: '动漫', image: '/static/covers/anime.jpg', tabs: ['动漫', '星光', '梦幻'], description: '原创星光使者带来节日惊喜的动漫风封面。', claimCount: 1398, stock: 512, daysAgo: 1, score: 4.9 }),
  cover({ id: 'cover-008', title: '云端礼物', classid: 'anime', className: '动漫', image: '/static/covers/anime.jpg', tabs: ['云朵', '礼物', '活力'], description: '漂浮云朵和礼物元素营造轻快活力氛围。', claimCount: 921, stock: 334, daysAgo: 5, score: 4.8 }),
  cover({ id: 'cover-009', title: '奇遇时刻', classid: 'anime', className: '动漫', image: '/static/covers/anime.jpg', tabs: ['奇遇', '彩色', '原创'], description: '明快配色与原创幻想角色组成的欢乐封面。', claimCount: 688, stock: 220, daysAgo: 8, score: 4.6 }),
  cover({ id: 'cover-010', title: '心意成双', classid: 'couple', className: '情侣', image: '/static/covers/couple.jpg', tabs: ['情侣', '浪漫', '心意'], description: '成双飞鸟与花朵勾勒温柔浪漫的心意。', claimCount: 1056, stock: 288, daysAgo: 2, score: 4.8 }),
  cover({ id: 'cover-011', title: '花间相遇', classid: 'couple', className: '情侣', image: '/static/covers/couple.jpg', tabs: ['花朵', '相遇', '粉色'], description: '柔和花卉与心形构图，适合表达甜蜜祝福。', claimCount: 719, stock: 176, daysAgo: 7, score: 4.7 }),
  cover({ id: 'cover-012', title: '萌宠来福', classid: 'pets', className: '萌宠', image: '/static/covers/pets.jpg', tabs: ['萌宠', '猫咪', '狗狗'], description: '原创猫咪和狗狗从礼物封面中探头送祝福。', claimCount: 1475, stock: 498, daysAgo: 1, score: 5 }),
  cover({ id: 'cover-013', title: '爪爪好运', classid: 'pets', className: '萌宠', image: '/static/covers/pets.jpg', tabs: ['可爱', '爪印', '治愈'], description: '柔和配色搭配可爱爪印，传递轻松治愈感。', claimCount: 864, stock: 306, daysAgo: 6, score: 4.8 }),
  cover({ id: 'cover-014', title: '一抹心意', classid: 'minimal', className: '极简', image: '/static/covers/minimal.jpg', tabs: ['极简', '留白', '质感'], description: '克制留白与折纸造型结合的现代极简封面。', claimCount: 632, stock: 240, daysAgo: 3, score: 4.7 }),
  cover({ id: 'cover-015', title: '简约赤金', classid: 'minimal', className: '极简', image: '/static/covers/minimal.jpg', tabs: ['赤金', '几何', '高级'], description: '赤金几何关系呈现安静而精致的节日心意。', claimCount: 577, stock: 205, daysAgo: 9, score: 4.6 }),
  cover({ id: 'cover-016', title: '欢庆时分', classid: 'festival', className: '节日', image: '/static/covers/festival.jpg', tabs: ['节日', '烟花', '欢庆'], description: '灯彩、烟花与彩带共同营造热闹节日氛围。', claimCount: 1228, stock: 390, daysAgo: 2, score: 4.9 }),
  cover({ id: 'cover-017', title: '灯彩流光', classid: 'festival', className: '节日', image: '/static/covers/festival.jpg', tabs: ['灯彩', '流光', '祝福'], description: '流光灯彩包围红包意象，适合多种庆祝场景。', claimCount: 798, stock: 267, daysAgo: 5, score: 4.7 }),
  cover({ id: 'cover-018', title: '花火祝愿', classid: 'festival', className: '节日', image: '/static/covers/festival.jpg', tabs: ['花火', '礼物', '喜悦'], description: '几何花火与礼物元素传达明亮真挚的祝愿。', claimCount: 690, stock: 184, daysAgo: 10, score: 4.6 })
]

export const recommendedCoverIds = [
  'cover-001',
  'cover-004',
  'cover-007',
  'cover-010',
  'cover-012',
  'cover-014',
  'cover-016',
  'cover-018'
]

export const noticeList = [
  { _id: 'notice-001', title: 'CoverHub 消息' }
]

export const userInfo = {
  IP: '本地访客',
  address: { province: '本地数据' },
  downloadSize: 0,
  scoreSize: 0
}
