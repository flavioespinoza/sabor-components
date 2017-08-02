require('./style.less')
var actions = require('./actions')

var lastSelected
var currentPZ
tag('x-swim-left-nav', {
  template: require('./template.html'),
  draw: function () {
    var state = Store.get(this.guid)
    if (state) {
      // otherwise display the top level list
      var resolution = state.currentResolution || 'week'

      if (state.zone) {
        // if a zone is selected display the readers below
        var readers = state['ws://sensornet.swim.services:80' + state.zone]
        if (readers) this.generateList(readers.list, false, state.zoneTitle, resolution)
      } else if (state.pzs) {
        this.generateList(state.pzs.list, false, 'Orbcomm', resolution)
      }

      var locationAttribute = $(lastSelected).attr('location')
      lastSelected = $('.location[location=\'' + locationAttribute + '\']').addClass('selected')
    }
  },
  inserted: function () {
    // needed for jQuery events
    var _self = this
    Store.connect({
      host: window.app.config.endPoints.host,
      node: window.app.config.org, // or []
      lane: 'pzs', // or []
      event: actions.GET_PZS
    })
    $('.keyboard-backspace', _self).on('click', function (e) {
      $(this).addClass('hidden')
      $(_self).removeClass('selectable')
      $('.dashboard', _self).removeClass('hidden')
      $('#allZones').removeClass('hidden')
      $('#singleZone').addClass('hidden')
      $('#singleReader').addClass('hidden')
      currentPZ = null
      Store.put(_self.guid, {
        zone: null,
        zoneTitle: ''
      })
      Dispatcher.dispatch(actions.SET_READER_ID, null)
      Dispatcher.dispatch(actions.SET_PZ_ID, null)
    })

    $('#navTitle').click(function () {
      if ($(_self).hasClass('selectable')) {
        $(_self).toggleClass('selectable')
        $(lastSelected).removeClass('selected')
        var locationAttribute = $(lastSelected).attr('location')
        $('.location[location=\'' + locationAttribute + '\']').removeClass('selected')
        lastSelected = null
        Dispatcher.dispatch(actions.SET_READER_ID, null)
        Dispatcher.dispatch(actions.SET_PZ_ID, currentPZ)
      }
    })

    $(this).on('click', '.location-btn', function (e) {
      var url = $(this).attr('url')
      var pz = url.split(/[ /]+/)[1]
      if (url) {
        var location = $(this).attr('location')

        if (pz === 'pz') {
          $(_self).removeClass('selectable')
          $('.keyboard-backspace', _self).removeClass('hidden')
          $('.dashboard', _self).addClass('hidden')
          $('#allZones').addClass('hidden')
          $('#singleZone').removeClass('hidden')
          currentPZ = url
          Store.put(_self.guid, {
            zone: url,
            zoneTitle: location
          })
          _self.getChildren(url, location)
          Dispatcher.dispatch(actions.SET_PZ_ID, url)
        } else if (url === 'child') { // CLICK ON READER
          $(lastSelected).toggleClass('selected')
          lastSelected = this
          if (!$(this).hasClass('selected')) {
            $(this).toggleClass('selected')
          }

          if (!$(_self).hasClass('selectable')) {
            $(_self).addClass('selectable')
          }

          var readerID = location.split(/[ -]+/)[1]
          $('#singleZone').addClass('hidden')
          $('#singleReader').removeClass('hidden')
          Dispatcher.dispatch(actions.SET_READER_ID, readerID)
        }
      }
    })
    Dispatcher.subscribe(function (action, data) {
      switch (action) {
        case actions.GET_READERS:

          var state = Store.get(this.guid) || {}
          var readers = state[data.node] || {
              list: []
            }
          var key = data['@update'][0].key
          if (!readers[key]) {
            readers.list.push({
              location: data['@update'][0].key,
              url: 'child',
              disconnects: data.disconnects,
              inactivity: data.inactivity
            })
            readers[key] = key
          }

          state[data.node] = readers
          Store.put(this.guid, state)
          break
        case actions.GET_PZS:
          var state = Store.get(this.guid) || {}
          var pzs = state.pzs || {
              list: []
            }

          var key = data['@update'][0].key
          if (!pzs[key]) {
            pzs.list.push({
              location: data['@update'][0].key,
              url: data.body[1].uri,
              disconnects: data.disconnects,
              inactivity: data.inactivity
            })
            pzs[key] = key
          }
          state.pzs = pzs
          Store.put(this.guid, state)
          break
      }
    }.bind(this))
  },
  methods: {
    generateList: function (items, children, title, resolution) {
      if (!items || !items.length) {
        return
      }
      $('.title', this).text(title)
      var icon = 'dns'
      if (currentPZ) {
        icon = 'reader_icon'
      }
      $('.location-list', this).html('')
      var template = _.template(require('./item.html'))
      for (var i = 0; i < items.length; i++) {
        var disconnects = 0
        var inactivity = 0

        if (resolution) {
          switch (resolution) {
            case 'week':
              disconnects = items[i].disconnects[1].week
              inactivity = items[i].inactivity[1].week
              break

            case 'day':
              disconnects = items[i].disconnects[0].day
              inactivity = items[i].inactivity[0].day
              break
          }
        }

        $('.location-list', this).append(template({
          location: items[i].location,
          url: items[i].url,
          icon: icon,
          disconnects: disconnects,
          inactivity: inactivity
        }))
      }
    },
    getChildren: function (url, title) {
      // get children of the Process Zone
      Store.connect({
        host: window.app.config.endPoints.host,
        node: url, // or []
        lane: 'readers', // or []
        event: actions.GET_READERS
      })
    }
  }
})
