const { cuboid, sphere, cylinder } = require('@jscad/modeling').primitives;
const { intersect, subtract, union } = require('@jscad/modeling').booleans;
const { colorize, colorNameToRgb } = require('@jscad/modeling').colors;
const { mirrorX, mirrorY, rotateX } = require('@jscad/modeling').transforms;
const { measureDimensions } = require('@jscad/modeling').measurements;

const preview = require('../../lib/preview');

const OBJECT_BALL = 'ball';
const OBJECT_ENCLOSING = 'enclosing';
const OBJECT_ROTATION_ELEMENT = 'rotation_element';

const DEFAULT_OBJECT = OBJECT_BALL;

const getParameterDefinitions = () => {
  return [
    { name: 'pipe_outer_diameter', type: 'float', initial: 60, caption: "pipe, outer diameter [mm]" },
    { name: 'pipe_inner_diameter', type: 'float', initial: 56, caption: "pipe, inner diameter [mm]" },
    { name: 'pipe_connector_length', type: 'float', initial: 20, caption: "pipe, connector length [mm]" },
    { name: 'object', type: 'choice', initial: DEFAULT_OBJECT, caption: 'object', values: [OBJECT_BALL, OBJECT_ENCLOSING, OBJECT_ROTATION_ELEMENT], captions: ['ball', 'enclosing', 'rotation element'] }
  ];
}

const main = (params) => {
  const pipe_outer_diameter = params.pipe_outer_diameter;
  const pipe_inner_diameter = params.pipe_inner_diameter;
  const pipe_connector_length = Math.max(10, params.pipe_connector_length);
  const object = params.object;

  const num_segments = 100;

  const wall_thickness = 5;

  const ball_diameter = pipe_outer_diameter * 1.5;
  const enclosing_diameter = ball_diameter + wall_thickness * 2;
  const mount_width = wall_thickness * 4;
  const rotation_hole_diameter = 12;
  const base_height = 10;
  const screw_hole_diameter = 5;
  const screw_hole_edge_distance = 4;

  const spiel = 0.4;

  const ball_with_side_flattening = (space = 0) => {
    const new_ball_diameter = ball_diameter + space * 2;
    const outer_sphere = sphere({ radius: new_ball_diameter / 2, segments: num_segments });
    const cube = cuboid({ size: [new_ball_diameter, new_ball_diameter - wall_thickness * 2, new_ball_diameter] });

    return intersect(
      cube,
      outer_sphere
    );
  }

  // build the ball
  const ball = () => {
    const outer_sphere = ball_with_side_flattening();
    const inner_pipe = cylinder({ radius: pipe_inner_diameter / 2, height: ball_diameter, segments: num_segments });
    const side_mount_1 = cuboid({ size: [mount_width, wall_thickness, mount_width], center: [0, ball_diameter / 2 - wall_thickness * 1 - wall_thickness / 2, 0] });
    const side_mount_2 = mirrorY(side_mount_1);

    const ball_1 = subtract(
      outer_sphere,
      inner_pipe,
      side_mount_1,
      side_mount_2,
    );

    const ball_1_height = measureDimensions(ball_1)[2];
    const cube = cuboid({ size: [ball_diameter, ball_diameter, ball_1_height - 2] });

    return intersect(
      cube,
      ball_1,
    );
  }

  // build the enclosing (one half)
  const enclosing = () => {
    const ball_negative = ball_with_side_flattening(spiel);
    const outer_sphere = sphere({ radius: enclosing_diameter / 2, segments: num_segments });

    const pipe_length = ball_diameter / 2 + pipe_connector_length;
    const outer_pipe = cylinder({ radius: pipe_outer_diameter / 2, height: pipe_length, segments: num_segments, center: [0, 0, pipe_length / 2] });
    const inner_pipe = cylinder({ radius: pipe_inner_diameter / 2, height: pipe_length, segments: num_segments, center: [0, 0, pipe_length / 2] });

    const rotation_hole = rotateX(Math.PI / 2, cylinder({ radius: rotation_hole_diameter / 2 + spiel, height: enclosing_diameter, segments: num_segments }));

    const base = cuboid({ size: [enclosing_diameter, enclosing_diameter, base_height], center: [0, 0, base_height / 2] });
    const base_mount_1 = cylinder({ radius: screw_hole_diameter / 2, height: base_height, segments: num_segments, center: [-enclosing_diameter / 2 + screw_hole_diameter / 2 + screw_hole_edge_distance, -enclosing_diameter / 2 + screw_hole_diameter / 2 + screw_hole_edge_distance, base_height / 2] });
    const base_mount_2 = mirrorX(base_mount_1);
    const base_mount_3 = mirrorY(base_mount_2);
    const base_mount_4 = mirrorX(base_mount_3);

    const cube = cuboid({ size: [enclosing_diameter, enclosing_diameter, enclosing_diameter + pipe_connector_length], center: [0, 0, enclosing_diameter / 2 + pipe_connector_length / 2] });

    return intersect(
      cube,
      subtract(
        union(
          outer_sphere,
          outer_pipe,
          base,
        ),
        inner_pipe,
        ball_negative,
        rotation_hole,
        base_mount_1,
        base_mount_2,
        base_mount_3,
        base_mount_4,
      )
    );
  }

  const rotation_element = () => {
    const side_mount_height = wall_thickness - spiel;
    const rotator_mount_height = wall_thickness;
    const rotation_hole_height = enclosing_diameter - ball_diameter + rotator_mount_height;

    const side_mount = cuboid({ size: [mount_width, mount_width, side_mount_height], center: [0, 0, side_mount_height / 2] });

    const rotation_hole = cylinder({ radius: rotation_hole_diameter / 2 - spiel * 2, height: rotation_hole_height, segments: num_segments, center: [0, 0, side_mount_height + rotation_hole_height / 2] });

    const rotator_mount_1 = cuboid({ size: [mount_width, mount_width, rotator_mount_height], center: [-mount_width / 2 - wall_thickness / 2, 0, side_mount_height + rotation_hole_height - rotator_mount_height / 2] });
    const rotator_mount_2 = mirrorX(rotator_mount_1);

    return subtract(
      union(
        side_mount,
        rotation_hole,
      ),
      rotator_mount_1,
      rotator_mount_2,
    );
  }

  return [
    ...object === OBJECT_BALL ? [colorize(colorNameToRgb("red"), ball())] : [],
    ...object === OBJECT_ENCLOSING ? [colorize(colorNameToRgb("blue"), enclosing())] : [],
    ...object === OBJECT_ROTATION_ELEMENT ? [colorize(colorNameToRgb("yellow"), rotation_element())] : [],
  ];
}

module.exports = { ...preview.main({}, main), getParameterDefinitions };
