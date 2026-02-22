'use strict';

const { cuboid, cylinder } = require('@jscad/modeling').primitives;
const { union, subtract } = require('@jscad/modeling').booleans;
const { rotateY, align } = require('@jscad/modeling').transforms;

const hooks = require('../lib/skadis-hooks');

const grid = require('../../lib/grid');
const preview = require('../../lib/preview');

const main = (params) => {
  const height = 60;
  const width = 10;
  const depth = 10;
  const holeDistance = 20;
  const holeDiameter = 8;
  const combineHoles = false;

  const hole = (width, height) => {
    const cyl = grid.at([0, 0, 0], cylinder({ radius: width / 2, height }));
    const cub = grid.at([0, width / 2, 0], cuboid({ size: [width, width / 2, height] }));
    return union(cyl, cub);
  }

  const base = () => {
    const body = grid.at([0, 0, 0], cuboid({ size: [width, depth, height] }));

    const holes = [];
    holes.push(grid.at([0, depth - holeDiameter, holeDistance], rotateY(Math.PI / 2, hole(holeDiameter, width))));
    holes.push(grid.at([0, depth - holeDiameter, height - holeDistance - holeDiameter], rotateY(Math.PI / 2, hole(holeDiameter, width))));
    if (combineHoles) {
      holes.push(grid.at([0, depth - holeDiameter, holeDistance + holeDiameter / 2], cuboid({ size: [width, holeDiameter, height - holeDistance * 2 - holeDiameter] })));
    }

    const object = subtract(
      body,
      holes
    );
    return object;
  };

  const model = union(
    grid.distribute([null, 0, null],
      align({}, base()),
      align({}, hooks.grid(width, height))
    )
  );
  return model;
}

module.exports = { ...preview.main({ xRay: false }, main) };
