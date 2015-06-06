
var Map = Class.extend({
  init: function() {
    
    var map = this;
    
    $("body").on("click", "[data-action]", function() {
      map.action.call(map, $(this).attr("data-action"));
    })

    this.listeners = {};
  },

  bind: function(event, callback, data) {
    if(!(event in this.listeners)) this.listeners[event] = [];
    this.listeners[event].push([callback, data]);
  },

  unbind: function(event, callback) {
    if(!(event in this.listeners)) return;
    
    for(var i=0; i<this.listeners[event].length; i++) {
      if(this.listeners[event][i][0] == callback) {
        this.listeners[event].splice(i, 1);
        break;
      }
    }
  },

  fire: function(event, data) {
    if(!(event in this.listeners)) return;

    for(var i=0; i<this.listeners[event].length; i++) {
      this.listeners[event][i][0].call(this, data, this.listeners[event][i][1]);
    }
  },

  panTo: function(location) {
    this.map.panTo(location);
    
    this._super(location);
  },

  zoomIn: function(delta) {
    if(delta == undefined) delta = 1;
    this.zoomDelta(delta);
  },

  zoomDelta: function(delta) {
    this.setZoom(this.getZoom() + delta);
  },

  zoomOut: function(delta) {
    if(delta == undefined) delta = 1;
    this.zoomDelta(-delta);
  },

  action: function(action) {
    if(action == "map-zoom-in") {
      this.zoomIn(1);
    } else if(action == "map-zoom-out") {
      this.zoomOut(1);
    }
  }
  
});

var LeafletMap = Map.extend({
  init: function(element, options) {
    if(!options) options = {};

    this._super(element, options);

    this.element = element;

    this.set(options);

    this.create_map();
    
    this.create_listeners();
  },

  create_map: function() {
    this.map = L.mapbox.map(this.element, "mapbox.outdoors", {
      zoomControl: false
    });
    this.map.setView([37.6189, -122.375040], 11);
  },
  
  create_listeners: function() {
    var map = this;
    this.map.on("move", function(e) {
      map.fire.call(map, "move", map.getCenter());
    });
  },

  set: function() {
    
  },

  setView: function(location, zoom, animate) {
    if(animate == undefined) animate = true;
    
    this.map.setView(location, zoom, {
      animate: animate,
    });
    
  },

  panTo: function(location) {
    this.map.panTo(location);
    
    this._super(location);
  },

  getZoom: function() {
    return this.map.getZoom();
  },
  
  setZoom: function(zoom) {
    this.map.setZoom(zoom);
  },

  addMarker: function(marker) {
    marker.marker.addTo(this.map);
  },

  getCenter: function() {
    var c = this.map.getCenter();
    return [c.lat, c.lng];
  }

});

var Marker = Class.extend({
  init: function() {
    
  },

  addTo: function(map) {
    map.addMarker(this);
  }
});

var LeafletMarker = Marker.extend({
  init: function(location) {
    this.marker = L.marker(location, {

    });
  },
});

function map_init() {
  L.mapbox.accessToken = "pk.eyJ1IjoiemxzYSIsImEiOiJuOGtheTRvIn0.nARpggDJzduPw-dkchKRpQ";
  
  prop.map = new LeafletMap("map-container");
}

function map_static(location, zoom) {
  var url     = "http://api.tiles.mapbox.com/v4/";
  var mapid   = "zlsa.mce1f9le";
  var lat     = location[0];
  var lon     = location[1];
  var zoom    = zoom;
  var size    = 1024;
  var width   = 720;
  var height  = 320;
  var format  = "png";
  url += mapid  + "/";
  url += lon    + ",";
  url += lat    + ",";
  url += zoom   + "/";
  url += width  + "x";
  url += height + ".";
  url += format + "?access_token=";
  url += L.mapbox.accessToken;
  return url;
}

function map_distance(a, b) {
  return L.latLng(a).distanceTo(b);
}
