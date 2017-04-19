<template>
  <div class="ui simple right floated basic dropdown button">
    dependencies
    <i class="dropdown icon"></i>
    <div class="menu" style="left: auto; right: 0; width: 20em">
      <a class="link item" target="_blank"
        v-for="(value, key) in doc.dependencies"
        :href="'https://www.npmjs.com/package/' + key">
        <span class="description" v-if="value.length < 10">{{value}}</span>
        <span class="text">{{key}}</span>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      doc: {
        name: "",
        version: "",
        description: "",
        repository: "",
        dependencies: {},
        devDependencies: {},
        keywords: [],
        author: "",
        license: ""
        // TODO: add all the things...i guess...
      }
    }
  },
  created() {
    var self = this;
    // Fetch() package.json for displaying dependencies
    // returns a Promise
    fetch('package.json')
      .then(function(response) {
        if (response.status >= 400) {
            throw new Error("Bad response from server");
        }
        return response.json();
      })
      .then(function(pkg) {
        self.doc = pkg;
      });

  }
}
</script>
