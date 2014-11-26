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
