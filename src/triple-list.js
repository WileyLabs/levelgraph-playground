module.exports = {
  props: ['subject', 'predicate', 'object', 'typeof'],
  data() {
    return {
      triples: [
        {
          subject: '',
          predicate: '',
          object: ''
        }
      ]
    };
  },
  created() {
    this.runFilter();
  },
  watch: {
    subject: 'runFilter',
    predicate: 'runFilter',
    object: 'runFilter'
  },
  methods: {
    runFilter() {
      var self = this;
      var filter = {};
      // TODO: move to computed property
      if (this.subject) filter.subject = this.subject;
      if (this.typeof) {
        filter.predicate = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
        filter.object = this.typeof
      } else {
        if (this.predicate) filter.predicate = this.predicate;
        if (this.object) filter.object = this.object;
      }
      // avoid returning the full database
      if (Object.keys(filter).length > 0) {
        // TODO: fix the `db` global assumption
        self.triples = [];
        db.get(filter, function(err, rv) {
          self.triples = rv;
        });
      }
    }
  }
};
