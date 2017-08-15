Class(RoadPageUI, "Controller").inherits(Widget)({
	HTML: `<div>
		<ul class="nav nav-tabs">
		  <li role="presentation" class="no-available-dates" data-toggle="tooltip" data-placement="top" disabled><a id="new-dates-link">New Dates</a></li>
		  <li role="presentation" class="active"><a id="past-dates-link">Past Dates</a></li>
		</ul>
		<div class="jumbotron">
		  <div class="container">
		  	<h1>Japan 2017</h1>
			 <p style="background-color: black;opacity:0.7;">
				Soon <i class="fa fa-ticket" style="color:white;" aria-hidden="true"></i>
			 </p>
 			 <p style="background-color: black;opacity:0.7;">
				To see the flyers click the event
			 </p>
		  </div>
		</div>
		<div id="new-dates"></div>
		<div id="past-dates"></div>
	</div>`,
	ELEMENT_CLASS: 'road-page-container',
	prototype: {
		rows: [],
		init: function init (config) {
			Widget.prototype.init.call(this, config);
			var Controller = this;

			this.$newDatesLink = this.element.find('#new-dates-link');
			this.$pastDatesLink = this.element.find('#past-dates-link');

			this.appendChild(new RoadPageUI.Table({
				name: 'pastDates'
			})).render(this.element.find('#past-dates'));

			this.appendChild(new RoadPageUI.Table({
				name: 'newDates'
			})).render(this.element.find('#new-dates'));

			this.pastDates.element.show();
			this.newDates.element.hide();

			$.get('/data.json', function (response) {
				var data = response;
				Controller.past_dates = data.past_dates.reverse();
				Controller.past_dates.map(function (date) {
					Controller.pastDates.appendChild(new RoadPageUI.TableRow({
			    		image: "img/band/flyers/" + date.flyer,
			    		date: date.date,
			    		where: date.at,
			    		city: date.city
			    	})).render(Controller.pastDates.$table);
				})
			})

		    // for (i = 0; i < 5; i++) {
		    // 	this.newDates.appendChild(new RoadPageUI.TableRow({
		    // 		image: "img/band/flyers/" + (i + 1) + ".jpg",
		    // 		date: moment().format('MMMM Do YYYY'),
		    // 		where: "Golden temple",
		    // 		city: "Tokyo, Japan"
		    // 	})).render(this.newDates.$table);
		    // }

		    this.bind('showModal', function (event) {
		    	flyerModal.changeImageSrc(event.data.imageSource);
		    	flyerModal.changeTitle(event.data.title);
		    	flyerModal.show();
		    }.bind(this));

		    // this.$newDatesLink.bind('click', function() {
		    // 	this.newDates.element.show();
		    // 	this.pastDates.element.hide();
		    // 	this.$newDatesLink.parent().addClass('active');
		    // 	this.$pastDatesLink.parent().removeClass('active');
		    // }.bind(this));


		    this.$pastDatesLink.bind('click', function() {
		    	this.newDates.element.hide();
		    	this.pastDates.element.show();
		    	this.$newDatesLink.parent().removeClass('active');
		    	this.$pastDatesLink.parent().addClass('active');
		    }.bind(this));
		}
	}
});

Class(RoadPageUI, 'Table').inherits(Widget).includes(BubblingSupport)({
	HTML: `
		<div>
			<div class="legend"></div>
			<table class="table table-hover">
			</table>
		</div>
	`,
	ELEMENT_CLASS: "table-responsive table-container",
	prototype: {
		init: function init (config) {
			Widget.prototype.init.call(this, config);
			this.$table = this.element.find('table');
		}
	}

})

Class(RoadPageUI, 'TableRow').inherits(Widget).includes(BubblingSupport)({
	HTML: `
		<tr data-toggle="tooltip" data-placement="top">
			<td class="table-date"></td>
			<td class="table-where"></td>
			<td class="table-city"></td>
		</tr>`,
	ELEMENT_CLASS: '',
	prototype: {
		init: function init (config) {
			Widget.prototype.init.call(this, config);
			this.$date = this.element.find('.table-date');
			this.$where = this.element.find('.table-where');
			this.$city = this.element.find('.table-city');

			this.$date.text(this.date);
			this.$where.text(this.where);
			this.$city.text(this.city);

			this.element.bind('click', function () {
				this.dispatch('showModal', {
					data: {
						imageSource: this.image,
						title: this.where + " @ " + this.city
					}
				});
			}.bind(this));
		}
	}
});

Class(RoadPageUI, 'FlyerModal').inherits(Widget).includes(BubblingSupport)({
	HTML: `
		<div class="modal fade" tabindex="-1" role="dialog">
		  <div class="modal-dialog" role="document">
		    <div class="modal-content">
		      <div class="modal-header">
		        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
		        <h4 class="modal-title"></h4>
		      </div>
		      <div class="modal-body">
		      	<img class="img-responsive" id="flyer-image">
		      	<div class="loader">
		      		<i class="fa fa-circle-o-notch fa-spin fa-5x" aria-hidden="true"></i>
		      	</div>
		      </div>
		      <div class="modal-footer">
		        <button type="button" class="btn btn-default" data-dismiss="modal">
		        	Close		        
		        </button>
		      </div>
		    </div><!-- /.modal-content -->
		  </div><!-- /.modal-dialog -->
		</div><!-- /.modal -->
	`,
	ELEMENT_CLASS: "flyer-modal",
	TICKET_BUTTON: `<button type="button" class="btn btn-default" data-dismiss="modal">
    	Find Tickets <i class="fa fa-ticket" aria-hidden="true"></i>
    </button>`,
	prototype: {
		downloadImage: null,
		init: function init (config) {
			Widget.prototype.init.call(this, config);
			this.image = this.element.find('#flyer-image');
			this.title = this.element.find('.modal-title');
			this.loader = this.element.find('.loader');
			this.loader.hide();
			this.image.bind('load', function (event) {
				this.loader.hide();
			}.bind(this))
			this.element.bind('hide.bs.modal', function () {
				$('.modal-backdrop.in').hide();
			})
		},
		changeImageSrc: function changeImageSrc (src) {
			var that = this;
			this.loader.show();
			this.image.attr('src', null);
			this.downloadImage = new Image();
			this.downloadImage.onload = function () {
				that.image.attr('src', this.src);
			}
			this.downloadImage.src = src;
			return this;
		},
		changeTitle: function changeTitle (string) {
			this.title.text(string);
		},
		show: function show () {
			this.element.modal('show');
		}
	}
});

var flyerModal = new RoadPageUI.FlyerModal({
	name: "flyerModal"
});

flyerModal.render($(document.body));

