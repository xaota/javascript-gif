  /** */
  export function bitsToNum(bitArray) {
    return bitArray.reduce((s, n) => s * 2 + n, 0);
  }

/** */
  export function byteToBitArr(bite) {
    const a = [];
    for (let i = 7; i >= 0; --i) a.push(Boolean(bite & (1 << i)));
    return a;
  }
