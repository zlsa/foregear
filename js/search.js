
var Result = Class.extend({
  init: function() {
    this.parent = null;

    this.score  = 0;

    this.index  = 0;
    
    this.html  = $(document.createElement("div"));
    this.html.addClass("content");

    this.openable = false;

    this.title = $(document.createElement("div"));
    this.title.addClass("title");
    
    this.data = $(document.createElement("div"));
    this.data.addClass("data");

    this.html.append(this.title);
    this.html.append(this.data);
    
    this.li = $(document.createElement("li"));
    this.li.append(this.html);
    this.li.addClass("result");
  },

  setScore: function(score) { // 0 = no match, 1 = perfect, 1000 = perfecter
    this.score = score;
  },

  setParent: function(parent) {
    this.parent = parent;
  },

  generate: function() {
    
  },

  closed: function() {

  },

  opened: function() {

  },

  action: function() {

  },

  setCanOpen: function(openable) {
    this.openable = openable;
    
    if(this.openable)
      this.title.addClass("ripple");
    else
      this.title.removeClass("ripple");
  },

  canOpen: function() {
    return this.openable;
  },

  close: function() {
    this.parent.set_open(-10);
  }
  
});

var NoResult = Result.extend({
  init: function() {
    this._super();
  },

  generate: function() {
    this._super();

    this.title.append("<span class='text'>No results</span>");
  }
});

var Results = Class.extend({
  init: function() {
    this.results = [];

    this.number  = 0;

    this.query = "";

    this.html  = $(document.createElement("div"));
    this.ul    = $(document.createElement("ul"));
    this.html.append(this.ul);

    this.html.addClass("results hidden");

    this.open  = -10;

    this.removed = false;
  },

  getResults: function() {
    return this.results;
  },

  isVisible: function() {
    return !this.removed;
  },

  addResult: function(result) {
    this.results.push(result);

    result.setParent(this);
    result.index = this.results.length - 1;

    result.generate();
    
    this.ul.append(result.li);
  },

  addToDropdown: function() {
    this.restyle();
    $("#dropdown").append(this.html);

    var html = this.html;
    
    setTimeout(function() {
      html.removeClass("hidden");
    }, 10);
  },

  restyle: function() {
    if(this.removed) return;
    
    var length = this.ul.find("li").length;

    var index = this.open;

    var results = this;

    this.ul.find("li").each(function(i) {
      $(this).removeClass("bottom top opened");

      if(i == index) {
        $(this).addClass("bottom top opened");
      } else if(i - 1 == index) {
        $(this).addClass("top");
        console.log("added top because we're beneath the index");
      } else if(i + 1 == index) {
        $(this).addClass("bottom");
      }

      if(i == 0 && this.open != 0) {
        $(this).addClass("top");
      }
      if(i == length - 1) {
        $(this).addClass("bottom");
      }
    });
    
  },

  set_open: function(id) {
    if(this.open >= 0)
      this.results[this.open].closed();
    
    if(id == this.open || id < 0)
      this.open = -10;
    else
      this.open = id;

    if(this.open >= 0)
      this.results[this.open].opened();
    
    search_restyle();
  },

  clicked: function(index) {
    if(!this.results[index].canOpen()) return;

    this.set_open(index);
  },

  add: function() {
    if(this.results.length >= 1) {
      this.addToDropdown();
    }

    if(this.results.length == 1) this.results[0].action();
  },

  remove: function() {
    console.log("removing '" + this.query + "'");
    this.html.addClass("removed");

    this.removed = true;
  }
  
});

// Search suggestion

var Suggestion = Class.extend({
  init: function(type, query, display) {
    this.type    = type;
    this.display = display;
    this.query   = query;

    this.score   = 0;

    this.html    = $(document.createElement("li"));
    this.html.addClass("ripple");
  },

  generate: function() {
    var icon = "history";
    if(this.type == "airport") icon = "map";
    if(this.type == "nearby")  icon = "my_location";
    
    this.html.empty();
    this.html.append("<span class='icon'><i class='material-icons'></i></span>");
    this.html.append("<span class='text'></span>");
    this.html.find(".icon i").text(icon);
    this.html.find(".text").text(this.display);

    this.html.attr("data-query", this.query);
  },

  setScore: function(score) { // 0 = no match, 1 = perfect, 1000 = perfecter
    this.score = score;
  },

});

// init

