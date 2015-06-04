
var Map = Class.extend({
  init: function() {
    
    var map = this;
    
    $("body").on("click", "[data-action]", function() {
      map.action.call(map, $(this).attr("data-action"));
    })

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

    this.createMap();
  },

  createMap: function() {
    this.map = L.mapbox.map(this.element, "mapbox.outdoors", {
      zoomControl: false
    });
    this.map.setView([37.6189, -122.375040], 11);
  },
  
  set: function() {
    
  },

  getZoom: function() {
    return this.map.getZoom();
  },
  
  setZoom: function(zoom) {
    this.map.setZoom(zoom);
  },

});

function map_init() {
  L.mapbox.accessToken = "pk.eyJ1IjoiemxzYSIsImEiOiJuOGtheTRvIn0.nARpggDJzduPw-dkchKRpQ";
  
  prop.map = new LeafletMap("map-container");
}
