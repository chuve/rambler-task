(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("application", function(exports, require, module) {
// Application bootstrapper.
Application = {
  initialize: function() {
      var app = this,
          NoteRouter = require('lib/router'),
          NoteCollection = require('models/noteCollection'),
          NoteAppModel = require('models/appModel'),
          NoteViewModel = require('models/noteViewModel'),
          HeaderView = require('views/headerView'),
          MonthView = require('views/monthView'),
          NoteView = require('views/formView');

      app.router = new NoteRouter();
      app.notes = new NoteCollection();
      app.appModel = new NoteAppModel();
      app.headerView = new HeaderView();
      app.monthView = new MonthView();
      app.noteViewModel = new NoteViewModel();
      app.noteView = new NoteView({ model: app.noteViewModel });

      app.appModel.on('change', function() {
          var m = app.appModel.get('month'),
              y = app.appModel.get('year');
          this.render(app.appModel);
          app.router.navigate('calendar/'+m+'-'+y);
      }, app.monthView);
  }
}

module.exports = Application;

});

require.register("initialize", function(exports, require, module) {
var application = require('application');

$(function() {
  application.initialize();
  Backbone.history.start();
});

});

require.register("lib/dictionary", function(exports, require, module) {
/**
 * Created by Evgeny Chuvelev on 26/11/14.
 */

module.exports = {
    1 : {
        name: 'Январь',
        length: 31
    },
    2 : {
        name: 'Февраль',
        length: 28
    },
    3 : {
        name: 'Март',
        length: 31
    },
    4 : {
        name: 'Апрель',
        length: 30
    },
    5 : {
        name: 'Май',
        length: 31
    },
    6 : {
        name: 'Июнь',
        length: 30
    },
    7 : {
        name: 'Июль',
        length: 31
    },
    8 : {
        name: 'Август',
        length: 31
    },
    9 : {
        name: 'Сентябрь',
        length: 30
    },
    10: {
        name: 'Октябрь',
        length: 31
    },
    11: {
        name: 'Ноябрь',
        length: 30
    },
    12: {
        name: 'Декабрь',
        length: 31
    }
};
});

require.register("lib/router", function(exports, require, module) {
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

});

require.register("lib/view_helper", function(exports, require, module) {

});

;require.register("models/appModel", function(exports, require, module) {
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
});

require.register("models/noteCollection", function(exports, require, module) {
/**
 * Created by Evgeny Chuvelev on 26/11/14.
 */

var NoteModel = require('./noteModel');

module.exports = Backbone.Collection.extend({
  model: NoteModel
});

});

require.register("models/noteModel", function(exports, require, module) {
/**
 * Created by Evgeny Chuvelev on 26/11/14.
 */

module.exports = Backbone.Model.extend({
    defaults: {
        'date': '',
        'title': '',
        'text': ''
    }
});

});

require.register("models/noteViewModel", function(exports, require, module) {
module.exports = Backbone.Model.extend({
    defaults: {
        'form_title' : '',
        'form_text'  : ''
    }
});
});

require.register("views/formView", function(exports, require, module) {
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
        'click a[data-click="cancel"]': 'closeNote',
        'swipeup': 'closeNote'
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
        this.$el.html(this.template(this.model.toJSON()));
    }
});
});

require.register("views/headerView", function(exports, require, module) {
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

});

