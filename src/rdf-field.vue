<template>
  <div class="eight wide field" v-if="label !== '@id' && label !== '@type'">
    <label>{{label}}</label>
    <div v-if="typeof val === 'string'" class="ui input">
      <input :value="val">
    </div>
    <div v-else-if="val['@language'] && val['@value']" class="ui labeled input">
      <div class="ui label">{{val['@language']}}</div>
      <input :value="val['@value']">
    </div>
    <div v-else-if="val['@type'] === 'xsd:anyURI' && '@value' in val">
      <a :href="val['@value']" target="_blank">{{val['@value']}}</a>
    </div>
    <div v-else-if="'@id' in val">
      <a :href="val['@id'] | expanded_name" target="_blank">{{val['@id']}}
        <i class="external icon"></i>
      </a>
    </div>
  </div>
</template>

<script>
const N3Util = require('n3').Util;

export default {
  props: ['label', 'val'],
  filters: {
    expanded_name(v) {
      return N3Util.expandPrefixedName(v, context['@context']);
    }
  }
}
</script>
