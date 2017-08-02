/**
 * Created by Flavor on 5/15/17.
 */
require('./style.less')

tag('x-app-swim-services-test', {
  template: require('./template.html'),
  inserted: function () {
    var host = Swim.downlink().host(window.app.config.endPoints.host)

        // 1. All Primary and Secondary Sensornerts with their PZs and queue lengths (top part of the view)
    Swim.downlink()
            .host(window.app.config.endPoints.host)
            .node(window.app.config.org)
            .lane('sensornetPzs')
            .onEvent(function (msg) {
                // console.log('sensornetPzs', Recon.stringify(msg.body));
              console.log('sensornetPzs', msg.body)
            })
            .sync()

        // # Use items 2 through 9 to display the donuts and event drop UI for event logs and event
        // # notifications. Lanes are available for daily and weekly views
        // 2. 7 day view of eventLogs for a given sensornet
    Swim.downlink()
            .host(window.app.config.endPoints.host)
            .node('/sensornet/SensorNet')
            .lane('eventLogs/week')
            .onEvent(function (msg) {
              console.log('eventLogs/week', msg.body)
            })
            .sync()

        // 3. 1 day view of eventLogs for a given sensornet
        // Swim.downlink()
        //     .host(window.app.config.endPoints.host)
        //     .node('/sensornet/SensorNet')
        //     .lane('eventLogs/day')
        //         .onEvent(function (msg) {
        //             console.log('eventLogs/day', msg.body);
        //         })
        //         .sync();

        // 4. 7 day view of event log status counts for a given sensornet
    Swim.downlink()
            .host(window.app.config.endPoints.host)
            .node('/sensornet/SensorNet')
            .lane('eventLogStatusCounts/week')
            .onEvent(function (msg) {
              console.log('eventLogStatusCounts/week', msg.body)
            })
            .sync()

        // 5. 1 day view of event log status counts for a given sensornet
        // Swim.downlink()
        //     .host(window.app.config.endPoints.host)
        //     .node('/sensornet/SensorNet')
        //     .lane('eventLogStatusCounts/day')
        //         .onEvent(function (msg) {
        //             console.log('eventLogStatusCounts/day', msg.body);
        //         })
        //         .sync();

        // 6. 7 day view of event notifications for a given sensornet
    Swim.downlink()
            .host(window.app.config.endPoints.host)
            .node('/sensornet/SensorNet')
            .lane('eventNotifications/week')
            .onEvent(function (msg) {
              console.log('eventNotifications/week', msg.body)
            })
            .sync()

        // 7. 1 day view of event notifications for a given sensornet
        // Swim.downlink()
        //     .host(window.app.config.endPoints.host)
        //     .node('/sensornet/SensorNet')
        //     .lane('eventNotifications/day')
        //     .onEvent(function (msg) {
        //         console.log('eventNotifications/day', msg.body);
        //     })
        //     .sync();

        // 8. 7 day view of event notification status counts for a given sensornet
    Swim.downlink()
            .host(window.app.config.endPoints.host)
            .node('/sensornet/SensorNet')
            .lane('eventNotificationStatusCounts/week')
            .onEvent(function (msg) {
              console.log('eventNotificationStatusCounts/week', msg.body)
            })
            .sync()

        // 9. 1 day view of event notification status counts for a given sensornet
        // Swim.downlink().host(window.app.config.endPoints.host)
        //     .node('/sensornet/SensorNet')
        //     .lane('eventNotificationStatusCounts/day')
        //         .onEvent(function (msg) {
        //             console.log('eventNotificationStatusCounts/day', msg.body);
        //         })
        //         .sync();
  },
  methods: {

  }
})
