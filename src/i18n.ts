/**
 * 简体中文 / 英文 双语文案(纯函数,默认简体中文)。
 * 噪音名/分类名按 id 索引;UI 文案为类型安全的 Messages 对象。
 */

export type Locale = 'zh-Hans' | 'en'

export const DEFAULT_LOCALE: Locale = 'zh-Hans'

export const LOCALE_LABELS: ReadonlyArray<{ locale: Locale; label: string }> = [
  { locale: 'zh-Hans', label: '简体中文' },
  { locale: 'en', label: 'English' },
]

export interface Messages {
  playTooltip: string
  prevTooltip: string
  nextTooltip: string
  timerTooltip: string
  volumeLabel: string
  languageTooltip: string
  timerOff: string
  timer5: string
  timer10: string
  timer30: string
  timerFinished: string
  stopped: string
  loadError: string
  decodeError: string
  audioError: string
}

const MESSAGES: Readonly<Record<Locale, Messages>> = {
  'zh-Hans': {
    playTooltip: '播放/暂停',
    prevTooltip: '上一个',
    nextTooltip: '下一个',
    timerTooltip: '睡眠定时器',
    volumeLabel: '音量',
    languageTooltip: '语言',
    timerOff: '关闭',
    timer5: '5 分钟',
    timer10: '10 分钟',
    timer30: '30 分钟',
    timerFinished: '定时结束',
    stopped: '已停止',
    loadError: '加载音频失败',
    decodeError: '浏览器无法解码',
    audioError: '无法启动音频引擎',
  },
  en: {
    playTooltip: 'Play/Pause',
    prevTooltip: 'Previous',
    nextTooltip: 'Next',
    timerTooltip: 'Sleep Timer',
    volumeLabel: 'Volume',
    languageTooltip: 'Language',
    timerOff: 'Off',
    timer5: '5 minutes',
    timer10: '10 minutes',
    timer30: '30 minutes',
    timerFinished: 'Timer finished',
    stopped: 'Stopped',
    loadError: 'Failed to load audio',
    decodeError: 'Browser cannot decode',
    audioError: 'Cannot start audio engine',
  },
}

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE]
}

/** 噪音显示名:优先当前语言词典,缺省回退英文名 */
export function noiseName(locale: Locale, id: string, fallback: string): string {
  return NOISE_NAMES[locale]?.[id] ?? fallback
}

/** 分类显示名 */
export function categoryName(locale: Locale, id: string, fallback: string): string {
  return CATEGORY_NAMES[locale]?.[id] ?? fallback
}

const CATEGORY_NAMES: Readonly<Record<Locale, Record<string, string>>> = {
  'zh-Hans': {
    noises: '噪音',
    water: '水声',
    appliances: '电器',
    nature: '自然',
    fire: '火',
    vehicles: '交通',
    urban: '城市',
    sleepy: '睡眠',
    classics: '经典',
  },
  en: {
    noises: 'Noises',
    water: 'Water',
    appliances: 'Appliances',
    nature: 'Nature',
    fire: 'Fire',
    vehicles: 'Vehicles',
    urban: 'Urban',
    sleepy: 'Sleepy',
    classics: 'Classics',
  },
}

const NOISE_NAMES: Readonly<Record<Locale, Record<string, string>>> = {
  'zh-Hans': {
    'white-noise': '白噪音',
    'pink-noise': '粉红噪音',
    'brown-noise': '棕噪音',
    'green-noise': '绿噪音',
    'grey-noise': '灰噪音',
    'light-rain': '雨声',
    'heavy-rain': '大雨',
    'drippy-rain': '滴雨',
    thunderstorm: '雷暴',
    'distant-thunder': '远雷',
    'rain-on-tent': '帐篷雨声',
    creek: '小溪',
    river: '河流',
    lake: '湖泊',
    waterfall: '瀑布',
    underwater: '水下',
    fountain: '喷泉',
    shower: '淋浴',
    'desk-fan': '台扇',
    'air-conditioner': '空调',
    vacuum: '吸尘器',
    microwave: '微波炉',
    'washing-machine': '洗衣机',
    'hair-dryer': '吹风机',
    beach: '海滩',
    'windy-trees': '风吹树',
    'wind-chimes': '风铃',
    crickets: '蟋蟀',
    birds: '鸟鸣',
    seagulls: '海鸥',
    frogs: '青蛙',
    'cat-purring': '猫呼噜',
    campfire: '篝火',
    fireplace: '壁炉',
    fireworks: '烟花',
    'airplane-interior': '飞机舱内',
    car: '汽车',
    'spaceship-engine': '飞船引擎',
    'steam-train': '蒸汽火车',
    'freight-train': '货运列车',
    'ship-deck': '船甲板',
    'coffee-shop': '咖啡馆',
    'city-street': '城市街道',
    office: '办公室',
    'train-station': '火车站',
    construction: '施工',
    keyboard: '键盘',
    'laptop-fans': '笔记本风扇',
    'lawn-mower': '割草机',
    flag: '旗帜',
    lullaby: '摇篮曲',
    snoring: '打鼾',
    'rain-classic': '经典雨声',
    'thunderstorm-classic': '经典雷暴',
  },
  en: {}, // 英文名即 CatalogEntry.name,回退即可
}
