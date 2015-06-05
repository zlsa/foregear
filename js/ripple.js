
function ripple_init() {
  $("body").on("mousedown", ".button, .ripple", ripple_down);
  $("body").mouseup(ripple_up);
  $("body").on("dragend", ripple_up);
}

function ripple_down(e) {
  var el = $(this);
  if(el.find(".ripples").length == 0)
    el.append("<div class='ripples'></div>");

  var ripples = el.find(".ripples");
  var ripple  = $("<div></div>");
  
  var x = e.pageX - el.offset().left;
  var y = e.pageY - el.offset().top;

  ripple.css({
    "left": x + "px",
    "top":  y + "px"
  });

  ripples.append(ripple);

  setTimeout(function() {
    ripple.addClass("opening");
  }, 0);

  return false;
}

function ripple_up() {
  $(".ripples > div").addClass("hidden");
  $(".ripples > div").attr("data-last-touch", time());
  setTimeout(function() {
    $(".ripples > div.hidden").each(function() {
      var el = $(this);
      if(el.data("last-touch") < time() - 0.5)
        el.remove();
    });
  }, 700);
}
