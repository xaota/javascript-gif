/** */
  export default class LZW {
  /** */
    constructor(data, minCodeSize) {
      this.data = data;
      this.minCodeSize = minCodeSize;

      // TODO: Now that the GIF parser is a bit different, maybe this should get an array of bytes instead of a String?
      this.pos  = 0; // Maybe this streaming thing should be merged with the Stream?
      this.clearCode = 1 << this.minCodeSize;
      this.eoiCode = this.clearCode + 1;
      this.codeSize = this.minCodeSize + 1;

      this.dict = [];
    }

  /** */
    decode() {
      const output = [];
      var code;
      var last;

      while (true) {
        last = code;
        code = this.readCode(this.codeSize);

        if (code === this.clearCode) {
          this.clear();
          continue;
        }
        if (code === this.eoiCode) break;

        if (code < this.dict.length) {
          if (last !== this.clearCode) this.dict.push(this.dict[last].concat(this.dict[code][0]));
        } else {
          if (code !== this.dict.length) throw new Error('Invalid LZW code.');
          this.dict.push(this.dict[last].concat(this.dict[last][0]));
        }
        output.push(...this.dict[code]);

        // If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
        if (this.dict.length === (1 << this.codeSize) && this.codeSize < 12) ++this.codeSize;
      }

      // I don't know if this is technically an error, but some GIFs do it.
      // if (Math.ceil(pos / 8) !== data.length) throw new Error('Extraneous LZW bytes.');
      return output;
    }

  /** */
    readCode(size) {
      var code = 0;
      for (var i = 0; i < size; ++i) {
        const condition = this.data.charCodeAt(this.pos >> 3) & (1 << (this.pos & 7));
        if (condition) code |= 1 << i;
        ++this.pos;
      }
      return code;
    }

  /** */
    clear() {
      this.dict = [];
      this.codeSize = this.minCodeSize + 1;
      for (var i = 0; i < this.clearCode; ++i) this.dict[i] = [i];
      this.dict[this.clearCode] = [];
      this.dict[this.eoiCode] = null;
    }

  /** LZW (GIF-specific) / parseCT
    * @param {number} entries количество блоков
    * @param {Stream} stream поток чтение GIF
    * @return {array} colors
    */
    static parseCT(entries, stream) { // Each entry is 3 bytes, for RGB.
      var ct = [];
      for (var i = 0; i < entries; ++i) ct.push(stream.readBytes(3));
      return ct;
    }
  }
