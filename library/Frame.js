/** {Frame} Кадр Gif @class
  *
  */
  export default class Frame {
  /** Создание кадра {Frame} @constructor
    * @param {HDR} hdr данные кадра
    * @param {object} frame данные кадра
    * @param {number} delay продолжительность отображения кадра
    */
    constructor(hdr, frame, delay) {
      const data = frame.getImageData(0, 0, hdr.size.x, hdr.size.y); // context
      const size = hdr.size;
      const image = new Image();
      image.src = frame.canvas.toDataURL();
      if (delay === 0) delay = 10;
      this.meta = {
        data,
        size,
        image,
        delay: delay * 10
      }
    }

  /** */
    get size() {
      return this.meta.size
    }

  /** */
    get image() {
      return this.meta.image;
    }

  /** */
    get data() {
      return this.meta.data;
    }

  /** */
    get delay() {
      return this.meta.delay;
    }
  }
