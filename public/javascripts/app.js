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
          NoteModel = require('models/noteModel'),
          HeaderView = require('views/headerView'),
          MonthView = require('views/monthView'),
          NoteFormView = require('views/formView');

      app.router = new NoteRouter();
      app.notes = new NoteCollection({});
      app.appModel = new NoteAppModel();
      app.headerView = new HeaderView({ model : app.appModel });
      app.monthView = new MonthView({ model : app.appModel, collection: app.notes, attributes: {
          'formConst': NoteFormView,
          'modelConst': NoteModel
      }});

      app.appModel.on('change', function() {
          var m = app.appModel.get('month'),
              y = app.appModel.get('year');
          this.render(app.appModel);
          app.router.navigate('calendar/'+m+'-'+y);
      }, app.monthView);

      app.router.on('route:calendar', function(month, year) {
          var now = new Date(),
              day = now.getDate();

          month = parseInt(month) || now.getMonth() + 1;
          year = parseInt(year) || now.getYear() + 1900;

          app.appModel.set({
              'month' : month,
              'year' : year
          });
      });

      app.router.on('route:note', function(){
          console.log('Show form');
      });
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
var application = require('application');

module.exports = Backbone.Router.extend({
    routes: {
        '' : 'calendar',
        'calendar()/' : 'calendar',
        'calendar/:month-:year' : 'calendar',
        'calendar/note' : 'note'
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

require.register("views/formView", function(exports, require, module) {
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
});

require.register("views/headerView", function(exports, require, module) {
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

});

require.register("views/monthView", function(exports, require, module) {
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
});

require.register("views/templates/form", function(exports, require, module) {
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<form>\n    <h2>Дата: ";
  foundHelper = helpers.date;
  stack1 = foundHelper || depth0.date;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "date", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h2>\n    <div>\n        <label for=\"title\">День под девизом</label>\n        <input type=\"text\" name=\"title\" value=\"";
  foundHelper = helpers.title;
  stack1 = foundHelper || depth0.title;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">\n    </div>\n    <div>\n        <label for=\"text\">Заметки</label>\n        <textarea name=\"text\" id=\"\" cols=\"30\" rows=\"10\">";
  foundHelper = helpers.text;
  stack1 = foundHelper || depth0.text;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "text", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</textarea>\n    </div>\n    <a data-click=\"save\">Сохранить</a>\n    <a data-click=\"cancel\">Отмена</a>\n</form>";
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
  tmp1.inverse = self.program(7, program7, data);
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  foundHelper = helpers.endWeek;
  stack1 = foundHelper || depth0.endWeek;
  stack2 = helpers['if'];
  tmp1 = self.program(9, program9, data);
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
  buffer += escapeExpression(stack1) + "\" class=\"day ";
  foundHelper = helpers.weekend;
  stack1 = foundHelper || depth0.weekend;
  stack2 = helpers['if'];
  tmp1 = self.program(5, program5, data);
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
  
  
  return "day--weekend";}

function program7(depth0,data) {
  
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

function program9(depth0,data) {
  
  
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