'use strict';

const { primitives, booleans, transforms, colors, measurements, geometries, extrusions, utils, hulls } = require('@jscad/modeling');
const { vectorText } = require('@jscad/modeling').text;
const { toArray } = require('@jscad/array-utils');

const runningInPreview = typeof process == 'undefined';

const lineThicknessThin = 0.1;

// make the given object transparent
const transparent = (obj) => {
  return colors.colorize([0.3, 0.3, 0.3, 0.5], obj);
}

// make the given object black
const black = (obj) => {
  return colors.colorize([0, 0, 0, 1], obj);
}

// cut the given object into halves and make one half transparent
const xRay = (params, obj) => {
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

  // copy color
  if (obj.color) {
    half2.color = obj.color;
  }

  return [transparent(half1), half2];
}

// render the given text as a 3D object
const text = (params, txt) => {
  const height = params.height ?? 1.5;
  const center = params.center ?? [0, 0, 0];

  const segments = vectorText({ height }, String(txt));
  const corner = primitives.circle({ radius: lineThicknessThin })
  const geoms = segments.map(segment => {
    const corners = segment.map((point) => {
      return transforms.translate(point, corner);
    })
    return hulls.hullChain(corners);
  });
  const geoms3D = geoms.map(geom => {
    return extrusions.extrudeLinear({ height: lineThicknessThin }, geom);
  });
  const geom3D = booleans.union(geoms3D);
  return transforms.center({ axes: [true, true, false], relativeTo: center }, geom3D);
}

// render a 3D line with the given points
const line = (params, start, end) => {
  const height = params.height ?? lineThicknessThin;
  const size = params.size ?? lineThicknessThin;

  const geom = geometries.path2.fromPoints({}, [start ?? [0, 0], end ?? [0, 0]]);
  const line3D = extrusions.extrudeRectangular({ height, size }, geom);
  return line3D;
}

// create a length marker line |<---->|
const lengthMarkerLine = (params, length) => {
  const leftK = booleans.union(
    line({}, [-length / 2, 0], [-length / 2, -4]),
    line({}, [-length / 2, -2], [-length / 2 + 1, -1]),
    line({}, [-length / 2, -2], [-length / 2 + 1, -3])
  );
  const rightK = booleans.union(
    line({}, [length / 2, 0], [length / 2, -4]),
    line({}, [length / 2, -2], [length / 2 - 1, -1]),
    line({}, [length / 2, -2], [length / 2 - 1, -3])
  );
  const middle = line({}, [-length / 2, -2], [length / 2, -2]);

  return booleans.union(
    leftK,
    rightK,
    middle
  )
}

// create a length marker text
const lengthMarkerText = (params, length) => {
  return text({ center: [0, -5, 0] }, Number.parseFloat(length).toFixed(2));
}

// create three length marker lines and texts for the dimensions of the given object
const dimensions = (params, obj) => {
  const dim = measurements.measureDimensions(obj);
  const bounds = measurements.measureBoundingBox(obj);

  const distance = 2;
  const objects = [];
  objects.push(transforms.align({ grouped: true, modes: ['center', 'max', 'max'], relativeTo: [(bounds[0][0] + bounds[1][0]) / 2, bounds[0][1] - distance, bounds[0][2]] }, lengthMarkerLine({}, dim[0]), lengthMarkerText({}, dim[0])));
  objects.push(transforms.align({ grouped: true, modes: ['max', 'center', 'max'], relativeTo: [bounds[0][0] - distance, (bounds[0][1] + bounds[1][1]) / 2, bounds[0][2]] }, transforms.rotateZ(utils.degToRad(-90), lengthMarkerLine({}, dim[1]), lengthMarkerText({}, dim[1]))));
  objects.push(transforms.align({ grouped: true, modes: ['max', 'max', 'center'], relativeTo: [bounds[0][0] - distance, bounds[0][1] - distance, (bounds[0][2] + bounds[1][2]) / 2] }, transforms.rotate([0, utils.degToRad(90), utils.degToRad(-45)], lengthMarkerLine({}, dim[2]), lengthMarkerText({}, dim[2]))));

  return objects.map((object) => {
    return black(object);
  })
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
          objectsWithXRay.push(...xRay({}, object));
        });
        return objectsWithXRay;
      })();
    }

    // add dimensions markers
    if (settings.dimensions ?? true) {
      originalObjects.forEach(object => {
        objects.push(...dimensions({}, object));
      });
    }

    return objects;
  }

  return {
    main: fn
  };
}

module.exports = {
  transparent,
  black,
  line,
  text,
  xRay,
  dimensions,
  withPreviewVisuals,
};
