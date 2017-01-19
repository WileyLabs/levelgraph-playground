var CodeMirror = require('codemirror');
// modes
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/turtle/turtle');
// linters
require('codemirror/addon/lint/lint');
require('codemirror/addon/lint/json-lint');

const default_options = {
  lineNumbers: true,
  gutters: ["CodeMirror-lint-markers"],
  lint: true
};

module.exports = {
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
        return default_options;
      }
    }
  },
  created: function() {
    // make internal state match passed in `code` value
    this.value = this.code;
    // merge in default options
    for (var attrname in default_options) {
      if (!(attrname in this.options)) {
        this.options[attrname] = default_options[attrname];
      }
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
}
