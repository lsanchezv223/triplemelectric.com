declare module "heic-convert" {
  type ConvertOptions = {
    buffer: Buffer;
    format: "JPEG" | "PNG";
    quality?: number;
    all?: boolean;
  };

  type ConvertFunction = (options: ConvertOptions) => Promise<Buffer>;

  const convert: ConvertFunction & {
    all: ConvertFunction;
  };

  export default convert;
}
