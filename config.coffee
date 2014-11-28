exports.config =
  # See docs at http://brunch.readthedocs.org/en/latest/config.html.
  files:
    javascripts:
      defaultExtension: 'js'
      joinTo:
        'javascripts/app.js': /^app/
        'javascripts/vendor.js': /^(bower_components|vendor)/
        'test/javascripts/test.js': /^test(\/|\\)(?!vendor)/
      order:
        before: [
          'bower_components/jquery/dist/jquery.js',
          'vendor/scripts/jQuery-Touch-Events/jquery.mobile-events.min.js'
          'vendor/scripts/console-helper.js',
        ]

    stylesheets:
      defaultExtension: 'styl'
      joinTo: 'stylesheets/app.css'
      order:
        before: ['']

    templates:
      defaultExtension: 'hbs'
      joinTo: 'javascripts/app.js'
