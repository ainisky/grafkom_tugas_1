//From here to object is a template/standard webgl code from module, DO NOT CHANGE ANYTHING.

import { Mat3 } from "./matrix3.js";

const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");

console.log(canvas);
console.log(canvas.width, canvas.height);
console.log(gl);

if (!gl) {
  throw new Error("WebGL2 tidak tersedia.");
}
const vertexShaderSource = `#version 300 es

in vec2 a_position;

uniform mat3 u_matrix;

void main() {
  vec3 p =
    u_matrix *
    vec3(
      a_position,
      1.0
    );

  gl_Position =
    vec4(
      p.xy,
      0.0,
      1.0
    );
}
`;

const fragmentShaderSource = `#version 300 es

precision highp float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
  outColor =
    u_color;
}
`;

function createShader(
  gl,
  type,
  source
) {
  const shader =
    gl.createShader(type);

  gl.shaderSource(
    shader,
    source
  );

  gl.compileShader(
    shader
  );

  const success =
    gl.getShaderParameter(
      shader,
      gl.COMPILE_STATUS
    );

  if (!success) {
    const info =
      gl.getShaderInfoLog(
        shader
      );

    gl.deleteShader(
      shader
    );

    throw new Error(
      "Shader compile error:\n" +
      info
    );
  }

  return shader;
}

function createProgram(
  gl,
  vertexShader,
  fragmentShader
) {
  const program =
    gl.createProgram();

  gl.attachShader(
    program,
    vertexShader
  );

  gl.attachShader(
    program,
    fragmentShader
  );

  gl.linkProgram(
    program
  );

  const success =
    gl.getProgramParameter(
      program,
      gl.LINK_STATUS
    );

  if (!success) {
    const info =
      gl.getProgramInfoLog(
        program
      );

    gl.deleteProgram(
      program
    );

    throw new Error(
      "Program link error:\n" +
      info
    );
  }

  return program;
}

const vertexShader =
  createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
  );

const fragmentShader =
  createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

const program =
  createProgram(
    gl,
    vertexShader,
    fragmentShader
  );

gl.useProgram(
  program
);

const positionBuffer = gl.createBuffer();

// Function for quick shape switching buffer

function setShape(vertices){
    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      positionBuffer
    );
    
    gl.bufferData(
      gl.ARRAY_BUFFER,
      vertices,
      gl.STATIC_DRAW
    );
}

const positionLocation =
  gl.getAttribLocation(
    program,
    "a_position"
  );

gl.bindBuffer(
  gl.ARRAY_BUFFER,
  positionBuffer
);

gl.enableVertexAttribArray(
  positionLocation
);

gl.vertexAttribPointer(
  positionLocation,
  2,
  gl.FLOAT,
  false,
  0,
  0
);

const matrixLocation =
  gl.getUniformLocation(
    program,
    "u_matrix"
  );

const colorLocation =
  gl.getUniformLocation(
    program,
    "u_color"
  );

function degToRad(
  degree
) {
  return (
    degree *
    Math.PI /
    180
  );
}

//Objects, add new objects/shapes if needed

const rectangleVertices =
  new Float32Array([
    -0.75, -0.080,
    1.00, -0.080,
    -0.75,  -1.00,
    1.00,  -1.00,
    1.00,  -0.080,
    -0.75,  -1.00
  ]);

const triangleVertices = //for sail
  new Float32Array([
    -0.1, -0.15,
     0.1, -0.15,
     0.00,  0.6
  ]);
 

const trapezoidVertices =
  new Float32Array([
    -0.15, -0.2,
     0.58,  0.0,
    -0.23,  0.0,

    -0.15, -0.2,
     0.5, -0.2,
     0.58,  0.0,

  ]);

// Helper to make circles

function createCircleVertices(
  radius,
  segments
) {
  const vertices = [];

  for (let i = 0; i < segments; i++) {
    const angle1 =
      (i / segments) *
      Math.PI * 2;

    const angle2 =
      ((i + 1) / segments) *
      Math.PI * 2;

    // Center point
    vertices.push(
      0,
      0
    );

    // First point on edge
    vertices.push(
      Math.cos(angle1) * radius,
      Math.sin(angle1) * radius
    );

    // Second point on edge
    vertices.push(
      Math.cos(angle2) * radius,
      Math.sin(angle2) * radius
    );
  }

  return new Float32Array(vertices);
}

const circleVertices =
  createCircleVertices(
    0.2, //rad
    126 //amount of vertices, more = smoother
  );

//This function does the math to determine object location after transformation

