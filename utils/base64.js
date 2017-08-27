// constants
let b64chars
  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
let b64tab = (bin => {
  let t = {};
  for (let i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
  return t;
})(b64chars);
let fromCharCode = String.fromCharCode;
// encoder stuff
let cb_utob = c => {
  if (c.length < 2) {
    let cc = c.charCodeAt(0);
    return cc < 0x80 ? c
      : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
        + fromCharCode(0x80 | (cc & 0x3f)))
        : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
          + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
          + fromCharCode(0x80 | ( cc         & 0x3f)));
  } else {
    let cc = 0x10000
      + (c.charCodeAt(0) - 0xD800) * 0x400
      + (c.charCodeAt(1) - 0xDC00);
    return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
      + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
      + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
      + fromCharCode(0x80 | ( cc         & 0x3f)));
  }
};
let re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
let utob = u => u.replace(re_utob, cb_utob);
let cb_encode = ccc => {
  let padlen = [0, 2, 1][ccc.length % 3],
    ord = ccc.charCodeAt(0) << 16
      | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
      | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
    chars = [
      b64chars.charAt( ord >>> 18),
      b64chars.charAt((ord >>> 12) & 63),
      padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
      padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
    ];
  return chars.join('');
};
let btoa = b => b.replace(/[\s\S]{1,3}/g, cb_encode);
let _encode = u => btoa(utob(u))
;
let encode = (u, urisafe) => {
  return !urisafe
    ? _encode(String(u))
    : _encode(String(u)).replace(/[+\/]/g, m0 => m0 === '+' ? '-' : '_').replace(/=/g, '');
};
let encodeURI = u => encode(u, true);
// decoder stuff
let re_btou = new RegExp([
  '[\xC0-\xDF][\x80-\xBF]',
  '[\xE0-\xEF][\x80-\xBF]{2}',
  '[\xF0-\xF7][\x80-\xBF]{3}'
].join('|'), 'g');
let cb_btou = cccc => {
  switch(cccc.length) {
    case 4:
      let cp = ((0x07 & cccc.charCodeAt(0)) << 18)
        |    ((0x3f & cccc.charCodeAt(1)) << 12)
        |    ((0x3f & cccc.charCodeAt(2)) <<  6)
        |     (0x3f & cccc.charCodeAt(3)),
        offset = cp - 0x10000;
      return (fromCharCode((offset  >>> 10) + 0xD800)
        + fromCharCode((offset & 0x3FF) + 0xDC00));
    case 3:
      return fromCharCode(
        ((0x0f & cccc.charCodeAt(0)) << 12)
        | ((0x3f & cccc.charCodeAt(1)) << 6)
        |  (0x3f & cccc.charCodeAt(2))
      );
    default:
      return  fromCharCode(
        ((0x1f & cccc.charCodeAt(0)) << 6)
        |  (0x3f & cccc.charCodeAt(1))
      );
  }
};
let btou = b => b.replace(re_btou, cb_btou);
let cb_decode = cccc => {
  let len = cccc.length,
    padlen = len % 4,
    n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
      | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
      | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
      | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
    chars = [
      fromCharCode( n >>> 16),
      fromCharCode((n >>>  8) & 0xff),
      fromCharCode( n         & 0xff)
    ];
  chars.length -= [0, 0, 2, 1][padlen];
  return chars.join('');
};
let atob = a => a.replace(/[\s\S]{1,4}/g, cb_decode);
let _decode = a => btou(atob(a))
let decode = a => _decode(
  String(a).replace(/[-_]/g, m0 => m0 === '-' ? '+' : '/')
  .replace(/[^A-Za-z0-9\+\/]/g, '')
);
// export Base64
module.exports = {
  atob, btoa, utob, encode, encodeURI, btou, decode
};