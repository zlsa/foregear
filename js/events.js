
var Events = Class.extend({
  init: function() {
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

});
