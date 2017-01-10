var Vue = require('vue');

var levelgraph = require('levelgraph');
var leveljs = require('level-js');
var levelup = require('levelup');
var levelgraphJSONLD = require('levelgraph-jsonld');

var factory = function (location) { return new leveljs(location) };

var db = levelgraphJSONLD(
  levelgraph(
    levelup('levelgraph-playgrond', {db: factory})
  )
);
window.db = db;

var default_doc = {
  "@context": {
    "name": "http://xmlns.com/foaf/0.1/name",
    "homepage": {
      "@id": "http://xmlns.com/foaf/0.1/homepage",
      "@type": "@id"
    }
  },
  "@id": "http://manu.sporny.org#person",
  "name": "Manu Sporny",
  "homepage": "http://manu.sporny.org/"
};

var app = new Vue({
  el: '#app',
  data: {
    input: default_doc,
    table: [],
    filter_by: {
      subject: '',
      predicate: '',
      object: ''
    }
  },
  created: function() {
    this.displayTriples({});
  },
  methods: {
    displayTriples: function(spo) {
      var self = this;
      db.get(spo, function(err, list) {
        self.table = list;
      });
    },
    put: function() {
      var self = this;
      db.jsonld.put(this.input, function(err, obj) {
        // do something after the obj is inserted
        console.log(err, obj);
        self.displayTriples({});
      });
    },
    filter: function() {
      var spo = {
        subject: this.filter_by.subject.trim(),
        predicate: this.filter_by.predicate.trim(),
        // objects are stored in levelgraph (at least via the JSON-LD addon) as strings in quotes
        // TODO: turn into computed property
        object: '"' + this.filter_by.object.trim()
                  .replace(/^\"/, '').replace(/\"$/, '') + '"'
      };

      if (spo.subject === '') delete spo.subject;
      if (spo.predicate === '') delete spo.predicate;
      if (spo.object === '""') delete spo.object;

      this.displayTriples(spo);
    }
  }
});
