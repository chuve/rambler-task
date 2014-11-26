/**
 * Created by Evgeny Chuvelev on 26/11/14.
 */

module.exports = Backbone.View.extend({
    el: $('[data-view="header-view"]'),

    initialize: function(){
        this.model.on('change:year', this.updateYear, this);
        this.model.on('change:month', this.updateMonth, this);
    },

    events: {
        'click [data-click="prev-month"]' : 'prevMonth',
        'click [data-click="next-month"]' : 'nextMonth'
    },

    prevMonth: function() {
        this.model.setPrevMonth();
    },

    nextMonth: function() {
        this.model.setNextMonth();
    },

    updateYear: function() {
        var $yearPlacement = this.$el.find('[data-bind="state-year"]');
        $yearPlacement.html(this.model.get('year'));
    },

    updateMonth: function() {
        var $monthPlacement = this.$el.find('[data-bind="state-month"]');
        $monthPlacement.html(this.model.getMonthName());
    }
});
