/**
 * Created by Flavor on 5/17/17.
 */
require('./style.less')
var actions = require('./actions')
var storeActions = require('store/actions')

tag('x-app-cloud-controls', {
    template: require('./template.html'),
    inserted: function() {
        var _self = this
        $('#cloudSensorNet', _self).on('click', function(e) {
            console.log('e', e)
            Dispatcher.dispatch(actions.OPEN_SENSOR_NET, _self)
        })

        // TODO: Tie in each pz and reader id

        $('#printButton', _self).on('click', function(e) {
            var currentPZ = Store.get('currentPZ')
            var currentReader = Store.get('currentReader')
            var print_url = window.app.config.print_url;
            var allZones = $('#allZones').hasClass('hidden')
            var singleZone = $('#singleZone').hasClass('hidden')
            var singleReader = $('#singleReader').hasClass('hidden')

            if (!allZones) {
                window.open(print_url.org)
            } else if (!singleZone) {
                window.open(print_url.pz.replace('{pz}', currentPZ.value))
            } else {
                window.open(print_url.reader.replace('{reader}', currentReader.value))
            }

            console.log('currentPZ', currentPZ)
            console.log('currentReader', currentReader)
        })
    }
})