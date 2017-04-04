var Vue = require('vue');

var levelgraph = require('levelgraph');
var leveljs = require('level-js');
var levelup = require('levelup');
var levelgraphJSONLD = require('levelgraph-jsonld');
var levelgraphN3 = require('levelgraph-n3');
window.N3 = N3 = require('n3');
window.term = term = require('./utils.js').term;

// Use futuristic Fetch() API
require('es6-promise').polyfill();
require('isomorphic-fetch');

var factory = function (location) { return new leveljs(location) };

var db = levelgraphN3(
  levelgraphJSONLD(
    levelgraph(
      levelup('levelgraph-playgrond', {db: factory})
    )
  )
);
window.db = db;

var default_jsonld = JSON.stringify({
  "@context": {
    "generatedAt": {
      "@id": "http://www.w3.org/ns/prov#generatedAtTime",
      "@type": "http://www.w3.org/2001/XMLSchema#date"
    },
    "Person": "http://xmlns.com/foaf/0.1/Person",
    "name": "http://xmlns.com/foaf/0.1/name",
    "knows": "http://xmlns.com/foaf/0.1/knows"
  },
  "@id": "http://example.org/graphs/73",
  "generatedAt": "2012-04-09",
  "@graph":
  [
    {
      "@id": "http://manu.sporny.org/about#manu",
      "@type": "Person",
      "name": "Manu Sporny",
      "knows": "http://greggkellogg.net/foaf#me"
    },
    {
      "@id": "http://greggkellogg.net/foaf#me",
      "@type": "Person",
      "name": "Gregg Kellogg",
      "knows": "http://manu.sporny.org/about#manu"
    }
  ]
}, null, 2);

var default_n3 = '@prefix foaf: <http://xmlns.com/foaf/0.1/>.\n\n'
+ '<http://bigbluehat.com/#>\n'
+ '  foaf:name "BigBlueHat" ;\n'
+ '  foaf:workHomepage "http://wiley.com/" ;\n'
+ '  foaf:knows <https://www.w3.org/People/Berners-Lee/card#i>.'

Vue.component('code-mirror', require('./code-mirror'));

Vue.component('package-json', require('./package-json.vue'));

function removeEmpties(spo) {
  // TODO: certainly  there's a better way to "clean" this object...later...maybe
  if (spo.subject === '') delete spo.subject;
  if (spo.predicate === '') delete spo.predicate;
  if (spo.object === '') delete spo.object;
  return spo;
}

