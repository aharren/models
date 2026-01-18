'use strict';

const { align } = require('@jscad/modeling').transforms;

const { openBox } = require('../../lib/boxes');
const { withPreviewVisuals } = require('../../lib/visuals');

const main = (params) => {
    const box = align({}, openBox({ size: [50, 50, 20], wallThickness: 1, outerCornerRadius: 0.5, center: [0, 0, 0] }));

    return box;
}

module.exports = { ...withPreviewVisuals(main) };
