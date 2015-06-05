
var prop = {};

function prop_init() {
  prop.time = {};
  prop.time.start = time();
}

$(document).ready(function() {
  prop_init();
  ripple_init();
  map_init();
  search_init();
});
