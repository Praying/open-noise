/**
 * 噪音模型。
 *
 * - crossFade:循环时使用 head⊕tail 交叉淡化
 * - randomStart:从随机偏移开始播放(连续频谱噪音避免开头可感知)
 */

export interface NoiseModel {
  id: string
  name: string
  fileName: string
  fileExtension: string
  crossFade: boolean
  randomStart: boolean
}

/** 音频资源 URL(提取包位于 public/audio) */
export function audioUrl(noise: NoiseModel): string {
  return `/audio/${noise.fileName}.${noise.fileExtension}`
}
