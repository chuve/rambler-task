/**
 * Created by Evgeny Chuvelev on 26/11/14.
 */
var application = require('/application');
var template = require('./templates/month');

module.exports = Backbone.View.extend({
    el: $('[data-bind="date-of-the-month"]'),

    template: template,

    events: {
        'click td': 'displayNote'
    },

    imposeNote: function($el) {
        $el.addClass('day--planned');
    },

    imposeNotes: function(){
        var notes = application.notes.toJSON(),
            $dates = this.$el.find('[data-date]'),
            self = this;

        _.each(notes, function(note) {
            $dates.filter('[data-date="' + note.date + '"]').addClass('day--planned');
        });
    },

    displayNote: function(event) {

        console.log(application.notes);

        var $target = $(event.currentTarget),
            targetDate = $target.data('date'),
            targetNoteInCollection = application.notes.findWhere({ date : targetDate}),
            textNote;

        if ( targetNoteInCollection ) {
            textNote = prompt('Введите текст', targetNoteInCollection.get('text'));
            if (textNote && textNote.length) {
                targetNoteInCollection.set('text', textNote);
            }
            return;
        }

        textNote = prompt('Введите текст');
        if ( textNote && textNote.length ) {
            application.notes.add({
                'date' : targetDate,
                'text' : textNote
            });
            this.imposeNote($target);
        }

        return;
    },

    initialize: function() {
        this.render();
    },

    render: function() {
        var month = this.model.get('month'),
            year = this.model.get('year'),
            length = this.model.getMonthLength(),
            firstWeekDay = this.model.getFisrtWeekDay(),
            prevMonthLength = this.model.getPrevMonthLength(),
            self = this;

        function getMonthModel(month, year, length) {
            var days = {},
                counter = 0;

            // add prev month days
            if (firstWeekDay !== 1) {
                var prevMonthDays = (firstWeekDay !== 0) ? firstWeekDay - 1 : 6,
                    pMonth = self.model.getPrevMonth();
                p = prevMonthLength - prevMonthDays + 1;
                while (prevMonthDays) {
                    days[counter] = {
                        num : p,
                        date: p + '.' + pMonth.month + '.' + pMonth.year,
                        current : false
                    };
                    p++;
                    counter++;
                    --prevMonthDays;
                }
            }

            // add current month days
            for (var c = 1; c <= length; c++) {
                days[counter] = {
                    num : c,
                    date: c + '.' + month + '.' + year,
                    current : true
                };
                counter++;
            }

            // add next month days
            if (counter != 42) {
                var nMonthDays = 42 - counter,
                    nMonth = self.model.getNextMonth();
                n = 1;
                while (nMonthDays >= n) {
                    days[counter] = {
                        num : n,
                        date: n + '.' + nMonth.month + '.' + nMonth.year,
                        current : false
                    };
                    n++;
                    counter++;
                }
            }

            return days;
        }

        function setWeeks(days) {
            var startWeekKeys = [0, 7, 14, 21, 28 , 35],
                endWeekKeys = [6, 13, 20, 27, 34, 41],
                weekends = [5, 6, 12, 13, 19, 20, 26, 27, 33, 34, 40, 41];

            // Зарефакторить на 1 прогон по объекту (?)

            _.each(startWeekKeys, function(key){
                days[key].startWeek = true;
            });

            _.each(endWeekKeys, function(key){
                days[key].endWeek = true;
            });

            _.each(weekends, function(key){
                days[key].weekend = true;
            });

            return days;
        }


        var m = getMonthModel(month,year,length);
        m = setWeeks(m);

        this.$el.html(this.template(_.toArray(m)));
        this.imposeNotes();
    }
});