<template>
  <a :href="self['@id']" @click.prevent="selected()">
    {{self['@id'] | curie}}
    <i class="filter icon"></i>
  </a>
</template>

<script>
// use VueX to set the current_scheme to the clicked scheme

export default {
  props: ['self'],
  methods: {
    selected() {
      this.$store.commit('setActiveScheme', {
        scheme: this.self['@id']
      });
    }
  }
}
</script>
