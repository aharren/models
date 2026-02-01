'use strict';

const { primitives, booleans, transforms, colors, measurements } = require('@jscad/modeling');
const { toArray } = require('@jscad/array-utils');

const runningInPreview = typeof process == 'undefined';

// make the given object transparent
const transparent = (obj) => {
  return colors.colorize([0.3, 0.3, 0.3, 0.5], obj);
}

// cut the given object into halves and make one half transparent
const xRay = (obj) => {
  if (!runningInPreview) {
    // don't modify the object in non-preview
    return [obj];
  }

  const objectCenter = measurements.measureCenter(obj);
  const objectDimensions = measurements.measureDimensions(obj);

  // create aligned bounding boxes for the halves
  const cut1 = transforms.align({ modes: ['center', 'max', 'center'], relativeTo: objectCenter }, primitives.cuboid({ size: [objectDimensions[0] + 1, objectDimensions[1] + 1, (objectDimensions[2] + 1) * 2] }));
  const cut2 = transforms.align({ modes: ['center', 'min', 'center'], relativeTo: objectCenter }, primitives.cuboid({ size: [objectDimensions[0] + 1, objectDimensions[1] + 1, (objectDimensions[2] + 1) * 2] }));

  // cut the original object
  const half1 = booleans.intersect(cut1, obj);
  const half2 = booleans.intersect(cut2, obj);

  return [half1, transparent(half2)];
}

// apply visual effects like x-ray in preview
// usage: module.exports = { ...withPreviewVisuals( {}, main) };
//        module.exports = { ...withPreviewVisuals( { xRay: false, ... }, main) };
const withPreviewVisuals = (settings, main) => {
  const fn = (params) => {
    // create objects via real main
    let originalObjects = toArray(main(params));

    // if not running in preview, just return the original objects
    if (!runningInPreview) {
      return originalObjects;
    }

    let objects = [...originalObjects];

    // apply x-ray to all objects
    if (settings.xRay ?? true) {
      objects = (() => {
        const objectsWithXRay = [];
        objects.forEach(object => {
          objectsWithXRay.push(...xRay(object));
        });
        return objectsWithXRay;
      })();
    }

    return objects;
  }

  return {
    main: fn
  };
}

module.exports = {
  transparent,
  xRay,
  withPreviewVisuals,
};
