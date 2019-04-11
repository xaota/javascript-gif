import Stream  from './library/Stream.js';
// import Options from './library/Options.js';
import Parser  from './library/Parser.js';
import Handler from './library/Handler.js';
import Vector from '../javascript-algebra/library/vector.js';

/** {Gif} Работа с Gif @class
  *
  */
  export default class Gif {
  /** Инициализация {Gif} @constructor
    * @param {Handler} handler параметры
    */
    constructor() {
      this.data = {
        frames: [],
        size: Vector.zero
      };
    }

  /**
    * @param {Handler} handler параметры
   */
    init(handler) {
      this.data.frames = handler.frames;
      this.data.size   = handler.data.hdr.size;
      return this;
    }

  /** / size */
    get size() {
      return this.data.size;
    }

  /** / frames */
    get frames() {
      return this.data.frames;
    }

  /** / length */
    get length() {
      return this.frames.length;
    }

  /** / frame */
    frame(index) {
      return this.frames[index];
    }

  /** / delay */
    delay(index) {
      const frames = this.frames;
      return index !== undefined
        ? frames[index].delay
        : frames
            .map(frame => frame.delay)
            .reduce((o, e) => o + e, 0);
    }

  /** / fetch @async @static
    * @param {string} src адрес загрузки gif
    * @return {Gif} gif
    */
    static async fetch(src) {
      const response = await fetch(src);
      const buffer   = await response.arrayBuffer();
      const data     = new Uint8Array(buffer);
      return await Gif.raw(data);
    }

  /** / raw @async @static
    * @param {Unit8Array} data данные GIF файла
    * @return {Gif} gif
    */
    static async raw(data) { // ! try..catch
      const stream  = new Stream(data);
      const parser  = new Parser(stream);
      const handler = new Handler();
      await parser.gif(handler);
      return new Gif().init(handler);
    }
  }
