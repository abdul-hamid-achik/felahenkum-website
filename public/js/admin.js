Vue.config.devtools = true
var Index = Vue.component('Index', {
  template: '<h2>Escoje una de las opciones en el menu</h2>'
})


var Media = Vue.component('Media', {
  template: '<div>\
  	<a class="btn btn-default pull-right" style="display:inline-block" v-on:click="toggleForm">Subir imagen o video</a>\
  	<div v-if="showForm" class="panel panel-default">\
  		<div class="panel-body">\
	  		<form id="upload-media-form" v-on:submit.prevent="onSubmit">\
	  			<div class="checkbox">\
	  				<label>\
			  			<input type="checkbox" name="galery"> Mostrar en la Galeria\
		  			</label>\
	  			</div>\
	  			<div class="checkbox">\
	  				<label>\
			  			<input type="checkbox" name="band"> Mostrar en la Banda\
		  			</label>\
	  			</div>\
	  			<div class="checkbox">\
	  				<label>\
			  			<input type="checkbox" name="carousel"> Mostrar en el Carousel de la pagina principal\
		  			</label>\
	  			</div>\
	  			<div class="checkbox">\
	  				<label>\
			  			<input type="checkbox" name="flyer"> Mostrar en flyers\
		  			</label>\
	  			</div>\
	  			<div class="form-group">\
				    <label for="InputFile">File</label>\
				    <input @change="autoDetectType" type="file" name="file" id="InputFile">\
				    <p class="help-block">\
						Para video <strong>solo el formato mp4 es soportado</strong>\
						Para images <strong>solo los formatos jpg y png son soportados.</strong>\
				    </p>\
				</div>\
				<button class="btn btn-default">Upload</button>\
	  		</form>\
	  	</div>\
  	</div>\
  	<h2>All Media</h2>\
	<div>\
		<div v-if="mediaData.length == 0">\
			<h4>No has subido imagenes o videos</h4>\
		</div>\
		<div v-if="mediaData.length > 0">\
			<div class="toolbar">\
				<div class="input-group">\
					<input type="text" class="form-control" v-model="mediaData.search_query">\
					<span class="input-group-addon">Q</span>\
				</div>\
			</div>\
			<div class="display-media-elements">\
				<div v-for="(record, index) in mediaData" class="panel panel-default media-element" :id="record._id">\
					<div class="panel-body">\
						<div class="image-container" v-if="record.type == \'image\'">\
							<img width="100%" :src="record.file.secure_url">\
						</div>\
						<div class="video-container" v-if="record.type == \'video\'">\
							<video controls width="100%" :src="record.file.secure_url"></video>\
						</div>\
						<div>\
							<div class="checkbox">\
								<label>\
									<input type="checkbox" name="gallery" @click="updatedCheckbox($event, index)" v-model="record.gallery"> Mostrar en la Galeria\
								</label>\
							</div>\
							<div class="checkbox">\
								<label>\
									<input type="checkbox" name="band" @click="updatedCheckbox($event, index)" v-model="record.band"> Mostrar en la Banda\
								</label>\
							</div>\
							<div class="checkbox">\
								<label>\
									<input type="checkbox" name="carousel" @click="updatedCheckbox($event, index)" v-model="record.carousel"> Mostrar en el Carousel de la pagina principal\
								</label>\
							</div>\
							<div class="checkbox">\
								<label>\
									<input type="checkbox" name="flyer"  @click="updatedCheckbox($event, index)" v-model="record.flyer"> Mostrar en flyers\
								</label>\
							</div>\
						</div>\
					</div>\
					<div class="panel-footer">\
						<button @click="deleteElement($event, record, index)" class="btn btn-default">Borrar</button>\
						<button @click="updateElement($event, record, index)" :disabled="!enableUpdateButton[index]" class="btn btn-success">Actualizar</button>\
					</div>\
				</div>\
			</div>\
		</div>\
	</div>\
  </div>',
  data: function () {
	return {
		mediaData: [], 
		showForm: false,
		newData: {},
		preventUpload: true,
		enableUpdateButton: {}
	}
  },
  methods: {
	autoDetectType: function (event) {
		var file = event.target.files[0]
		if (file) {
			return
		}
		var type = file.type

		if (type.indexOf('image') != -1 && (type.toLowerCase().indexOf('png' != -1) || type.toLowerCase().indexOf('jpg' != -1))) {
			this.newData.type = 'image'
			this.preventUpload = false
		} else if (type.indexOf('video') != -1 && type.indexOf('mp4' != -1)) {
			this.newData.type = 'video'
			this.preventUpload = false
		} else {
			alert("Subiste un formato no soportado: " + type)
		}
	},
	updatedCheckbox: function (event, index) {
		this.$set(this.$data.enableUpdateButton, index, true)
	},
  	toggleForm: function (event) {
  		this.$set(this, 'showForm', !this.showForm)
	},
	updateElement: function (event, record, index) {
		this.$http.put('/api/media', record)
			.then((res) => {
				this.$set(this.$data.enableUpdateButton, index, true)
				alert("Los datos han sido actualizados")
			})
	},
  	onSubmit: function (event) {
			if (this.preventUpload) {
				return event.preventDefault()
			}
			var options = {
				headers: { 'Content-Type': 'multipart/form-data' }
			}
			var formElement = document.getElementById('upload-media-form')
			var formData = new FormData(formElement)

			formData.append('type', this.newData.type)

			this.$http.post('/api/upload', formData, options).then((response) => {
				this.toggleForm(event)
				response.body.file = JSON.parse(response.body.file)
				this.mediaData.push(response.body)
				this.newData.type = null
				alert("Tu archivo acaba de ser subido a la pagina")
			})
	  },
	  deleteElement: function (event, record, index) {
		  this.$http.delete('/api/media/' + record._id)
		  	.then((res) => {
				  this.mediaData.splice(index, 1)
				  document.getElementById(record._id).remove()
				  alert(res.body.message)
			  })
	  }
  },
  mounted: function () {
  	this.$http.get('/api/media')
  		.then((response) => {
			response.body.map(function (data) {
				data.file = JSON.parse(data.file)
				console.log(data)
			})
			this.$set(this.$data, 'mediaData', response.body)
  		})
  }
})

