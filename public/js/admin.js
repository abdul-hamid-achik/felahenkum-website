var Index = Vue.component('Index', {
  template: '<div><p><--- Look at the options</p></div>'
})

var MediaElement = {
	template: '<div class="panel panel-default">\
	  <div class="panel-body">\
	    Panel content\
	  </div>\
	  <div class="panel-footer">Panel footer</div>\
	</div>',
	props: ['record']
}

var MediaGallery = {
	template: '<div>\
		<div v-if="data.length == 0">\
			<h4>No images or videos are uploaded </h4>\
		</div>\
		<div v-if="data.length > 0">\
			<div class="toolbar">\
				<div class="input-group">\
					<input type="text" class="form-control" v-model="data.search_query">\
					<span class="input-group-addon">Q</span>\
				</div>\
			</div>\
			<div class="display-media-elements">\
			 	<div v-for="element in data">\
					<media-element record="element"></media-element>\
				</div>\
			</div>\
		</div>\
	</div>',
	props: ['data'],
	mounted: function () {
		console.log(this)

	},
	data: function () {
		return { 
			data: [],
			search_query: '' 
		}
	},
	watch: {
		data: function (val) {
			console.log(val)
		},
		search_query: function (val) {
			console.log(val)
		}
	},
	components: {
		'media-element': MediaElement
	}
}

var Media = Vue.component('Media', {
  template: '<div>\
  	<h3><a v-on:click="toggleForm">Upload Image or Video</a></h3>\
  	<div v-if="showForm" class="panel panel-default">\
  		<div class="panel-body">\
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
			  			<input type="checkbox" name="galery"> Show in galery\
		  			</label>\
	  			</div>\
	  			<div class="checkbox">\
	  				<label>\
			  			<input type="checkbox" name="band"> Show in band\
		  			</label>\
	  			</div>\
	  			<div class="checkbox">\
	  				<label>\
			  			<input type="checkbox" name="carousel"> Show in carousel\
		  			</label>\
	  			</div>\
	  			<div class="checkbox">\
	  				<label>\
			  			<input type="checkbox" name="flyer"> Show in flyer\
		  			</label>\
	  			</div>\
	  			<div class="form-group">\
				    <label for="InputFile">File</label>\
				    <input type="file" name="file" id="InputFile">\
				    <p class="help-block">\
						For Video <small>only mp4 is supported</small>\
						and for Images <small>only jpg and png is supported</small>\
				    </p>\
				</div>\
				<button v-on:click="closeForm" class="btn btn-default">Upload</button>\
	  		</form>\
	  	</div>\
  	</div>\
  	<h4>All Media</h4>\
	<div>\
		<media-gallery :data="mediaData"></media-gallery>\
	</div>\
  </div>',
  data: function () {
  	return { 
  		mediaData: [], 
  		showForm: false 
  	}
  },
  methods: {
  	toggleForm: function (event) {
  		this.$set(this, 'showForm', !this.showForm)
  	},
  	closeForm: function (event) {
/*  		this.$set(this, 'showForm', false)
  		debugger*/
  	}
  },
  mounted: function () {
  	this.$http.get('/api/media')
  		.then(function (response) {
  			this.mediaData = response.body
  		}.bind(this))
  },
  components: {
  	'media-gallery': MediaGallery
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

