<template>
<div class="ui two column grid">
  <div class="two wide column">
    <triple-list inline-template
      typeof="http://www.w3.org/2004/02/skos/core#ConceptScheme">
      <div class="ui vertical menu">
        <skos-concept-scheme
           v-for="triple in triples"
           v-if="triple.subject"
           :resource="triple.subject">
        </skos-concept-scheme>
      </div>
    </triple-list>
  </div>
  <div class="seven wide column">
    <triple-list inline-template ref="right"
      predicate="http://www.w3.org/2004/02/skos/core#inScheme"
      :object="current_scheme">
      <div>
        <h2 class="ui header">{{object | curie}}</h2>
        <div class="ui divided link items">
          <skos-concept v-for="t in triples" :resource="t.subject"></skos-concept>
        </div>
      </div>
    </triple-list>
  </div>
  <div class="seven wide column">
      <skos-concept-table :self="current_concept"></skos-concept-table>
  </div>
</div>
</template>

<script>
export default {
  created() {
    // set default scheme
    this.$store.dispatch('setActiveScheme', {
      scheme: 'wpub:AbstractScheme'
    });
  },
  computed: {
    current_scheme() {
      return this.$store.state.current_scheme;
    },
    current_concept() {
      return this.$store.state.current_concept;
    }
  }
}
</script>
