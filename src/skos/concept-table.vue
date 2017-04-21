<template>
<div v-if="filtered['prefLabel']">
  <h2 class="ui header">{{filtered['prefLabel'] | @value}}</h2>
  <table class="ui definition table">
    <tbody>
    <tr v-for="(val, key) in filtered">
      <td>{{key}}</td>
      <td v-if="key !== 'inScheme' && key !== 'topConceptOf'">
        <rdf-item v-if="val.length === 1" :label="key" :val="val[0]"></rdf-item>
        <rdf-item v-else :label="key" :val="val"></rdf-item>
      </td>
      <td v-else>
        <a is="skos-concept-scheme-filter-link" :self="val[0]"></a>
      </td>
    </tr>
    </tbody>
  </table>
</div>
</template>

<script>
export default {
  // TODO: provide `resource` based loading
  // TODO: share a Concept VM with...the other one
  props: ['self'],
  computed: {
    filtered() {
      let filtered = this.self;
      delete filtered['@id'];
      delete filtered['@type'];
      return filtered;
    }
  }
}
</script>
