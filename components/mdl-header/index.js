// import stylesheet
require('./style.less')

// import needed components
require('components/app-search')
require('components/app-filter-group')
require('components/app-resolution-bar')

// export component as tag
tag('x-mdl-header', {
  template: require('./template.html')
})
