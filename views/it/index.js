// import the template, and transform it into a dom element
require('./style.less')
var actions = require('store/actions')

require('components/app-step-chart')


if (window.location.hostname === 'localhost') {
  $(document.body).css('overflow', 'scroll')
  $('html').css('overflow', 'scroll')
}



var cloudControlActions = require('components/app-cloud-controls/actions')

module.exports = $(require('./template.html'))
Dispatcher.subscribe(function(action, data) {
    switch (action) {

        case cloudControlActions.OPEN_SENSOR_NET:
            $('x-app-sensor-net').toggle()
            var isDark = $('body').hasClass('dark-bg')
            if (isDark) {
                $('body').removeClass('dark-bg')
                $('.left-nav').removeClass('opacity-15')
                $('.core-charts').removeClass('opacity-15')
                $('.right-kpi').removeClass('opacity-15')
                $('#powerSensorNetBtn').removeClass('opacity-15')
            } else {
                $('body').addClass('dark-bg')
                $('.left-nav').addClass('opacity-15')
                $('.core-charts').addClass('opacity-15')
                $('.right-kpi').addClass('opacity-15')
                $('#powerSensorNetBtn').addClass('opacity-15')
            }
            break
    }
})