
'use strict';
angular.module('baseApp')
.controller('mapcontroller' ,function ($scope, $timeout, APIService) {

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

	var selected_country_center = [103, 15.5];
	var selected_country_southWest = [95,5];
	var selected_country_northEast = [110,28];
	var filter = null;
	var selected_features = ['in', 'area_id'];
	var area_id = '9999';
	var admin_level = 'country';
	var country_id = '';
	var selected_data = 'gii'; //default
	var data_lvl = 'idx';
	var data_unit = 'Index';
	var by_gender = 'female';
	var selected_data_text = 'Gender Inequality Index';
	var legend_colors = [];
	var legend_label = [];
	var year = 2019;
	var data_key = '';
	var common_id = '';
	var indicator_id = '';
	var featureClicked = false;
	var nodata_feature = '';
	var MainGIISector = [];
	var MainGIISectorDes = [];
	var colors = ['#FF7B89', '#8A5082', '#6F5F90', '#758EB7', '#A5CAD2', '#381460', '#A278B5', '#413C69', '#003F5C'];
	var send=true;
	var datepicker_start = $("#start").val();
	var datepicker_end = $("#end").val();
	var gii_feature;
	$scope.showDivDimensionChart= false;
	$scope.showLineChart= true;
	$scope.giiDetail = false;
	$("#gii_text_detial").css("display", "none");
	$scope.showSpinner = true;
	var adm1_feature = '';
	var area_name  = '';
	var check_data_level = 'gii';
	var data_id = '';
	var unique_indicator_id = '';
	var drowdown_country = "'154','228','40','250','123'";
	var chart_desc = "";
	$scope.showGIICharts = true;
	$scope.showDIVChartDesc = true;
	var chart_spider_series_female =  [];
	var chart_spider_series_male =  [];
	var _map_clicked = '';
	var _map_clicked_name = '';
	$scope.showGIISpider = false;

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
	var class_no = '5';
	var mapcolor = {
		// '5': {
		// 	'male':['#BDC9E1','#74A9CF','#2B8CBE','#045A8D'],
		// 	'female':['#D7B5D8','#DF65B0','#DD1C77','#980043'],
		// 	'none':['#CBC9E2','#9E9AC8','#756BB1','#54278F'],
		// 	'ratio':['#CBC9E2','#9E9AC8','#756BB1','#54278F'],
		// 	'index':['#CBC9E2','#9E9AC8','#756BB1','#54278F'],
		// },
		'5': {
			'male': ['#ECE7F2', '#A6BDDB', '#3690C0', '#045A8D', '#013553'],
			'female': ['#E7E1EF', '#C994C7',  '#E7298A', '#980043', '#56051D'],
			'none': ['#EFEDF5', '#BCBDDC', '#807DBA', '#6A51A3', '#390967'],
			'ratio': ['#EFEDF5', '#BCBDDC', '#807DBA', '#6A51A3', '#390967'],
			'index': ['#EFEDF5', '#BCBDDC', '#807DBA', '#6A51A3', '#390967'],
		},
		'6': {
			'male': ['#D0D1E6',  '#A6BDDB', '#74A9CF', '#3690C0', '#0570B0', '#034E7B'],
			'female': ['#D4B9DA', '#C994C7', '#DF65B0', '#E7298A', '#CE1256', '#91003F'],
			'none': ['#DADAEB', '#BCBDDC', '#9E9AC8', '#807DBA', '#6A51A3', '#4A1486'],
			'ratio': ['#DADAEB', '#BCBDDC', '#9E9AC8', '#807DBA', '#6A51A3', '#4A1486'],
			'index': ['#DADAEB', '#BCBDDC', '#9E9AC8', '#807DBA', '#6A51A3', '#4A1486'],
		},
		'7': {
			'male': ['#ECE7F2', '#D0D1E6', '#A6BDDB', '#74A9CF', '#3690C0', '#0570B0', '#034E7B'],
			'female': ['#ECE7F2', '#D4B9DA', '#C994C7', '#DF65B0', '#E7298A', '#CE1256', '#91003F'],
			'none': ['#ECE7F2', '#DADAEB', '#BCBDDC', '#9E9AC8', '#807DBA', '#6A51A3', '#4A1486'],
			'ratio': ['#ECE7F2', '#DADAEB', '#BCBDDC', '#9E9AC8', '#807DBA', '#6A51A3', '#4A1486'],
			'index': ['#ECE7F2', '#DADAEB', '#BCBDDC', '#9E9AC8', '#807DBA', '#6A51A3', '#4A1486'],
		},
		'8': {
			'male': ['#ECE7F2', '#D0D1E6', '#A6BDDB', '#74A9CF', '#3690C0', '#0570B0', '#045A8D', '#023858'],
			'female': ['#E7E1EF', '#D4B9DA', '#C994C7', '#DF65B0', '#E7298A', '#CE1256', '#980043', '#67001F'],
			'none': ['#EFEDF5', '#DADAEB', '#BCBDDC', '#9E9AC8', '#807DBA', '#6A51A3', '#54278F', '#3F007D'],
			'ratio': ['#EFEDF5', '#DADAEB', '#BCBDDC', '#9E9AC8', '#807DBA', '#6A51A3', '#54278F', '#3F007D'],
			'index': ['#EFEDF5', '#DADAEB', '#BCBDDC', '#9E9AC8', '#807DBA', '#6A51A3', '#54278F', '#3F007D'],
		},
		'9': {
			'male': ['#ECE7F2', '#D0D1E6', '#A6BDDB', '#74A9CF', '#3690C0', '#0570B0', '#045A8D', '#023858', '#013553'],
			'female': ['#E7E1EF', '#D4B9DA', '#C994C7', '#DF65B0', '#E7298A', '#CE1256', '#980043', '#67001F', '#56051D'],
			'none': ['#EFEDF5', '#DADAEB', '#BCBDDC', '#9E9AC8', '#807DBA', '#6A51A3', '#54278F', '#3F007D', '#390967'],
			'ratio': ['#EFEDF5', '#DADAEB', '#BCBDDC', '#9E9AC8', '#807DBA', '#6A51A3', '#54278F', '#3F007D', '#390967'],
			'index': ['#EFEDF5', '#DADAEB', '#BCBDDC', '#9E9AC8', '#807DBA', '#6A51A3', '#54278F', '#3F007D', '#390967'],
		},

	};

	$("#guide-btn").click();
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
			area_id = '9999';
			$("#adm1_dropdown").val("9999");
			hideGIICharts();
			selected_features = ['in', 'area_id'];
			chart_spider_series_female = [];
			chart_spider_series_male = [];
			$scope.updateMap();
		}
	});


	$('#datepicker').datepicker({
		format: "yyyy",
		viewMode: "years",
		minViewMode: "years",
		keyboardNavigation: false,
		forceParse: false,
		autoclose: true,
		orientation: "bottom auto",
	}).on("changeDate", function(e) {
		if(send){
			datepicker_start = $("#start").val();
			datepicker_end = $("#end").val();
			$scope.getLineChartData();
			send=false;
		}
		setTimeout(function(){send=true;},200);
	});

	$scope.layerClasses = function(features, data_key) {
		if(data_key === 'gii'){
			for(var i=0; i<features.length; i++){
				if(features[i]["properties"][data_key] < CLASS_1){
					features[i]["properties"]["color"] = mapcolor[class_no][by_gender][4];
				}else if(features[i]["properties"][data_key] < CLASS_2){
					features[i]["properties"]["color"] = mapcolor[class_no][by_gender][3];
				}else if(features[i]["properties"][data_key] < CLASS_3){
					features[i]["properties"]["color"] = mapcolor[class_no][by_gender][2];
				}else if(features[i]["properties"][data_key] < CLASS_4){
					features[i]["properties"]["color"] = mapcolor[class_no][by_gender][1];
				}else if(features[i]["properties"][data_key] >= CLASS_4){
					features[i]["properties"]["color"] = mapcolor[class_no][by_gender][0];
				}
			}
		}else{
			for(var j=0; j<features.length; j++){
				if(features[j]["properties"][data_key] < CLASS_1){
					features[j]["properties"]["color"] = mapcolor[class_no][by_gender][0];
				}else if(features[j]["properties"][data_key] < CLASS_2){
					features[j]["properties"]["color"] = mapcolor[class_no][by_gender][1];
				}else if(features[j]["properties"][data_key] < CLASS_3){
					features[j]["properties"]["color"] = mapcolor[class_no][by_gender][2];
				}else if(features[j]["properties"][data_key] < CLASS_4){
					features[j]["properties"]["color"] = mapcolor[class_no][by_gender][3];
				}else if(features[j]["properties"][data_key] >= CLASS_4){
					features[j]["properties"]["color"] = mapcolor[class_no][by_gender][4];
				}
			}
		}
	};

	$scope.genMapLayer = function() {
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
				// Get the `fill-extrusion-color` from the source `color` property.
				'fill-color': ['get', 'color'],
				//'fill-extrusion-color': '#000',
				// Make extrusions slightly opaque to see through indoor walls.
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
					' #980043',
					'#FFF'
				],
				'line-width': [
					'case',
					['boolean', ['feature-state', 'hover'], false],
					2,
					1
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
					'fill-outline-color': ' #980043',
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
				'line-color': ' #980043',
				'line-width': 1,
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
			popup
			.setLngLat(e.lngLat)
			.setHTML(
				'<h4>'+feature.properties.area_name+'</h4>' +
				'<p>' +
				selected_data_text + ":     "+feature["properties"][data_key].toFixed(2)+
				'</p>'
			)
			.addTo(map);
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

	};

	$scope.genMapLegend = function(data_unit) {
		var mapcolor = {
			'5': {
				'male': ['#ECE7F2', '#A6BDDB', '#3690C0', '#045A8D', '#013553'],
				'female': ['#E7E1EF', '#C994C7',  '#E7298A', '#980043', '#56051D'],
				'none': ['#EFEDF5', '#BCBDDC', '#807DBA', '#6A51A3', '#390967'],
				'ratio': ['#EFEDF5', '#BCBDDC', '#807DBA', '#6A51A3', '#390967'],
				'index': ['#EFEDF5', '#BCBDDC', '#807DBA', '#6A51A3', '#390967'],
			}
		};
		// if(CLASS_1 === CLASS_4){
		// 	legend_label = [
		// 		'' + CLASS_4.toString(),
		// 		'No Data',
		// 	];

		// 	if(by_gender === 'male'){
		// 		legend_colors = [
		// 			'#024E72',
		// 			'#B9B9B9',
		// 		];
		// 	}else if(by_gender === 'female'){
		// 		legend_colors = [
		// 			'#AE1857',
		// 			'#B9B9B9',
		// 		];
		// 	}else{
		// 		legend_colors = [
		// 			'#52006A',
		// 			'#B9B9B9',
		// 		];
		// 	}
		// }else{
		// 	legend_label = [
		// 		'< '+ CLASS_1.toString(),
		// 		CLASS_1.toString() + ' - '+ CLASS_2.toString(),
		// 		CLASS_2.toString() + ' - '+ CLASS_3.toString(),
		// 		CLASS_3.toString() + ' - '+ CLASS_4.toString(),
		// 		'> ' + CLASS_4.toString(),
		// 		'No Data',
		// 	];

		// 	if(by_gender === 'male'){
		// 		legend_colors = mapcolor[class_no]["male"];
		// 	}else if(by_gender === 'female'){
		// 		legend_colors = mapcolor[class_no]["female"];
		// 	}else{
		// 		legend_colors = mapcolor[class_no]["none"].reverse();
		// 	}
		// }

		legend_label = [
			'< '+ CLASS_1.toString(),
			CLASS_1.toString() + ' - '+ CLASS_2.toString(),
			CLASS_2.toString() + ' - '+ CLASS_3.toString(),
			CLASS_3.toString() + ' - '+ CLASS_4.toString(),
			'> ' + CLASS_4.toString(),
			'No Data',
		];

		if(by_gender === 'male'){
			legend_colors = mapcolor[class_no]["male"];
		}else if(by_gender === 'female'){
			legend_colors = mapcolor[class_no]["female"];
		}else{
			legend_colors = mapcolor[class_no]["none"].reverse();
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
				'line-width': 0.2,
			}
		});
	};

	$scope.showChartDesc = function() {
		var dataType = $("#gii_dimension_dropdown").find('option:selected').val();
		$("#selected_dimension_name").html("");
		$("#selected_country_name").html("");
		$("#chart-desc2").html("");
		$("#chart-desc").html("");
		$("#chart_instruction").html("");

		var dimension_desc = {
			'ALL' : "The calculation of GII at sub-national level varies slightly according to the availability of data. It is important to note that in countries where data is available such as Cambodia, Lao PDR and Vietnam, we add an additional dimension to the GII, i.e. ‘gender based violence’ because it reflects social norms and gender status, a crucial measurement of gender inequality. In Cambodia, we also add intra-household power dynamics to empowerment dimension.",

			'Cambodia' : {
				"Reproductive health": ["This dimension is measured by maternal mortality ratio (MMR) and adolescent birth rates. Maternal mortality refers to death due to complications from pregnancy or childbirth. Higher maternal mortality suggests poorer maternal health. It also shows the ability of a country to create conditions and support for maternal health (Human Development Index, 2014). Women who give birth in their early age are at high risks of complications and even death during pregnancy and birth. Adolescent birth rate indicates accessibility to reproductive healthcare among young women. It also implies challenges for them in accessing opportunities for social and economic improvement (WHO).",
				"How to read Reproductive Health Index (RHI) value: Unlike the value of GII, the closer RHI to 0, the less accessibility to reproductive health care among women, particularly the adolescents.  The RHI also indicates multiple implications to their health, wellbeing and opportunities to thrive socially and economically. It’s important to note that as this dimension uses women-specific datasets, male reproductive health index is always represented as 1."],
				"Empowerment": ["This dimension is measured by three aspects: political participation, education, and intra-household decision-making. Specifically, it used data on 1) proportion of women/men in parliament, 2) progression to secondary school of women/men, and 3) the ability of married-women in making decisions regarding large purchase, their own healthcare and visiting family and friends. The sub-national GII of Cambodia is unique and more thorough as it incorporates power dynamics at domestic sphere.",
				"How to read Empowerment Index (EI) value: the closer EI value to 0, the lower status women face in public and domestic domains, partly caused by their lack of access to education."],
				"Labour Force": ["This dimension is measured by employment opportunities open to women and men in labour market, using data on the percentage of women/men who are employed, or actively seeking employment (labour force participation rate, LFPR). ",
				"How to read Labour Index (LI) value: The closer LI to 0, the less employment for women in labour market. It is important to note that LFPR data does not reflect the quality of employment such as working conditions, fair and decent wage, social protections to workers. For example, even though women have increasingly engaged in paid employment, they might be crowed in low-skilled and precarious jobs."],
				"Violence": ["This dimension is measured by the perception of domestic violence. Specifically, it uses data on 1) population aged 15-49 who believe a husband is justified in beating his wife/partner with at least one specified reason, and 2) women who agree that a husband is justified in beating his wife for any specific reason. GBV reflects social norms and collective mindsets toward the status and roles of women and men. Therefore, the inclusion of GBV dimension in GII captures situation of gender inequality more thoroughly. In Cambodia, the data on GBV was collected among female respondents only, hence reflecting the level of internalized subordination among women. GBV is a unique feature of sub-national GII in Cambodia.",
				"How to read GBV Index value: The closer GBV index to 0, the more acceptance of the society toward domestic violence, and the more internalization of women to their subordinating social status to men. It calls attention to underlying causes of gender inequality rooted in social structures and public mindsets that need to be changed."],

			},
			'Laos' : {
				"Reproductive health": ["This dimension is measured by maternal mortality ratio (MMR) and adolescent birth rates. Maternal mortality refers to death due to complications from pregnancy or childbirth. Higher maternal mortality suggests poorer maternal health. It also shows the ability of a country to create conditions and support for maternal health (Human Development Index, 2014). Women who give birth in their early age are at high risks of complications and even death during pregnancy and birth. Adolescent birth rate indicates accessibility to reproductive healthcare among young women. It also implies challenges for them in accessing opportunities for social and economic improvement (WHO).",
				"How to read Reproductive Health Index (RHI) value: Unlike the value of GII, the closer RHI to 0, the less accessibility of women, particularly the adolescents to reproductive health care.  The RHI also indicates multiple implications to their health, wellbeing and opportunities to thrive socially and economically. It’s important to note that as this dimension uses women-specific datasets, male reproductive health index is always represented as 1."],
				"Empowerment": ["This dimension is measured by political participation and education attainment. Specifically, it used data on 1) proportion of women in parliament seats, and 2) progression to secondary school of women/men.",
				"How to read Empowerment Index (EI) value: the closer EI value to 0, the less space for women in political sphere, partly caused by their lack of access to education."],
				"Labour Force": ["This dimension is measured by employment opportunities open to women and men in labour market, using data on the percentage of women/men who are employed, or actively seeking employment (labour force participation rate, LFPR). ",
				"How to read Labour Index (LI) value: The closer LI to 0, the less employment opportunities for women in labour market. It is important to note that LFPR data does not reflect the quality of employment such as working conditions, fair and decent wage, social protections to workers. For example, even though women have increasingly engaged in paid employment, they might be crowed in low-skilled and precarious jobs."],
				"Violence": ["This dimension is measured by the perception of domestic violence. Specifically, it uses data on population aged 15-49 who believe a husband is justified in beating his wife/partner if she goes out without telling him or neglects the children or argues with him or refuses sex with him or burns the food. GBV reflects social norms and collective mindsets toward the status and roles of women and men. Therefore, the inclusion of GBV dimension in GII captures situation of gender inequality more thoroughly. In Lao PDR, the data on GBV was collected among female respondents only, hence reflecting the level of internalized subordination among women. GBV is a unique feature of sub-national GII in Laos. ",
				"How to read GBV Index value: The closer GBV index to 0, the more acceptance of the society toward domestic violence, and the more internalization of women to their subordinating social status to men. It calls attention to underlying causes of gender inequality rooted in social structures and public mindsets that need to be changed."],

			},
			'Myanmar' : {
				"Reproductive health": ["This dimension is measured by maternal mortality ratio (MMR) and adolescent fertility rates (AFR). Maternal mortality refers to death due to complications from pregnancy or childbirth. Higher maternal mortality suggests poorer maternal health. It also shows the ability of a country to create conditions and support for maternal health (Human Development Index, 2014). Women who give birth in their early age are at high risks of complications and even death during pregnancy and birth. AFR indicates accessibility to reproductive healthcare among young women. It also implies challenges for them in accessing opportunities for social and economic improvement (WHO).",
				"How to read Reproductive Health Index (RHI) value: Unlike the value of GII, the closer RHI to 0, the less accessibility of women, particularly the adolescents to reproductive health care.  The RHI also indicates multiple implications to their health, wellbeing and opportunities to thrive socially and economically. It’s important to note that as this dimension uses women-specific datasets, male reproductive health index is always represented as 1."],
				"Empowerment": ["This dimension is measured by political participation and education attainment. Specifically, it used data on 1) proportion of women in parliament seats, and 2) enrolment rate to secondary school among women/men.",
				"How to read Empowerment Index (EI) value: the closer EI value to 0, the less space for women in political arene, partly caused by their access to education."],
				"Labour Force": ["This dimension is measured by employment opportunities open to women and men in labour market, using data on the percentage of women/men who are employed, or actively seeking employment (labour fource participation rate, LFPR). ",
				"How to read Labour Index (LI) value: The closer LI to 0, the less employment opportunities for women in labour market. It is important to note that LFPR data does not reflect the quality of employment such as working conditions, fair and decent wage, social protections to workers. For example, even though women have increasingly engaged in paid employment, they might be crowed in low-skilled and precarious jobs."],
				"Violence": ["",
				""],

			},
			'Thailand' : {
				"Reproductive health": ["This dimension is measured by maternal mortality ratio (MMR) and adolescent birth rates. Maternal mortality refers to death due to complications from pregnancy or childbirth. Higher maternal mortality suggests poorer maternal health. It also shows the ability of a country to create conditions and support for maternal health (Human Development Index, 2014). Women who give birth in their early age are at high risks of complications and even death during pregnancy and birth. Adolescent birth rate indicates accessibility to reproductive healthcare among young women. It also implies challenges for them in accessing opportunities for social and economic improvement (WHO).",
				"How to read Reproductive Health Index (RHI) value: Unlike the value of GII, the closer RHI to 0, the less accessibility of women, particularly the adolescents to reproductive health care.  The RHI also indicates multiple implications to their health, wellbeing and opportunities to thrive socially and economically. It’s important to note that as this dimension uses women-specific datasets, male reproductive health index is always represented as 1."],
				"Empowerment": ["This dimension is measured by political participation and education attainment. Specifically, it used data on 1) proportion of women in parliament seats, and 2) secondary school attainment of women/men.",
				"How to read Empowerment Index (EI) value: the closer EI value to 0, the less space for women in political arene, partly caused by their educational level."],
				"Labour Force": ["This dimension is measured by employment opportunities open to women and men in labour market, using data on the percentage of women/men who are employed, or actively seeking employment (labour fource participation rate, LFPR). ",
				"How to read Labour Index (LI) value: The closer LI to 0, the less employment opportunities for women in labour market. It is important to note that LFPR data does not reflect the quality of employment such as working conditions, fair and decent wage, social protections to workers. For example, even though women have increasingly engaged in paid employment, they might be crowed in low-skilled and precarious jobs."],
				"Violence": ["",
				""],

			},
			'Vietnam' : {
				"Reproductive health": ["This dimension is measured by maternal mortality ratio (MMR) and total fertility rate (TFR) . Maternal mortality refers to death due to complications from pregnancy or childbirth. Higher maternal mortality suggests poorer maternal health. It also shows the ability of a country to create conditions and support for maternal health (Human Development Index, 2014). TFR refers to the average number of children born to a woman over her reproductive years. The high TFR historically associates with poverty and the lack of access to contraceptive measures and reproductive healthcare.",
				"How to read Reproductive Health Index (RHI) value: Unlike the value of GII, the closer RHI to 0, the less accessibility of women to reproductive health care.  The RHI also indicates multiple implications to their health, wellbeing and opportunities to thrive socially and economically. It’s important to note that as this dimension uses women-specific datasets, male reproductive health index is always represented as 1."],
				"Empowerment": ["This dimension is measured by political participation and education attainment. Specifically, it used data on 1) proportion of women in parliament seats, and 2) attendance to secondary school of women/men.",
				"How to read Empowerment Index (EI) value: the closer EI value to 0, the less space for women in political arene, partly caused by their lack of access to education."],
				"Labour Force": ["This dimension is measured by employment opportunities open to women and men in labour market, using data on the percentage of women/men who are employed, or actively seeking employment (labour fource participation rate, LFPR). ",
				"How to read Labour Index (LI) value: The closer LI to 0, the less employment opportunities for women in labour market. It is important to note that LFPR data does not reflect the quality of employment such as working conditions, fair and decent wage, social protections to workers. For example, even though women have increasingly engaged in paid employment, they might be crowed in low-skilled and precarious jobs."],
				"Violence": ["This dimension is measured by the perception of domestic violence. Specifically, it uses data on percentage of women aged 15-49 who believe a husband is justified in beating his wife/partner for any specific reason. GBV reflects social norms and collective mindsets toward the status and roles of women and men. Therefore, the inclusion of GBV dimension in GII captures situation of gender inequality more thoroughly. In Vietnam, the data on GBV was collected among female respondents only, hence reflecting the level of internalized subordination among women. GBV is a unique feature of sub-national GII in Vietnam. ",
				"How to read GBV Index value: The closer GBV index to 0, the more acceptance of the society toward domestic violence, and the more internalization of women to their subordinating social status to men. It calls attention to underlying causes of gender inequality rooted in social structures and public mindsets that need to be changed."],

			}

		};

		var selected_country_name = $("#adm0_dropdown").find('option:selected').text();
		var selected_country_id= $("#adm0_dropdown").find('option:selected').val();
		var selected_data = $("#gii_dimension_dropdown").find('option:selected').text();
		var chart_instruction = "";
		if(dataType === 'gii'){
			$scope.showDIVChartDesc = true;
			chart_desc = "This graph compares gender inequality among the Mekong countries in "+year+". The higher index value, the less equal women in the countries experience.";
			chart_instruction = "To view the graphs for one or multiple locations, you need to define administrative unit to be shown in the map by clicking on button ‘BY COUNTRY’ or ‘BY PROVINCE’ located above the map. Then you can select the location(s) by clicking on the map.";
			if(admin_level === 'province'){
				if(selected_country_id === '9999'){
					chart_desc = "This graph illustrates the state of gender inequality between sub-national administrative units in Mekong countries in "+year+". The higher index value, the less equal women in the countries experience.";
				}else{
					chart_desc = "This graph illustrates the state of gender inequality between sub-national administrative units in "+selected_country_name+" in "+year+". The higher index value, the less equal women in the countries experience.";
				}
			}else{
				if(selected_country_id === '9999'){
					chart_desc = "This graph illustrates the state of gender inequality among the Mekong countries in Mekong countries in "+year+". The higher index value, the less equal women in the countries experience.";
				}else{
					chart_desc = "This graph illustrates the state of gender inequality in "+selected_country_name+" in "+year+". The higher index value, the less equal women in the countries experience.";
				}
			}
		}else{
			chart_instruction  = "To generate the graphs on "+selected_data+" for one or multiple locations, you need to define administrative unit to be shown in the map by clicking on button ‘BY COUNTRY’ or ‘BY PROVINCE’ located above the map. Then you can select the location(s) by clicking on the map";
			$scope.showDIVChartDesc = true;
			$("#gii_text_detial").css("display", "none");
			if(selected_country_name === 'All'){
				chart_desc = "The calculation of GII at sub-national level varies slightly according to the availability of data. It is important to note that in countries where data is available such as Cambodia, Lao PDR and Vietnam, we add an additional dimension to the GII, i.e. ‘gender based violence’ because it reflects social norms and gender status, a crucial measurement of gender inequality. In Cambodia, we also add intra-household power dynamics to empowerment dimension.";
			}else{
				$("#selected_dimension_name").text(selected_data);
				$("#selected_country_name").text(selected_country_name);
				chart_desc = dimension_desc[selected_country_name][selected_data][0];
				var chart_desc2 = dimension_desc[selected_country_name][selected_data][1];
				$("#chart-desc2").text(chart_desc2);
				
			}
		}
		$("#chart-desc").text(chart_desc);
		$("#chart_instruction").text(chart_instruction);
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

	$scope.zoomtoCountry = function (id) {
		var params= {
			country_id: id,
		};
		APIService.getCountryMap(params)
		.then(function (result){
			var features = result[0].features;
			var polygon = features[0].geometry.coordinates;
			var fit = new L.Polygon(polygon).getBounds();
			var southWest = new mapboxgl.LngLat(fit['_southWest']['lat'], fit['_southWest']['lng']);
			var northEast = new mapboxgl.LngLat(fit['_northEast']['lat'], fit['_northEast']['lng']);
			map.fitBounds(new mapboxgl.LngLatBounds(southWest, northEast));
		});
	};

	$scope.getAdm0 = function () {
		APIService.getAdm0()
		.then(function (result){
			var adm0_feature = result[0];
			nodata_feature = adm0_feature;
			var items = result[0].features;
			$scope.nodataMap();
			$scope.showChartDesc();
			$.each(items, function (i, item) {
				$("#adm0_dropdown").append('<option value="'+item["properties"]["id_0"]+'">'+item["properties"]["name_0"]+'</option>');
			});
		});
	};


	$scope.getAdm1 = function (id) {
		var params= {
			adm1_id: id,
		};
		APIService.getAdm1(params)
		.then(function (result){
			adm1_feature = result[0];
			var items = result[0].features;
			$("#adm1_dropdown").append('<option value="9999">All</option>');
			$.each(items, function (i, item) {
				if(id === '9999'){
					$("#adm1_dropdown").append('<option value="'+item["properties"]["area_id"]+'">'+item["properties"]["name_0"]+'- '+item["properties"]["name_1"]+'</option>');
				}else{
					$("#adm1_dropdown").append('<option value="'+item["properties"]["area_id"]+'">'+item["properties"]["name_1"]+'</option>');
				}
			});
		});
	};



	$scope.getMainGIISector = function () {
		APIService.getMainGIISector()
		.then(function (result){
			$.each(result, function (i, item) {
				MainGIISector.push(item["common_id"]);
				MainGIISectorDes.push(item["common_desc"]);
				$("#gii_dimension_dropdown").append('<option value="'+item["common_id"]+'">&#8203;&#8203;&#8203;&#8203; GII dimension: '+item["common_desc"]+'</option>');
			});
		});
	};



	$scope.getGIIIndicators = function (id, dm) {
		var params= {
			id: id,
		};
		APIService.getGIIIndicators(params)
		.then(function (result){
			$("#gii_indicators_dropdown").html("");
			$("#gii_indicators_dropdown").append('<option value="9999">None</option>');
			if(dm !== "gii"){
				$.each(result, function (i, item) {
					$("#gii_indicators_dropdown").append('<option data-unit="'+item["unit"]+'" value="'+item["indicator_id"]+'">'+item["indicator_desc"]+'</option>');
				});
			}
		});
	};

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

	$scope.clearNodataLayer = function() {
		try {
			map.removeLayer('nodata_map');
			map.removeLayer('nodata_outline');
			map.removeSource('nodata_map');
		}
		catch(err) {
			console.log("not");
		}
	};


	$scope.giiData = [];


	$scope.getGiiDimensionGroup = function(index, area_id) {
		var params= {
			area_id: area_id,
			admin_level: admin_level,
			year: year
		};
		APIService.getDimensionGroup(params)
		.then(function (result){
			$scope.dimensionGroup = result;
			$scope.giiData[index]['dimensionGroup'] = result;
		});
	};


	$scope.getGiiDimensionData = function(index, area_id) {
		var params= {
			area_id: area_id,
			admin_level: admin_level,
			year: year
		};
		APIService.getDimensionData(params)
		.then(function (result){
			$scope.dimensionData = result;
			$scope.giiData[index]['dimensionData'] = result;
		});
	};


	$scope.getGiiIndicatorData= function(index, area_id) {
		var params= {
			area_id: area_id,
			admin_level: admin_level,
			year: year
		};
		APIService.getIndicatorData(params)
		.then(function (result){
			$scope.indicatorData = result;
			$scope.giiData[index]['indicatorData'] = result;
		});
	};

	$scope.getGiiIndicatorGroup= function(index, area_id) {
		var params= {
			area_id: area_id,
			admin_level: admin_level,
			year: year
		};
		APIService.getIndicatorGroup(params)
		.then(function (result){
			$scope.indicatorGroup = result;
			$scope.giiData[index]['indicatorGroup'] = result;
		});
	};


	$scope.genColChart= function(title, sub_title, y_axis_title, categories, series) {
		// Create the chart
		Highcharts.chart('col-chart-container', {
			chart: {
				type: 'column',
				options3d: {
					enabled: true,
					alpha: 15,
					beta: 25,
					depth: 50,
					viewDistance: 25
				},
				style: {
					fontFamily: 'Roboto'
				}
			},
			title: {
				text: title.toUpperCase(),
				style: {
					fontSize: 12
				}
			},
			subtitle: {
				text: sub_title
			},
			credits: {
				enabled: false
			},
			plotOptions: {
				column: {
					depth: 25
				}
			},
			yAxis: {
				title: {
					text: y_axis_title,
					x: -20
				},
				gridLineDashStyle: 'Dash'
			},
			xAxis: {
				categories: categories,
			},
			tooltip: {
				headerFormat: '<span style="font-size:11px">'+title+'</span><br>',
				pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}<br/>'
			},
			series: series,
			exporting: {
				buttons: {
				  contextButton: {
					menuItems: ["printChart",
								"separator",
								"downloadPNG",
								"downloadJPEG",
								"downloadPDF",
								"downloadSVG",
								"separator",
								"downloadCSV",
								"downloadXLS",
								//"viewData",
							]
				  }
				}
			  },

		});
	};

	$scope.genLineChart= function(title, sub_title, y_axis_title, series) {
		Highcharts.chart('line-chart-container', {
			chart: {
				type: 'spline',
				style: {
					fontFamily: 'Roboto'
				}
			},
			credits: {
				enabled: false
			},
			title: {
				text: title.toUpperCase(),
				style: {
					fontSize: 12
				}
			},
			subtitle: {
				text: datepicker_start + ' to ' + datepicker_end
			},
			yAxis: {
				title: {
					text: y_axis_title
				}
			},
			xAxis: {
				accessibility: {
					rangeDescription: 'Range: '+ datepicker_start + ' to ' + datepicker_end
				}
			},
			legend: {
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'middle'
			},
			plotOptions: {
				series: {
					label: {
						connectorAllowed: false
					},
					pointStart: parseInt(datepicker_start)
				}
			},
			series: series,
			exporting: {
				buttons: {
				  contextButton: {
					menuItems: ["printChart",
								"separator",
								"downloadPNG",
								"downloadJPEG",
								"downloadPDF",
								"downloadSVG",
								"separator",
								"downloadCSV",
								"downloadXLS",
								//"viewData",
							]
				  }
				}
			  },
			responsive: {
				rules: [{
					condition: {
						maxWidth: 500
					},
					chartOptions: {
						legend: {
							layout: 'horizontal',
							align: 'center',
							verticalAlign: 'bottom'
						}
					}
				}]
			}
		});
	};

	$scope.genBarChart= function(title, sub_title, y_axis_title, categories, series) {
		Highcharts.chart('bar-chart-container', {
			chart: {
				type: 'column',
				style: {
					fontFamily: 'Roboto'
				}
			},
			title: {
				text: title.toUpperCase(),
				style: {
					fontSize: 12
				}
			},
			credits: {
				enabled: false
			},
			subtitle: {
				text: sub_title
			},
			xAxis: {
				categories: categories,
				crosshair: true
			},
			yAxis: {
				min: 0,
				title: {
					text: y_axis_title
				}
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
			series: series,
			exporting: {
				buttons: {
				  contextButton: {
					menuItems: ["printChart",
								"separator",
								"downloadPNG",
								"downloadJPEG",
								"downloadPDF",
								"downloadSVG",
								"separator",
								"downloadCSV",
								"downloadXLS",
								//"viewData",
							]
				  }
				}
			  },
		});
	};

	$scope.genSpiderChart= function(title, sub_title, categories, series, div_id) {
		Highcharts.chart(div_id, {
			chart: {
				polar: true,
				type: 'line',
				style: {
					fontFamily: 'Roboto'
				},
				margins: [0,0,0,0],
				spacingTop: 0,
				spacingBottom: 0,
				spacingLeft: 0,
				spacingRight: 0,
			},
			credits: {
				enabled: false
			},
			title: {
				text: title.toUpperCase(),
				x: -40,
				style: {
					fontSize: 12
				}
			},
			subtitle: {
				text: sub_title,
				x: -40
			},
			pane: {
				size: '80%'
			},
			xAxis: {
				categories: categories,
				tickmarkPlacement: 'on',
				gridLineWidth: 1,
				gridLineColor: '#FFA123',

				lineColor: '#22FFAA',
				tickColor: '#FF00FF',
			},

			yAxis: {
				gridLineInterpolation: 'polygon',
				gridLineColor: '#123FFF',
				lineWidth: 1,
				min: 0,
				max: 1

			},
			tooltip: {
				headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
				pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
				'<td style="padding:0"><b>{point.y:.2f} </b></td></tr>',
				footerFormat: '</table>',
				shared: true,
				useHTML: true
			},

			legend: {
				align: 'right',
				verticalAlign: 'middle',
				layout: 'vertical'
			},
			series: series,
			exporting: {
				buttons: {
				  contextButton: {
					menuItems: ["printChart",
								"separator",
								"downloadPNG",
								"downloadJPEG",
								"downloadPDF",
								"downloadSVG",
								"separator",
								"downloadCSV",
								"downloadXLS",
								//"viewData",
							]
				  }
				}
			  },
			responsive: {
				rules: [{
					condition: {
						maxWidth: 500
					},
					chartOptions: {
						legend: {
							align: 'right',
							verticalAlign: 'middle',
							layout: 'vertical'
						},
						pane: {
							size: '100%'
						}
					}
				}]
			}
		});
	};


	$scope.getData = function () {
		$scope.giiDetail = true;
		$scope.giiTextDetail = true;
		var params= {
			area_id: area_id,
			admin_level: admin_level,
			country_id: country_id,
			year: year,
		};
		APIService.getGII(params)
		.then(function (result){
			var features = result[0].features;

			var col_chart_categories = [];
			var col_chart_data = [];
			var indices_areas_data = [];

			$scope.giiData = [];

			for(var i=0; i<features.length; i++){
				var _area_name = "";
				if(admin_level==="country"){
					_area_name = features[i].properties.area_name;
					$scope.giiData.push({
						'area_name': _area_name,
					});
				}else{
					_area_name = features[i].properties.area_name + "<br>("+features[i].properties.country_name + ")";
					$scope.giiData.push({
						'area_name': features[i].properties.area_name + " ("+features[i].properties.country_name + ")",
					});
				}

				col_chart_categories.push(_area_name);
				col_chart_data.push([ _area_name, features[i].properties.gii]);
				indices_areas_data.push(_area_name);

				// $scope.getGiiIndicatorData(i, features[i].properties.area_id);
				$scope.getGiiDimensionData(i, features[i].properties.area_id);
				$scope.getGiiDimensionGroup(i, features[i].properties.area_id);
				// $scope.getGiiIndicatorGroup(i, features[i].properties.area_id);
			}
			var chart_title = 'Gender Inequality Index';
			var chart_sub_title = year ;
			var chart_serise = [{
				color: '#9B72AA',
				name: "Gender Inequality Index",
				data: col_chart_data
			}];
			$scope.genColChart(chart_title, chart_sub_title, chart_title, col_chart_categories, chart_serise);
			$scope.showSpinner = false;
		}, reason => {
			$scope.showSpinner = false;
		});
	};

	$scope.getGIISpiderChartData = function () {
		$scope.showGIISpider = true;
		var params= {
			area_id: _map_clicked,
			admin_level: admin_level,
			year: year
		};

		var new_item_f = {
			name: _map_clicked_name,
			data: [null , null , null, null],
			pointPlacement: 'on'
		};
		var new_item_m = {
			name: _map_clicked_name,
			data: [null , null , null, null],
			pointPlacement: 'on'
		};

		APIService.getDimensionData(params)
		.then(function (result){
			var dimensions = ['Empowerment', 'Labour Force', 'Reproductive health', 'Violence'];
			var _gender= ['female', 'male'];
			for (var i = 0; i <result.length; i++) {
				for (var j = 0; j < dimensions.length; j++) {
					if(result[i]["common_des"] === dimensions[j]){
						if(result[i]["data"] === "female"){
							new_item_f["data"][j] = result[i]["value"];
						}else{
							new_item_m["data"][j] = result[i]["value"];
						}
					}
				}
			}
			chart_spider_series_female.push(new_item_f);
			chart_spider_series_male.push(new_item_m);

			var chart_categories = ['Empowerment', 'Labour Force', 'Reproductive health', 'Violence'];
			$scope.genSpiderChart("GII Dimension : Male", year , chart_categories, chart_spider_series_male, 'spider-male-container');
			$scope.genSpiderChart("GII Dimension : Female", year , chart_categories, chart_spider_series_female, 'spider-female-container');
		});
	};


	$scope.getLineChartData = function () {
		var params= {
			area_id: area_id,
			admin_level: admin_level,
			country_id: country_id,
			start_year: datepicker_start,
			end_year: datepicker_end,
		};
		APIService.getLineChartData(params)
		.then(function (result){
			var features = result;
			var line_chart_series = [];
			var timeserise = [];
			datepicker_start = parseInt(datepicker_start);
			datepicker_end = parseInt(datepicker_end);

			for (var z = datepicker_start; z <= datepicker_end; z++) {
				timeserise.push(z);
			}
			var area_list = area_id.split(",");

			for(var x=2; x< area_list.length; x++){
				var series_data = [];
				for(var r=0; r < timeserise.length; r++){
					series_data.push(null);
				}
				for(var i=0; i< timeserise.length; i++){
					for(var j=0; j<features.length; j++){
						var _data = features[j];
						if("'"+_data["area_id"]+"'" === area_list[x]){
							area_name = _data["area_name"];
							if(admin_level==="country"){
								area_name = _data["area_name"];
							}else{
								area_name = _data["area_name"] + "<br>("+_data["country_name"] + ")";
							}
							if(_data["year"] === timeserise[i]){
								var index = timeserise.indexOf(_data["year"]);
								series_data[index] = _data["gii"];
							}
						}
					}
				}
				var country_data = {
					color: colors[x-2],
					name: area_name,
					data: series_data,
				};
				line_chart_series.push(country_data);
			}

			var line_chart_title = 'GENDER INEQUALITY TRENDS';
			var line_chart_sub_title = datepicker_start + ' to ' + datepicker_end;
			var line_chart_yAxis = 'GII';
			$scope.genLineChart(line_chart_title, line_chart_sub_title, line_chart_yAxis, line_chart_series);
		});
	};


	$scope.getDimensionLineChartData = function () {
		var params= {
			area_id: area_id,
			admin_level: admin_level,
			common_id: common_id,
			gender_type: by_gender,
			country_id: country_id,
			start_year: datepicker_start,
			end_year: datepicker_end,
		};
		APIService.getDimensionLineChartData(params)
		.then(function (result){
			var features = result;
			var line_chart_series = [];
			var timeserise = [];
			datepicker_start = parseInt(datepicker_start);
			datepicker_end = parseInt(datepicker_end);
			for (var z = datepicker_start; z <= datepicker_end; z++) {
				timeserise.push(z);
			}
			var area_list = area_id.split(",");
			for(var x=2; x< area_list.length; x++){
				var series_data = [];
				for(var r=0; r < timeserise.length; r++){
					series_data.push(null);
				}
				for(var i=0; i< timeserise.length; i++){
					for(var j=0; j<features.length; j++){
						var _data = features[j];
						if("'"+_data["area_id"]+"'" === area_list[x]){
							area_name = _data["area_name"];
							if(_data["year"] === timeserise[i]){
								var index = timeserise.indexOf(_data["year"]);
								series_data[index] = _data["value"];
							}
						}
					}
				}
				var country_data = {
					color: colors[x-2],
					name: area_name,
					data: series_data,
				};
				line_chart_series.push(country_data);
			}

			var line_chart_title = selected_data_text.toUpperCase() + " [" +by_gender+"]";
			var line_chart_sub_title = datepicker_start + ' to ' + datepicker_end;
			var line_chart_yAxis = selected_data_text;
			$scope.genLineChart(line_chart_title, line_chart_sub_title, line_chart_yAxis, line_chart_series);

		});
	};

	$scope.check_dimension_data = function () {

		$("#by_gender_index").removeClass("active");
		$("#by_gender_male").removeClass("active");
		$("#by_gender_female").removeClass("active");
		$("#by_gender_ratio").removeClass("active");

		$("#by_gender_index").addClass("li-disabled");
		$("#by_gender_male").addClass("li-disabled");
		$("#by_gender_female").addClass("li-disabled");
		$("#by_gender_ratio").addClass("li-disabled");

		var params= {
			data_id: $("#gii_dimension_dropdown").find('option:selected').val()
		};
		APIService.check_dimension_data(params)
		.then(function (result){
			for(var i=0; i<result.length; i++){
				if(result[i]["data"] === 'female'){
					$("#by_gender_female").removeClass('li-disabled');
				}else if(result[i]["data"] === 'male'){
					$("#by_gender_male").removeClass('li-disabled');

				}else if(result[i]["data"] === 'ratio'){
					$("#by_gender_ratio").removeClass('li-disabled');

				}else if(result[i]["data"] === 'index'){
					$("#by_gender_index").removeClass('li-disabled');
				}
			}
			if(result.length === 1){
				$("#by_gender_"+result[0]["data"]).addClass("active");
				by_gender = result[0]["data"];
			}else{
				$("#by_gender_female").addClass("active");
				by_gender = "female";
			}
			check_data_level = 'dimension';
			$scope.check_gii_available_year();
		});
	};

	$scope.check_indicator_data = function () {

		$("#by_gender_index").removeClass("active");
		$("#by_gender_male").removeClass("active");
		$("#by_gender_female").removeClass("active");
		$("#by_gender_ratio").removeClass("active");

		$("#by_gender_index").addClass("li-disabled");
		$("#by_gender_male").addClass("li-disabled");
		$("#by_gender_female").addClass("li-disabled");
		$("#by_gender_ratio").addClass("li-disabled");

		var params= {
			data_id: $("#gii_indicators_dropdown").find('option:selected').val()
		};
		APIService.check_indicator_data(params)
		.then(function (result){
			for(var i=0; i<result.length; i++){
				if(result[i]["data"] === 'female'){
					$("#by_gender_female").removeClass('li-disabled');
				}else if(result[i]["data"] === 'male'){
					$("#by_gender_male").removeClass('li-disabled');
				}else if(result[i]["data"] === 'ratio'){
					$("#by_gender_ratio").removeClass('li-disabled');
				}else if(result[i]["data"] === 'index'){
					$("#by_gender_index").removeClass('li-disabled');
				}
			}
			if(result.length === 1){
				$("#by_gender_"+result[0]["data"]).addClass("active");
				by_gender = result[0]["data"];
			}else{
				$("#by_gender_female").addClass("active");
				by_gender = "female";
			}
			check_data_level = 'indicator';
			$scope.check_gii_available_year();
			$scope.find_unique_indicator_id();
		});
	};

	$scope.dev = function(array) {
		const n = array.length;
		const mean = array.reduce((a, b) => a + b) / n;
		return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
	};

	$scope.getMap = function () {
		var val_arr= [];
		var val_total = 0;
		var count = 0;
		$scope.showSpinner = true;
		var params= {
			area_id: area_id,
			admin_level: admin_level,
			country_id: country_id,
			year: year,
		};
		APIService.getGII(params)
		.then(function (result){
			var features = result[0].features;
			$scope.showSpinner = false;
			if(features.length === 0){
				$("#dataset_name").text("No data found");
				$("#dataset_definition").text("No data found");
			}else{
				$("#dataset_name").text("Found "+features.length+" results");
				if(features.length === 1){
					var polygon = features[0].geometry.coordinates;
					var fit = new L.Polygon(polygon).getBounds();
					var southWest = new mapboxgl.LngLat(fit['_southWest']['lat'], fit['_southWest']['lng']);
					var northEast = new mapboxgl.LngLat(fit['_northEast']['lat'], fit['_northEast']['lng']);
					var center = new mapboxgl.LngLatBounds(southWest, northEast).getCenter();
					map.fitBounds(new mapboxgl.LngLatBounds(southWest, northEast));
				}
				data_key = 'gii';
				by_gender = 'none';
				$("#dataset_definition").text("Gender Inequality Index (GII) "  + year );

				var col_chart_categories = [];
				var col_chart_data = [];
				var indices_areas_data = [];
				$scope.giiData = [];
				MAXVALUE = 0;
				MINVALUE = features[0].properties.gii;
				for(var i=0; i<features.length; i++){
					val_arr.push(features[i].properties.gii);
					val_total += features[i].properties.gii;
					if(MAXVALUE < features[i].properties.gii){
						MAXVALUE = features[i].properties.gii;
					}
					if(MINVALUE > features[i].properties.gii){
						MINVALUE = features[i].properties.gii;
					}

					col_chart_categories.push(features[i].properties.area_name);
					col_chart_data.push([features[i].properties.area_name, features[i].properties.gii]);
					indices_areas_data.push(features[i].properties.area_name);
				}
				MEAN = val_total / features.length;
				STD = $scope.dev(val_arr);
				// Range Value

				MINVALUE = 0;
				MAXVALUE =1;
				RANGEVALUE = MAXVALUE- MINVALUE;
				INTERVAL = RANGEVALUE / 5;
				CLASS_1 = MINVALUE + INTERVAL;
				CLASS_2 = CLASS_1 + INTERVAL;
				CLASS_3 = CLASS_2 + INTERVAL;
				CLASS_4 = CLASS_3 + INTERVAL;

				// if((MEAN - STD) < MINVALUE ){
				// 	CLASS_1 = (MEAN - (STD/2));
				// }else{
				// 	CLASS_1 = (MEAN - STD);
				// }
				// CLASS_2 = MEAN;
				// CLASS_3 = (MEAN + STD);
				// CLASS_4 = MAXVALUE;

				CLASS_1 = CLASS_1.toFixed(3);
				CLASS_2 = CLASS_2.toFixed(3);
				CLASS_3 = CLASS_3.toFixed(3);
				CLASS_4 = CLASS_4.toFixed(3);

				//layer classes
				$scope.layerClasses(features, data_key);
				//update a map legend
				$scope.genMapLegend('index');
				gii_feature = result[0];
				$scope.genMapLayer();
			}
			$("div.spanner").addClass("hide");
		});
	};

	$scope.getIndicatorMap = function () {
		var val_arr= [];
		var val_total = 0;
		var count = 0;
		$scope.showSpinner = true;

		var params= {
			area_id: area_id,
			admin_level: admin_level,
			country_id: country_id,
			year: year,
			indicator_id: indicator_id,
			gender_type: by_gender,
		};
		APIService.getIndicatorMap(params)
		.then(function (result){
			var features = result[0].features;
			$scope.showSpinner = false;
			if(features.length === 0){
				$("#dataset_name").text("No data found");
				$("#dataset_definition").text("No data found");
			}else{
				$("#dataset_name").text("Found "+features.length+" results");
				if(features.length === 1){
					var polygon = features[0].geometry.coordinates;
					var fit = new L.Polygon(polygon).getBounds();
					var southWest = new mapboxgl.LngLat(fit['_southWest']['lat'], fit['_southWest']['lng']);
					var northEast = new mapboxgl.LngLat(fit['_northEast']['lat'], fit['_northEast']['lng']);
					var center = new mapboxgl.LngLatBounds(southWest, northEast).getCenter();
					map.fitBounds(new mapboxgl.LngLatBounds(southWest, northEast));
				}
				MAXVALUE = 0;
				MINVALUE = features[0].properties.value;
				for(var i=0; i<features.length; i++){
					val_arr.push(features[i].properties.value);
					val_total += features[i].properties.value;
					if(MAXVALUE < features[i].properties.value){
						MAXVALUE = features[i].properties.value;
					}
					if(MINVALUE > features[i].properties.value){
						MINVALUE = features[i].properties.value;
					}
				}
				MEAN = val_total / features.length;
				STD = $scope.dev(val_arr);
				// Range Value

				MINVALUE = 0;
				MAXVALUE =1;
				RANGEVALUE = MAXVALUE- MINVALUE;
				INTERVAL = RANGEVALUE / 5;
				CLASS_1 = MINVALUE + INTERVAL;
				CLASS_2 = CLASS_1 + INTERVAL;
				CLASS_3 = CLASS_2 + INTERVAL;
				CLASS_4 = CLASS_3 + INTERVAL;

				// if((MEAN - STD) < MINVALUE ){
				// 	CLASS_1 = (MEAN - (STD/2));
				// }else{
				// 	CLASS_1 = (MEAN - STD);
				// }
				// CLASS_2 = MEAN;
				// CLASS_3 = (MEAN + STD);
				// CLASS_4 = MAXVALUE;

				CLASS_1 = CLASS_1.toFixed(3);
				CLASS_2 = CLASS_2.toFixed(3);
				CLASS_3 = CLASS_3.toFixed(3);
				CLASS_4 = CLASS_4.toFixed(3);

				data_key = 'value';
				$("#dataset_definition").text(selected_data_text + " " + by_gender + " " + year );

				if(selected_data_text === 'Gender Inequality Index'){
					$("#by_gender").css("display","none");
				}else{
					$("#by_gender").css("display","block");
				}
				//layer classes
				$scope.layerClasses(features, data_key);
				//update a map legend
				$scope.genMapLegend(features[0].properties.unit);
				gii_feature = result[0];
				$scope.genMapLayer();
			}
		}, reason => {
			$scope.showSpinner = false;
		});
	};

	$scope.getIndicatorGraphData = function () {
		$scope.giiDetail = true;
		$scope.giiTextDetail = true;
		var chart_categories = [];
		var female_data = [];
		var male_data = [];
		var params= {
			area_id: area_id,
			admin_level: admin_level,
			country_id: country_id,
			year: year,
			indicator_id: $("#gii_indicators_dropdown").find('option:selected').val(),
		};

		APIService.getIndicatorGraphData(params)
		.then(function (result){
			var features = result;
			for(var i=0; i<features.length; i++){
				if(admin_level === 'country'){
					chart_categories.push(features[i].name_0);
				}else{
					chart_categories.push(features[i].name_1 +'<br>('+features[i].name_0 + ")");
				}
				female_data.push(features[i].female);
				male_data.push(features[i].male);
			}

			var col_chart_data = [];
			if(by_gender === 'female'){
				col_chart_data = female_data;
			}else if (by_gender === 'male'){
				col_chart_data = male_data;
			}else{
				col_chart_data = female_data;
			}
			// Create the chart
			var chart_title = selected_data_text.toUpperCase();
			var chart_sub_title = year + " | " + by_gender;
			var chart_serise = [{
				color: '#9B72AA',
				name: selected_data_text,
				data: col_chart_data
			}];
			$scope.genColChart(chart_title, chart_sub_title, selected_data_text, chart_categories, chart_serise);

			var chart_spider_series =  [{
				color: ' #980043',
				name: 'FEMALE',
				data: female_data,
				pointPlacement: 'on'

			}, {
				color: '#024E72',
				name: 'MALE',
				data: male_data,
				pointPlacement: 'on'

			}];
			$scope.genSpiderChart(chart_title, year+" | " + "Female and Male", chart_categories, chart_spider_series, 'spider-chart-container');
			var chart_bar_series = [{
				color: ' #980043',
				name: 'FEMALE',
				data: female_data

			}, {
				color: '#024E72',
				name: 'MALE',
				data: male_data

			}];
			$scope.genBarChart(chart_title, year+" | " + "Female and Male", selected_data_text, chart_categories, chart_bar_series);
			$scope.showSpinner = false;
		});
	};

	$scope.getDimensionMap = function () {
		var val_arr= [];
		var val_total = 0;
		var count = 0;
		$scope.showSpinner = true;

		var params= {
			area_id: area_id,
			admin_level: admin_level,
			country_id: country_id,
			year: year,
			common_id: common_id,
			gender_type: by_gender,
		};
		APIService.getDimensionMap(params)
		.then(function (result){
			var features = result[0].features;
			if(features.length === 0){
				$("#dataset_name").text("No data found");
				$("#dataset_definition").text("No data found");
			}else{
				$("#dataset_name").text("Found "+features.length+" results");
				if(features.length === 1){
					var polygon = features[0].geometry.coordinates;
					var fit = new L.Polygon(polygon).getBounds();
					var southWest = new mapboxgl.LngLat(fit['_southWest']['lat'], fit['_southWest']['lng']);
					var northEast = new mapboxgl.LngLat(fit['_northEast']['lat'], fit['_northEast']['lng']);
					var center = new mapboxgl.LngLatBounds(southWest, northEast).getCenter();
					map.fitBounds(new mapboxgl.LngLatBounds(southWest, northEast));
				}
				MAXVALUE = 0;
				MINVALUE = features[0].properties.value;
				for(var i=0; i<features.length; i++){
					val_arr.push(features[i].properties.value);
					val_total += features[i].properties.value;
					if(MAXVALUE < features[i].properties.value){
						MAXVALUE = features[i].properties.value;
					}
					if(MINVALUE > features[i].properties.value){
						MINVALUE = features[i].properties.value;
					}
				}
				MEAN = val_total / features.length;
				STD = $scope.dev(val_arr);
				// Range Value

				MINVALUE =0;
				MAXVALUE =1;
				RANGEVALUE = MAXVALUE- MINVALUE;
				INTERVAL = RANGEVALUE / 5;

				CLASS_1 = MINVALUE + INTERVAL;
				CLASS_2 = CLASS_1 + INTERVAL;
				CLASS_3 = CLASS_2 + INTERVAL;
				CLASS_4 = CLASS_3 + INTERVAL;

				// if((MEAN - STD) < MINVALUE ){
				// 	CLASS_1 = (MEAN - (STD/2));
				// }else{
				// 	CLASS_1 = (MEAN - STD);
				// }
				// CLASS_2 = MEAN;
				// CLASS_3 = (MEAN + STD);
				// CLASS_4 = MAXVALUE;

				CLASS_1 = CLASS_1.toFixed(3);
				CLASS_2 = CLASS_2.toFixed(3);
				CLASS_3 = CLASS_3.toFixed(3);
				CLASS_4 = CLASS_4.toFixed(3);


				data_key = 'value';
				$("#dataset_definition").text(selected_data_text + " " + by_gender + " " + year );

				if(selected_data_text === 'Gender Inequality Index'){
					$("#by_gender").css("display","none");
				}else{
					$("#by_gender").css("display","block");
				}
				//layer classes
				$scope.layerClasses(features, data_key);
				//update a map legend
				$scope.genMapLegend('number');

				gii_feature = result[0];
				$scope.genMapLayer();
				$scope.showSpinner = false;
			}
		}, reason => {
			$scope.showSpinner = false;
		});
	};


	$scope.getDimensionGraphData = function () {
		$scope.giiDetail = true;
		$scope.giiTextDetail = true;
		var chart_categories = [];
		var female_data = [];
		var male_data = [];
		var params= {
			area_id: area_id,
			admin_level: admin_level,
			country_id: country_id,
			year: year,
			common_id: common_id,
		};

		APIService.getDimensionGraphData(params)
		.then(function (result){
			var features = result;
			for(var i=0; i<features.length; i++){
				if(admin_level === 'country'){
					chart_categories.push(features[i].name_0);
					female_data.push([features[i].name_0, features[i].female]);
					male_data.push([features[i].name_0, features[i].male]);
				}else{
					chart_categories.push(features[i].name_1 +'<br>('+features[i].name_0+")");
					female_data.push([features[i].name_1 +' ('+features[i].name_0+")", features[i].female]);
					male_data.push([features[i].name_1 +' ('+features[i].name_0+")", features[i].male]);
				}

			}

			var col_chart_data = [];
			if(by_gender === 'female'){
				col_chart_data = female_data;
			}else if (by_gender === 'male'){
				col_chart_data = male_data;
			}else{
				col_chart_data = female_data;
			}
			// Create the chart
			var chart_title = selected_data_text.toUpperCase();
			var chart_sub_title = year + " | " + by_gender;
			var chart_serise = [{
				color: '#9B72AA',
				name: selected_data_text,
				data: col_chart_data
			}];
			$scope.genColChart(chart_title, chart_sub_title, selected_data_text, chart_categories, chart_serise);

			var chart_spider_series =  [{
				color: ' #980043',
				name: 'FEMALE',
				data: female_data,
				pointPlacement: 'on'

			}, {
				color: '#024E72',
				name: 'MALE',
				data: male_data,
				pointPlacement: 'on'

			}];
			$scope.genSpiderChart(chart_title, year+" | " + "Female and Male", chart_categories, chart_spider_series, 'spider-chart-container');

			var chart_bar_series = [{
				color: ' #980043',
				name: 'FEMALE',
				data: female_data

			}, {
				color: '#024E72',
				name: 'MALE',
				data: male_data

			}];
			$scope.genBarChart(chart_title, year+" | " + "Female and Male", selected_data_text, chart_categories, chart_bar_series);
			$scope.showSpinner = false;
		});
	};

	$scope.resetMap = function () {
		admin_level= 'country';
		area_id= '9999';
		country_id= '';
		year= year;
		$("#adm0_dropdown").val("9999");
		$("#adm1_dropdown").val("9999");
		$scope.getAdm1('9999');
		$("#data_level_country").addClass("active");
		$("#data_level_province").removeClass("active");
		$("#gii_dimension_dropdown").val("gii").change();
		$scope.getGIIIndicators('9999', 'gii');
		map.flyTo({center:  [103, 15.5], zoom: 4});
	};

	$scope.check_gii_available_year = function () {
		var params= {
			check_data_level: check_data_level,
			admin_level: admin_level,
			data_id: data_id,
			gender_type: by_gender,
			area_id: drowdown_country
		};
		APIService.check_gii_available_year(params)
		.then(function (result){
			result = result.sort();
			year = result[result.length-1];
			$("input[type=range]").val(year); // sets value
			$scope.updateMap();

			if(result.length === 0){
				$("#dataset_name").text("Data by "+admin_level+" level not available");
				$("#my_range").css("display", "none");
			}else{
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
				$("#my_range").css("display", "block");
			}
		});
	};
	$scope.check_gii_available_year();

	$scope.find_unique_indicator_id = function () {
		$scope.showSpinner = true;
		var params= {
			indicator_id: $("#gii_indicators_dropdown").find('option:selected').val(),
			gender_type: by_gender
		};
		APIService.find_unique_indicator_id(params)
		.then(function (result){
			indicator_id = result["unique_indicator_id"];
			$scope.getIndicatorMap();
		}, reason => {
			$scope.showSpinner = false;
		});
	};


	$scope.updateMap = function () {
		$scope.clearMapLayer();
		var dimension_val = $("#gii_dimension_dropdown").find('option:selected').val();
		var indicator_val = $("#gii_indicators_dropdown").find('option:selected').val();

		if(indicator_val === '9999'){
			if(dimension_val === 'gii'){
				$scope.showDivDimensionChart= false;
				$scope.showDIVChartDesc = false;
				$scope.getMap();

			}else{
				$scope.showDIVChartDesc = true;
				$scope.showDivDimensionChart= false;
				$scope.getDimensionMap();
			}
		}else{
			indicator_val =  unique_indicator_id;
			// $scope.getIndicatorMap();
			$scope.find_unique_indicator_id();
			// $scope.check_indicator_data();
		}
		if(admin_level === 'province' && area_id === '9999' && country_id !== ''){
			$scope.zoomtoCountry(country_id);
		}else if(admin_level === 'province' && country_id === '' ){
			map.flyTo({center:  [103, 15.5], zoom: 4});
		}
	};

	$scope.updateData = function () {

		$scope.showSpinner = true;
		$scope.showDIVChartDesc = true;
		$scope.showGIICharts = true;

		var dimension_val = $("#gii_dimension_dropdown").find('option:selected').val();
		var indicator_val = $("#gii_indicators_dropdown").find('option:selected').val();
		if(dimension_val === 'gii'){
			$scope.showDivDimensionChart= false;
			$scope.getData();
			$scope.getLineChartData();
			$scope.giiDetail= true;
			$scope.showLineChart= true;
			$scope.showGIISpider=true;
			$scope.giiTextDetail = true;
			$("#gii_text_detial").css("display", "block");
			
			if(selected_features.includes(_map_clicked)){
				$scope.getGIISpiderChartData();
			}

			// Delete any point 
			var dl_idx=0;
			var _idx=0;
			chart_spider_series_male.forEach((point) => {
				if (point.name === _map_clicked_name) {
					dl_idx = _idx;
					
					chart_spider_series_male.splice(dl_idx,1);
					chart_spider_series_female.splice(dl_idx,1);

					var chart_categories = ['Empowerment', 'Labour Force', 'Reproductive health', 'Violence'];
					$scope.genSpiderChart("GII Dimension : Male", year , chart_categories, chart_spider_series_male, 'spider-male-container');
					$scope.genSpiderChart("GII Dimension : Female", year , chart_categories, chart_spider_series_female, 'spider-female-container');
				}
				_idx+=1;
			});

		}else{
			$("#gii_text_detial").css("display", "none");
			$scope.showDivDimensionChart= true;
			$scope.showLineChart= true;
			$scope.showGIISpider=false;
			$scope.getDimensionGraphData();
			$scope.getDimensionLineChartData();
		}

		// if(indicator_val === '9999'){
		// 	if(dimension_val === 'gii'){
		// 		$scope.showDivDimensionChart= false;
		// 		$scope.getData();
		// 		$scope.getLineChartData();

		// 	}else{
		// 		// $scope.giiDetail= true;
		// 		$scope.showDivDimensionChart= true;
		// 		$scope.getDimensionGraphData();
		// 		$scope.getDimensionLineChartData();
		// 	}
		// }else{
		// 	// $scope.giiDetail= true;
		// 	$scope.showDivDimensionChart= true;
		// 	$scope.showLineChart= false;
		// 	$scope.getIndicatorGraphData();

		// }
	};

	$scope.mapInt = function () {
		$scope.getAdm0();
		$scope.getAdm1('9999');
		$scope.getMainGIISector();
		$scope.getGIIIndicators(9999, 'gii');
		area_id="'in','area_id','154','228','40','250','123'";
		$scope.getData();
		$scope.getLineChartData();
	};
	$scope.mapInt();



	map.on('click', function (e) {
		// set bbox as 5px reactangle area around clicked point
		var bbox = [
			[e.point.x - 0.1, e.point.y - 0.1],
			[e.point.x + 0.1, e.point.y + 0.1]
		];
		var features = map.queryRenderedFeatures(bbox, {
			layers: ['admin_gii']
		});
		filter = features.reduce(
			function (memo, feature) {
				if(admin_level === 'country'){
					_map_clicked_name =  feature.properties.area_name;
				}else{
					_map_clicked_name = feature.properties.area_name + "<br>("+feature.properties.country_name + ")";
				}
				if(selected_features.includes(feature.properties.area_id)){
					var index = selected_features.indexOf(feature.properties.area_id);
					if (index !== -1) {
						selected_features.splice(index, 1);
					}
				}else{
					memo.push(feature.properties.area_id);
					area_id += ", "+feature.properties.area_id;
					_map_clicked = feature.properties.area_id;
				}
				return memo;
			},
			selected_features
		);
		area_id = "'" + selected_features.join("','") + "'";
		map.setFilter('admin-highlighted', filter);
		map.setFilter('admin-outline-highlighted', filter);
		$scope.updateData();
	});

	$scope.clearCountryMapLayer = function() {
		map.removeLayer('nodata_outline');
		map.removeLayer('nodata_map');
		map.removeSource('nodata_map');
	};

	$(".close").click(function() {
		$(".modal-background").click();
	});
	// Modal Close Function
	$(".modal-background").click(function() {
		$(".modal").removeClass('show');
		$(".modal").addClass('hide');
	});

	function hideModel() {
		$(".modal").removeClass('show');
		$(".modal").addClass('hide');
	}

	function hideGIICharts() {
		$("#col-chart-container").html("");
		$("#line-chart-container").html("");
		$("#bar-chart-container").html("");
		$("#bar-chart-container").html("");
		$scope.showGIICharts = false;
		$scope.showDIVChartDesc = false;
	}

	$("#guiding-button").click(function() {
		hideModel();
		$("#guiding-modal").removeClass('hide');
		$("#guiding-modal").addClass('show');
	});

	$("#adm0_dropdown").change(function(){
		$scope.showChartDesc();
		hideGIICharts();
		selected_features = ['in', 'area_id'];
		chart_spider_series_female = [];
		chart_spider_series_male = [];
		area_id = "'"+this.value+"'";
		drowdown_country = area_id;
		country_id=this.value;

		if(admin_level === 'province'){
			area_id = '9999';
		}
		if(this.value === '9999'){
			map.flyTo({center:  [103, 15.5], zoom: 4});
			country_id = '9999';
			area_id = '9999';
			drowdown_country = "'154','228','40','250','123'";
		}else{
			// area_id = '9999';
			// $("#province-dropdown").css("display", "block");
		}
		$scope.check_gii_available_year();
		$("#adm1_dropdown").html("");
		$scope.getAdm1(country_id);
		$scope.updateMap();
	});

	$("#adm1_dropdown").change(function(){
		$scope.showChartDesc();
		hideGIICharts();
		selected_features = ['in', 'area_id'];
		chart_spider_series_female = [];
		chart_spider_series_male = [];
		area_id = "'"+this.value+"'";
		admin_level = "province";
		nodata_feature = adm1_feature;
		if(this.value === '9999'){
			area_id = '9999';
			nodata_feature = adm1_feature;
		}
		// $("#by_gender_female").click();
		$scope.updateMap();
	});

	$("#gii_dimension_dropdown").change(function(){
		$scope.showChartDesc();
		hideGIICharts();
		$("#by_gender_male").addClass('li-disabled');
		$("#by_gender_female").addClass('li-disabled');
		$("#by_gender_index").addClass('li-disabled');
		$("#by_gender_ratio").addClass('li-disabled');

		$("#by_gender_male").removeClass("active");
		$("#by_gender_female").removeClass("active");
		$("#by_gender_index").removeClass("active");
		$("#by_gender_ratio").removeClass("active");
		var selected = $(this).find('option:selected').val();
		// clear selected areas
		area_id = '9999';
		$("#adm1_dropdown").val('9999');
		selected_data_text = $(this).find('option:selected').text();
		if(selected_data_text === 'None'){
			selected_data_text = "Gender Inequality Index";
		}

		data_lvl ='idx';
		data_unit = 'Index';
		$scope.getGIIIndicators(selected, '');
		$scope.clearMapLayer();
		common_id = selected;
		// $scope.giiDetail = false;
		$("#gii_text_detial").css("display", "none");
		selected_features = ['in', 'area_id'];
		chart_spider_series_female = [];
		chart_spider_series_male = [];

		if(selected === 'gii'){
			data_id = selected;
			check_data_level = 'gii';
			$scope.check_gii_available_year();
			$scope.getGIIIndicators(9999, 'gii');
		}else{
			$scope.showDIVChartDesc = true;
			$("#gii_text_detial").css("display", "none");

			$scope.check_dimension_data();
			data_id = selected;
			check_data_level = 'dimension';
			$scope.check_gii_available_year();
		}
		if(admin_level === 'province' && area_id === '9999' && country_id !== ''){
			$scope.zoomtoCountry(country_id);
		}else if(admin_level === 'province' && country_id === '' ){

			map.flyTo({center:  [103, 15.5], zoom: 4});
		}

	});

	$("#gii_indicators_dropdown").change(function(){

		$("#by_gender").css('display', 'block');
		selected_features = ['in', 'area_id'];
		chart_spider_series_female = [];
		chart_spider_series_male = [];
		var selected = $(this).find('option:selected').val();
		selected_data = selected;
		indicator_id = selected;
		data_id = indicator_id;

		selected_data_text = $(this).find('option:selected').text();
		data_unit = $(this).find('option:selected').attr("data-unit");
		var dimension_id = $("#gii_dimension_dropdown").find('option:selected').val();
		if(dimension_id === 'REP'){
			by_gender = 'ratio';
		}
		data_lvl ='idc';
		$scope.clearMapLayer();
		if(selected === '9999'){
			$("#gii_dimension_dropdown").change();
		}else{
			$scope.check_indicator_data();
		}
	});



	$("#data_level_country").click(function(){
		$("#province-dropdown").css("display", "none");
		hideGIICharts();
		selected_features = ['in', 'area_id'];
		
		chart_spider_series_female = [];
		chart_spider_series_male = [];
		if($("#adm1_dropdown").find('option:selected').val() === '9999'){
			area_id = '9999';
		}else{
			// area_id = $("#adm1_dropdown").find('option:selected').val();

			area_id = '9999';
		}
		$("#data_level_province").removeClass("active");
		$(this).addClass("active");
		admin_level = 'country';
		$scope.showChartDesc();
		$scope.check_gii_available_year();
		$scope.updateMap();
	});

	$("#data_level_province").click(function(){
		$("#province-dropdown").css("display", "block");
		hideGIICharts();
		selected_features = ['in', 'area_id'];
		chart_spider_series_female = [];
		chart_spider_series_male = [];
	
		if($("#adm1_dropdown").val() === '9999'){
			area_id = '9999';
		}else{
			area_id = "'"+$("#adm1_dropdown").val().toString()+"'";
		}
		$("#data_level_country").removeClass("active");
		$(this).addClass("active");

		admin_level = 'province';
		$scope.showChartDesc();
		$scope.check_gii_available_year();
		$scope.updateMap();
	});

	$("#by_gender_index").click(function(){
		$("#by_gender_ratio").removeClass("active");
		$("#by_gender_female").removeClass("active");
		$("#by_gender_male").removeClass("active");
		$(this).addClass("active");
		by_gender = "index";
		$scope.updateMap();
	});

	$("#by_gender_ratio").click(function(){
		$("#by_gender_index").removeClass("active");
		$("#by_gender_female").removeClass("active");
		$("#by_gender_male").removeClass("active");
		$(this).addClass("active");
		by_gender = "ratio";
		$scope.updateMap();
	});

	$("#by_gender_female").click(function(){
		
		hideGIICharts();
		selected_features = ['in', 'area_id'];
		chart_spider_series_female = [];
		chart_spider_series_male = [];
		area_id = '9999';
		$("#by_gender_ratio").removeClass("active");
		$("#by_gender_index").removeClass("active");
		$("#by_gender_male").removeClass("active");
		$(this).addClass("active");
		by_gender = "female";
		$scope.updateMap();
	});

	$("#by_gender_male").click(function(){
		hideGIICharts();
		selected_features = ['in', 'area_id'];
		chart_spider_series_female = [];
		chart_spider_series_male = [];

		area_id = '9999';
		$("#by_gender_ratio").removeClass("active");
		$("#by_gender_index").removeClass("active");
		$("#by_gender_female").removeClass("active");
		$(this).addClass("active");
		by_gender = "male";
		$scope.updateMap();
	});


	$("#dimension_spiderweb_chart").click(function(){
		$("#dimension_bar_chart").removeClass("active");
		$(this).addClass("active");
		$("#bar-chart-container").css("display", "none");
		$("#spider-chart-container").css("display", "block");
	});

	$("#dimension_bar_chart").click(function(){
		$("#dimension_spiderweb_chart").removeClass("active");
		$(this).addClass("active");
		$("#bar-chart-container").css("display", "block");
		$("#spider-chart-container").css("display", "none");
	});

	$('#reset_map').click(function () {
		$("#province-dropdown").css("display", "none");
		$scope.resetMap();
	});

	$('#btn-show-gii').click(function() {
		area_id = '9999';
		$('#gii_dimension_dropdown').val('gii').change();
		$scope.showChartDesc();
	});

});