function search_init() {
  prop.search = {};

  prop.search.query = "";

  prop.search.results = null;
  prop.search.suggestions = [];

  $("#dropdown").on("click", ".results .title", search_result_clicked);
  $("#search-suggestions").on("click", "li", search_suggestion_clicked);

  $("#search #searchbar input.search").keyup(function(e) {
    if(e.which == 13) search();
    else              search_changed();
  });
  
  $("#search #searchbar .search.button").click(search);
  $("#search #searchbar .clear-search.button").click(search_clear);
  
  $("#search #searchbar input.search").blur(function() {
    setTimeout(function() {
//      search_hide_suggestions();
    }, 100);
  });
  $("#search #searchbar input.search").focus(search_update_suggestions);
  
  search_changed();
}

// element handling

function search_result_clicked(e) {
  var el = $(this).parent().parent();
  
  prop.search.results.clicked(el.index());
}

function search_suggestion_clicked(e) {
  var el = $(this);
  search_set_query(el.attr("data-query"));
  search();
}

function search_changed() {
  if(search_get_query() != "") {
    $("#search #searchbar .clear-search.button").addClass("visible");
  } else {
//    $("#search #searchbar .clear-search.button").removeClass("visible");
  }
  
  $("#dropdown").addClass("suggestions");
  
  prop.search.query = search_get_query();

  search_update_suggestions();

  search_restyle();
}

function search_get_query() {
  return $("#search #searchbar input.search").val();
}

function search_set_query(query) {
  prop.search.query = query;
  $("#search #searchbar input.search").val(query);
}

// actual search

function search() {
  var query = search_get_query().toLowerCase();

  if(isspace(query)) return;

  search_remove_all();

  var results = [];
  
  results.push.apply(results, airport_search(query));

  results = results.sort(score_compare);
  
  if(results.length == 0) {
    results.push(new NoResult());
  }

  prop.search.results = new Results();

  for(var i=0; i<results.length; i++) {
    prop.search.results.addResult(results[i]);
    prop.search.results.add();
  }

  hide_keyboard();

  search_update_suggestions();

  search_restyle_searchbox();
  
  $("#search-suggestions").addClass("hidden");
}

// misc utility functions

function search_clear() {
  $("#search #searchbar input.search").val("");
  
  search_remove_all();
  hide_keyboard();
  
  search_hide_suggestions();
}

function search_restyle_searchbox() {
  var touching = false;

  if(prop.search.results && prop.search.results.open != 0) touching = true;
  if(prop.search.suggestions.length != 0 && !$("#search-suggestions").hasClass("hidden")) touching = true;

  if(touching) {
    $("#search").addClass("dropdown-touching");
  } else {
    $("#search").removeClass("dropdown-touching");
  }
  
}

function search_restyle() {
  if(prop.search.results)
    prop.search.results.restyle();
  
  search_restyle_searchbox();
}

function search_remove_all() {
  if(prop.search.results)
    prop.search.results.remove();

  prop.search.results = null;

  prop.search.suggestions = [];

  search_restyle();
}

function search_open() {
  if(prop.search.results.length) return true;
}

// suggestions

function search_get_suggestions(query) {
  prop.search.suggestions = [];

  var suggestions = [];

  if(query != "") {
    suggestions.push.apply(suggestions, airport_suggestions(query));
  }

  suggestions = suggestions.sort(score_compare);

  var max_suggestions = 10;

  for(var i=0; i<Math.min(suggestions.length, max_suggestions); i++) {
    prop.search.suggestions.push(suggestions[i]);
  }

}

function search_update_suggestions() {

  var query = prop.search.query;

  search_get_suggestions(query);

  var ul = $("#search-suggestions ul");

  if(prop.search.suggestions.length == 0) {
    search_hide_suggestions();
  } else {
    search_show_suggestions();
    ul.empty();
    
    for(var i=0; i<Math.min(prop.search.suggestions.length, 6); i++) {
      prop.search.suggestions[i].generate();
      ul.append(prop.search.suggestions[i].html);
    }
  }

  search_restyle_searchbox();
  
}

function search_show_suggestions() {
  $("#search-suggestions").removeClass("hidden");
  $("#dropdown").addClass("suggestions-visible");
}

function search_hide_suggestions() {
  $("#search-suggestions").addClass("hidden");
  $("#dropdown").removeClass("suggestions-visible");

  setTimeout(search_restyle_searchbox, 10);
}
