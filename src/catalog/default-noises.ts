/**
 * 内置噪音目录(54 项)。
 *
 * crossFade/randomStart 为循环播放策略;音频文件与图标资源一一对应。
 */

import type { NoiseModel } from '../domain/noise'

/** UI 展示用目录项:领域模型 + 分类与图标 */
export interface CatalogEntry extends NoiseModel {
  categoryId: string
  /** public/icons/ 下的图标文件 */
  icon: string
}

export interface NoiseCategoryInfo {
  id: string
  name: string
}

/** 分类顺序 */
export const NOISE_CATEGORIES: readonly NoiseCategoryInfo[] = [
  { id: 'noises', name: 'Noises' },
  { id: 'water', name: 'Water' },
  { id: 'appliances', name: 'Appliances' },
  { id: 'nature', name: 'Nature' },
  { id: 'fire', name: 'Fire' },
  { id: 'vehicles', name: 'Vehicles' },
  { id: 'urban', name: 'Urban' },
  { id: 'sleepy', name: 'Sleepy' },
  { id: 'classics', name: 'Classics' },
]

const ICONS = {
  whiteNoise: '/icons/icon_white-noise-transparent.svg',
  pinkNoise: '/icons/icon_pink-noise-transparent.svg',
  brownNoise: '/icons/icon_brown-noise-transparent.svg',
  greenNoise: '/icons/icon_green-noise-transparent@2x.png',
  greyNoise: '/icons/icon_grey-noise-transparent.svg',
  lightRain: '/icons/icon_light-rain-transparent.svg',
  heavyRain: '/icons/icon_heavy-rain-transparent.svg',
  drippyRain: '/icons/icon_drippy-rain-transparent.svg',
  thunderstorm: '/icons/icon_thunderstorm-transparent.svg',
  distantThunder: '/icons/icon_distant-thunder-transparent.svg',
  rainOnTent: '/icons/icon_rain-on-tent-transparent.svg',
  creek: '/icons/icon_creek-transparent.svg',
  river: '/icons/icon_river-transparent.svg',
  lake: '/icons/icon_lake-transparent.svg',
  waterfall: '/icons/icon_waterfall-transparent.svg',
  underwater: '/icons/icon_underwater-transparent.svg',
  fountain: '/icons/icon_fountain-transparent.svg',
  shower: '/icons/icon_shower-transparent.svg',
  fan: '/icons/icon_fan-transparent.svg',
  airConditioner: '/icons/icon_air-conditioner-transparent.svg',
  vacuum: '/icons/icon_vacuum-transparent.svg',
  microwave: '/icons/icon_microwave-transparent.svg',
  washingMachine: '/icons/icon_washing-machine-transparent.svg',
  hairDryer: '/icons/icon_hair-dryer-transparent.svg',
  laptopFan: '/icons/icon_laptop-fan-transparent.svg',
  beach: '/icons/icon_beach-transparent.svg',
  windyTrees: '/icons/icon_windy-trees-transparent.svg',
  windChimes: '/icons/icon_wind-chimes-transparent.svg',
  cricket: '/icons/icon_cricket-transparent.svg',
  bird: '/icons/icon_bird-transparent.svg',
  seagulls: '/icons/icon_seagulls-transparent.svg',
  frogs: '/icons/icon_frogs-transparent.svg',
  catPurring: '/icons/icon_cat-purring-transparent.svg',
  campfire: '/icons/icon_campfire-transparent.svg',
  fireplace: '/icons/icon_fireplace-transparent.svg',
  fireworks: '/icons/icon_fireworks-transparent.svg',
  flag: '/icons/icon_flag-transparent.svg',
  car: '/icons/icon_car-transparent.svg',
  airplane: '/icons/icon_airplane-transparent.svg',
  spaceship: '/icons/icon_spaceship-transparent.svg',
  steamTrain: '/icons/icon_steam-train-transparent.svg',
  freightTrain: '/icons/icon_freight-train-transparent.svg',
  sailboat: '/icons/icon_sailboat-transparent.svg',
  coffee: '/icons/icon_coffee-transparent.svg',
  city: '/icons/icon_city-transparent.svg',
  office: '/icons/icon_office-transparent.svg',
  trainStation: '/icons/icon_train-station-transparent.svg',
  jackhammer: '/icons/icon_jackhammer-transparent.svg',
  keyboard: '/icons/icon_keyboard-transparent.svg',
  lawnMower: '/icons/icon_lawn-mower-transparent.svg',
  cribMobile: '/icons/icon_crib-mobile-transparent@2x.png',
  snoring: '/icons/icon_snoring-transparent.svg',
} as const

