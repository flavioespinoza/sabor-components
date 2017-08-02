/**
 * Created by Flavor on 5/15/17.
 */
require('./style.less')
require('components/app-sensor-net-donut')
require('components/swim-events-chart')

tag('x-app-sensor-net', {
  template: require('./template.html'),
  inserted: function () {
    var _self = this
    var Host = Swim.downlink().host(window.app.config.endPoints.host)
    var sensorNets = []

        // 1. All Primary and Secondary Sensornerts with their PZs and queue lengths (top part of the view)
    Host.node('org/Orbcomm')
            .lane('sensornetPzs')
            .onEvent(function (msg) {
                // console.log('sensornetPzs', msg.body);

              var idx = _.findIndex(sensorNets, function (obj) {
                return obj.title === msg.body['@update'].key
              })

              if (idx < 0) {
                sensorNets.push({
                  title: msg.body['@update'].key,
                  count: msg.body.pzs.length,
                  subTitle: 'PZs',
                  info: msg.body
                })
              } else {
                sensorNets[idx] = {
                  title: msg.body['@update'].key,
                  count: msg.body.pzs.length,
                  subTitle: 'PZs',
                  info: msg.body
                }
              }

              _self.generateSensorNets(sensorNets)
            })
            .sync()
  },
  methods: {
    generateSensorNets: function (sensorNets) {
      var _self = this
      var template = _.template(require('./sensornet-card.html'))
      var primariesConnected = []
      var processZones = []
      var primariesProcessing = []
      var secondariesConnected = []
      var queLength = []
      var secondariesProcessing = []

      $('.sensor-net-cards', _self).html('')

      for (var i = 0; i < sensorNets.length; i++) {
        $('.sensor-net-cards', _self).append(template(sensorNets[i]))
        if (sensorNets[i].info.sensornetStatus.connected) {
          primariesConnected.push(sensorNets[i])
        }
        for (var j = 0; j < sensorNets[i].info.pzs.length; j++) {
          processZones.push(sensorNets[i].info.pzs[j])
        }
        queLength.push(sensorNets[i].info.queueLength)
      }

      $('#sensorNets', _self).html(sensorNets.length)

      $('#primariesConnected', _self).html(primariesConnected.length)
      $('#processZones', _self).html(processZones.length)

      $('#primariesProcessing', _self).html(secondariesConnected.length)
      $('#secondariesConnected', _self).html(secondariesConnected.length)

      $('#queueLength', _self).html(_.sum(queLength))
      $('#secondariesProcessing', _self).html(secondariesProcessing.length)
    }

  }
})
