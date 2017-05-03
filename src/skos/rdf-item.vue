<template>
  <div>
    <div v-if="val.length && typeof val !== 'string'">
      <skos-concept v-for="concept in val" :self="concept"></skos-concept>
    </div>
    <div v-else-if="Object.keys(val).length === 1 && val['@value']">
      {{val['@value']}}
    </div>
    <div v-else-if="val['@language'] && val['@value']">
      <div class="ui label">{{val['@language']}}</div>
      <span>{{val['@value']}}</span>
    </div>
    <div v-else-if="(val['@type'] === 'xsd:anyURI' || val['@type'] === 'http://www.w3.org/2001/XMLSchema#anyURI') && '@value' in val">
      <a :href="val['@value']" target="_blank">{{val['@value']}}</a>
    </div>
    <div v-else-if="val['@id']">
      <a :href="val['@id'] | uncurie" target="_blank">{{val['@id'] | curie}}
        <i class="external icon"></i>
      </a>
    </div>
    <div v-else>{{val}}</div>
  </div>
</template>

<script>
export default {
  props: ['label', 'val']
}
</script>
