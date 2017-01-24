var CodeMirror = require('codemirror');
// modes
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/turtle/turtle');
// linters
require('codemirror/addon/lint/lint');
require('codemirror/addon/lint/json-lint');

// custom json-ld hinter
require('codemirror/addon/hint/show-hint');

// TODO: move this into a CodeMirror addon
function suggest(cm, pred) {
  var terms = [
    '@base',
    '@container', '@context',
    '@graph',
    '@id',
    '@language', '@list',
    '@reverse',
    '@set',
    '@type',
    '@vocab'
  ];
  if (!pred || pred()) setTimeout(function() {
    if (!cm.state.completionActive) {
      cm.showHint({
        hint: function (cm, options) {
          var cur = cm.getCursor(),
              token = cm.getTokenAt(cur);
          var start = token.start - 1,
              end = token.end;
          var list = terms;
          if (token.type === 'property') {
            let search = token.string.match(/\w/);
            if (search !== null) {
              list = terms.filter(function(t) {
                if (t.indexOf(search) > -1) {
                  return t;
                }
              });
            }
            return {
                list: list, //value[i].listCallback(),
                from: CodeMirror.Pos(cur.line, start+2),
                to: CodeMirror.Pos(cur.line, end-1)
            };
          }
        }
      });
    }
  }, 100);
  return CodeMirror.Pass;
}

const default_options = {
  lineNumbers: true,
  gutters: ["CodeMirror-lint-markers"],
  lint: true,
  extraKeys: {
    "'@'": suggest,
    "Ctrl-Space": suggest
  }
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