var Blog = Vue.component('Blog', {
  template: '<li>This is a todo</li>'
})

var TourDates = Vue.component('TourDates', {
  template: '<div>\
		<a class="btn btn-default pull-right" style="display:inline-block" v-on:click="toggleForm">Agregar Nueva Fecha</a>\
	<div class="panel panel-default">\
		<div class="panel-header">\
			<div class="new-date" v-if="showForm"></div>\
			<div class="normal-actions" v-if="!showForm"></div>\
		</div>\
		<div class="panel-body">\
			<div class="new-date" v-if="!showForm"></div>\
            <div class="normal-actions" v-if="!showForm">\
                <table class="table table-hover">\
                    <thead>\
                        <tr>\
                            <th>Fecha</th>\
                            <th>Lugar</th>\
                            <th>Ciudad</th>\
                            <th>Acciones</th>\
                        </tr>\
                    </thead>\
                    <tbody>\
                        <tr v-for="(date, index) in tourDates">\
                            <td>{{ date.date | formatDate }}</td>\
                            <td>{{ date.at }}</td>\
                            <td>{{ date.city }}</td>\
                            <td>\
                                <a class="btn btn-default" v-on:click="showFlyer">Ver Flyer</a>\
                                <a class="btn btn-default" v-on:click="deleteDate">Borrar</a>\
                                <a class="btn btn-default" v-on:click="updateDate">Actualizar</a>\
                            </td>\
                        </tr>\
                    </tbody>\
                </table>\
            </div>\
		</div>\
		<div class="panel-footer">\
			<div class="new-date" v-if="showForm"></div>\
			<div class="normal-actions" v-if="!showForm"></div>\
		</div>\
	</div>\
  </div>',
  mounted: function () {
	this.$http.get('/api/road')
		.then((response) => {
		  response.body.map(function (data) {
			  data.flyer.file = JSON.parse(data.flyer.file)
			  console.log(data)
		  })
		  this.$set(this.$data, 'tourDates', response.body)
		})
	},
  data: function () {
    return {
        tourDates: [],
        showForm: false
    }
  },

  methods: {
      toggleForm: function () {
        this.$set(this, 'showForm', !this.showForm)
      },
      updateDate: function (id) {

      },
      deleteDate: function (id) {

      },
      showFlyer: function(url) {

      }
  },
  filters: {
      formatDate: function (value) {
          return moment(value).format('Do MMMM YYYY')
      }
  }
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

