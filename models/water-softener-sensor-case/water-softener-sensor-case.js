'use strict';

const { align, translate } = require('@jscad/modeling').transforms;
const { cylinder, cuboid } = require('@jscad/modeling').primitives;
const { subtract, union } = require('@jscad/modeling').booleans;

const { openBox, lid } = require('../../lib/boxes');
const { withPreviewVisuals } = require('../../lib/visuals');

const at = (pos, obj) => {
  // align corner of object relative to [0,0,0]
  const zero = align({ modes: ['min', 'min', 'min'] }, obj);
  return translate(pos, zero);
}

const main = (params) => {
  const espBoardSizeX = 31.5;
  const espBoardSizeY = 39;
  const tofBoardSizeX = 13;
  const tofBoardSizeY = 25;
  const espTofBoardDistanceX = 36;

  const espUsbConnectorWidth = 10;
  const espUsbConnectorHeight = 4;

  const tofSensorViewSizeX = 6;
  const tofSensorViewSizeY = 10;
  const tofBoardMountingHoleRadius = 1.5;
  const tofBoardMountingHolesDistance = 20;

  const innerSizeHeight = 10;
  const innerSize = [espBoardSizeX + espTofBoardDistanceX + tofBoardSizeX, Math.max(espBoardSizeY, tofBoardSizeY), innerSizeHeight];

  const wallThickness = 2;
  const outerCornerRadius = 0.5;
  const enclosureSize = [innerSize[0] + wallThickness * 2, innerSize[1] + wallThickness * 2, innerSize[2] + wallThickness * 1];

  const segments = 64;

  const enclosureBox = () => {
    const outerBox = at([-wallThickness, -wallThickness, -wallThickness], openBox({ size: enclosureSize, wallThickness, segments, outerCornerRadius }));

    const bracketHeight = 4;
    const bracket1 = at([espBoardSizeX, 0, 0], cuboid({ size: [wallThickness, innerSize[1], bracketHeight] }));
    const bracket2 = at([espBoardSizeX + espTofBoardDistanceX - wallThickness, 0, 0], cuboid({ size: [wallThickness, innerSize[1], bracketHeight] }));

    const usbConnectorHole = at([espBoardSizeX / 2 - espUsbConnectorWidth / 2, -wallThickness, 2], cuboid({ size: [espUsbConnectorWidth, wallThickness, espUsbConnectorHeight] }));

    const tofBoardMountingHeight = innerSizeHeight - 1;
    const tofBoardMounting1 = at([espBoardSizeX + espTofBoardDistanceX + tofBoardSizeX / 2 - tofBoardMountingHoleRadius, innerSize[1] / 2 - tofBoardMountingHolesDistance / 2 - tofBoardMountingHoleRadius, 0], cylinder({ radius: tofBoardMountingHoleRadius, height: tofBoardMountingHeight }));
    const tofBoardMounting2 = at([espBoardSizeX + espTofBoardDistanceX + tofBoardSizeX / 2 - tofBoardMountingHoleRadius, innerSize[1] / 2 + tofBoardMountingHolesDistance / 2 - tofBoardMountingHoleRadius, 0], cylinder({ radius: tofBoardMountingHoleRadius, height: tofBoardMountingHeight }));

    const tofSensorHole = at([espBoardSizeX + espTofBoardDistanceX + tofBoardSizeX / 2 - tofBoardMountingHoleRadius - tofSensorViewSizeX / 2, innerSize[1] / 2 - tofSensorViewSizeY / 2, -wallThickness], cuboid({ size: [tofSensorViewSizeX, tofSensorViewSizeY, wallThickness] }));

    return subtract(
      union(
        outerBox,
        bracket1,
        bracket2,
        tofBoardMounting1,
        tofBoardMounting2,
      ),
      usbConnectorHole,
      tofSensorHole,
    );
  }

  const enclosureLid = () => {
    const lidBase = at([-wallThickness, -wallThickness, 0], lid({ size: enclosureSize, wallThickness, segments, outerCornerRadius }));

    const airHoleWidth = 1;
    const airHoleLength = innerSize[1] / 2;
    const airHoles = union(
      at([innerSize[0] / 20 * 2, innerSize[1] / 2 - airHoleLength / 2, 0], cuboid({ size: [airHoleWidth, airHoleLength, wallThickness] })),
      at([innerSize[0] / 20 * 3, innerSize[1] / 2 - airHoleLength / 2, 0], cuboid({ size: [airHoleWidth, airHoleLength, wallThickness] })),
      at([innerSize[0] / 20 * 4, innerSize[1] / 2 - airHoleLength / 2, 0], cuboid({ size: [airHoleWidth, airHoleLength, wallThickness] })),
      at([innerSize[0] / 20 * 5, innerSize[1] / 2 - airHoleLength / 2, 0], cuboid({ size: [airHoleWidth, airHoleLength, wallThickness] })),
      at([innerSize[0] / 20 * 6, innerSize[1] / 2 - airHoleLength / 2, 0], cuboid({ size: [airHoleWidth, airHoleLength, wallThickness] })),
      at([innerSize[0] / 20 * 7, innerSize[1] / 2 - airHoleLength / 2, 0], cuboid({ size: [airHoleWidth, airHoleLength, wallThickness] })),
      at([innerSize[0] / 20 * 8, innerSize[1] / 2 - airHoleLength / 2, 0], cuboid({ size: [airHoleWidth, airHoleLength, wallThickness] })),
      at([innerSize[0] / 20 * 17, innerSize[1] / 2 - airHoleLength / 2, 0], cuboid({ size: [airHoleWidth, airHoleLength, wallThickness] })),
      at([innerSize[0] / 20 * 18, innerSize[1] / 2 - airHoleLength / 2, 0], cuboid({ size: [airHoleWidth, airHoleLength, wallThickness] })),
    );

    return subtract(
      lidBase,
      airHoles
    )
  };

  return [
    translate([0, 10, 0], align({ modes: ['center', 'min', 'min'] }, enclosureBox())),
    translate([0, -10, 0], align({ modes: ['center', 'max', 'min'] }, enclosureLid())),
  ];
}

module.exports = { ...withPreviewVisuals({}, main) };
