<template>
<div class="item"
  :resource="compacted['@id']" :typeof="rdfa_typeof" :id="dom_id"
  @click="selected">

  <!--textarea v-model="compacted"></textarea-->

  <div class="content">
    <div class="header">{{compacted['prefLabel'] | @value}}</div>
    <!--div class="meta">{{compacted['@id']}}</div-->
    <div class="description">
      <p>{{compacted['definition'] | @value}}</p>
    </div>
</div>
</template>

<script>
const N3Util = require('n3').Util;

const context = {
  "@context": {
    "@vocab": "http://www.w3.org/2004/02/skos/core#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "owl": "http://www.w3.org/2002/07/owl#",
    "@language": "" // forces all strings into @value objects
  }
};

export default {
  props: ['resource', 'typeof', 'self'],
  data() {
    return {
      dom_id: '',
      compacted: {}
    };
  },
  computed: {
    rdfa_typeof() {
      if ('@type' in this.compacted) {
        if (typeof this.compacted['@type'] === 'object'
            && this.compacted['@type'].length > 0) {
          return this.compacted['@type'].join(' ');
        } else {
          return this.compacted['@type'];
        }
      }
    },
    filtered_compacted() {
      let filtered = this.compacted;
      delete filtered['@id'];
      delete filtered['@type'];
      return filtered;
    }
  },
  created() {
    var self = this;
    if (this.resource) {
      self.dom_id = btoa(this.resource);
      self.$db.jsonld.get(this.resource, context,
        {compactArrays: false, graph: true},
        function(err, rv) {
          let temp = rv;
          delete temp['@context'];
          // everything's tucked in an @graph because of ^^
          self.compacted = temp['@graph'][0];
          // TODO: not really sure what all this may effect...
        });
    }

    // allow for cascading elements by passing in full JSON-LD
    if (this.self) {
      self.compacted = this.self;
    }
  },
  methods: {
    selected() {
      this.$store.commit('setActiveConcept', {
        concept: this.compacted
      });
    }
  },
  filters: {
    as_fragment(v) {
      // TODO: fix `context` global leak
      return '#' + btoa(N3Util.expandPrefixedName(v, context['@context']));
    }
  }
};
</script>
