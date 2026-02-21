'use strict';

const { cuboid, cylinder } = require('@jscad/modeling').primitives;
const { union, subtract } = require('@jscad/modeling').booleans;
const { rotateX } = require('@jscad/modeling').transforms;

const grid = require('../../lib/grid');
const preview = require('../../lib/preview');

const main = (params) => {
  // Wifi Access Point
  const deviceHeight = 22.5;
  const deviceWidth = 98;
  const deviceDepthEnclosed = 25;
  const bottomBorderWidth = 13;
  // Zigbee Bridge
  //const deviceHeight = 26.5;
  //const deviceWidth = 90;
  //const deviceDepthEnclosed = 25;
  //const bottomBorderWidth = 19;
  // Network Switch
  //const deviceHeight = 29 - 2; // incl. feet, minus bracketDepth (2) for that side
  //const deviceWidth = 94.3;
  //const deviceDepthEnclosed = 25;
  //const bottomBorderWidth = 5;

  const wallThickness = 4;

  const numBracketsX = 2;
  const numBracketsY = 2;
  const bracketWidth = 2;
  const bracketDepth = 2;

  const shellInnerSize = [deviceWidth + 2 * bracketDepth, deviceHeight + 2 * bracketDepth, deviceDepthEnclosed + 2 * bracketDepth];
  const shellOuterSize = [shellInnerSize[0] + 2 * wallThickness, shellInnerSize[1] + 2 * wallThickness, shellInnerSize[2] + 1 * wallThickness];

  const shell = () => {
    const outside = grid.at([-wallThickness, -wallThickness, -wallThickness], cuboid({ size: shellOuterSize }));
    const inside = grid.at([0, 0, 0], cuboid({ size: shellInnerSize }));
    const bottomHole = grid.at([bottomBorderWidth + bracketDepth, 0, -wallThickness], cuboid({ size: [shellInnerSize[0] - 2 * bottomBorderWidth - 2 * bracketDepth, shellInnerSize[1], wallThickness] }));
    return subtract(outside, inside, bottomHole);
  };

  const innerBracketsX = () => {
    const bracketDistanceX = (shellInnerSize[0] - numBracketsX * bracketWidth) / (numBracketsX + 1);
    const bracket = cuboid({ size: [bracketWidth, bracketDepth, shellInnerSize[2] + wallThickness] });
    const objects = [];
    for (let i = 0; i < numBracketsX; i++) {
      const x = bracketDistanceX + i * (bracketWidth + bracketDistanceX);
      objects.push(grid.at([x, 0, -wallThickness], bracket));
      objects.push(grid.at([x, deviceHeight + bracketDepth, -wallThickness], bracket));
    }
    return union(objects);
  };

  const innerBracketsY = () => {
    const bracketDistanceY = (shellInnerSize[1] - numBracketsY * bracketWidth) / (numBracketsY + 1);
    const bracket = cuboid({ size: [bracketDepth, bracketWidth, shellInnerSize[2] + wallThickness] });
    const objects = [];
    for (let i = 0; i < numBracketsY; i++) {
      const y = bracketDistanceY + i * (bracketWidth + bracketDistanceY);
      objects.push(grid.at([0, y, -wallThickness], bracket));
      objects.push(grid.at([deviceWidth + bracketDepth, y, -wallThickness], bracket));
    }
    return union(objects);
  };

  const hooks = () => {
    const height = 11;
    const depth = 5.4;
    const width = 4.9;
    const thickness = 6;
    const distanceX = 40;
    const distanceZ = 20;

    const hook = union(
      grid.at([0, depth, 0], cuboid({ size: [width, thickness, height] })),
      grid.at([0, 0, height - thickness / 2], cuboid({ size: [width, depth, thickness / 2] })),
      grid.at([0, 0, height - thickness], rotateX(Math.PI / 2, cylinder({ radius: width / 2, height: depth })))
    );
    const objects = [];
    const y = shellOuterSize[1] - wallThickness
    const row1Z = shellOuterSize[2] - wallThickness - height;
    objects.push(grid.at([shellInnerSize[0] / 2 - width / 2, y, row1Z], hook));
    objects.push(grid.at([shellInnerSize[0] / 2 - width / 2 - distanceX, y, row1Z], hook));
    objects.push(grid.at([shellInnerSize[0] / 2 - width / 2 + distanceX, y, row1Z], hook));
    const row2Z = row1Z - distanceZ;
    objects.push(grid.at([shellInnerSize[0] / 2 - width / 2 - distanceX / 2, y, row2Z], hook));
    objects.push(grid.at([shellInnerSize[0] / 2 - width / 2 + distanceX / 2, y, row2Z], hook));
    return objects;
  };

  const model = union(
    shell(),
    innerBracketsX(),
    innerBracketsY(),
    hooks()
  );
  return grid.center(model);
}

module.exports = { ...preview.main({ xRay: false }, main) };
