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