require.register("views/monthView", function(exports, require, module) {
/**
 * Created by Evgeny Chuvelev on 26/11/14.
 */
var app = require('/application');
var template = require('./templates/month');

module.exports = Backbone.View.extend({
    el: $('[data-view="month-view"]'),

    template: template,

    events: {
        'click td': 'displayNote',
        'swiperight': 'prevMonth',
        'swipeleft': 'nextMonth'
    },

    prevMonth: function() {
        app.appModel.setPrevMonth();
    },

    nextMonth: function() {
        app.appModel.setNextMonth();
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
        var currentMonth = app.appModel.get('month'),
            currentYear = app.appModel.get('year'),
            length = app.appModel.getMonthLength(),
            firstWeekDay = app.appModel.getFisrtWeekDay(),
            prevMonthLength = app.appModel.getPrevMonthLength(),
            todayKey;

        function getMonthModel(month, year, length) {
            var days = {},
                counter = 0;

            // add prev month days
            if (firstWeekDay !== 1) {
                var prevMonthDays = (firstWeekDay !== 0) ? firstWeekDay - 1 : 6,
                    pMonth = app.appModel.getPrevMonth();
                p = prevMonthLength - prevMonthDays + 1;
                todayKey = prevMonthDays;
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

            var date = new Date();

            if (date.getMonth()+1 === currentMonth && date.getFullYear() === currentYear) {
                var today = todayKey + date.getDate() - 1;
                days[today].today = true;
            }

            return days;
        }

        var month = getMonthModel(currentMonth,currentYear,length);
        month = setWeeks(month);

        this.$el.find('[data-bind="date-of-the-month"]').html(this.template(_.toArray(month)));
        this.imposeNotes();
    }
});
});

require.register("views/templates/form", function(exports, require, module) {
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  return "\n            <a data-click=\"remove\">Удалить</a>\n        ";}

  buffer += "<form class=\"notes__form-wrapper\">\n    <div class=\"notes__form-date\">";
  foundHelper = helpers.date;
  stack1 = foundHelper || depth0.date;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "date", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</div>\n    <div class=\"notes__form-title\">\n        <label class=\"notes__form-label\" for=\"title\">День под девизом</label>\n        <input type=\"text\" name=\"title\" id=\"title\" class=\"notes__form-title__input\" value=\"";
  foundHelper = helpers.title;
  stack1 = foundHelper || depth0.title;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">\n    </div>\n    <div class=\"notes__form-text\">\n        <label class=\"notes__form-label\" for=\"text\">Заметка</label>\n        <textarea class=\"notes__form-text__textarea\" name=\"text\" id=\"\">";
  foundHelper = helpers.text;
  stack1 = foundHelper || depth0.text;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "text", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</textarea>\n    </div>\n    <div class=\"notes__buttons\">\n        <a data-click=\"save\">Сохранить</a>\n        <a data-click=\"cancel\">Отмена</a>\n        ";
  foundHelper = helpers.model;
  stack1 = foundHelper || depth0.model;
  stack2 = helpers['if'];
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </div>\n</form>";
  return buffer;});
});

require.register("views/templates/month", function(exports, require, module) {
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n    ";
  foundHelper = helpers.startWeek;
  stack1 = foundHelper || depth0.startWeek;
  stack2 = helpers['if'];
  tmp1 = self.program(2, program2, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  foundHelper = helpers.current;
  stack1 = foundHelper || depth0.current;
  stack2 = helpers['if'];
  tmp1 = self.program(4, program4, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(9, program9, data);
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  foundHelper = helpers.endWeek;
  stack1 = foundHelper || depth0.endWeek;
  stack2 = helpers['if'];
  tmp1 = self.program(11, program11, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;}
function program2(depth0,data) {
  
  
  return "<tr>";}

function program4(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n            <td data-date=\"";
  foundHelper = helpers.date;
  stack1 = foundHelper || depth0.date;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "date", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" class=\"day";
  foundHelper = helpers.today;
  stack1 = foundHelper || depth0.today;
  stack2 = helpers['if'];
  tmp1 = self.program(5, program5, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  foundHelper = helpers.weekend;
  stack1 = foundHelper || depth0.weekend;
  stack2 = helpers['if'];
  tmp1 = self.program(7, program7, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"><span class=\"day__num\">";
  foundHelper = helpers.num;
  stack1 = foundHelper || depth0.num;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "num", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</span></td>\n    ";
  return buffer;}
function program5(depth0,data) {
  
  
  return " day--today";}

function program7(depth0,data) {
  
  
  return " day--weekend";}

function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <td data-date=\"";
  foundHelper = helpers.date;
  stack1 = foundHelper || depth0.date;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "date", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" class=\"day day--non-current\"><span class=\"day__num\">";
  foundHelper = helpers.num;
  stack1 = foundHelper || depth0.num;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "num", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</span></td>\n    ";
  return buffer;}

function program11(depth0,data) {
  
  
  return "</tr>";}

  stack1 = depth0;
  stack2 = helpers.each;
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }});
});


//# sourceMappingURL=app.js.map