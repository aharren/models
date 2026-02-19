'use strict';

const { transforms, measurements } = require('@jscad/modeling');
const { flatten } = require('@jscad/array-utils');

// put the object group's left front bottom corner at the given position
const at = (position, ...objects) => {
  return transforms.align({ modes: ['min', 'min', 'min'], relativeTo: position, grouped: true }, objects);
}

// center the object group on the x axis and y axis, and put it flat on the x-y surface
const center = (...objects) => {
  return transforms.align({ modes: ['center', 'center', 'min'], relativeTo: [0, 0, 0], grouped: true }, objects);
}

// distribute the given objects along the y axis with the given distance
const distributeY = (distanceY, ...objects) => {
  const input = flatten(objects);
  const output = [];
  let nextMinY = 0;
  input.forEach(object => {
    output.push(transforms.align({ modes: ['none', 'min', 'none'], relativeTo: [null, nextMinY, null] }, object));
    const dimensions = measurements.measureDimensions(object);
    nextMinY += dimensions[1] + distanceY;
  });
  return center(output);
}

module.exports = {
  at,
  center,
  distributeY,
};
