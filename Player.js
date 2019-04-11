// import Gif from './Gif.js';

/** {Player} Gif Player - управление воспроизведением Gif @class
  *
  */
  export default class Player {
  /** {Player} Инициализация плеера @constructor
    * @param {Gif} gif изображение-анимация
    */
    constructor(gif, context) {
      this.gif = gif;
      if (context) this.init(context);
      this.current = null;
      this.pause();
    }

  /** */
    init(context) {
      this.context = context;
      return this;
    }

  /** */
    resize(context = this.context) {
      if (!context) return this;

      const x = this.gif.size.x;
      const y = this.gif.size.y;
      const px = 'px';
      context.canvas.width  = x;
      context.canvas.height = y;
      context.canvas.style.width  = x + px;
      context.canvas.style.height = y + px;
      return this;
    }

  /** / render @chainable
    * @param {number} index номер кадра
    * @return {Player} @this
    */
    render(index = 0) {
      this.current = index;
      frame(this.gif.frames, this.context, this.current);
      return this;
    }

  /** / play @chainable
    * @return {Player} @this
    */
    play() {
      this.active = true;
      cooldown.call(this);
      return this;

      /** */
        function cooldown() {
          if (!this.active) return;
          const delay = this.gif.frames[this.current].delay;
          frame(this.gif.frames, this.context, this.current);
          this.current = (this.current + 1) % this.gif.length; // !
          setTimeout(cooldown.bind(this), delay);
        }
    }

  /** / pause @chainable
    * @return {Player} @this
    */
    pause() {
      this.active = false;
      return this;
    }

  /** / shift @chainable
    * @param {number} index относительное число кадров для смещения
    * @return {Player} @this
    */
    shift(index) {
      this.current = this.current + index;
      if (this.current < 0) this.current = this.gif.length - 1;
      if (this.current === this.gif.length) this.current = 0;
      frame(this.gif.frames, this.context, this.current);
      return this;
    }
  }

// #region [Private]
/** */
  function frame(frames, context, index) {
    const frame = frames[index].data;
    context.putImageData(frame, 0, 0);
  }
// #endregion
