
var Result = Class.extend({
  init: function() {
    this.html  = $(document.createElement("div"));
    this.html.addClass("content");

    this.openable = false;

    this.title = $(document.createElement("div"));
    this.title.addClass("title");
    
    this.data = $(document.createElement("div"));
    this.data.addClass("data");

    this.html.append(this.title);
    this.html.append(this.data);
  },

  generate: function() {
    
  },

  closed: function() {

  },

  opened: function() {

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

  search: function(query) {
    this.query = query;
  },
  
  addResult: function(result) {
    this.results.push(result);

    result.generate();
    
    var li = $(document.createElement("li"));
    li.addClass("result");
    li.append(result.html);
    
    this.ul.append(li);
  },

  addToDropdown: function() {
    this.restyleResults();
    $("#dropdown").append(this.html);

    var html = this.html;
    
    setTimeout(function() {
      html.removeClass("hidden");
    }, 10);
  },

  restyleResults: function() {
    if(this.removed) return;
    
    this.number = prop.search.results.indexOf(this);
    
    var number = this.number;
    var length = this.ul.find("li").length;

    this.html.attr("data-number", this.number);
    console.log("setting '" + this.query + "' to " + this.number);

    var index = this.open;

    this.ul.find("li").each(function(i) {
      $(this).removeClass("bottom top opened");

      if(i == index) {
        $(this).addClass("bottom top opened");
      } else if(i - 1 == index) {
        $(this).addClass("top");
      } else if(i + 1 == index) {
        $(this).addClass("bottom");
      }
      if(i == 0 && number != 0)
        $(this).addClass("top");
      if(i == length - 1) {
        $(this).addClass("bottom");
      }
    });
    
  },

  clicked: function(index) {
    if(!this.results[index].canOpen()) return;

    if(this.open == index) {
      this.results[this.open].closed();
      this.open = -10;
    } else {
      if(this.open != -10)
        this.results[this.open].closed();
      this.results[index].opened();
      this.open = index;
    }

    search_restyle();
  },

  add: function() {
    if(this.results.length >= 1) {
      prop.search.results.push(this);
      this.addToDropdown();
    }
  },

  remove: function() {
    console.log("removing '" + this.query + "'");
    this.html.attr("data-number", -10);
    this.html.addClass("removed");

    this.removed = true;
  }
  
});

var NoResults = Results.extend({
  init: function() {
    this._super();
    this.html.addClass("no-results");
  },

  search: function(query) {
    this._super(query);

    this.addResult(new NoResult());
  }
});

function search_init() {
  prop.search = {};

  prop.search.results = [];

  $("#dropdown").on("click", ".results .title", search_result_clicked);

  $("#search #searchbar input.search").keyup(function(e) {
    if(e.which == 13) search();
  });
  
  $("#search #searchbar .search.button").click(search)
}

function search_result_clicked(e) {
  // e is the .title
  var el = $(this).parent().parent();
  // el is the 

  var results = prop.search.results[el.parent().parent().attr("data-number")];

  results.clicked(el.index());

  search_restyle_searchbox();
}

function search_result_opened(el) {

}

function search() {
  var query = $("#search #searchbar input.search").val();

  if(isspace(query)) return;

  var airports = airport_search(query);

  search_remove_all();
  
  if(airports.getResults().length == 0) {
    var results = new NoResults();
    results.search(query);
    results.add();
  } else {
    airports.add();
  }

  search_restyle_searchbox();
}

function search_get_first_visible_result() {
  for(var i=0; i<prop.search.results.length; i++) {
    if(prop.search.results[i].isVisible()) return prop.search.results[i];
  }
  return null;
}

function search_restyle_searchbox() {
  var touching = false;

  var first_visible = search_get_first_visible_result();
  if(first_visible && first_visible.open == 0) touching = true;

  if(touching) {
    $("#search").removeClass("dropdown-touching");
  } else {
    $("#search").addClass("dropdown-touching");
  }
}

function search_restyle() {
  for(var i=0; i<prop.search.results.length; i++) {
    prop.search.results[i].restyleResults();
  }
  search_restyle_searchbox();
}

function search_remove_all() {
  for(var i=0; i<prop.search.results.length; i++) {
    prop.search.results[i].remove();
  }

  search_restyle();
}
