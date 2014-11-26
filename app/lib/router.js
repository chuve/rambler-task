var application = require('application');

module.exports = Backbone.Router.extend({
    routes: {
        '' : 'calendar',
        'calendar()/' : 'calendar',
        'calendar/:month-:year' : 'calendar',
        'calendar/note' : 'note'
    }
});
