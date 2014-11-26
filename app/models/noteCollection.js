/**
 * Created by Evgeny Chuvelev on 26/11/14.
 */

var NoteModel = require('./noteModel');

module.exports = Backbone.Collection.extend({
  model: NoteModel
});
