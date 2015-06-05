
function time() {
  return new Date().getTime() * 0.001;
}

function canvas(width, height) {
  var c = document.createElement("canvas");
  c.width  = width;
  c.height = height;
  return c;
}

function clamp(a, v, b) {
  if(a > b) {
    var temp = a;
    a = b;
    b = temp;
  }
  if(a > v) return a;
  if(b < v) return b;
  return a;
}

function lerp(il, i, ih, ol, oh) {
  return (((i - il) / (ih - il)) * (oh - ol)) + ol;
}

function clerp(il, i, ih, ol, oh) {
  return clamp(ol, lerp(il, i, ih, ol, oh), oh);
}

function degrees(radians) {
  return radians * (180/Math.PI);
}

function radians(degrees) {
  return degrees * (Math.PI/180);
}

function isspace(s) {
  return !(/\S/.test(s));
};
  
