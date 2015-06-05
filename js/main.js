
var prop = {};

function prop_init() {
  prop.time = {};
  prop.time.start = time();
  prop.blocking = 0;
}

function blocking() {
  prop.blocking += 1;
}

function unblock() {
  prop.blocking -= 1;
  if(prop.blocking == 0) {
    done();
  }
}

$(document).ready(function() {
  prop_init();
  ripple_init();
  
  airport_init();
  
  map_init();
  search_init();
});

function done() {
  console.log("done loading");
}
