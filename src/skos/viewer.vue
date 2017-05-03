<template>
<div class="ui grid">
  <div class="three wide column">
    <div class="ui fluid vertical menu">
      <skos-concept-scheme
         v-for="triple in schemes"
         v-if="triple.subject"
         :resource="triple.subject">
      </skos-concept-scheme>
    </div>
  </div>
  <div class="six wide column">
    <h2 class="ui header">{{current_scheme | curie}}</h2>
    <div class="ui divided link items">
      <skos-concept v-for="t in concepts" :resource="t.subject" :key="t.subject"></skos-concept>
    </div>
  </div>
  <div class="seven wide column">
      <skos-concept-table :self="current_concept"></skos-concept-table>
  </div>
</div>
</template>

<script>
export default {
  data() {
    return {
      schemes: [],
      concepts: []
    }
  },
  watch: {
    current_scheme() {
      this.getConcepts();
    },
    schemes() {
      if (this.schemes.length > 0) {
        console.log(this.schemes[0].subject);
        // set default scheme to the first one found
        this.$store.dispatch('setActiveScheme', {
          // TODO: require curie from some place...unglobal...
          scheme: curie(this.schemes[0].subject)
        });
      }
    }
  },
  created() {
    this.getSchemes();
  },
  computed: {
    current_scheme() {
      return this.$store.state.current_scheme;
    },
    current_concept() {
      return this.$store.state.current_concept;
    }
  },
  methods: {
    getSchemes() {
      this.getInto('schemes', {
        predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        object: 'http://www.w3.org/2004/02/skos/core#ConceptScheme'
      });
    },
    getConcepts() {
      this.getInto('concepts', {
        predicate: 'http://www.w3.org/2004/02/skos/core#inScheme',
        object: this.current_scheme
      });
    }
  }
}
</script>
