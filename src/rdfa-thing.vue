<template>
  <div v-if="getCompacted" :resource="compacted['@id']"
    :typeof="rdfa_typeof" :id="id" class="item">
    <h4 class="header">
      {{compacted['@id']}}
      <span class="ui label" v-for="type in compacted['@type']">
        {{type}}
      </span>
    </h4>
    <div class="ui form">
      <div class="inline fields" v-for="(val, key) in compacted">
        <div v-if="val['@language'] && val['@value']" class="eight wide field">
          <label>{{key}}</label>
          <div class="ui labeled input">
            <div class="ui label">{{val['@language']}}</div>
            <input :value="val['@value']">
          </div>
        </div>
        <div v-else-if="key !== '@type' && typeof val === 'object' && val.length > 0" class="eight wide field">
          <label>{{key}}</label>
          <div class="ui search selection dropdown multiple">
            <span v-for="v in val" class="ui label">{{v}}</span>
          </div>
        </div>
        <div v-else-if="val['@type'] === 'xsd:anyURI' && '@value' in val" class="eight wide field">
          <label>{{key}}</label>
          <a :href="val['@value']" target="_blank">{{val['@value']}}</a>
        </div>
        <div v-else-if="key !== '@id' && key !== '@type'" class="eight wide field">
          <label>{{key}}</label>
          <input :value="val">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const N3Util = require('n3').Util;

const context = {
  "@context": {
    "cat": "http://www.w3.org/ns/dcat#",
    "qb": "http://purl.org/linked-data/cube#",
    "grddl": "http://www.w3.org/2003/g/data-view#",
    "ma": "http://www.w3.org/ns/ma-ont#",
    "owl": "http://www.w3.org/2002/07/owl#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfa": "http://www.w3.org/ns/rdfa#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "rif": "http://www.w3.org/2007/rif#",
    "rr": "http://www.w3.org/ns/r2rml#",
    "skos": "http://www.w3.org/2004/02/skos/core#",
    "skosxl": "http://www.w3.org/2008/05/skos-xl#",
    "wdr": "http://www.w3.org/2007/05/powder#",
    "void": "http://rdfs.org/ns/void#",
    "wdrs": "http://www.w3.org/2007/05/powder-s#",
    "xhv": "http://www.w3.org/1999/xhtml/vocab#",
    "xml": "http://www.w3.org/XML/1998/namespace",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "prov": "http://www.w3.org/ns/prov#",
    "sd": "http://www.w3.org/ns/sparql-service-description#",
    "org": "http://www.w3.org/ns/org#",
    "gldp": "http://www.w3.org/ns/people#",
    "cnt": "http://www.w3.org/2008/content#",
    "dcat": "http://www.w3.org/ns/dcat#",
    "earl": "http://www.w3.org/ns/earl#",
    "ht": "http://www.w3.org/2006/http#",
    "ptr": "http://www.w3.org/2009/pointers#",
    "cc": "http://creativecommons.org/ns#",
    "ctag": "http://commontag.org/ns#",
    "dc": "http://purl.org/dc/terms/",
    "dc11": "http://purl.org/dc/elements/1.1/",
    "dcterms": "http://purl.org/dc/terms/",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "gr": "http://purl.org/goodrelations/v1#",
    "ical": "http://www.w3.org/2002/12/cal/icaltzd#",
    "og": "http://ogp.me/ns#",
    "rev": "http://purl.org/stuff/rev#",
    "sioc": "http://rdfs.org/sioc/ns#",
    "v": "http://rdf.data-vocabulary.org/#",
    "vcard": "http://www.w3.org/2006/vcard/ns#",
    "schema": "http://schema.org/",
    "describedby": "http://www.w3.org/2007/05/powder-s#describedby",
    "license": "http://www.w3.org/1999/xhtml/vocab#license",
    "role": "http://www.w3.org/1999/xhtml/vocab#role"
  }
}

export default {
  props: ['resource', 'typeof'],
  data: function() {
    return {
      id: '',
      compacted: {},
      triples: [
        {
          subject: '',
          predicate: '',
          object: ''
        }
      ]
    };
  },
  computed: {
    rdfa_typeof: function() {
      if ('@type' in this.compacted) {
        if (typeof this.compacted['@type'] === 'object'
            && this.compacted['@type'].length > 0) {
          return this.compacted['@type'].join(' ');
        } else {
          return this.compacted['@type'];
        }
      }
    },
    getCompacted: function() {
      var self = this;
      if (this.resource) {
        // TODO: fix global assumptions
        self.$db.jsonld.get(this.resource, context, function(err, rv) {
          var compacted = rv;
          // don't need to see this over and over
          delete compacted['@context'];
          // TODO: don't skip @graph
          delete compacted['@graph'];
          self.compacted = compacted;
        });
      }
      // TODO: this whole thing is a hacky mess...
      return true;
    }
  },
  created: function() {
    var self = this;
    if (this.resource) {
      // give this Thing a unqiue DOM id
      self.id = btoa(this.resource);
    }
    var filter = {};
    // TODO: move to computed property
    if (this.resource) filter.subject = this.resource;
    if (this.typeof) {
      filter.predicate = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
      filter.object = this.typeof
    }
    // avoid returning the full database
    if (Object.keys(filter).length > 0) {
      // TODO: fix global assumptions
      self.$db.get(filter, function(err, rv) {
        self.triples = rv;
      });
    }
  }
};
</script>
