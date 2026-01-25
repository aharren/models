'use strict';

const { align, translate, rotateX } = require('@jscad/modeling').transforms;
const { cylinder } = require('@jscad/modeling').primitives;
const { subtract, union } = require('@jscad/modeling').booleans;
const { degToRad } = require('@jscad/modeling').utils;

const { openBox } = require('../../lib/boxes');
const { withPreviewVisuals } = require('../../lib/visuals');

const main = (params) => {
  const wallThickness = 2;
  const innerSize = [200, 25, 18];
  const innerOuterDistance = 0.5;
  const cornerRadius = 0.8;
  const innerGrabHoleRadius = 10;
  const outerGrabHoleRadius = 14;
  const airHoleRadius = 1.5;

  const segments = 64;

  const innerBoxSize = [innerSize[0] + wallThickness * 2, innerSize[1] + wallThickness * 2, innerSize[2] + wallThickness * 1];
  const outerBoxSize = [innerBoxSize[0] + wallThickness * 2 + innerOuterDistance, innerBoxSize[1] + wallThickness * 2 + innerOuterDistance, innerBoxSize[2] + wallThickness * 1];

  const innerBox = () => {
    const box = align({}, openBox({ size: innerBoxSize, wallThickness, outerCornerRadius: cornerRadius, segments }));

    const airHoles =
      translate([innerBoxSize[0] / 2 - innerBoxSize[1] / 2 - innerBoxSize[1] / 4, 0, 0],
        align({}, union(
          translate([innerBoxSize[1] / 4, innerBoxSize[1] / 4, 0], cylinder({ height: wallThickness, radius: airHoleRadius, segments })),
          translate([innerBoxSize[1] / 4, -innerBoxSize[1] / 4, 0], cylinder({ height: wallThickness, radius: airHoleRadius, segments })),
          translate([-innerBoxSize[1] / 4, -innerBoxSize[1] / 4, 0], cylinder({ height: wallThickness, radius: airHoleRadius, segments })),
          translate([-innerBoxSize[1] / 4, innerBoxSize[1] / 4, 0], cylinder({ height: wallThickness, radius: airHoleRadius, segments })),
          translate([0, 0, 0], cylinder({ height: wallThickness, radius: airHoleRadius, segments })),
          translate([innerBoxSize[1] / 2, 0, 0], cylinder({ height: wallThickness, radius: airHoleRadius, segments })),
          translate([-innerBoxSize[1] / 2, 0, 0], cylinder({ height: wallThickness, radius: airHoleRadius, segments }))
        ))
      );

    const grabHoles = translate([-innerBoxSize[0] / 3, 0, innerBoxSize[2]], rotateX(degToRad(90), cylinder({ height: innerBoxSize[1] + 2, radius: innerGrabHoleRadius, segments })));

    return subtract(
      box,
      airHoles,
      grabHoles,
    );
  }

  const outerBox = () => {
    const box = align({}, openBox({ size: outerBoxSize, wallThickness, outerCornerRadius: cornerRadius, segments }));

    const grabHoles = translate([0, 0, outerBoxSize[2]], rotateX(degToRad(90), cylinder({ height: outerBoxSize[1] + 2, radius: outerGrabHoleRadius, segments })));

    return subtract(
      box,
      grabHoles,
    );
  }

  return [
    translate([0, 10, 0], align({ modes: ['none', 'min', 'none'] }, innerBox())),
    translate([0, -10, 0], align({ modes: ['none', 'max', 'none'] }, outerBox())),
  ];
}

module.exports = { ...withPreviewVisuals(main) };
