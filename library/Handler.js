import Frame from './Frame.js';

/** {Handler}  @class
  *
  */
  export default class Handler {
  /** {Handler} @constructor
    // * @param {Options} options параметры
    */
    constructor() {
      this.frame = null;
      this.frames = [];
      this.data = {};
    }

  /** / img */
    img(...args) {
      return withProgress.call(this, doIMG)(...args);
    }

  /** / hdr */
    hdr(...args) {
      this.data.hdr = args[0];
      return withProgress.call(this, doHDR)(...args);
    }

  /** / gce */
    gce(...args) {
      return withProgress.call(this, doGCE)(...args);
    }

  /** / com (comments?) */
    com(...args) {
      this; // stream
      return withProgress(doNothing)(...args);
    }

  /** / eof */
    eof(block) {
      // const options = this.options.data;
      // const canvas  = this.canvas;
      const hdr     = this.data.hdr; // !
      //toolbar.style.display = '';
      pushFrame.call(this, hdr);
      // doDecodeProgress(false);
      // if (!(options.c_w && options.c_h)) {
      //   canvas.width  = hdr.width  * get_canvas_scale.call(this);
      //   canvas.height = hdr.height * get_canvas_scale.call(this);
      // }
      // this.player.init(this, get_canvas_scale.bind(this));
      // loading = false;
      // if (load_callback) load_callback(gif);
    }

  /** / app - I guess that's all for now. */
    get app() {
      this;
      return {
      /** TODO: Is there much point in actually supporting iterations? */
        NETSCAPE(...args) {
          this; // stream
          return withProgress(doNothing)(...args);
        }
      }
    }
  }

// #region [Private]
/** / withProgress
  * @param{boolean=} draw Whether to draw progress bar or not; this is not idempotent because of translucency.
  *                  Note that this means that the text will be unsynchronized with the progress bar on non-frames;
  *                  but those are typically so small (GCE etc.) that it doesn't really matter. TODO: Do this properly.
  * @this {Handler}
  */
  function withProgress(fn, draw) {
    return block => {
      fn.call(this, block);
      // doDecodeProgress(draw);
    }
  }

/** / doIMG
  * @this {Handler}
  */
  function doIMG(img) {
    const hdr = this.data.hdr; // !
    // if (!this.frame) this.frame = this.temp.getContext('2d');
    const canvas = document.createElement('canvas');
    canvas.style.width  = hdr.size.x + 'px';
    canvas.style.height = hdr.size.y + 'px';
    canvas.width  = hdr.size.x;
    canvas.height = hdr.size.y;
    const frame = this.frame || canvas.getContext('2d');

    var currIdx = this.frames.length;

    //ct = color table, gct = global color table
    var ct = img.lctFlag ? img.lct : hdr.gct; // TODO: What if neither exists?

    /*
    Disposal method indicates the way in which the graphic is to be treated after being displayed.

    Values: 0 - No disposal specified. The decoder is not required to take any action.
            1 - Do not dispose. The graphic is to be left in place.
            2 - Restore to background color. The area used by the graphic must be restored to the background color.
            3 - Restore to previous. The decoder is required to restore the area overwritten by the graphic with what was there prior to rendering the graphic.
            Importantly, "previous" means the frame state after the last disposal of method 0, 1, or 2.
    */
    if (currIdx > 0) {
      if (this.lastDisposalMethod === 3) {
        // Restore to previous
        // If we disposed every frame including first frame up to this point, then we have
        // no composited frame to restore to. In this case, restore to background instead.
        if (this.disposalRestoreFromIdx !== null) {
          frame.putImageData(this.frames[this.disposalRestoreFromIdx].data, 0, 0);
        } else {
          frame.clearRect(this.lastImg.leftPos, this.lastImg.topPos, this.lastImg.width, this.lastImg.height);
        }
      } else {
        this.disposalRestoreFromIdx = currIdx - 1;
      }

      if (this.lastDisposalMethod === 2) {
        // Restore to background color
        // Browser implementations historically restore to transparent; we do the same.
        // http://www.wizards-toolkit.org/discourse-server/viewtopic.php?f=1&t=21172#p86079
        // frame.clearRect(this.lastImg.leftPos, this.lastImg.topPos, this.lastImg.width, this.lastImg.height);
        frame.clearRect(this.lastImg.offset.x, this.lastImg.offset.y, this.lastImg.size.x, this.lastImg.size.y);
      }
    }
    // else, Undefined/Do not dispose.
    // frame contains final pixel data from the last frame; do nothing

    //Get existing pixels for img region after applying disposal method
    var imgData = frame.getImageData(img.offset.x, img.offset.y, img.size.x, img.size.y);

    //apply color table colors
    img.pixels.forEach((pixel, i) => {
      // imgData.data === [R,G,B,A,R,G,B,A,...]
      if (pixel !== this.transparency) {
        imgData.data[i * 4 + 0] = ct[pixel][0];
        imgData.data[i * 4 + 1] = ct[pixel][1];
        imgData.data[i * 4 + 2] = ct[pixel][2];
        imgData.data[i * 4 + 3] = 255; // Opaque.
      }
    });

    frame.putImageData(imgData, img.offset.x, img.offset.y);

    this.frame = frame;
    this.lastImg = img;
  }

/** / doHDR
  * @this {Handler}
  */
  function doHDR(hdr) {
    // console.log('hdr!', hdr, hdr.size); // !
    // setSizes.call(this, hdr.width, hdr.height);
  }

/** / doGCE
  * @this {Handler}
  */
  function doGCE(gce) {
    const hdr = this.data.hdr; // !
    pushFrame.call(this, hdr, );
    clear.call(this);
    this.transparency = gce.transparencyGiven ? gce.transparencyIndex : null;
    this.delay = gce.delayTime;
    this.disposalMethod = gce.disposalMethod;
    // We don't have much to do with the rest of GCE.
  }

/** / doNothing */
  function doNothing() {}

/** */
  function pushFrame(hdr, frame) {
    if (!this.frame) return;
    const item = new Frame(hdr, this.frame, this.delay);
    this.frames.push(item);
  }

/** */
  function clear() {
    const frame  = this.frame;
    const last   = this.lastImg;
    if (!frame || !last) return;
    // const offset = last.offset;
    // const size   = last.size;
    // frame.clearRect(offset.x, offset.y, size.x, size.y);
    this.lastDisposalMethod = this.disposalMethod;
  }
// #endregion
