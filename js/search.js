
function search_init() {
  $("#dropdown .results").on("click", ".title", search_result_clicked);

  $("#dropdown .results li").each(function() {
    $(this).find("img").attr("src", map_static([Math.random() * 45, 100 - (Math.random() * 30)]));
  });
}

function search_result_clicked(e) {
  var el = $(this).parent().parent();

  var index = el.index();
  var length = el.parent().find("li").length;
  
  if(el.hasClass("opened")) index = -10;

  el.parent().find("li").each(function(i) {
    $(this).removeClass("bottom top opened");

    if(i == index) {
      $(this).addClass("bottom top opened");

      search_result_opened($(this));
    } else if(i - 1 == index) {
      $(this).addClass("top");
    } else if(i + 1 == index) {
      $(this).addClass("bottom");
    }
    if(i == length - 1)
      $(this).addClass("bottom");
  });
}

function search_result_opened(el) {

}