function createTRSMatrix(
  transform
) {
  const t =
    Mat3.translation(
      transform.x,
      transform.y
    );

  const r =
    Mat3.rotation(
      degToRad(
        transform.rotation
      )
    );

  const s =
    Mat3.scaling(
      transform.scaleX,
      transform.scaleY
    );

  let matrix =
    Mat3.identity();

  matrix =
    Mat3.multiply(
      matrix,
      s
    );

  matrix =
    Mat3.multiply(
      matrix,
      r
    );

  matrix =
    Mat3.multiply(
      matrix,
      t
    );

  return matrix;
}

//Helper function to make calling or drawing the object easier

function drawShape(
    vertices,
    x,
    y,
    scaleX,
    scaleY,
    rotation,
    color,
){
    setShape(vertices);
    const matrix = createTRSMatrix ({
        x: x,
        y: y,
        scaleX: scaleX,
        scaleY: scaleY,
        rotation: rotation
    });

    gl.uniformMatrix3fv(
        matrixLocation,
        false,
        matrix
    );

    gl.uniform4fv(
        colorLocation,
        color
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        vertices.length / 2
    );

}

//Function to draw or call the shapes into the scene or canvas

function drawScene(seconds) {
  gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
  );

  gl.clearColor(
    1.0,
    1.0,
    1.0,
    1.0
  );

  gl.clear(
    gl.COLOR_BUFFER_BIT
  );

  gl.useProgram(program);

  //Call the shapes needed

    //water
    drawShape(
        rectangleVertices,
        0.0,
        0.0,
        1.0,
        1.0,
        0.0,
        new Float32Array(
            [0.2, 0.8, 1.0, 1]
        )
    );

    //clouds
    const cloud1X = Math.sin(seconds * 1.2) * 0.05;
    const cloud2X = Math.sin(seconds * 1.15) * 0.04;

    drawShape(
        circleVertices,
        1.9 + cloud1X,      
        1.5,        
        0.45,        
        0.5,        
        0.0,        
        new Float32Array([
            0.2, 0.8, 1.0, 1
        ])
    );

    drawShape(
        circleVertices,
        2.1 + cloud1X,      
        1.2,        
        0.4,        
        0.5,        
        0.0,        
        new Float32Array([
            0.2, 0.8, 1.0, 1
        ])
    );

    drawShape(
        circleVertices,
        1.81 + cloud1X,      
        1.6,        
        0.4,        
        0.5,        
        0.0,        
        new Float32Array([
            0.2, 0.8, 1.0, 1
        ])
    );

    drawShape(
        circleVertices,
        1.8 + cloud1X,      
        0.9,        
        0.4,        
        0.7,        
        0.0,        
        new Float32Array([
            0.2, 0.8, 1.0, 1
        ])
    );
    
    drawShape(
        circleVertices,
        1.5 + cloud1X,      
        1.5,        
        0.4,        
        0.5,        
        0.0,        
        new Float32Array([
            0.2, 0.8, 1.0, 1
        ])
    );

    drawShape(
        circleVertices,
        1.5 + cloud1X,      
        1.2,        
        0.4,        
        0.5,        
        0.0,        
        new Float32Array([
            0.2, 0.8, 1.0, 1
        ])
    );

    //clouds number 2
    
    drawShape(
        circleVertices,
        -0.1 + cloud2X,      
        1.28,        
        0.45,        
        0.6,        
        0.0,        
        new Float32Array([
            0.2, 0.8, 1.0, 1
        ])
    );

    drawShape(
        circleVertices,
        -0.3 + cloud2X,      
        1.35,        
        0.4,        
        0.5,        
        0.0,        
        new Float32Array([
            0.2, 0.8, 1.0, 1
        ])
    );

    drawShape(
        circleVertices,
        -0.2 + cloud2X,      
        1.15,        
        0.4,        
        0.5,        
        0.0,        
        new Float32Array([
            0.2, 0.8, 1.0, 1
        ])
    );

    drawShape(
        circleVertices,
        0.12 + cloud2X,      
        1.6,        
        0.4,        
        0.5,        
        0.0,        
        new Float32Array([
            0.2, 0.8, 1.0, 1
        ])
    );

    drawShape(
        circleVertices,
        0.12 + cloud2X,      
        0.9,        
        0.4,        
        0.7,        
        0.0,        
        new Float32Array([
            0.2, 0.8, 1.0, 1
        ])
    );
    
    drawShape(
        circleVertices,
        0.45 + cloud2X,      
        1.5,        
        0.4,        
        0.5,        
        0.0,        
        new Float32Array([
            0.2, 0.8, 1.0, 1
        ])
    );

    drawShape(
        circleVertices,
        0.4 + cloud2X,      
        1.2,        
        0.4,        
        0.5,        
        0.0,        
        new Float32Array([
            0.2, 0.8, 1.0, 1
        ])
    );

    //boat movement
    const boatX = -1.5 + ((seconds * 0.25) % 3.0)
    const rotation = Math.sin(seconds * 2) * 1.5;

    //boat body
    drawShape(
        trapezoidVertices,
        boatX + 0.24,
        0.1,
        1.0,
        1.0,
        rotation,
        new Float32Array(
            [0.1, 0.1, 0.1, 1]
        )
    );

    //boat sail

    drawShape(
        triangleVertices,
        boatX + 0.3,
        0.25,
        1.0,
        1.0,
        rotation,
        new Float32Array([
            1, 0, 0.2, 1
        ])
    );

    //tree
    const wind = Math.sin(seconds * 2) * 0.01;
    const scale = 1.0 + Math.sin(seconds * 1) * 0.03;

    drawShape(
        circleVertices,
        -1.50+wind,      
        1.52,        
        0.45 * scale,        
        0.5 * scale,        
        0.0,        
        new Float32Array([
            0.52, 0.90, 0.35, 1
        ])
    );

    drawShape(
        circleVertices,
        -1.75+wind,      
        1.45,        
        0.45*scale,        
        0.5*scale,        
        0.0,        
        new Float32Array([
            0.52, 0.90, 0.35, 1
        ])
    );

    drawShape(
        circleVertices,
        -1.65+wind,      
        1.25,        
        0.45,        
        0.5,        
        0.0,        
        new Float32Array([
            0.52, 0.90, 0.35, 1
        ])
    );

    drawShape(
        circleVertices,
        -1.9+wind,      
        1.15,        
        0.45,        
        0.5,        
        0.0,        
        new Float32Array([
            0.52, 0.90, 0.35, 1
        ])
    );

    drawShape(
        circleVertices,
        -1.35+wind,      
        1.25,        
        0.45,        
        0.5,        
        0.0,        
        new Float32Array([
            0.52, 0.90, 0.35, 1
        ])
    );

    drawShape(
        circleVertices,
        -1.15+wind,      
        1.0,        
        0.45,        
        0.5,        
        0.0,        
        new Float32Array([
            0.52, 0.90, 0.35, 1
        ])
    );

    drawShape(
        circleVertices,
        -1.5+wind,      
        1.0,        
        0.45,        
        0.5,        
        0.0,        
        new Float32Array([
            0.52, 0.90, 0.35, 1
        ])
    );

    drawShape(
        circleVertices,
        -1.75+wind,      
        1.0,        
        0.45,        
        0.5,        
        0.0,        
        new Float32Array([
            0.52, 0.90, 0.35, 1
        ])
    );

    drawShape(
        circleVertices,
        -1.4+wind,      
        0.8,        
        0.45*scale,        
        0.5*scale,        
        0.0,        
        new Float32Array([
            0.2, 0.75, 0.35, 1
        ])
    );

    drawShape(
        circleVertices,
        -2+wind,      
        0.8,        
        0.45*scale,        
        0.5*scale,        
        0.0,        
        new Float32Array([
            0.2, 0.75, 0.35, 1
        ])
    );

    drawShape(
        circleVertices,
        -1.1+wind,      
        0.9,        
        0.45*scale,        
        0.5*scale,        
        0.0,        
        new Float32Array([
            0.2, 0.75, 0.35, 1
        ])
    );

    drawShape(
        circleVertices,
        -1.75+wind,      
        0.8,        
        0.45*scale,        
        0.5*scale,        
        0.0,        
        new Float32Array([
            0.2, 0.75, 0.35, 1
        ])
    );

    drawShape(
        circleVertices,
        -1.76+wind,      
        0.6,        
        0.45,        
        0.5,        
        0.0,        
        new Float32Array([
            0.05, 0.55, 0.45, 1
        ])
    );

    drawShape(
        circleVertices,
        -1.1+wind,      
        0.3,        
        0.6,        
        0.8,        
        0.0,        
        new Float32Array([
            0.05, 0.55, 0.45, 1
        ])
    );

    drawShape(
        circleVertices,
        -0.8+wind,      
        0.35,        
        0.6,        
        0.8,        
        0.0,        
        new Float32Array([
            0.05, 0.55, 0.45, 1
        ])
    );

    drawShape(
        circleVertices,
        -0.6+wind,      
        0.1,        
        0.8,        
        1,        
        0.0,        
        new Float32Array([
            0.05, 0.55, 0.45, 1
        ])
    );

    //land
    drawShape(
        circleVertices,
        -0.190,      
        -0.140,        
        10,        
        10,        
        0.0,        
        new Float32Array([
            1.0, 1.0, 0.0, 1.0
        ])
    );

}

//Function that calls drawscene multiple times to make an animation

function render(time){
    const seconds= time / 1000;

    drawScene(seconds);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);