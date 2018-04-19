/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const bgzf = require('../index.js');
const fs = require("fs");

const run = function() {
  const READ_SIZE = 100000;
  const filename = __dirname + "/large.bam";
  const fd = fs.openSync(filename, "r");
  const filesize = fs.statSync(filename).size;

  let d_offset = 0;
  return (() => {
    const result = [];
    while (filesize > d_offset) {
      const size = Math.min(READ_SIZE, filesize - d_offset);
      const buf = new Buffer(size);
      fs.readSync(fd, buf, 0, size, d_offset);
      const [infbuf, i_offsets, d_offsets] = Array.from(bgzf.inflate(buf));
      d_offset += d_offsets[d_offsets.length - 1];
      result.push(console.log(d_offset));
    }
    return result;
  })();
};

run();
