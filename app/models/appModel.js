/**
 * Created by Evgeny Chuvelev on 26/11/14.
 */
var monthsDictionary = require('/lib/dictionary');

module.exports = Backbone.Model.extend({
    defaults: {
        'month': 11,
        'year': 2014
    },

    isLeapYear: function() {
        var year = this.get('year');
        if ( ( (year % 400) === 0 ) || ( ( year % 4 === 0 ) && ( year % 100 !== 0) ) ) {
            return true;
        }

        return false;
    },

    getMonthName: function () {
        return monthsDictionary[this.get('month')].name;
    },

    getMonthLength: function () {
        var month = parseInt(this.get('month'));

        if( month === 2 && this.isLeapYear() ) {
            return monthsDictionary[month].length + 1;
        }

        return monthsDictionary[month].length;
    },

    getPrevMonthLength: function (){
        var currentMonth = parseInt(this.get('month')),
            currentYear = parseInt(this.get('year'));

        if ( currentMonth > 1 ) {
            return monthsDictionary[currentMonth - 1].length;
        }

        return monthsDictionary[1].length;
    },

    getFisrtWeekDay: function() {
        var day = 1,
            month = this.get('month'),
            year = this.get('year');

        var a = parseInt( (14 - month) / 12 ),
            y = year - a,
            m = month + 12 * a - 2,
            weekday = ( 7000 + parseInt( day + y + parseInt( y / 4 ) - parseInt( y / 100 ) + parseInt( y / 400 ) + ( 31 * m ) / 12 ) ) % 7;

        return weekday; // 0 - воскресенеье, 1 - понедельник
    },

    getNextMonth: function() {
        var currentMonth = parseInt(this.get('month')),
            currentYear = parseInt(this.get('year'));

        if ( currentMonth < 12 ) {
            return {
                'month' :  currentMonth + 1,
                'year' : currentYear
            };
        }

        return {
            'month' :  1,
            'year' : currentYear + 1
        };
    },

    getPrevMonth: function() {
        var currentMonth = parseInt(this.get('month')),
            currentYear = parseInt(this.get('year'));

        if ( currentMonth > 1 ) {
            return {
                'month' :  currentMonth - 1,
                'year' : currentYear
            };
        }

        return {
            'month' :  12,
            'year' : currentYear - 1
        };
    },

    setNextMonth: function() {
        var nextMonth = this.getNextMonth();
        this.set('month', nextMonth.month);
        this.set('year', nextMonth.year);
    },

    setPrevMonth: function() {
        var prevMonth = this.getPrevMonth();
        this.set('month', prevMonth.month);
        this.set('year', prevMonth.year);
    }
});