export const DEFAULT_NOISES: readonly CatalogEntry[] = [
  // —— Noises(彩色噪音:crossFade=0, randomStart=1)——
  { id: 'white-noise', name: 'White Noise', fileName: 'WhiteNoise', fileExtension: 'wav', crossFade: false, randomStart: true, categoryId: 'noises', icon: ICONS.whiteNoise },
  { id: 'pink-noise', name: 'Pink Noise', fileName: 'PinkNoise', fileExtension: 'wav', crossFade: false, randomStart: true, categoryId: 'noises', icon: ICONS.pinkNoise },
  { id: 'brown-noise', name: 'Brown Noise', fileName: 'BrownNoise', fileExtension: 'wav', crossFade: false, randomStart: true, categoryId: 'noises', icon: ICONS.brownNoise },
  { id: 'green-noise', name: 'Green Noise', fileName: 'green-noise', fileExtension: 'wav', crossFade: false, randomStart: true, categoryId: 'noises', icon: ICONS.greenNoise },
  { id: 'grey-noise', name: 'Grey Noise', fileName: 'GreyNoise', fileExtension: 'wav', crossFade: false, randomStart: true, categoryId: 'noises', icon: ICONS.greyNoise },

  // —— Water ——
  { id: 'light-rain', name: 'Rain', fileName: 'rain-remastered', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'water', icon: ICONS.lightRain },
  { id: 'heavy-rain', name: 'Heavy Rain', fileName: 'HeavyRain', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'water', icon: ICONS.heavyRain },
  { id: 'drippy-rain', name: 'Drippy Rain', fileName: 'DrippyRain', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'water', icon: ICONS.drippyRain },
  { id: 'thunderstorm', name: 'Thunderstorm', fileName: 'thunderstorm-remastered', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'water', icon: ICONS.thunderstorm },
  { id: 'distant-thunder', name: 'Distant Thunder', fileName: 'Thunderstorm-2', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'water', icon: ICONS.distantThunder },
  { id: 'rain-on-tent', name: 'Rain on Tent', fileName: 'RainOnTent', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'water', icon: ICONS.rainOnTent },
  { id: 'creek', name: 'Creek', fileName: 'Creek', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'water', icon: ICONS.creek },
  { id: 'river', name: 'River', fileName: 'River', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'water', icon: ICONS.river },
  { id: 'lake', name: 'Lake', fileName: 'LakeWaterLapping', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'water', icon: ICONS.lake },
  { id: 'waterfall', name: 'Waterfall', fileName: 'Waterfall', fileExtension: 'wav', crossFade: false, randomStart: true, categoryId: 'water', icon: ICONS.waterfall },
  { id: 'underwater', name: 'Underwater', fileName: 'Underwater', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'water', icon: ICONS.underwater },
  { id: 'fountain', name: 'Fountain', fileName: 'Fountain', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'water', icon: ICONS.fountain },
  { id: 'shower', name: 'Shower', fileName: 'Shower', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'water', icon: ICONS.shower },

  // —— Appliances ——
  { id: 'desk-fan', name: 'Desk Fan', fileName: 'Fan', fileExtension: 'wav', crossFade: false, randomStart: true, categoryId: 'appliances', icon: ICONS.fan },
  { id: 'air-conditioner', name: 'Air Conditioner', fileName: 'AirConditioner', fileExtension: 'wav', crossFade: false, randomStart: true, categoryId: 'appliances', icon: ICONS.airConditioner },
  { id: 'vacuum', name: 'Vacuum', fileName: 'Vacuum', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'appliances', icon: ICONS.vacuum },
  { id: 'microwave', name: 'Microwave', fileName: 'Microwave', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'appliances', icon: ICONS.microwave },
  { id: 'washing-machine', name: 'Washing Machine', fileName: 'WashingMachine', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'appliances', icon: ICONS.washingMachine },
  { id: 'hair-dryer', name: 'Hair Dryer', fileName: 'HairDryer', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'appliances', icon: ICONS.hairDryer },

  // —— Nature ——
  { id: 'beach', name: 'Beach', fileName: 'beach-remastered', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'nature', icon: ICONS.beach },
  { id: 'windy-trees', name: 'Windy Trees', fileName: 'WindyTrees', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'nature', icon: ICONS.windyTrees },
  { id: 'wind-chimes', name: 'Wind Chimes', fileName: 'WindChimes', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'nature', icon: ICONS.windChimes },
  { id: 'crickets', name: 'Crickets', fileName: 'Crickets', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'nature', icon: ICONS.cricket },
  { id: 'birds', name: 'Birds', fileName: 'Birds', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'nature', icon: ICONS.bird },
  { id: 'seagulls', name: 'Seagulls', fileName: 'Seagulls', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'nature', icon: ICONS.seagulls },
  { id: 'frogs', name: 'Frogs', fileName: 'Frogs', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'nature', icon: ICONS.frogs },
  { id: 'cat-purring', name: 'Cat Purring', fileName: 'CatPurring3', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'nature', icon: ICONS.catPurring },

  // —— Fire ——
  { id: 'campfire', name: 'Campfire', fileName: 'Campfire', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'fire', icon: ICONS.campfire },
  { id: 'fireplace', name: 'Fireplace', fileName: 'Fireplace', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'fire', icon: ICONS.fireplace },
  { id: 'fireworks', name: 'Fireworks', fileName: 'Fireworks', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'fire', icon: ICONS.fireworks },

  // —— Vehicles ——
  { id: 'airplane-interior', name: 'Airplane Interior', fileName: 'airplane-remastered', fileExtension: 'wav', crossFade: true, randomStart: true, categoryId: 'vehicles', icon: ICONS.airplane },
  { id: 'car', name: 'Car', fileName: 'Car', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'vehicles', icon: ICONS.car },
  { id: 'spaceship-engine', name: 'Spaceship Engine', fileName: 'SpaceshipEngine', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'vehicles', icon: ICONS.spaceship },
  { id: 'steam-train', name: 'Steam Train', fileName: 'TrainInterior', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'vehicles', icon: ICONS.steamTrain },
  { id: 'freight-train', name: 'Freight Train', fileName: 'TrainPassing', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'vehicles', icon: ICONS.freightTrain },
  { id: 'ship-deck', name: 'Ship Deck', fileName: 'ShipDeck', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'vehicles', icon: ICONS.sailboat },

  // —— Urban ——
  { id: 'coffee-shop', name: 'Coffee Shop', fileName: 'CoffeeShop', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'urban', icon: ICONS.coffee },
  { id: 'city-street', name: 'City Street', fileName: 'CityStreet', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'urban', icon: ICONS.city },
  { id: 'office', name: 'Office', fileName: 'Office', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'urban', icon: ICONS.office },
  { id: 'train-station', name: 'Train Station', fileName: 'TrainStation', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'urban', icon: ICONS.trainStation },
  { id: 'construction', name: 'Construction', fileName: 'Construction', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'urban', icon: ICONS.jackhammer },
  { id: 'keyboard', name: 'Keyboard', fileName: 'Keyboard', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'urban', icon: ICONS.keyboard },
  { id: 'laptop-fans', name: 'Laptop Fans', fileName: 'MacbookProFans', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'urban', icon: ICONS.laptopFan },
  { id: 'lawn-mower', name: 'Lawn Mower', fileName: 'LawnMower', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'urban', icon: ICONS.lawnMower },
  { id: 'flag', name: 'Flag', fileName: 'FlagFlapping', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'urban', icon: ICONS.flag },

  // —— Sleepy ——
  { id: 'lullaby', name: 'Lullaby', fileName: 'Lullaby', fileExtension: 'mp3', crossFade: false, randomStart: false, categoryId: 'sleepy', icon: ICONS.cribMobile },
  { id: 'snoring', name: 'Snoring', fileName: 'Snoring', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'sleepy', icon: ICONS.snoring },

  // —— Classics ——
  { id: 'rain-classic', name: 'Rain Classic', fileName: 'rain-classic', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'classics', icon: ICONS.lightRain },
  { id: 'thunderstorm-classic', name: 'Thunderstorm Classic', fileName: 'thunderstorm-classic', fileExtension: 'mp3', crossFade: true, randomStart: true, categoryId: 'classics', icon: ICONS.thunderstorm },
]

/** 按分类顺序分组(UI 与测试共用;防止分类 id 拼写错误导致条目丢失) */
export function groupEntriesByCategory(
  entries: readonly CatalogEntry[],
): Array<{ category: NoiseCategoryInfo; members: CatalogEntry[] }> {
  return NOISE_CATEGORIES.map((category) => ({
    category,
    members: entries.filter((e) => e.categoryId === category.id),
  })).filter((group) => group.members.length > 0)
}
