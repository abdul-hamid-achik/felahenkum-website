var Index = Vue.component('Index', {
  template: '<div><p><--- Look at the options</p></div>'
})

var MediaElement = Vue.component('media-element', {
	template: '<div class="panel panel-default">\
	  <div class="panel-body">\
	    Panel content\
	  </div>\
	  <div class="panel-footer">Panel footer</div>\
	</div>'
})

var MediaGallery = Vue.component('media-gallery', {
	template: '<div>\
		<div class="toolbar">\
			<div class="input-group">\
				<input type="text" v-model="search_query">\
				<span class="input-group-addon">Q</span>\
			</div>\
		</div>\
		<div class="display-media-elements">\
		 	<div v-for="element in data">\
				<media-element record="element">\
			</div>\
		</div>\
	</div>',
	props: ['data'],
	ready: function () {

	},
	data: {
		data: null,
		search_query: ''
	},
	watch: {
		data: function (val) {
			console.log(val)
		},
		search_query: function (val) {
			console.log(val)
		}
	}
})

var Media = Vue.component('Media', {
  template: '<div>\
  	<h4>Upload Image or Video</h4>\
  	<div>\
  		<form action="/api/upload" method="post" enctype="multipart/form-data">\
  			<div class="form-group">\
  				<label for="type-selector">What are you uploading?\
		  			<select class="form-control" id="type-selector" name="type">\
		  				<option value="null">Select an option</option>\
		  				<option value="video">Video</option>\
		  				<option value="image">Image</option>\
		  			</select>\
	  			<label>\
  			</div>\
  			<div class="checkbox">\
  				<label>\
		  			<input type="checkbox" value="galery"> Show in galery\
	  			</label>\
  			</div>\
  			<div class="checkbox">\
  				<label>\
		  			<input type="checkbox" value="band"> Show in band\
	  			</label>\
  			</div>\
  			<div class="checkbox">\
  				<label>\
		  			<input type="checkbox" value="carousel"> Show in carousel\
	  			</label>\
  			</div>\
  			<div class="checkbox">\
  				<label>\
		  			<input type="checkbox" value="flyer"> Show in flyer\
	  			</label>\
  			</div>\
  			<div class="form-group">\
			    <label for="InputFile">File</label>\
			    <input type="file" id="InputFile">\
			    <p class="help-block">\
					For Video <small>only mp4 is supported</small>\
					and for Images <small>only jpg and png is supported</small>\
			    </p>\
			</div>\
			<button class="btn btn-default">Upload</button>\
  		</form>\
  	</div>\
  	<h4>All Media</h4>\
  	<media-gallery :data="{{ media_data }}"></media-gallery>\
  </div>',
  data: {
  	media_data: null
  },
  mounted: function () {
  	this.$http.get('/api/media')
  		.then(function (response) {
  			this.media_data = response
  		}.bind(this))
  }
})

var Blog = Vue.component('Blog', {
  template: '<li>This is a todo</li>'
})

var TourDates = Vue.component('TourDates', {
  template: '<li>This is a todo</li>'
})

var Messages = Vue.component('Messages', {
  template: '<li>This is a todo</li>'
})

var routes = [
	{ path: '/', component: Index },
	{ path: '/media', component: Media },
	{ path: '/blog', component: Blog },
	{ path: '/tour_dates', component: TourDates },
	{ path: '/messages', component: Messages }
]

var router = new VueRouter({ routes: routes })

Vue.use(VueRouter)
Vue.use(VueResource)

var app = new Vue({
  el: '#admin-panel',
  data: {
    message: 'What would you like to do?'
  },
  router: router
})

