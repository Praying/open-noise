import { describe, expect, test } from 'vitest'
import {
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  categoryName,
  getMessages,
  noiseName,
  type Locale,
} from './i18n'
import { DEFAULT_NOISES, NOISE_CATEGORIES } from './catalog/default-noises'

describe('i18n', () => {
  test('默认语言为简体中文', () => {
    expect(DEFAULT_LOCALE).toBe('zh-Hans')
  })

  test('两种语言各有一份完整文案', () => {
    const required: Array<keyof ReturnType<typeof getMessages>> = [
      'playTooltip',
      'timerTooltip',
      'timerOff',
      'loadError',
      'decodeError',
      'audioError',
    ]
    for (const locale of ['zh-Hans', 'en'] as Locale[]) {
      const messages = getMessages(locale)
      for (const key of required) {
        expect(messages[key]).toBeTruthy()
      }
    }
  })

  test('未知语言回退到默认语言', () => {
    const messages = getMessages('fr' as Locale)
    expect(messages).toEqual(getMessages(DEFAULT_LOCALE))
  })

  test('每个噪音都有简体中文名,未知 id 回退英文名', () => {
    for (const entry of DEFAULT_NOISES) {
      expect(noiseName('zh-Hans', entry.id, entry.name)).not.toBe(entry.name)
    }
    expect(noiseName('zh-Hans', 'unknown-id', 'Fallback')).toBe('Fallback')
    expect(noiseName('en', 'white-noise', 'White Noise')).toBe('White Noise')
  })

  test('每个分类都有简体中文名', () => {
    for (const category of NOISE_CATEGORIES) {
      expect(categoryName('zh-Hans', category.id, category.name)).not.toBe(category.name)
    }
  })

  test('语言切换标签齐全', () => {
    expect(LOCALE_LABELS.map((l) => l.locale)).toEqual(['zh-Hans', 'en'])
    expect(LOCALE_LABELS[0].label).toBe('简体中文')
    expect(LOCALE_LABELS[1].label).toBe('English')
  })
})
