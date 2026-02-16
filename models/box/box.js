'use strict';

const { align } = require('@jscad/modeling').transforms;

const { openBox } = require('../../lib/boxes');
const preview = require('../../lib/preview');

const main = (params) => {
  const box = openBox({ size: [50, 50, 20], wallThickness: 1, outerCornerRadius: 0.5 });
  return align({}, box);
}

module.exports = { ...preview.main({}, main) };
