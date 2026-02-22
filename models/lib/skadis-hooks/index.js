'use strict';

const { cuboid, cylinder } = require('@jscad/modeling').primitives;
const { union } = require('@jscad/modeling').booleans;
const { rotateX, rotateZ, center } = require('@jscad/modeling').transforms;

const colors = require('../../../lib/colors');
const grid = require('../../../lib/grid');

const sizes = {
  hook: {
    width: 4.9,
    height: 11,
    depth: 5.4,
    thickness: 6,
  },
  grid: {
    distance: 40,
  },
};

// create a single hook
const singleHook = () => {
  const height = sizes.hook.height;
  const width = sizes.hook.width;
  const depth = sizes.hook.depth;
  const thickness = sizes.hook.thickness;
  const hook = union(
    grid.at([0, depth, 0], cuboid({ size: [width, thickness, height] })),
    grid.at([0, 0, height - thickness / 2], cuboid({ size: [width, depth, thickness / 2] })),
    grid.at([0, 0, height - thickness], rotateX(Math.PI / 2, cylinder({ radius: width / 2, height: depth })))
  );
  return center({}, hook);
}

// create a grid of hooks with the given width and height
const hookGrid = (width, height, mode = 0, symmetric = true) => {
  const objects = [];
  const hook = singleHook();
  const distance = sizes.grid.distance;
  const maxHeight = height - sizes.hook.height;
  const maxWidth = width - sizes.hook.width;
  const y = 0;
  mode %= 2;
  for (let z = 0; z < maxHeight; z += distance / 2) {
    for (let x = mode * distance / 2; x < (maxWidth - (symmetric ? (mode * distance / 2) : 0)); x += distance) {
      objects.push(grid.at([x, y, -z], hook));
    }
    mode = (mode + 1) % 2;
  }
  return center({}, union(objects));
};

const main = (params) => {
  const width = 100;
  const height = 50;
  const object = colors.transparent(cuboid({ size: [width, width, height] }));
  const hookGrid1 = colors.red(rotateZ(1 * Math.PI, hookGrid(width, height, 0, true)));
  const hookGrid2 = colors.blue(rotateZ(-0.5 * Math.PI, hookGrid(width, height, 0, false)));
  const hookGrid3 = colors.yellow(rotateZ(0 * Math.PI, hookGrid(width, height, 1, true)));
  const hookGrid4 = colors.black(rotateZ(0.5 * Math.PI, hookGrid(width, height, 1, false)));
  const part1 = grid.distribute([null, 0, null], hookGrid1, object, hookGrid3);
  const part2 = grid.distribute([0, null, null], hookGrid4, object, hookGrid2);
  return [...part1, part2[0], part2[2]];
}

module.exports = {
  main,
  sizes,
  hook: singleHook,
  grid: hookGrid,
};
