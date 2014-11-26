/**
 * Created by echuvelev on 26/11/14.
 */
var template = require('./templates/form');

module.exports = Backbone.View.extend({
    el: $('[data-view="form-view"]'),

    template: template,

    events: {
        'click a[data-click="save"]': 'saveNote',
        'click a[data-click="cancel"]': 'close'
    },

    imposeNote: function($el) {
        $el.addClass('day--planned');
    },

    saveNote: function() {
        var data = this.$el.find('form').serializeArray();

        for(var i = 0; i < data.length; i++ ) {
            this.model.set(data[i].name, data[i].value);
        }
        this.collection.add(this.model);
        this.imposeNote(this.attributes.$targetDay);
    },

    close: function() {

    },

    initialize: function() {
        this.render();
        console.log(this.collection);
    },

    render: function(){
        this.$el.html(this.template(this.model.toJSON()));
    }
});