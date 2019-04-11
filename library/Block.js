import Vector from '../../javascript-algebra/library/vector.js';
import LZW    from './lzw.js';
import {byteToBitArr, bitsToNum} from './common.js';

const ext = {
  0xF9: gce,
  0xFE: com,
  0x01: pte,
  0xFF: app
}

/** {Block} Блок данных Gif файла @class @static
  *
  */
  export default class Block {
  /** / ext */
    static ext(stream, handler) {
      const label = stream.readByte();
      const type = ext[label] || unknown; // extType
      type(stream, handler);
    }

  /** / img */
    static img(stream, handler) {
      const image = {}

      const left = stream.readUnsigned();
      const top  = stream.readUnsigned();

      const width  = stream.readUnsigned();
      const height = stream.readUnsigned();

      image.offset = Vector.from(left, top);
      image.size   = Vector.from(width, height);

      const bits = byteToBitArr(stream.readByte());
      const lct  = bits.shift();
      const interlaced = bits.shift();
      image.sorted = bits.shift();
      image.reserved = bits.splice(0, 2);
      const size = bitsToNum(bits.splice(0, 3));

      if (lct) image.lct = LZW.parseCT(1 << (size + 1));

      image.lzwMinCodeSize = stream.readByte();

      var lzwData = readSubBlocks(stream);

      image.pixels = new LZW(lzwData, image.lzwMinCodeSize).decode();
      if (interlaced) image.pixels = deinterlace(image.pixels, image.width); // Move

      handler.img(image);
    }
  }

// #region [Private]
/** / img -> readSubBlocks */
  function readSubBlocks(stream) {
    var size, data = '';
    do {
      size = stream.readByte();
      data += stream.read(size);
    } while (size !== 0);
    return data;
  }

/** / img -> deinterlace */
  function deinterlace(pixels, width) {
    // Of course this defeats the purpose of interlacing. And it's *probably* the least efficient way it's ever been implemented. But nevertheless...
    var newPixels = new Array(pixels.length);
    var rows = pixels.length / width;

    // See appendix E.
    var offsets = [0, 4, 2, 1];
    var steps = [8, 8, 4, 2];

    var fromRow = 0;
    for (var pass = 0; pass < 4; pass++) {
      for (var toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
        cpRow(toRow, fromRow, pixels, width, newPixels);
        ++fromRow;
      }
    }

    return newPixels;
  }

/** / img -> cpRow */
  function cpRow(toRow, fromRow, pixels, width, newPixels) {
    var fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
    newPixels.splice(...[toRow * width, width].concat(fromPixels));
  }

/** / ext -> gce */
  function gce(stream, handler) {
    stream.readByte(); // Always 4
    const block = {};
    const bits = byteToBitArr(stream.readByte());
    block.reserved = bits.splice(0, 3); // Reserved; should be 000.
    block.disposalMethod = bitsToNum(bits.splice(0, 3));
    block.userInput = bits.shift();
    block.transparencyGiven = bits.shift();
    block.delayTime = stream.readUnsigned();
    block.transparencyIndex = stream.readByte();
    block.terminator = stream.readByte();
    handler.gce(block);
  }

/** / ext -> com */
  function com(stream, handler) {
    const comment = readSubBlocks(stream);
    handler.com({comment});
  }

/** / ext -> pte */
  function pte(stream, handler) {
    // No one *ever* uses this. If you use it, deal with parsing it yourself.
    stream.readByte(); // Always 12
    const block = {};
    block.ptHeader = stream.readBytes(12);
    block.ptData = readSubBlocks(stream);
    handler.pte(block);
  }

/** / ext -> app */
  function app(stream, handler) {
    stream.readByte(); // Always 11
    const block = {};
    block.identifier = stream.read(8);
    block.authCode   = stream.read(3);
    switch (block.identifier) {
      case 'NETSCAPE':
        parseNetscapeExt(block, stream, handler);
        break;
      default:
        parseUnknownAppExt(block, stream, handler);
        break;
    }
  }

/** / ext -> unknown */
  function unknown(stream, handler) {
    const data = readSubBlocks(stream);
    handler.unknown({data});
  }

/** / parseNetscapeExt */
  function parseNetscapeExt(block, stream, handler) {
    stream.readByte(); // Always 3
    block.unknown = stream.readByte(); // ??? Always 1? What is this?
    block.iterations = stream.readUnsigned();
    block.terminator = stream.readByte();
    handler.app.NETSCAPE(block);
  }

/** / parseUnknownAppExt */
  function parseUnknownAppExt(block, stream, handler) {
    block.appData = readSubBlocks(stream);
    // FIXME: This won't work if a handler wants to match on any identifier.
    handler.app[block.identifier] && handler.app[block.identifier](block);
  }
// #endregion
