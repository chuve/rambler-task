/**
 * Created by Evgeny Chuvelev on 26/11/14.
 */

var app = require('/application');
var template = require('./templates/form');
var NoteModel = require('/models/noteModel');

module.exports = Backbone.View.extend({
    el: $('[data-view="form-view"]'),

    template: template,

    events: {
        'click a[data-click="save"]': 'saveNote',
        'click a[data-click="remove"]': 'removeNote',
        'click a[data-click="cancel"]': 'closeNote'
    },

    hide: function() {
        this.$el.removeClass('notes__form--show');
        app.headerView.showControls();
    },

    show: function() {
        this.$el.addClass('notes__form--show');
        app.headerView.hideControls();
    },

    closeNote: function() {
        this.hide();
        app.monthView.show();
    },

    imposeNote: function($el) {
        $el.addClass('day--planned');
    },

    unImposeNote: function($el) {
        $el.removeClass('day--planned');
    },

    removeNote: function() {
        var note = this.model.get('model'),
            $target = this.model.get('$target');

        app.notes.remove(note);
        this.unImposeNote($target);
        this.closeNote();
    },

    saveNote: function(event) {
        var data = this.$el.find('form').serializeArray(),
            note = this.model.get('model'),
            $target = this.model.get('$target');

        if ( note ) {
            var emptyInputs = 0;
            for( var i = 0; i < data.length; i++ ) {
                note.set(data[i].name, data[i].value);

                if( data[i].value === '') {
                    emptyInputs++;
                }
            }
        } else {
            var newNote = new NoteModel({
                'date' : this.model.get('date')
            });
            for ( var i = 0; i < data.length; i++ ) {
                newNote.set(data[i].name, data[i].value);
            }
            app.notes.add(newNote);
            this.imposeNote($target);
        }

        this.closeNote();
    },

    initialize: function() {
        this.render();
        this.model.on('change', this.render, this);
    },

    render: function() {
        console.log(app.notes);
        this.$el.html(this.template(this.model.toJSON()));
    }
});