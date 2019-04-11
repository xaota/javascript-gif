import HDR   from './HDR.js';
import Block from './Block.js';

// #region [Data]
  const types = {
    '!': 'ext',
    ',': 'img',
    ';': 'eof'
  };
// #endregion

/** {Parser} Анализ и разбор содержимого Gif-файла @class
  *
  */
  export default class Parser {
  /** Инициализация парсера из потока данных @constructor
    * @param {Stream} stream поток данных из {Uint8Array} gif-файла
    */
    constructor(stream) {
      this.stream = stream;
    }

  /** / parseBlock */
    parseBlock(handler, index = 0) {
      const stream   = this.stream;
      const byte     = stream.readByte();
      const sentinel = String.fromCharCode(byte);
      const type     = types[sentinel];
      if (!type) throw new Error('Unknown block: 0x' + sentinel.toString(16)); // TODO: Pad this with a 0.
      if (type === 'eof') return handler.eof();
      Block[type](stream, handler);
      this.parseBlock(handler, ++index);
    }

  /** / gif @async
    * @param {Handler} handler обработчики парсинга
    * @return {Promise} обработка gif
    */
    gif(handler) {
      const hdr = HDR.init(this.stream);
      handler.hdr(hdr);
      return new Promise(resolve => {
        this.parseBlock(handler);
        resolve();
      });
    }
  }
