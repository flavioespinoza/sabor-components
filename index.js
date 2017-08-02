__material__
__fontawesome__

// include base styles
require('./styles/main.less')

// using a store, init it
require('store')
var actions = require('store/actions')

var views = {}
var isViewDirty = false;
var firstLoad = true;

// setup the router
var router = Router({
    '/': function() {
        var view = require('./views/default')
        view.appendTo('#app')
        isViewDirty = true;
    },
    '/it': function() {
        $(function() {
            var view = require('./views/it')
            view.appendTo('#app')
            isViewDirty = true;

            Dispatcher.dispatch(actions.GET_STEP_CHART_DATA, {
              charts: $('x-app-step-chart')
            })

        })
    },
    '/ot': function() {
        $(function() {
            var chrome = require('./views/ot')
            chrome.appendTo('#app')
            isViewDirty = true;


        })
    }
})

router.configure({
    on: function() {
        // reload the screen between views for this app
        if (isViewDirty && !firstLoad) {
            window.location.reload()
        }
        firstLoad = false;

        $(function() {
            // upgrade all material design lite components
            componentHandler.upgradeAllRegistered()
        })
    }
})

// set the default route if no route is found
router.init('#/')