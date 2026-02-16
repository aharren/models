'use strict';

const { cuboid } = require('@jscad/modeling').primitives;
const { union } = require('@jscad/modeling').booleans;
const { align } = require('@jscad/modeling').transforms;

const preview = require('../../lib/preview');

const main = (params) => {
  const count = 10;
  const start = 1;
  const increase = 1;

  const length = 10;
  const width = 10;

  const objects = [];
  for (let i = 0; i < count; i++) {
    const step = cuboid({ size: [length, width, start + i * increase] });
    objects.push(align({ modes: ['min', 'min', 'min'], relativeTo: [i * length, 0, 0] }, step));
  }

  const model = union(...objects);
  return align({}, model);
}

module.exports = { ...preview.main({ xRay: false }, main) };
