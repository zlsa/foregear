
function drawer_init() {
  $("#searchbar .menu.button").click(drawer_toggle);
  
  $("body").keyup(function(e) {
    if(e.which == 27) drawer_close();
  });
  
  $("#drawer > .drawer > .close.button").click(drawer_close);
  
  $("#drawer").click(drawer_close);
  $("#drawer > .drawer").click(function(e) {
    return false;
  });
}

function drawer_close() {
  $("#drawer").addClass("closed");
}

function drawer_open() {
  $("#drawer").removeClass("closed");
}

function drawer_is_open() {
  if($("#drawer").hasClass("closed")) return false;
  return true;
}

function drawer_toggle() {
  if(drawer_is_open()) drawer_close();
  else                 drawer_open();
}
