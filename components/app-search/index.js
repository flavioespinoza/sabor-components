require('./style.scss')

var actions = require('./actions')

tag('x-app-search', {
  template: require('./template.html'),
  inserted: function () {
    var _self = this
    var list = _self.getSearchItems()
    for (var i = 0; i < list.length; i++) {
      $('#searchList', _self).append('<li class="list">' + list[i].name + '</li>')
    }

    $('#search', _self).on('keyup', _self.filterSearchItems)
    $('#search', _self).on('focusout', function () {
      $('#searchList').fadeOut(500)
    })

    $('.list', _self).on('click', _self.selectedItem.bind(this))
  },
  events: {

  },
  methods: {
    filterSearchItems: function () {
      $('#searchList').fadeIn(500)

      var input = document.getElementById('search')
      var filter = input.value.toUpperCase()
      var ul = document.getElementById('searchList')
      var li = ul.getElementsByTagName('li')

      for (var i = 0; i < li.length; i++) {
        if (li[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = ''
        } else {
          li[i].style.display = 'none'
        }
      }
    },
    selectedItem: function (e) {
      $('#search', this).val(e.currentTarget.innerText)
      Dispatcher.dispatch(actions.SELECT_ITEM, {
        selected: e.currentTarget.innerText
      })
    },
    getSearchItems: function () {
            // TODO: Change to swim service
      return [{
        name: 'Adel'
      }, {
        name: 'Agnes'
      }, {
        name: 'Billy'
      }, {
        name: 'Bob'
      }, {
        name: 'Calvin'
      }, {
        name: 'Christiana'
      }, {
        name: 'Cindy'
      }, {
          name: 'Asdfnes'
        }, {
            name: 'Bifasdlly'
          }, {
              name: 'Boadsgfb'
            }, {
              name: 'Calhfgvin'
            }, {
              name: 'Chrishfghfgtiana'
            }, {
              name: 'Cinhfgdy'
            }]
    }
  }
})
