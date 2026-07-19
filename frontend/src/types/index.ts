export interface CaptureRegion {
  x: number
  y: number
  width: number
  height: number
}

export interface TransparentImage {
  data: Uint8Array
  width: number
  height: number
}

export type CaptureState = 'idle' | 'capturing' | 'processing' | 'complete' | 'error'

export interface ExtractionEngine {
  removeBackground(image: ImageData): Promise<TransparentImage>
}
