var app = require('application');

module.exports = Backbone.Router.extend({
    routes: {
        '' : 'calendar',
        'calendar(/)' : 'calendar',
        'calendar/:month-:year(/)' : 'calendar',
        'calendar/note/:day-:month-:year(/)' : 'note'
    },

    'calendar': function(month, year) {
        var now = new Date(),
            day = now.getDate();

        month = parseInt(month) || now.getMonth() + 1;
        year = parseInt(year) || now.getYear() + 1900;

        app.appModel.set({
            'month' : month,
            'year' : year
        });
    },

    'note': function(day, month, year) {
        console.log(day, month, year);
    }
});
