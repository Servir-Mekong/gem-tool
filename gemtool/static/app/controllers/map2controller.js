'use strict';
angular.module('baseApp')
.controller('map2controller' ,function ($scope, $timeout, APIService) {

	mapboxgl.accessToken = 'pk.eyJ1IjoidGhhbm5hcm90IiwiYSI6ImNrOXFzZjgzcjA2OTczZXFrbXV4Z3lzejUifQ.4CmrqCen0XTYYYCjcWGrzg';
	var map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/mapbox/light-v10',
		center: [103, 15.5],
		minZoom: 3,
		zoom: 4,
		pitch: 0,
		bearing: 0,
		antialias: false
		// pitch: 40,
		// bearing: 0,
		// antialias: true
	});

	var zoomThreshold = 4;
	// Create a popup, but don't add it to the map yet.
	var popup = new mapboxgl.Popup({
		closeButton: false
	});
	var filter = null;
	var selected_features = ['in', 'area_id'];
	var area_id = '9999';
	var admin_level = 'province';
	var country_id = '40';  //cambodia
	var selected_data = 'gii'; //default
	var data_lvl = 'idx';
	var by_gender = 'Female';
	var selected_data_text = 'Children aged 6-14 never attending school';
	var legend_colors = [];
	var legend_label = [];
	var dataset_id = '';
	var year = 2020;
	var init = true;
	var nodata_feature='';
	var chart_color = '';
	var data_unit= '';
	var section_id = '';
	$scope.showSpinner = true;

	var MAXVALUE = 0;
	var MINVALUE = 0;
	var RANGEVALUE = 0;
	var INTERVAL = 0;
	var MEAN = 0;
	var STD = 0;
	var CLASS_1 = 0;
	var CLASS_2 = 0;
	var CLASS_3 = 0;
	var CLASS_4 = 0;

	// 1. Initialise range slider instance
	$(".js-range-slider").ionRangeSlider();
	// 2. Save instance to variable
	var my_range = $(".js-range-slider").data("ionRangeSlider");
	// 3. Update range slider content (this will change handles positions)
	my_range.update({
		grid: true,
		skin: "square",
		prettify_enabled: false,
		min: 2000,
		max: 2022,
		values:[],
		onChange: function(data) {
			year = data.slider.context.value;
			// $scope.getDatasetL1(selected_data);
			var dataset_name_l2 = $("#dataset-dropdown").find('option:selected').text();
			selected_data_text =  dataset_name_l2 + " " +year;
			$("#dataset_name").text(selected_data_text);

			$scope.clearMapLayer();
			// $scope.getMap();
			if ($("#by_gender_gap").hasClass('active')){
				$scope.calGenderGap();
			}else{
				$scope.find_dataset_id_l2();
			}
		}
	});

	$scope.getMainSector = function () {
		var params= {
			country_id: country_id
		};
		APIService.getMainSector(params)
		.then(function (result){
			$("#main-sector-dropdown").html("");
			$.each(result, function (i, item) {
				$("#main-sector-dropdown").append('<option value="'+item["section_id"]+'">'+item["section_name"]+'</option>');
			});
			$("#main-sector-dropdown").trigger("change");
		});
	};
	$scope.getMainSector();

	var dataset_l1 = '';
	$scope.getDatasetL1 = function (id) {
		section_id = id;
		var params= {
			id: section_id,
			country_id: country_id
		};
		APIService.getDatasetL1(params)
		.then(function (result){
			dataset_l1 = result;
			$scope.getDataset(id);
		});
	};

	$scope.getDataset = function (id) {
		var params= {
			id: id,
			country_id: country_id
		};
		APIService.getDataset(params)
		.then(function (result){
			var dataset_l2 = result;
			$("#dataset-dropdown").html("");
			for (var i = 0; i < dataset_l1.length; i++) {
				var optgroup = "<optgroup label='"+dataset_l1[i]["dataset_name_l1"]+"'>";
				for (var j = 0; j < dataset_l2.length; j++) {

					if(dataset_l1[i]["dataset_id_l1"] === dataset_l2[j]["dataset_id_l1"]){

						if(dataset_l2[j]["dataset_name_l2"] === 'NA'){
							optgroup += "<option data-content='"+dataset_l2[j]["dataset_name_l2"]+"' data-dataset_id_l1='"+dataset_l1[i]["dataset_id_l1"]+"' data-dataset_name_l1='"+dataset_l1[i]["dataset_name_l1"]+"'  value='" + dataset_l2[j]["dataset_id_l1"] + "'>" + dataset_l1[i]["dataset_name_l1"] + "</option>";
						}else{
							optgroup += "<option data-content='"+dataset_l2[j]["dataset_name_l2"]+"' data-dataset_id_l1='"+dataset_l1[i]["dataset_id_l1"]+"' data-dataset_name_l1='"+dataset_l1[i]["dataset_name_l1"]+"'  value='" + dataset_l2[j]["dataset_id_l1"] + "'>" + dataset_l1[i]["dataset_name_l1"] +" - "+ dataset_l2[j]["dataset_name_l2"] + "</option>";
						}
					}
				}
				optgroup += "</optgroup>";
				$('#dataset-dropdown').append(optgroup);
			}
			$("#dataset-dropdown").trigger("change");
		});
	};

	$scope.nodataMap = function () {
		map.addSource('nodata_map', {
			'type': 'geojson',
			'data': nodata_feature
		});
		map.addLayer({
			'id': 'nodata_map',
			'type': 'fill',
			'source': 'nodata_map',
			'paint': {
				'fill-color': "#B9B9B9",
			},

		}, 'settlement-label');
		// Add a black outline around the polygon.
		map.addLayer({
			'id': 'nodata_outline',
			'type': 'line',
			'source': 'nodata_map',
			'layout': {},
			'paint': {
				'line-color': "#FFF",
				'line-width': 1,
			}
		});

		// Geographic coordinates of the LineString
		var  coordinates = nodata_feature.features[0].geometry.coordinates;
		var polygon = nodata_feature.features[0].geometry.coordinates;
		var fit = new L.Polygon(polygon).getBounds();
		var southWest = new mapboxgl.LngLat(fit['_southWest']['lat'], fit['_southWest']['lng']);
		var northEast = new mapboxgl.LngLat(fit['_northEast']['lat'], fit['_northEast']['lng']);
		var center = new mapboxgl.LngLatBounds(southWest, northEast).getCenter();
		// map.flyTo({center: center, zoom: 10});
		map.fitBounds(new mapboxgl.LngLatBounds(southWest, northEast));

	};

	$scope.genMapLegend = function(data_unit) {
		if(CLASS_1 === CLASS_4){
			legend_label = [
				'' + CLASS_4.toString(),
				'No Data',
			];

			if(by_gender === 'male'){
				legend_colors = [
					'#024E72',
					'#B9B9B9',
				];
			}else if(by_gender === 'female'){
				legend_colors = [
					'#AE1857',
					'#B9B9B9',
				];
			}else{
				legend_colors = [
					'#52006A',
					'#B9B9B9',
				];
			}
		}else{
			legend_label = [
				'< '+ CLASS_1.toString(),
				CLASS_1.toString() + ' - '+ CLASS_2.toString(),
				CLASS_2.toString() + ' - '+ CLASS_3.toString(),
				CLASS_3.toString() + ' - '+ CLASS_4.toString(),
				'> ' + CLASS_4.toString(),
				'No Data',
			];

			if(by_gender === 'male'){
				legend_colors = [
					'#FFFFCD',
					'#8ADCE8',
					'#2EC4DA',
					'#0D899E',
					'#024E72',
					'#B9B9B9',
				];
			}else if(by_gender === 'female'){
				legend_colors = [
					'#FFFFCD',
					'#EFBCBC',
					'#E26B9B',
					'#D71E6C',
					'#AE1857',
					'#B9B9B9',
				];
			}else{
				legend_colors = [
					'#FFFFCD',
					'#C6B4CE',
					'#9B72AA',
					'#A03C78',
					'#52006A',
					'#B9B9B9',
				];
			}
		}

		$("#legend").html("");

		if(data_unit=== 'GPI' || data_unit=== 'Ratio'){
			$("#legend").html("<lable>GENDER GAP</lable>");
		}else{
			$("#legend").html("<lable>"+data_unit.toUpperCase()+"</lable>");
		}


		// create legend
		for (var i = 0; i < legend_label.length; i++) {
			var layer = legend_label[i];
			var color = legend_colors[i];
			var item = document.createElement('div');
			var key = document.createElement('span');
			key.className = 'legend-key';
			key.style.backgroundColor = color;

			var value = document.createElement('span');
			value.innerHTML = layer;
			item.appendChild(key);
			item.appendChild(value);
			legend.appendChild(item);
		}
	};

	$scope.layerClasses = function(features, data_key, unit) {
		for(var i=0; i<features.length; i++){
			if(by_gender === 'male'){
				if(features[i]["properties"][data_key] === 'No Data'){
					features[i]["properties"]["color"] = '#b9b9b9';
				}else if(features[i]["properties"][data_key] < CLASS_1){
					features[i]["properties"]["color"] = '#FFFFCD';
				}else if(features[i]["properties"][data_key] < CLASS_2){
					features[i]["properties"]["color"] = '#8ADCE8';
				}else if(features[i]["properties"][data_key] < CLASS_3){
					features[i]["properties"]["color"] = '#2EC4DA';
				}else if(features[i]["properties"][data_key] < CLASS_4){
					features[i]["properties"]["color"] = '#0D899E';
				}else if(features[i]["properties"][data_key] >= CLASS_4){
					features[i]["properties"]["color"] = '#024E72';
				}
			}else if(by_gender === 'female'){
				if(features[i]["properties"][data_key] === 'No Data'){
					features[i]["properties"]["color"] = '#b9b9b9';
				}else if(features[i]["properties"][data_key] < CLASS_1){
					features[i]["properties"]["color"] = '#FFFFCD';
				}else if(features[i]["properties"][data_key] < CLASS_2){
					features[i]["properties"]["color"] = '#EFBCBC';
				}else if(features[i]["properties"][data_key] < CLASS_3){
					features[i]["properties"]["color"] = '#E26B9B';
				}else if(features[i]["properties"][data_key] < CLASS_4){
					features[i]["properties"]["color"] = '#D71E6C';
				}else if(features[i]["properties"][data_key] >= CLASS_4){
					features[i]["properties"]["color"] = '#AE1857';
				}
			}else{
				if(features[i]["properties"][data_key] === 'No Data'){
					features[i]["properties"]["color"] = '#b9b9b9';
				}else if(features[i]["properties"][data_key] < CLASS_1){
					features[i]["properties"]["color"] = '#FFFFCD';
				}else if(features[i]["properties"][data_key] < CLASS_2){
					features[i]["properties"]["color"] = '#C6B4CE';
				}else if(features[i]["properties"][data_key] < CLASS_3){
					features[i]["properties"]["color"] = '#9B72AA';
				}else if(features[i]["properties"][data_key] < CLASS_4){
					features[i]["properties"]["color"] = '#A03C78';
				}else if(features[i]["properties"][data_key] >= CLASS_4){
					features[i]["properties"]["color"] = '#52006A';
				}
			}

		}
	};

	$scope.check_data = function () {
		$("#by_gender_gap").addClass("li-disabled");
		$("#by_gender_male").addClass("li-disabled");
		$("#by_gender_female").addClass("li-disabled");
		$("#by_gender_total").addClass("li-disabled");
		var params= {
			dataset_id_l1: $("#dataset-dropdown").find('option:selected').attr('data-dataset_id_l1')
		};
		APIService.check_data(params)
		.then(function (result){

			if(result["calc"] === 'GPI' || result["calc"] === 'Ratio'){
				$("#by_gender_gap").removeClass('li-disabled');
			}else{
				$("#by_gender_gap").addClass("li-disabled");
			}

			if(result["number"] === 1){
				if(result["data"] === 'Male'){
					$("#by_gender_male").removeClass('li-disabled');
					$("#by_gender_male").click();
				}else if (result["data"] === 'Female'){
					$("#by_gender_female").removeClass('li-disabled');
					$("#by_gender_female").click();
				}else if (result["data"] === 'Total'){
					$("#by_gender_total").click();
					$("#by_gender_total").removeClass('li-disabled');
				}
			}else if(result["number"] === 2){
				$("#by_gender_male").removeClass('li-disabled');
				$("#by_gender_female").removeClass('li-disabled');
				$("#by_gender_total").addClass("li-disabled");
				$("#by_gender_female").click();
			}
			$scope.check_available_year();
		});
	};


	$scope.find_dataset_id_l2 = function () {
		$scope.showSpinner = true;
		var params= {
			dataset_id_l1: $("#dataset-dropdown").find('option:selected').attr('data-dataset_id_l1'),
			gender_type: by_gender,
			dataset_name_l2: $("#dataset-dropdown").find('option:selected').attr('data-content')

		};
		APIService.find_dataset_id_l2(params)
		.then(function (result){
			dataset_id = result["dataset_id"];
			$("#dataset_definition").text(result["definition"]+ ' in ' + year);
			$scope.getMap();
		}, reason => {
			$("#dataset_name").text("No data found");
			$scope.showSpinner = false;
		});
	};

	$scope.check_available_year = function () {
		for(var i=2000; i<=2021; i++){
			$("#tickmarks").find("[value='"+i+"']").prop("disabled", true);
		}
		var params= {
			dataset_id_l1: $("#dataset-dropdown").find('option:selected').attr('data-dataset_id_l1'),
			id: section_id,
			country_id: country_id,
			gender_type: by_gender,

		};
		APIService.check_available_year(params)
		.then(function (result){
			$scope.showSpinner = false;
			if(result.length > 0){
				year = result[result.length-1];
				$("#my_range").css("display", "block");
				$scope.find_dataset_id_l2();

				var _available_years=[];
				var latest_val = 'None';
				var _disable = true;
				if(result.length === 1){
					_disable = true;
					_available_years.push(latest_val);
					for(var i=0; i<result.length; i++){
						_available_years.push(result[i].toString());
					}
				}else{
					_disable = false;
					for(var j=0; j<result.length; j++){
						_available_years.push(result[j].toString());
					}
				}
				my_range.update({
					disable: _disable,
					from: result[result.length -1],
					values:_available_years
				});

			}else{
				$("#my_range").css("display", "none");
			}
		});
	};


	$scope.dev = function(array) {
		const n = array.length;
		const mean = array.reduce((a, b) => a + b) / n;
		return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
	};


	$scope.getMap = function () {
		$scope.showSpinner = false;
		var indices_areas_data = [];
		var indicator_data = [];
		$scope.giiData = [];

		var params= {
			area_id: area_id,
			admin_level: admin_level,
			gender_type: by_gender,
			year:year,
			country_id: country_id,
			dataset_id: dataset_id,
			dataset_id_l1: $("#dataset-dropdown").find('option:selected').attr('data-dataset_id_l1')
		};
		APIService.getDatesetMap(params)
		.then(function (result){
			var val_arr= [];
			var val_total = 0;
			var count = 0;
			var features = result[0].features;
			$scope.showSpinner = false;
			if(features.length === 0){
				$("#dataset_name").text("No dataset found");
				$("#detail_div").css("display", "none");
			}else{
				var polygon ='';
				if(features.length === 1){
					polygon = features[0].geometry.coordinates;
				}else{
					polygon = nodata_feature.features[0].geometry.coordinates;
				}
				var fit = new L.Polygon(polygon).getBounds();
				var southWest = new mapboxgl.LngLat(fit['_southWest']['lat'], fit['_southWest']['lng']);
				var northEast = new mapboxgl.LngLat(fit['_northEast']['lat'], fit['_northEast']['lng']);
				var center = new mapboxgl.LngLatBounds(southWest, northEast).getCenter();
				map.fitBounds(new mapboxgl.LngLatBounds(southWest, northEast));

				if($("#dataset-dropdown").find('option:selected').attr('data-content') === "NA"){
					selected_data_text = $("#dataset-dropdown").find('option:selected').attr('data-dataset_name_l1') + "- "+ by_gender+ " " + year;
				}else{
					selected_data_text = $("#dataset-dropdown").find('option:selected').attr('data-dataset_name_l1') + "-" + $("#dataset-dropdown").find('option:selected').attr('data-content') + "- "+ by_gender+ " " + year;
				}

				MAXVALUE = 0;
				MINVALUE = features[0].properties.value;

				var data_key = "value";
				$("#detail_div").css("display", "block");
				$("#dataset_name").text(selected_data_text);
				for(var i=0; i<features.length; i++){
					indicator_data.push(features[i].properties.value);
					indices_areas_data.push(features[i].properties.area_name);
					data_unit = features[i].properties.unit;
					val_arr.push(features[i].properties.value);
					val_total += features[i].properties.value;
					if(MAXVALUE < features[i].properties.value){
						MAXVALUE = features[i].properties.value;
					}
					if(MINVALUE > features[i].properties.value){
						MINVALUE = features[i].properties.value;
					}
					MEAN = val_total / features.length;
					STD = $scope.dev(val_arr);
				}

				if(data_unit.toLowerCase() === 'percentage'){
					MAXVALUE = 100;
					MINVALUE = 0;
					// Range Value
					RANGEVALUE = MAXVALUE- MINVALUE;
					INTERVAL = RANGEVALUE / 5;
					CLASS_1 = MINVALUE + INTERVAL;
					CLASS_2 = CLASS_1 + INTERVAL;
					CLASS_3 = CLASS_2 + INTERVAL;
					CLASS_4 = CLASS_3 + INTERVAL;
				}else if(data_unit.toLowerCase() === 'index' || data_unit.toLowerCase() === 'ratio'){
					MAXVALUE = 1;
					MINVALUE = 0;
					// Range Value
					RANGEVALUE = MAXVALUE- MINVALUE;
					INTERVAL = RANGEVALUE / 5;
					CLASS_1 = MINVALUE + INTERVAL;
					CLASS_2 = CLASS_1 + INTERVAL;
					CLASS_3 = CLASS_2 + INTERVAL;
					CLASS_4 = CLASS_3 + INTERVAL;
				}else if(data_unit.toLowerCase() === 'number'){
					MAXVALUE = MAXVALUE;
					MINVALUE = MINVALUE;
					// Range Value
					RANGEVALUE = MAXVALUE- MINVALUE;
					INTERVAL = RANGEVALUE / 5;
					CLASS_1 = MINVALUE + INTERVAL;
					CLASS_2 = CLASS_1 + INTERVAL;
					CLASS_3 = CLASS_2 + INTERVAL;
					CLASS_4 = CLASS_3 + INTERVAL;
				}
				else{
					if((MEAN - STD) < MINVALUE ){
						CLASS_1 = (MEAN - (STD/2));
					}else{
						CLASS_1 = (MEAN - STD);
					}
					CLASS_2 = MEAN;
					CLASS_3 = (MEAN + STD);
					CLASS_4 = MAXVALUE;
				}


				CLASS_1 = CLASS_1.toFixed(3);
				CLASS_2 = CLASS_2.toFixed(3);
				CLASS_3 = CLASS_3.toFixed(3);
				CLASS_4 = CLASS_4.toFixed(3);

				//layer classes
				$scope.layerClasses(features, data_key, data_unit);
				//update a map legend
				$scope.genMapLegend(data_unit);

				Highcharts.chart('bar-chart-container', {
					chart: {
						type: 'column',
						style: {
							fontFamily: 'Roboto'
						}
					},
					title: {
						text: $("#dataset_definition").text()//selected_data_text.toUpperCase()
					},
					subtitle: {
						text: $("#adm0_dropdown").find('option:selected').text().toUpperCase()
					},
					xAxis: {
						categories: indices_areas_data,
						crosshair: true
					},
					yAxis: {
						min: 0,
						title: {
							text: data_unit
						}
					},
					credits: {
						enabled: false
					},
					tooltip: {
						headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
						pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
						'<td style="padding:0"><b>{point.y:.1f} </b></td></tr>',
						footerFormat: '</table>',
						shared: true,
						useHTML: true
					},
					plotOptions: {
						column: {
							pointPadding: 0.1,
							borderWidth: 0
						}
					},
					series: [{
						color: chart_color,
						name: selected_data_text,
						data: indicator_data

					}]
				});


				var gii_feature = result[0];
				var hoveredStateId = null;
				map.addSource('admin_gii', {
					'type': 'geojson',
					'data': gii_feature
				});
				map.addLayer({
					'id': 'admin_gii',
					'type': 'fill',
					'source': 'admin_gii',
					'paint': {
						'fill-color': ['get', 'color'],
						'fill-opacity': [
							'case',
							['boolean', ['feature-state', 'hover'], false],
							1,
							0.8
						],

					},

				}, 'settlement-label');
				// Add a black outline around the polygon.
				map.addLayer({
					'id': 'outline',
					'type': 'line',
					'source': 'admin_gii',
					'layout': {},
					'paint': {
						'line-color': [
							'case',
							['boolean', ['feature-state', 'hover'], false],
							'#f8b600',
							'#FFF'
						],
						'line-width': [
							'case',
							['boolean', ['feature-state', 'hover'], false],
							2,
							0.5
						],
					}
				});

				map.addLayer(
					{
						'id': 'admin-highlighted',
						'type': 'fill',
						'source': 'admin_gii',
						'paint': {
							'fill-color': ['get', 'color'],
							'fill-outline-color': '#f8b600',
							'fill-opacity': 1,
						},
						'filter': ['in', 'area_id', '']
					}

				);

				// Add a black outline around the polygon.
				map.addLayer({
					'id': 'admin-outline-highlighted',
					'type': 'line',
					'source': 'admin_gii',
					'layout': {},
					'paint': {
						'line-color': '#f8b600',
						'line-width': 2,
					},
					'filter': ['in', 'area_id', '']
				});

				// When the user moves their mouse over the state-fill layer, we'll update the
				// feature state for the feature under the mouse.
				map.on('mousemove', 'admin_gii', function (e) {
					var feature = e.features[0];
					if (e.features.length > 0) {
						if (hoveredStateId !== null) {
							map.setFeatureState(
								{ source: 'admin_gii', id: hoveredStateId },
								{ hover: false }
							);
						}
						hoveredStateId = feature.id;
						map.setFeatureState(
							{ source: 'admin_gii', id: hoveredStateId },
							{ hover: true  }
						);
					}
					// Display a popup with the name of the county.
					if(feature.properties[data_key] === 'No Data'){
						popup
						.setLngLat(e.lngLat)
						.setHTML(
							'<h4>'+feature.properties.area_name+'</h4>' +
							'<p>' +
							selected_data_text + ":     "+feature.properties[data_key] +
							'</p>'
						)
						.addTo(map);
					}else{
						popup
						.setLngLat(e.lngLat)
						.setHTML(
							'<h4>'+feature.properties.area_name+'</h4>' +
							'<p>' +
							selected_data_text + ":     "+feature.properties[data_key].toFixed(2) +
							'</p>'
						)
						.addTo(map);
					}
				});
				// When the mouse leaves the state-fill layer, update the feature state of the
				// previously hovered feature.
				map.on('mouseleave', 'admin_gii', function () {
					map.getCanvas().style.cursor = '';
					popup.remove();
					if (hoveredStateId !== null) {
						map.setFeatureState(
							{ source: 'admin_gii', id: hoveredStateId },
							{ hover: false }
						);
					}
					hoveredStateId = null;
				});
			}
		});
	};


	$scope.calGenderGap = function () {
		by_gender = 'GAP';
		$scope.showSpinner = true;
		var f_indices_areas_data = [];
		var f_indicator_data = [];
		var m_indices_areas_data = [];
		var m_indicator_data = [];
		$scope.giiData = [];
		var genderGap_data = [];
		var genderGap_area_data = [];

		var params= {
			area_id: area_id,
			admin_level: admin_level,
			dataset_id: dataset_id,
			gender_type: 'Female',
			year:year,
			country_id: country_id,
			dataset_name_l2: $("#dataset-dropdown").find('option:selected').attr('data-content'),
			dataset_id_l1:  $("#dataset-dropdown").find('option:selected').attr('data-dataset_id_l1'),
		};

		APIService.getGenderGapMap(params)
		.then(function (result){
			var f_features = result[0].features;
			if(f_features.length === 0){
				$("#dataset_name").text("Sorry, we can not calculate a gender gap of this dataset!");
				$("#detail_div").css("display", "none");
			}else{
				var polygon ='';
				if(f_features.length === 1){
					polygon = f_features[0].geometry.coordinates;
				}else{
					polygon = nodata_feature.features[0].geometry.coordinates;
				}
				var data_key = "value";
				$("#detail_div").css("display", "block");
				$("#dataset_name").text(selected_data_text);
				for(var i=0; i<f_features.length; i++){
					f_indicator_data.push(f_features[i].properties.value);
					f_indices_areas_data.push(f_features[i].properties.area_name);
					data_unit = f_features[i].properties.unit;
				}
				var params= {
					area_id: area_id,
					admin_level: admin_level,
					dataset_id: dataset_id,
					gender_type: 'Male',
					year:year,
					country_id: country_id,
					dataset_name_l2: $("#dataset-dropdown").find('option:selected').attr('data-content'),
					dataset_id_l1:  $("#dataset-dropdown").find('option:selected').attr('data-dataset_id_l1'),
				};
				APIService.getGenderGapMap(params)
				.then(function (result){
					var val_arr= [];
					var val_total = 0;
					var count = 0;
					var m_features = result[0].features;
					var gender_gap_map = result[0];
					if(m_features.length === 0){
						$("#dataset_name").text("Sorry, we can not calculate a gender gap of this dataset!");
						$("#detail_div").css("display", "none");
					}else{
						var polygon ='';
						if(m_features.length === 1){
							polygon = m_features[0].geometry.coordinates;
						}else{
							polygon = nodata_feature.features[0].geometry.coordinates;
						}

						var data_key = "value";
						$("#detail_div").css("display", "block");
						$("#dataset_name").text(selected_data_text);
						MAXVALUE = 0;
						MINVALUE = 10000000;
						if(m_features[0].properties.calc === 'GPI' || m_features[0].properties.calc === 'Ratio' || m_features[0].properties.calc === 'Both'){

							for(var i=0; i<m_features.length; i++){
								m_indicator_data.push(m_features[i].properties.value);
								m_indices_areas_data.push(m_features[i].properties.area_name);
								data_unit = 'GPI';

								for(var j=0; j<f_features.length; j++){
									m_indicator_data.push(m_features[i].properties.value);
									m_indices_areas_data.push(m_features[i].properties.area_name);
									if(m_features[i].properties.area_name === f_features[j].properties.area_name){
										if(m_features[i].properties.calc === 'GPI' || m_features[i].properties.calc === 'Ratio' || m_features[i].properties.calc === 'Both'){
											var gap = 'No Data';
											if(m_features[i].properties.value > 0 && f_features[i].properties.value > 0){
												gap = f_features[j].properties.value / m_features[i].properties.value;
												val_arr.push(gap);
												val_total += gap;
												if(MAXVALUE < gap){
													MAXVALUE = gap;
												}
												if(MINVALUE > gap){
													MINVALUE = gap;
												}
												genderGap_data.push(gap);
												genderGap_area_data.push(m_features[i].properties.area_name);

											}else{
												gap = 'No Data';
											}
											gender_gap_map.features[i]["properties"]["value"] = gap;
											gender_gap_map.features[i]["properties"]["data"] = 'Gender Gap';
											gender_gap_map.features[i]["properties"]["unit"] = 'GPI';
										}
									}
								}
							}

							MEAN = val_total / gender_gap_map.features.length;
							STD = $scope.dev(val_arr);

							if(data_unit.toLowerCase() === 'percentage'){
								MAXVALUE = 100;
								MINVALUE = 0;
								// Range Value
								RANGEVALUE = MAXVALUE- MINVALUE;
								INTERVAL = RANGEVALUE / 5;
								CLASS_1 = MINVALUE + INTERVAL;
								CLASS_2 = CLASS_1 + INTERVAL;
								CLASS_3 = CLASS_2 + INTERVAL;
								CLASS_4 = CLASS_3 + INTERVAL;
							}else if(data_unit.toLowerCase() === 'index' || data_unit.toLowerCase() === 'ratio'){
								MAXVALUE = 1;
								MINVALUE = 0;
								// Range Value
								RANGEVALUE = MAXVALUE- MINVALUE;
								INTERVAL = RANGEVALUE / 5;
								CLASS_1 = MINVALUE + INTERVAL;
								CLASS_2 = CLASS_1 + INTERVAL;
								CLASS_3 = CLASS_2 + INTERVAL;
								CLASS_4 = CLASS_3 + INTERVAL;
							}else if(data_unit.toLowerCase() === 'number'){
								MAXVALUE = MAXVALUE;
								MINVALUE = MINVALUE;
								// Range Value
								RANGEVALUE = MAXVALUE- MINVALUE;
								INTERVAL = RANGEVALUE / 5;
								CLASS_1 = MINVALUE + INTERVAL;
								CLASS_2 = CLASS_1 + INTERVAL;
								CLASS_3 = CLASS_2 + INTERVAL;
								CLASS_4 = CLASS_3 + INTERVAL;
							}
							else{
								if((MEAN - STD) < MINVALUE ){
									CLASS_1 = (MEAN - (STD/2));
								}else{
									CLASS_1 = (MEAN - STD);
								}
								CLASS_2 = MEAN;
								CLASS_3 = (MEAN + STD);
								CLASS_4 = MAXVALUE;
							}

							CLASS_1 = CLASS_1.toFixed(3);
							CLASS_2 = CLASS_2.toFixed(3);
							CLASS_3 = CLASS_3.toFixed(3);
							CLASS_4 = CLASS_4.toFixed(3);

							// selected_data_text = $("#dataset-dropdown").find('option:selected').attr('data-dataset_name_l1') + "-" + $("#dataset-dropdown").find('option:selected').attr('data-content') + "- Gender Gap " + year;
							selected_data_text = $("#dataset-dropdown").find('option:selected').attr('data-dataset_name_l1') + "- Gender Gap " + year;
							//layer classes
							$scope.layerClasses(gender_gap_map.features, data_key, data_unit);
							//update a map legend
							$scope.genMapLegend(data_unit);

							Highcharts.chart('bar-chart-container', {
								chart: {
									type: 'column',
									style: {
										fontFamily: 'Roboto'
									}
								},
								title: {
									text: selected_data_text.toUpperCase()
								},
								subtitle: {
									text: $("#adm0_dropdown").find('option:selected').text().toUpperCase()
								},
								xAxis: {
									categories: genderGap_area_data,
									crosshair: true
								},
								yAxis: {
									min: 0,
									title: {
										text: data_unit
									}
								},
								credits: {
									enabled: false
								},
								tooltip: {
									headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
									pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
									'<td style="padding:0"><b>{point.y:.1f} </b></td></tr>',
									footerFormat: '</table>',
									shared: true,
									useHTML: true
								},
								plotOptions: {
									column: {
										pointPadding: 0.1,
										borderWidth: 0
									}
								},
								series: [{
									color: chart_color,
									name: selected_data_text,
									data: genderGap_data

								}]
							});

							var hoveredStateId = null;
							map.addSource('admin_gii', {
								'type': 'geojson',
								'data': gender_gap_map
							});
							map.addLayer({
								'id': 'admin_gii',
								'type': 'fill',
								'source': 'admin_gii',
								'paint': {
									'fill-color': ['get', 'color'],
									'fill-opacity': [
										'case',
										['boolean', ['feature-state', 'hover'], false],
										1,
										0.8
									],

								},

							}, 'settlement-label');
							// Add a black outline around the polygon.
							map.addLayer({
								'id': 'outline',
								'type': 'line',
								'source': 'admin_gii',
								'layout': {},
								'paint': {
									'line-color': [
										'case',
										['boolean', ['feature-state', 'hover'], false],
										'#f8b600',
										'#FFF'
									],
									'line-width': [
										'case',
										['boolean', ['feature-state', 'hover'], false],
										2,
										0.5
									],
								}
							});

							map.addLayer(
								{
									'id': 'admin-highlighted',
									'type': 'fill',
									'source': 'admin_gii',
									'paint': {
										'fill-color': ['get', 'color'],
										'fill-outline-color': '#f8b600',
										'fill-opacity': 1,
									},
									'filter': ['in', 'area_id', '']
								}
							);

							// Add a black outline around the polygon.
							map.addLayer({
								'id': 'admin-outline-highlighted',
								'type': 'line',
								'source': 'admin_gii',
								'layout': {},
								'paint': {
									'line-color': '#f8b600',
									'line-width': 2,
								},
								'filter': ['in', 'area_id', '']
							});

							// When the user moves their mouse over the state-fill layer, we'll update the
							// feature state for the feature under the mouse.
							map.on('mousemove', 'admin_gii', function (e) {
								var feature = e.features[0];
								if (e.features.length > 0) {
									if (hoveredStateId !== null) {
										map.setFeatureState(
											{ source: 'admin_gii', id: hoveredStateId },
											{ hover: false }
										);
									}
									hoveredStateId = feature.id;
									map.setFeatureState(
										{ source: 'admin_gii', id: hoveredStateId },
										{ hover: true  }
									);
								}
								// Display a popup with the name of the county.
								if(feature.properties[data_key] === 'No Data'){

									popup
									.setLngLat(e.lngLat)
									.setHTML(
										'<h4>'+feature.properties.area_name+'</h4>' +
										'<p>' +
										selected_data_text + ":     "+feature.properties[data_key] +
										'</p>'
									)
									.addTo(map);

								}else{
									popup
									.setLngLat(e.lngLat)
									.setHTML(
										'<h4>'+feature.properties.area_name+'</h4>' +
										'<p>' +
										selected_data_text + ":     "+feature.properties[data_key].toFixed(2) +
										'</p>'
									)
									.addTo(map);
								}
							});
							// When the mouse leaves the state-fill layer, update the feature state of the
							// previously hovered feature.
							map.on('mouseleave', 'admin_gii', function () {
								map.getCanvas().style.cursor = '';
								popup.remove();
								if (hoveredStateId !== null) {
									map.setFeatureState(
										{ source: 'admin_gii', id: hoveredStateId },
										{ hover: false }
									);
								}
								hoveredStateId = null;
							});

						}else{
							$("#dataset_name").text("Sorry, we can not calculate a gender gap of this dataset!");
							$("#detail_div").css("display", "none");
						}
					}
					$scope.showSpinner = false;
				});
			}
		});
	};

	$scope.getCountryMap = function (id) {
		var params= {
			country_id: id,
		};
		APIService.getCountryMap(params)
		.then(function (result){
			nodata_feature = result[0];
			$scope.nodataMap();
		});
	};
	$scope.getCountryMap(country_id);

	$scope.getAdm0 = function () {
		APIService.getAdm0()
		.then(function (result){
			var items = result[0].features;
			$.each(items, function (i, item) {
				$("#adm0_dropdown").append('<option value="'+item["properties"]["id_0"]+'">'+item["properties"]["name_0"]+'</option>');
			});
		});
		$("#adm0_dropdown").trigger("change");
	};
	$scope.getAdm0();

	$scope.getAdm1 = function (id) {
		var params= {
			adm1_id: id,
		};
		APIService.getAdm1(params)
		.then(function (result){
			var items = result[0].features;
			$("#adm1_dropdown").append('<option value="9999">All</option>');
			$.each(items, function (i, item) {
				$("#adm1_dropdown").append('<option value="'+item["properties"]["area_id"]+'">'+item["properties"]["name_1"]+'</option>');
			});
		});
	};
	$scope.getAdm1(40);

	$scope.clearMapLayer = function() {
		try {
			map.removeLayer('admin_gii');
			map.removeLayer('outline');
			map.removeLayer('admin-highlighted');
			map.removeLayer('admin-outline-highlighted');
			map.removeSource('admin_gii');
		}
		catch(err) {
			console.log("not");
		}
	};

	$scope.clearCountryMapLayer = function() {
		map.removeLayer('nodata_outline');
		map.removeLayer('nodata_map');
		map.removeSource('nodata_map');
	};

	$("#adm0_dropdown").change(function(){
		$("#by_gender_gap").removeClass("active");
		$scope.showSpinner = true;
		area_id = this.value;
		area_id = '9999';
		country_id=this.value;
		$scope.clearMapLayer();
		$scope.clearCountryMapLayer();
		$scope.getCountryMap(country_id);
		$scope.getMainSector();
		$("#adm1_dropdown").html("");
		$scope.getAdm1(country_id);
	});

	$("#adm1_dropdown").change(function(){
		$("#by_gender_gap").removeClass("active");
		$scope.showSpinner = true;
		area_id = "'"+this.value+"'";
		admin_level = "province";
		if(this.value === '9999'){
			area_id = '9999';
		}
		$scope.clearMapLayer();
		$scope.getMap();
	});

	$("#main-sector-dropdown").change(function(){
		$scope.showSpinner = true;
		$("#by_gender_gap").removeClass("active");
		var selected = $(this).find('option:selected').val();
		selected_data = selected;
		selected_data_text = $(this).find('option:selected').text();
		data_lvl ='idx';
		$scope.getDatasetL1(selected_data);
	});

	$("#dataset-dropdown").change(function(){
		$("#by_gender_gap").removeClass("active");
		var selected = $(this).find('option:selected').val();
		var dataset_name_l2 = $(this).find('option:selected').text();
		selected_data_text =  dataset_name_l2 + " " + year;
		$("#dataset_name").text(selected_data_text);
		$("#dataset_definition").text($(this).find('option:selected').attr('data-definition')+ ' in ' + year);
		data_lvl ='idc';
		dataset_id = selected;
		if(init === true){
			$scope.check_data();
		}else{
			$scope.check_data();
		}
		init = false;
	});

	$("#data_level_country").click(function(){
		$("#data_level_province").removeClass("active");
		$(this).addClass("active");
		admin_level = 'country';
		$scope.clearMapLayer();
		$scope.check_available_year();
	});

	$("#data_level_province").click(function(){
		if($("#adm1_dropdown").val() === '9999'){
			area_id = '9999';
		}
		$("#data_level_country").removeClass("active");
		$(this).addClass("active");
		admin_level = 'province';
		$scope.clearMapLayer();
		$scope.check_available_year();
	});

	$("#by_gender_gap").click(function(){
		$("#by_gender_female").removeClass("active");
		$("#by_gender_male").removeClass("active");
		$("#by_gender_total").removeClass("active");
		$(this).addClass("active");
		$scope.clearMapLayer();
		$scope.calGenderGap();
	});

	$("#by_gender_female").click(function(){
		$("#by_gender_gap").removeClass("active");
		$("#by_gender_male").removeClass("active");
		$("#by_gender_total").removeClass("active");
		$(this).addClass("active");
		by_gender = "Female";
		$scope.clearMapLayer();
		$scope.check_available_year();
	});

	$("#by_gender_male").click(function(){
		$("#by_gender_gap").removeClass("active");
		$("#by_gender_female").removeClass("active");
		$("#by_gender_total").removeClass("active");
		$(this).addClass("active");
		by_gender = "Male";
		$scope.clearMapLayer();
		$scope.check_available_year();
	});

	$("#by_gender_total").click(function(){
		$("#by_gender_gap").removeClass("active");
		$("#by_gender_female").removeClass("active");
		$("#by_gender_male").removeClass("active");
		$(this).addClass("active");
		by_gender = "Total";
		$scope.clearMapLayer();
		$scope.check_available_year();
	});

});
