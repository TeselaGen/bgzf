const BGZF_HEADER = "1f 8b 08 04 00 00 00 00 00 ff 06 00 42 43 02 00".split(" ").map(v=> parseInt(v, 16));

const { inflateRawSync } = require('./build/Release/bgzf');
const bgzf = {};

bgzf.inflateRaw = function(defbuf){
  const ret = new Buffer(65535);
  const len = inflateRawSync(defbuf, ret);
  return ret.slice(0, len);
};


bgzf.inflate = function(input){
  // check header
  let defbuf;
  for (let _i = 0; _i < BGZF_HEADER.length; _i++) { const c = BGZF_HEADER[_i]; if (c !== input[_i]) { throw new Error("not BGZF format"); } }
  let buf = input;
  const defbufs = [];
  const d_offsets = [];
  const i_offsets = [];
  let total_isize = 0;
  let total_dsize = 0;
  try {
    while (true) {
      const dsize = buf.readUInt16LE(16) + 1;
      const isize = buf.readUInt32LE(dsize - 4);
      defbuf = buf.slice(18, dsize - 8);

      i_offsets.push(total_isize);
      d_offsets.push(total_dsize);
      defbufs.push(defbuf);

      total_isize += isize;
      total_dsize += dsize;
      buf = buf.slice(dsize);
    }
  } catch (e) {}
  d_offsets.push(total_dsize);
  i_offsets.push(total_isize);

  const infbuf = new Buffer(total_isize);
  
  for (let i = 0; i < defbufs.length; i++) {
    defbuf = defbufs[i];
    const start = i_offsets[i];
    const end   = i_offsets[i+1];
    inflateRawSync(defbuf, infbuf.slice(start, end));
  }

  return [infbuf, i_offsets, d_offsets, buf];
};

module.exports = bgzf;
