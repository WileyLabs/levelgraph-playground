var Vue = require('vue');

var CodeMirror = require('codemirror');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/turtle/turtle');

Vue.component('code-mirror', {
  template: '<textarea></textarea>',
  data: function() {
    return {
      value: ''
    };
  },
  props: {
    code: String,
    options: {
      type: Object,
      default: function() {
        return {
          lineNumbers: true
        };
      }
    }
  },
  created: function() {
    // make internal state match passed in `code` value
    this.value = this.code;
    // merge in default options
    // TODO: find a way to get at the defaults defined above
    if (!('lineNumbers' in this.options)) {
      this.options.lineNumbers = true;
    }
  },
  mounted: function() {
    var self = this;
    this.editor = CodeMirror.fromTextArea(this.$el, this.options);
    this.editor.setValue(this.value);
    this.editor.on('change', function(cm) {
      self.value = cm.getValue();
    });
  },
  destroyed: function() {
    this.editor.toTextArea();
  },
  methods: {
    refresh: function() {
      this.editor.refresh();
    }
  }
});
