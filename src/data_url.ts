import { Base64, HttpUtils, MediaType, Percent, StringEx } from "../deps.ts";

const {
  ASCII_WHITESPACE,
} = HttpUtils.Pattern;

export namespace DataURL {
  export class Resource {
    #type: string;
    #data: ArrayBuffer;
    private constructor(data: ArrayBuffer, type: string) {
      this.#data = data;
      this.#type = type;
      Object.freeze(this);
    }

    get type(): string {
      return this.#type;
    }

    get data(): ArrayBuffer {
      return this.#data;
    }

    static create(type: string | MediaType, data: BufferSource): Resource {
      let mediaType: MediaType;
      if (type instanceof MediaType) {
        mediaType = type;
      } else if (typeof type === "string") {
        mediaType = MediaType.fromString(type);
      } else {
        throw new TypeError("type");
      }

      let buffer: ArrayBuffer;
      if (data instanceof ArrayBuffer) {
        buffer = data;
      } else if (ArrayBuffer.isView(data)) {
        buffer = data.buffer;
      } else {
        throw new TypeError("buffer");
      }

      return new Resource(buffer, mediaType.toString());
    }

    static fromURL(dataUrl: URL): Resource {
      // 1
      if (dataUrl.protocol !== "data:") {
        throw new TypeError(`URL scheme is not "data"`);
      }

      // 2
      // https://fetch.spec.whatwg.org/#data-urls に従い、フラグメントは無視する
      dataUrl.hash = "";

      // 3, 4
      let bodyStringWork = dataUrl.toString().substring(5);

      // 5, 6, 7
      if (bodyStringWork.includes(",") !== true) {
        throw new TypeError("U+002C not found");
      }

      // 最初に出現した","をメディアタイプとデータの区切りとみなす。
      // https://fetch.spec.whatwg.org/#data-urls に従い
      // ・メディアタイプのquotedなパラメーター値に含まれた","とみなせる場合であっても区切りとする
      // ・クエリはデータの一部とみなす
      const mediaTypeOriginal = bodyStringWork.split(",")[0] as string;
      let mediaTypeStr = StringEx.trim(mediaTypeOriginal, ASCII_WHITESPACE);

      // 8, 9
      bodyStringWork = bodyStringWork.substring(mediaTypeOriginal.length + 1);

      // 10
      let bytes = Percent.decode(bodyStringWork);

      // 11
      const base64Indicator = /;[\u0020]*base64$/i;
      const base64: boolean = base64Indicator.test(mediaTypeStr);
      if (base64 === true) {
        // 11.1
        bodyStringWork = StringEx.Isomorphic.decode(bytes);

        // 11.2, 11.3
        bytes = Base64.decode(bodyStringWork);

        // 11.4, 11.5, 11.6
        mediaTypeStr = mediaTypeStr.replace(base64Indicator, "");
      }

      // 12
      if (mediaTypeStr.startsWith(";")) {
        mediaTypeStr = "text/plain" + mediaTypeStr;
      }

      // 13, 14
      let mediaType: MediaType;
      try {
        mediaType = MediaType.fromString(mediaTypeStr);
      } catch (exception) {
        void exception;
        mediaType = MediaType.fromString("text/plain;charset=US-ASCII");
      }

      return new Resource(bytes.buffer, mediaType.toString());
    }

    static fromString(dataUrlStr: string): Resource {
      let dataUrl: URL;
      try {
        dataUrl = new URL(dataUrlStr);
      } catch (exception) {
        void exception;
        throw new TypeError("dataUrlStr does not reperesent URL");
      }

      return Resource.fromURL(dataUrl);
    }

    static from(dataUrl: URL | string): Resource {
      if (dataUrl instanceof URL) {
        return Resource.fromURL(dataUrl);
      } else if (typeof dataUrl === "string") {
        return Resource.fromString(dataUrl);
      }
      throw new TypeError("dataUrl");
    }

    //TODO options.base64
    toURL(): URL {
      return new URL(this.toString());
    }

    // FileReaderの仕様に倣い、テキストかどうかに関係なく常時Base64エンコードする仕様
    //TODO options.base64
    toString(): string {
      // let encoding = "";
      // let dataEncoded: string;
      // if (base64) {
      const encoding = ";base64";
      const dataEncoded = Base64.encode(new Uint8Array(this.#data));
      // }

      return "data:" + this.#type + encoding + "," + dataEncoded;
    }
  }
  Object.freeze(Resource);
}
