
// search stuffs

var AirportResult = Result.extend({
  init: function(airport) {
    this._super();

    this.airport = airport;

    this.setCanOpen(true);
  },

  generate: function() {
    this._super();

    this.title.append("<span class='marker button'><i class='material-icons'>location_on</i></span>");
    this.title.append("<span class='icao'></span>");
    this.title.append("<span class='name'></span>");
    
    this.title.find(".icao").text(this.airport.icao);
    this.title.find(".name").text(this.airport.name);
    
    this.data.append("<img class='map' />");
    this.data.find("img.map").attr("src", map_static(this.airport.location, 13));

    var marker = this.title.find(".marker.button");
    marker.attr("title", "show " + this.airport.getIcao() + " on the map");
    var airport_result = this;
    
    marker.click(function(e) {
      airport_result.marker_clicked.call(airport_result);
      return false;
    });
    
  },

  closed: function() {
    this._super();
    
    console.log("closing " + this.airport.icao);
  },

  opened: function() {
    this._super();
    
    console.log("opening " + this.airport.icao);
  },

  marker_clicked: function() {
    this.airport.showOnMap();
  },
  
});

var AirportResults = Results.extend({
  init: function() {
    this._super();
    this.html.addClass("airports");
  },

  search: function(query) {
    this._super(query);

    var airport = airport_get(query);
    if(airport) {
      this.addResult(new AirportResult(airport));
      return;
    }

    var airports = airport_find(query, 3);
    if(airports.length >= 0) {
      for(var i=0; i<airports.length; i++)
        this.addResult(new AirportResult(airports[i]));
    }
  }
});

// airport json list order

var AIRPORT = {
  ICAO: 0,
  NAME: 1,
  LOCATION: 2,
  ALT:  3
};

// actual airport class

var Airport = Class.extend({
  init: function(options) {

    this.icao = "";
    this.name = "";
    this.location = [0, 0];
    this.alt  = 0;

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
  
  setArray: function(data) {
    this.icao = data[AIRPORT.ICAO];
    this.name = data[AIRPORT.NAME];
    this.location = data[AIRPORT.LOCATION];
    this.alt  = data[AIRPORT.ALT];
  },

  getIcao: function() {
    return this.icao.toUpperCase();
  },

  showOnMap: function() {
    prop.map.setView(this.location, 14);
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
    })
    .fail(function() {
      console.log(arguments);
    })
    .always(function() {
      unblock();
    });
}

function airport_icao(icao) {
  return icao.toLowerCase();
}

function airport_get(icao) {
  icao = airport_icao(icao);

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

function airport_find(icao, distance) {
  icao = airport_icao(icao);

  var results = {};

  for(var i=0; i<prop.airport.list.length; i++) {
    var airport = prop.airport.list[i];
    if(airport[AIRPORT.ICAO].indexOf(icao) >= 0 || icao.indexOf(airport[AIRPORT.ICAO]) >= 0) {
      var l = -1;
    } else {
      var l = new Levenshtein(airport[AIRPORT.ICAO], icao).distance;
    }
    if(l < distance) {
      if(!(l in results)) results[l] = [];
      results[l].push(airport_get(airport[AIRPORT.ICAO]));
    }
  }

  var max_results = 10;
  
  if(results[-1]) {
    max_results = max_results - results[-1].length;
  }
  
  if(!results[1]) {
    max_results = 5;
  }

  if(!results[2]) {
    max_results = 3;
  }

  var out = [];
  var number = 0;

  for(var i=-1; i<distance; i++) {
    if(results[i]) {
      for(var j=0; j<results[i].length; j++) {
        if(number >= max_results) return out;
        out.push(results[i][j]);
        number += 1;
      }
    }
  }

  return out;
}

function airport_search(query) {
  var results = new AirportResults();
  results.search(query);

  return results;
}
