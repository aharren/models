'use strict';

const { primitives, booleans, transforms } = require('@jscad/modeling');

// construct a box which is open on the upper size
const openBox = (params) => {
  // parameters
  const size = params.size ?? [10, 10, 10];
  const wallThickness = params.wallThickness ?? 1;
  const outerCornerRadius = params.outerCornerRadius ?? 0;
  const innerCornerRadius = params.innerCornerRadius ?? 0;
  const center = params.center ?? [0, 0, 0];
  const segments = params.segments ?? 32;

  // extended Z size to move the upper rounded corners out of the result object
  const extendedZSize = size[2] + Math.max(innerCornerRadius, outerCornerRadius);

  // build the outer part of the box
  const outerSize = [size[0], size[1], extendedZSize];
  const outerBox = transforms.align({}, primitives.roundedCuboid({ size: outerSize, roundRadius: outerCornerRadius, segments }));

  // build the inner part of the box
  const innerSize = [size[0] - 2 * wallThickness, size[1] - 2 * wallThickness, extendedZSize];
  const innerBox = transforms.translateZ(wallThickness, transforms.align({}, primitives.roundedCuboid({ size: innerSize, roundRadius: innerCornerRadius, segments })));

  // outer part minus inner part
  const box = booleans.subtract(outerBox, innerBox);

  // cut the box to the result size
  const resultSizeCuboid = transforms.align({}, primitives.cuboid({ size }));
  const sizedBox = booleans.intersect(resultSizeCuboid, box);

  // center the result box as requested
  const centeredBox = transforms.center({ relativeTo: center }, sizedBox);
  return centeredBox;
}

// construct a lid for a box
const lid = (params) => {
  // parameters
  const size = params.size ?? [10, 10, 10];
  const wallThickness = params.wallThickness ?? 1;
  const outerCornerRadius = params.outerCornerRadius ?? 0;
  const innerCornerRadius = params.innerCornerRadius ?? 0;
  const center = params.center ?? [0, 0, 0];
  const segments = params.segments ?? 32;

  const innerWallThickness = 1;
  const innerWallHeight = 2;

  // create a box with wallThickness as height
  const box1 = transforms.align({ modes: ['center', 'center', 'min'] }, openBox({ size: [size[0], size[1], wallThickness], wallThickness, outerCornerRadius, innerCornerRadius, segments }));

  // create another, inner box
  const box2 = transforms.align({ modes: ['center', 'center', 'min'] }, openBox({ size: [size[0] - wallThickness * 2, size[1] - wallThickness * 2, wallThickness + innerWallHeight], wallThickness: innerWallThickness, outerCornerRadius: innerCornerRadius, innerCornerRadius: 0, segments }));

  // combine both boxes as the lid
  const lid = booleans.union(box1, box2);

  // center the result lid as requested
  const centeredLid = transforms.center({ relativeTo: center }, lid);
  return centeredLid;
}

module.exports = {
  openBox,
  lid,
};