window.app = new Vue({
  el: '#app',
  data: {
    input: {
      jsonld: default_jsonld,
      n3: default_n3
    },
    config: {
      jsonld: {
        base: '',
        overwrite: false
      },
      n3: {}
    },
    table: [],
    filter: {
      subject: '',
      predicate: '',
      object: ''
    },
    current_tab: 'json-ld',
    limit: 100,
    offset: 0,
    filtered: false,
    output_jsonld: '',
    output_n3: ''
  },
  watch: {
    current_tab: function(v) {
      var self = this;
      // DOM changing...wait for it...
      Vue.nextTick(function() {
        // TODO: ugh...context leakage...nasty stuff
        if (self.input_type) {
          self.$refs[self.input_type].refresh();
        }
      });
    }
  },
  computed: {
    actual_filter: function() {
      var object = this.filter.object.trim();
      if (object !== '' && !isNaN(object)) {
        // search for the RDF materialized integer
        object = '"' + String(object) + '"^^http://www.w3.org/2001/XMLSchema#integer';
      }
      var spo = {
        subject: this.filter.subject.trim(),
        predicate: this.filter.predicate.trim(),
        object: object
      };

      spo = removeEmpties(spo);

      return spo;
    },
    input_type: function() {
      // TODO: this is embarrasingly bad...
      if (this.current_tab === 'json-ld') {
        return 'jsonld';
      } else if (this.current_tab === 'n3') {
        return 'n3';
      } else if (this.current_tab === 'output-jsonld') {
        return 'output-jsonld';
      } else if (this.current_tab === 'output-n3') {
        return 'output-n3';
      } else {
        return false;
      }
    },
    actual_table: function() {
      return this.table.slice(this.offset, this.limit+this.offset);
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
      // TODO: refs are handy, but this feels "off"
      if (this.input_type === 'jsonld') {
      db[this.input_type].put(
        this.$refs[this.input_type].value,
        this.config[this.input_type],
        function(err, obj) {
          // do something after the obj is inserted
          self.displayTriples({});
        });
      } else {
        // ...the new .put() signatures no longer match between JSON-LD & N3 extensions
        // TODO: help make them match (again)
        db[this.input_type].put(
          this.$refs[this.input_type].value,
          function(err, obj) {
            // do something after the obj is inserted
            self.displayTriples({});
          });
      }
    },
    del: function() {
      var self = this;
      // TODO: this is JSON-LD only...time to move stuff around...
      db[this.input_type].del(
        this.$refs[this.input_type].value,
        this.config[this.input_type],
        function(err, obj) {
          // do something after the obj is inserted
          self.displayTriples({});
        });
    },
    empty: function() {
      var self = this;
      // this...is dangerous...unless demo
      if (confirm("Really? You're sure?")) {
        db.get({}, function(err, list) {
          if (err) console.error(err);
          db.del(list, function(err) {
            if (err) console.error(err);
            self.displayTriples({});
          });
        });
      }
    },
    applyFilter: function() {
      if (this.filter.subject === ''
        && this.filter.predicate === ''
        && this.filter.object === '') {
        this.filtered = false;
      } else {
        this.filtered = true;
      }
      this.displayTriples(this.actual_filter);
    },
    removeFilter: function(filter) {
      if (undefined === filter) {
        this.filter = {
          subject: '',
          predicate: '',
          object: ''
        };
      } else {
        this.filter[filter] = '';
      }
      this.applyFilter();
    },
    changeTab: function(tab) {
      this.current_tab = tab;
    },
    setFilter: function(spo) {
      // TODO: add some error handling and such
      this.filter.subject = spo.subject;
      this.filter.predicate = spo.predicate;
      this.filter.object = spo.object;
    },
    addSPO: function() {
      var self = this;
      if (self.filter.subject !== '' && self.filter.predicate !== '' && self.filter.object !== '') {
        db.put(self.filter, function(err) {
          if (err) {
            console.error(err);
          } else {
            self.table.unshift(self.filter);
            self.filter = {
              subject: '',
              predicate: '',
              object: ''
            };
            self.applyFilter();
          }
        });
      }
    },
    removeSPO: function(spo, idx) {
      var self = this;
      // remove it from the database
      db.del(spo, function(err) {
        if (err) {
          console.error(err);
        } else {
          // remove it from the page/app state
          self.table.splice(idx, 1);
        }
      });
      // TODO: switch to the changes feed once that's a thing
    },
    output: function(type) {
      var self = this;
      var filter = removeEmpties(JSON.parse(JSON.stringify(this.filter)));
      if (type === 'n3') {
        db.n3.get(filter, function(err, rv) {
          self.output_n3 = rv;
          // TODO: hackilicious...we should fix this...
          self.$refs['output-n3'].editor.setValue(self.output_n3);
          self.$refs['output-n3'].refresh();
        });
      } else {
        db.get(filter, function(err, rv) {
          if (err) throw err;
          var graphs = [];
          rv.forEach((triple) => {
            graphs.push({
              subject: term(triple.subject),
              predicate: term(triple.predicate),
              object: term(triple.object)
            });
          });
          jsonld.fromRDF({'@default': graphs}, function(err, rv) {
            self.output_jsonld = JSON.stringify(rv, null, '  ');
            // TODO: hackilicious...we should fix this...
            self.$refs['output-jsonld'].editor.setValue(self.output_jsonld);
            self.$refs['output-jsonld'].refresh();
          });
        });
      }
    }
  }
});
