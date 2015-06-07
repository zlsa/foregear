
// airport json list order

var AIRPORT = {
  ICAO:     0,
  NAME:     1,
  LOCATION: 2,
  ALT:      3,
  TYPE:     4
};

// search stuffs

var AirportResult = ImageResult.extend({
  init: function(airport) {
    this._super();

    this.airport = airport;

    this.li.addClass("airport");

    this.setCanOpen(true);
    
    prop.map.bind("move", this.map_moved, this);
  },

  generate: function() {
    this._super();

    var color = tinycolor("#eba070");
    this.img_color = color.desaturate(rand(5, 40)).spin(rand(-20, 20));
    this.img_src = this.airport.getStaticMapUrl();

    this.title.append("<span class='marker button'><i class='material-icons'>location_on</i></span>");
    this.title.append("<span class='icao'></span>");
    this.title.append("<span class='distance'></span>");
    this.title.append("<span class='name'></span>");
    
    this.title.find(".icao").text(this.airport.icao);
    this.title.find(".distance").text(to_km(map_distance(this.airport.location, prop.map.getCenter())));
    this.title.find(".name").text(this.airport.name);

    var marker = this.title.find(".marker.button");
    marker.attr("title", "show " + this.airport.getIcao() + " on the map");
    var airport_result = this;
    
    marker.click(function(e) {
      airport_result.marker_clicked.call(airport_result);
      return false;
    });
    
    this.data.addClass("ripple");
    
    this.data.click(function(e) {
      airport_result.marker_clicked.call(airport_result, true);
      return false;
    });
    
    this.airport.addMarker();
  },

  action: function() {
    this.marker_clicked();
  },

  load: function() {
    this._super();
  },

  closed: function() {
    this._super();
    
    console.log("closing " + this.airport.icao);
  },

  opened: function() {
    this._super();
    
    console.log("opening " + this.airport.icao);
  },

  marker_clicked: function(do_not_close) {
    this.airport.showOnMap();

    if(!do_not_close)
      this.close();

    search_hide_results();
  },

  map_moved: function(location, that) {
    that.title.find(".distance").text(to_km(map_distance(that.airport.location, prop.map.getCenter())));
  },

  remove: function() {
    prop.map.unbind("move", this.map_moved);
  },
  
  hide: function() {
    this.airport.remove();
  }
  
});

// actual airport class

var Airport = Class.extend({
  init: function(options) {

    this.icao = "";
    this.name = "";
    this.location = [0, 0];
    this.alt  = 0;
    this.type = "small";

    if(typeof options == typeof [])
      this.setArray(options);
    else
      this.set(options);
  },

  set: function(data) {
    if("icao" in data)     this.icao = data.icao;
    if("name" in data)     this.name = data.name;
    if("location" in data) this.location = data.location;
    if("alt" in data)      this.alt  = data.alt;
  },

  formatSuggestion: function() {
    return this.getIcao() + " (" + this.name + ")";
  },
  
  setArray: function(data) {
    this.icao     = data[AIRPORT.ICAO];
    this.name     = data[AIRPORT.NAME];
    this.location = data[AIRPORT.LOCATION];
    this.alt      = data[AIRPORT.ALT];
    this.type     = data[AIRPORT.TYPE];
  },

  getIcao: function() {
    return this.icao.toUpperCase();
  },

  addMarker: function() {
    if(!this.marker)
      this.marker = new Marker(this.location, prop.map);
  },

  showOnMap: function() {
    prop.map.setView(this.location, 14);

    this.addMarker();
  },

  removeMarker: function() {
    if(this.marker)
      this.marker.remove();
    this.marker = null;
  },

  remove: function() {
    this.removeMarker();
  },

  getStaticMapUrl: function() {
    if(this.type == "large")
      var zoom = 13;
    else if(this.type == "medium")
      var zoom = 14;
    else if(this.type == "small")
      var zoom = 15;
    return map_static(this.location, zoom);
  }
});

function airport_init() {
  prop.airport = {};
  
  prop.airport.list = [];

  prop.airport.hash = {};

  blocking();

  $.get("data/airports.json")
    .done(function(data) {
      prop.airport.list = data;

      console.log("loaded " + data.length + " airports");
    })
    .fail(function() {
      console.log(arguments);
    })
    .always(function() {
      unblock();
    });
}

function airport_normalize_icao(icao) {
  return icao.toLowerCase().replace(" ", "");
}

function airport_get(icao) {
  icao = airport_normalize_icao(icao);

  if(!(icao in prop.airport.hash)) {
    for(var i=0; i<prop.airport.list.length; i++) {
      if(prop.airport.list[i][AIRPORT.ICAO] == icao) {
        prop.airport.hash[icao] = new Airport(prop.airport.list[i]);
        break;
      }
    }
  }

  if(!(icao in prop.airport.hash))
    return null;

  return prop.airport.hash[icao];
}

function airport_search(query) {
  var q = query.split(",");

  var results = [];
  
  if(query == "nearby") {
    return airport_search_distance(prop.map.getCenter());
  }

  for(var i=0; i<q.length; i++){
    results.push.apply(results, airport_search_icao(q[i]));
  }

  return results;

}

function airport_search_icao(query, suggestion) {
  var icao = airport_normalize_icao(query);

  var results = [];

  for(var i=0; i<prop.airport.list.length; i++) {
    var airport_icao = prop.airport.list[i][AIRPORT.ICAO];
    var icao_score   = similarity(airport_icao, icao) * 10;

    var airport_name = prop.airport.list[i][AIRPORT.NAME];
    var name_score = 0;
    if(query.length > 4) {
      var name_score = similarity(airport_name, query);
    }
    
    if((name_score + icao_score) >= 0.6) {
      var airport        = airport_get(airport_icao);
      
      var distance_score = 0;
      distance_score     = clerp(0, map_distance(prop.map.getCenter(), airport.location), 1000 * 1000, 0.7, 1);
      distance_score    *= clerp(0, map_distance(prop.map.getCenter(), airport.location), 1000 * 10, 10, 1);

      var size_score     = 0;
      if(airport.type == "medium") size_score = 1;
      if(airport.type == "large")  size_score = 3;
      
      var score          = (name_score + icao_score + size_score) * distance_score * 10;

      if(suggestion) {
        var suggestion   = new Suggestion("airport", airport.icao, airport.formatSuggestion());
        suggestion.setScore(score);
        results.push(suggestion);
      } else {
        var result       = new AirportResult(airport);
        result.setScore(score);
        results.push(result);
      }
    }
    
  }

  return results;
}

function airport_search_distance(location) {

  var results = [];

  for(var i=0; i<prop.airport.list.length; i++) {
    var airport_location = prop.airport.list[i][AIRPORT.LOCATION];
    var distance_score   = 0;
    distance_score       = clerp(0, map_distance(airport_location, location), 1000 * 100, 3, 0);
    distance_score      *= clerp(0, map_distance(airport_location, location), 1000 * 10, 100, 1);

    if(distance_score >= 0.5) {
      var airport        = airport_get(prop.airport.list[i][AIRPORT.ICAO]);
      var result         = new AirportResult(airport);
      var score          = distance_score;
      result.setScore(score);
      results.push(result);
    }
    
  }

  return results;
}

function airport_suggestions(query) {
  var s = similarity(query, "nearby");
  if(s > 0.7) {
    var suggestion = new Suggestion("nearby", "nearby", "Show all nearby airports");
    suggestion.setScore(s * 10);
    return [suggestion];
  }

  var results = airport_search_icao(query, true);

  return results;
}
