/**
 * 声音目录。全部音频直接开放。
 */

import type { NoiseModel } from './noise'

export class SoundCatalog {
  private readonly noises: readonly NoiseModel[]

  constructor(noises: readonly NoiseModel[]) {
    this.noises = noises
  }

  allSounds(): NoiseModel[] {
    return [...this.noises]
  }

  availableSounds(): NoiseModel[] {
    return [...this.noises]
  }

  sound(id: string): NoiseModel | null {
    return this.noises.find((n) => n.id === id) ?? null
  }
}
