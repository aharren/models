'use strict';

const { primitives, booleans, transforms, colors, measurements } = require('@jscad/modeling');

// cut the given object into halfes and make one half transparent
const xRay = (obj) => {
    const objectCenter = measurements.measureCenter(obj);
    const objectDimensions = measurements.measureDimensions(obj);

    const cut1 = transforms.align({ modes: ['center', 'max', 'center'], relativeTo: objectCenter }, primitives.cuboid({ size: [objectDimensions[0] + 1, objectDimensions[1] + 1, (objectDimensions[2] + 1) * 2] }));
    const cut2 = transforms.align({ modes: ['center', 'min', 'center'], relativeTo: objectCenter }, primitives.cuboid({ size: [objectDimensions[0] + 1, objectDimensions[1] + 1, (objectDimensions[2] + 1) * 2] }));

    const half1 = booleans.intersect(cut1, obj);
    const half2 = booleans.intersect(cut2, obj);

    return [half1, colors.colorize([0.3, 0.3, 0.3, 0.5], half2)];
}

module.exports = {
    xRay,
};
