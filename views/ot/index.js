// import the template, and transform it into a dom element
require('./style.less')

// import components
require('uicore/swim-sankey')

require('components/mdl-header')
require('components/app-action-bar')
var actionBarActions = require('components/app-action-bar/actions')

require('components/app-graph-card')
require('components/app-bubble-chart')

// export the template as a DOM element
module.exports = $(require('./template.html'))

Dispatcher.subscribe(function(action) {
    switch (action) {
        case actionBarActions.TOGGLE_CHART_DISPLAY:
            $('x-app-bubble-chart').toggle()
            $('x-swim-sankey').toggle()
            break
    }
})