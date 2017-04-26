const VueX = require('vuex');
const Vue = require('vue');
Vue.use(VueX);

const VueLevelGraph = require('./src/vue-levelgraph.js');
// TODO: fix the typo in the db name...requires migration T_T
Vue.use(VueLevelGraph, {name: 'levelgraph-playgrond'});

const N3 = require('n3');
const term = require('./utils.js').term;

// Use futuristic Fetch() API
require('es6-promise').polyfill();
require('isomorphic-fetch');

let context = {
  "@context": {
    "dct": "http://purl.org/dc/terms/",
    "owl": "http://www.w3.org/2002/07/owl#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "xml": "http://www.w3.org/XML/1998/namespace",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "mesh": "https://www.nlm.nih.gov/mesh/#",
    "prov": "http://www.w3.org/ns/prov#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "skos": "http://www.w3.org/2004/02/skos/core#",
    "wbas": "https://ontology.wiley.com/Base#",
    "wdat": "https://data.wiley.com/",
    "wpub": "https://vocabulary.wiley.com/PublicationType/",
    "fabio": "http://purl.org/spar/fabio/",
    "@base": "https://vocabulary.wiley.com/PublicationType/",
    "@language": "en"
  }
};
window.context = context;

const VueJSONLD = {
  install(Vue, options) {
    Vue.prototype['@context'] = context['@context'];
  }
};
Vue.use(VueJSONLD);

var invert = function (obj) {
  var new_obj = {};
  for (var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      new_obj[obj[prop]] = prop;
    }
  }
  return new_obj;
};

window.context_flipped = (function() {
  let temp = context['@context'];
  delete temp['@base']; // temp's a duplicate for us...
  return invert(temp);
})();

var default_jsonld = JSON.stringify({
  "@context": {
    "@vocab": "http://xmlns.com/foaf/0.1/",
  },
  "@id": "http://bigbluehat.com/#",
  "name": "BigBlueHat",
  "knows": [
    {
      "@id": "http://manu.sporny.org#person",
      "name": "Manu Sporny",
      "homepage": "http://manu.sporny.org/"
    }
  ]
}, null, 2);

var default_n3 = '@prefix foaf: <http://xmlns.com/foaf/0.1/>.\n\n'
+ '<http://bigbluehat.com/#>\n'
+ '  foaf:name "BigBlueHat" ;\n'
+ '  foaf:workHomepage "http://wiley.com/" ;\n'
+ '  foaf:knows <https://www.w3.org/People/Berners-Lee/card#i>.'

Vue.component('code-mirror', require('./src/code-mirror'));

Vue.component('package-json', require('./src/package-json.vue'));

const store = new VueX.Store({
  state: {
    current_scheme: '',
    current_concept: {}
  },
  mutations: {
    setActiveScheme(state, payload) {
      state.current_scheme = uncurie(payload.scheme);
    },
    setActiveConcept(state, payload) {
      state.current_concept = uncurie(payload.concept);
    }
  },
  actions: {
    setActiveScheme({ commit }, payload) {
      console.log('dispatching');
      commit('setActiveConcept', {concept: {}});
      commit('setActiveScheme', payload);
    }
  }
});

Vue.component('skos-viewer', require('./src/skos/viewer.vue'));
Vue.component('triple-list', require('./src/skos/triple-list.js'));
Vue.component('rdf-item', require('./src/skos/rdf-item.vue'));
Vue.component('skos-concept-scheme', require('./src/skos/concept-scheme.vue'));
Vue.component('skos-concept-scheme-filter-link', require('./src/skos/concept-scheme-filter-link.vue'));
Vue.component('skos-concept', require('./src/skos/concept.vue'));
Vue.component('skos-concept-table', require('./src/skos/concept-table.vue'));

function removeEmpties(spo) {
  // TODO: certainly  there's a better way to "clean" this object...later...maybe
  if (spo.subject === '') delete spo.subject;
  if (spo.predicate === '') delete spo.predicate;
  if (spo.object === '') delete spo.object;
  return spo;
}

window.curie = function(v) {
  let finds = Object.keys(context_flipped).filter((iri) => {
    return v.match(iri);
  });
  return context_flipped[finds[0]] + ':' + v.replace(finds[0], '');
};

window.uncurie = function(v) {
  return N3.Util.expandPrefixedName(v, context['@context']);
};

Vue.filter('curie', curie);
Vue.filter('uncurie', uncurie);
Vue.filter('@value', (v, lang) => {
  if (Array.isArray(v) && v.length === 1) {
    // TODO: ...yeah...there's more stuff to happen here...
    if (v[0]['@language'] === lang) {
      return v[0]['@value'];
    } else {
      // TODO: should this fall back to an unknown lang?
      return v[0]['@value'];
    }
  }
});

window.app = new Vue({
  el: '#app',
  store,
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
      self.$db.get(spo, function(err, list) {
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
        self.$db.get({}, function(err, list) {
          if (err) console.error(err);
          self.$db.del(list, function(err) {
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
        self.$db.put(self.filter, function(err) {
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
      self.$db.del(spo, function(err) {
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
        self.$db.n3.get(filter, function(err, rv) {
          self.output_n3 = rv;
          // TODO: hackilicious...we should fix this...
          self.$refs['output-n3'].editor.setValue(self.output_n3);
          self.$refs['output-n3'].refresh();
        });
      } else {
        self.$db.get(filter, function(err, rv) {
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
