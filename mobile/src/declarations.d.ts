declare module "*.css" {}
declare module "*.onnx" {
  const value: number;
  export default value;
}
declare module "jpeg-js" {
  import type { RawImageData } from "jpeg-js";
  export function decode(
    data: ArrayLike<number> | ArrayBuffer,
    useTypedArray: true
  ): RawImageData<Uint8Array>;
  export function encode(
    imgData: RawImageData<Uint8Array | Buffer>,
    qu?: number
  ): RawImageData<Buffer>;
}
