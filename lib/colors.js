'use strict';

const { colors } = require('@jscad/modeling');

// colorize the given object with transparent color
const transparent = (object) => {
  return colors.colorize([0.3, 0.3, 0.3, 0.5], object);
}

// colorize the given object with black color
const black = (object) => {
  return colors.colorize([0, 0, 0, 1], object);
}

module.exports = {
  transparent,
  black,
};
