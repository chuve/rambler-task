/**
 * Created by Evgeny Chuvelev on 26/11/14.
 */
var app = require('application');

module.exports = Backbone.View.extend({
    el: $('[data-view="header-view"]'),

    initialize: function(){
        app.appModel.on('change:year', this.updateYear, this);
        app.appModel.on('change:month', this.updateMonth, this);
    },

    events: {
        'click [data-click="prev-month"]' : 'prevMonth',
        'click [data-click="next-month"]' : 'nextMonth'
    },

    hideControls: function() {
      var $controls = $('[data-click]');
      $controls.addClass('notes__header-trigger--hide');
    },

    showControls: function() {
        var $controls = $('[data-click]');
        $controls.removeClass('notes__header-trigger--hide');
    },

    prevMonth: function() {
        app.appModel.setPrevMonth();
    },

    nextMonth: function() {
        app.appModel.setNextMonth();
    },

    updateYear: function() {
        var $yearPlacement = this.$el.find('[data-bind="state-year"]');
        $yearPlacement.html(app.appModel.get('year'));
    },

    updateMonth: function() {
        var $monthPlacement = this.$el.find('[data-bind="state-month"]');
        $monthPlacement.html(app.appModel.getMonthName());
    }
});
