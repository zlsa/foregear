
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
  return v;
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

var DEVICE = {
  SQUASHED: 1024,
  SMALL:    640,
  MOBILE:   480
};

function hide_keyboard() {
  var element = $("#search #searchbar input.search");
  element.attr("readonly", "readonly");
  element.attr("disabled", "true");
  setTimeout(function() {
    element.blur();
    element.removeAttr("readonly");
    element.removeAttr("disabled");
  }, 100);
}

function first_element_compare(a, b) {
  if(a[1] < b[1]) return -1;
  if(a[1] > b[1]) return 1;
  return 0;
}

function score_compare(a, b) {
  if(a.score > b.score) return -1;
  if(a.score < b.score) return 1;
  return 0;
}

function normalize(s) {
  return s.toLowerCase().replace(/[\s\.\-_]/g, "");
}

function similarity(a, b){
  if(a.length <= 1 || b.length <= 1) return 0;
  
  a = normalize(a);
  b = normalize(b);

  if(a == b) return 1.5;
  if(a.indexOf(b) >= 0 || b.indexOf(a) >= 0) {
    var maxlength = Math.max(a.length, b.length);
    var minlength = Math.min(a.length, b.length);
    var difference = Math.abs(a.length - b.length);
    return (difference / minlength);
  }
  return 0;
}

function to_km(n) {
  n = (n / 1000);
  if(n < 40) n = n.toFixed(1);
  else       n = Math.round(n);
  return n + "km";
}

function rand(l, h) {
  return lerp(0, Math.random(), 1, l, h);
}
