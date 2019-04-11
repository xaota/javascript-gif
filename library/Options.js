import Vector from "../../javascript-algebra/library/vector";

/** {Options} Параметры GIF @class
  *
  */
  export default class Options {
  /** {Options} @constructor
    * @param {object} options параметры Gif
    */
    constructor(options) {
      this.data = Object.assign(getDefaultOptions(), options);
      if (this.data.viewport.size !== null) this.data.viewport.is = true;
    }

  /** */
    get viewport() {
      return this.data.viewport.size;
    }

  /** */
    get offset() {
      return this.data.viewport.offset;
    }

  /** */
    get size() {
      return this.data.size;
    }

  /** */
    get is() {
      return this.data.viewport.is;
    }
  }

// #region [Private]
/** */
  function getDefaultOptions() {
    return {
      viewport: {
        offset: Vector.zero,
        size  : null,
        is    : false
      },
      size: null
    }
  }
// #endregion
