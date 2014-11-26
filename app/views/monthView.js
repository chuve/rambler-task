/**
 * Created by Evgeny Chuvelev on 26/11/14.
 */
var app = require('/application');
var template = require('./templates/month');

module.exports = Backbone.View.extend({
    el: $('[data-view="month-view"]'),

    template: template,

    events: {
        'click td': 'displayNote'
    },

    show: function() {
      this.$el.addClass('notes__body--show');
    },

    hide: function() {
        this.$el.removeClass('notes__body--show');
    },

    imposeNotes: function(){
        var notes = app.notes.toJSON(),
            $dates = this.$el.find('[data-date]');

        _.each(notes, function(note) {
            $dates.filter('[data-date="' + note.date + '"]').addClass('day--planned');
        });
    },

    displayNote: function(event) {
        var $target = $(event.currentTarget),
            targetDate = $target.data('date'),
            targetNoteInCollection = app.notes.findWhere({ date : targetDate});

        this.hide();
        app.noteView.show();

        app.noteViewModel.set({
            'date' : targetDate,
            '$target' : $target,
            'text' : '',
            'title' : '',
            'model' : ''
        });

        if (targetNoteInCollection) {
            app.noteViewModel.set({
                'title': targetNoteInCollection.get('title'),
                'text': targetNoteInCollection.get('text'),
                'model' : targetNoteInCollection
            });
        }
    },

    initialize: function() {
        this.render();
        this.show();
    },

    render: function() {
        var month = app.appModel.get('month'),
            year = app.appModel.get('year'),
            length = app.appModel.getMonthLength(),
            firstWeekDay = app.appModel.getFisrtWeekDay(),
            prevMonthLength = app.appModel.getPrevMonthLength();

        function getMonthModel(month, year, length) {
            var days = {},
                counter = 0;

            // add prev month days
            if (firstWeekDay !== 1) {
                var prevMonthDays = (firstWeekDay !== 0) ? firstWeekDay - 1 : 6,
                    pMonth = app.appModel.getPrevMonth();
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
                    nMonth = app.appModel.getNextMonth();
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


        var month = getMonthModel(month,year,length);
        month = setWeeks(month);

        this.$el.find('[data-bind="date-of-the-month"]').html(this.template(_.toArray(month)));
        this.imposeNotes();
    }
});