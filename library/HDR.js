import Vector from '../../javascript-algebra/library/vector.js';
import LZW    from './lzw.js';
import {byteToBitArr, bitsToNum} from './common.js';
// import Stream from './Stream.js';

/** {HDR}  @class
  *
  */
  export default class HDR {
  /** {HDR} @constructor
    * @param {}
    */
    constructor(data) {
      this.data = data;
    }

  /** */
    get signum() {
      return this.data.signum;
    }

  /** */
    get version() {
      return this.data.version;
    }

  /** */
    get size() {
      return this.data.size;
    }

  /** */
    get colors() {
      return this.data.colors;
    }

  /** */
    get sorted() {
      return this.data.sorted;
    }

  /** */
    get background() {
      return this.data.background;
    }

  /** */
    get pixelAspectRatio() {
      return this.data.pixelAspectRatio;
    }

  /** */
    get gct() {
      return this.data.gct;
    }

  /** */
    static init(stream, gctHandler = LZW.parseCT) {
      const data = {};

      data.signum  = signum(stream);
      data.version = stream.read(3);
      data.size    = size(stream);

      const bits  = byteToBitArr(stream.readByte());
      const gct   = bits.shift();
      data.colors = bitsToNum(bits.splice(0, 3));
      data.sorted = bits.shift();
      const count = bitsToNum(bits.splice(0, 3));

      data.background = stream.readByte();
      data.pixelAspectRatio = stream.readByte(); // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64

      const entries = 1 << (count + 1);
      data.gct = gct
        ? gctHandler(entries, stream)
        : [];

      return new HDR(data);
    }
  }

// #region [Private]
/** */
  function signum(stream, length = 3) {
    const signum = stream.read(length);
    if (signum !== 'GIF') throw new Error('not a GIF file'); // XXX: This should probably be handled more nicely.
    return signum;
  }

/**
  * @return {Vector} размеры
  */
  function size(stream) {
    const width  = stream.readUnsigned();
    const height = stream.readUnsigned();
    return Vector.from(width, height);
  }
// #endregion
