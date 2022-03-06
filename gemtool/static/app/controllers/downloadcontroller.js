'use strict';
angular.module('baseApp')
.controller('downloadcontroller' ,function ($scope, $timeout, APIService) {

	var filter = null;
	var selected_features = ['in', 'area_id'];
	var area_id = '9999';
	var admin_level = 'province';
	var country_id = '';
	var selected_data = 'gii'; //default
	var by_gender = 'female';
	var selected_data_text = 'Gender Inquality Index';
	var common_id = '';
	var indicator_id = '';

	var send=true;
	var datepicker_start = $("#start").val();
	var datepicker_end = $("#end").val();
	$scope.showSpinner = true;

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
			//Destroy the old Datatable
			$scope.destroyDatatable();
			$scope.updateData();
			send=false;
		}
		setTimeout(function(){send=true;},200);
	});

	$scope.getAdm0 = function () {
		APIService.getAdm0()
		.then(function (result){
			var items = result[0].features;
			$.each(items, function (i, item) {
				$("#adm0_dropdown").append('<option value="'+item["properties"]["id_0"]+'">'+item["properties"]["name_0"]+'</option>');
			});
		});

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

	$scope.getAdm1('9999');

	$scope.getMainGIISector = function () {
		APIService.getMainGIISector()
		.then(function (result){

			$.each(result, function (i, item) {
				$("#gii_dimension_dropdown").append('<option value="'+item["common_id"]+'">'+item["common_desc"]+'</option>');
			});
		});
	};
	$scope.getMainGIISector();


	$scope.getGIIIndicators = function (id) {
		var params= {
			id: id,
		};
		APIService.getGIIIndicators(params)
		.then(function (result){
			$("#gii_indicators_dropdown").html("");
			$("#gii_indicators_dropdown").append('<option value="9999">None</option>');
			$.each(result, function (i, item) {
				$("#gii_indicators_dropdown").append('<option value="'+item["indicator_id"]+'">'+item["indicator_desc"]+ '</option>');
			});
		});
	};
	$scope.getGIIIndicators(9999);


	$scope.getData = function () {
		$scope.showSpinner = true;
		var params= {
			area_id: area_id,
			admin_level: admin_level,
			country_id: country_id,
			start_year: datepicker_start,
			end_year: datepicker_end,
		};
		APIService.downloadGII(params)
		.then(function (result){
			var features = result[0].features;
			$scope.showSpinner = false;
			var data = [];

			for(var i=0; i<features.length; i++){
				var item = {};
				if(admin_level === 'country'){
					item = {
						"area_id" : features[i]["properties"]["area_id"],
						"name_0" : features[i]["properties"]["name_0"],
						"gii" : features[i]["properties"]["gii"],
						"year" : features[i]["properties"]["year"],
					};
				}else{
					item = {
						"area_id" : features[i]["properties"]["area_id"],
						"name_0" : features[i]["properties"]["name_0"],
						"name_1" : features[i]["properties"]["name_1"],
						"gii" : features[i]["properties"]["gii"],
						"year" : features[i]["properties"]["year"],
					};
				}

				data.push(item);
			}
			var col = {};
			if(admin_level === 'country'){
				col = [
					{ data: 'area_id' , title: 'Area Code' },
					{ data: 'name_0' , title: 'Country' },
					{ data: 'gii' , title: 'GII' },
					{ data: 'year'  , title: 'Year' }
				];

			}else{
				col = [
					{ data: 'area_id' , title: 'Area Code' },
					{ data: 'name_0' , title: 'Country' },
					{ data: 'name_1' , title: 'Province' },
					{ data: 'gii' , title: 'GII' },
					{ data: 'year'  , title: 'Year' }
				];
			}
			$('#gii_datatable').DataTable({
				searching: false,
				pageLength: 50,
				data: data,
				columns: col,
				dom: 'Bfrtip',
				buttons: [
					{ extend: "copyHtml5", className: "export-btn" },
					{ extend: "excelHtml5", className: "export-btn" },
					{ extend: "csvHtml5", className: "export-btn" },
					{ extend: "pdfHtml5", className: "export-btn" },
					{
						text: 'Geojson',
						action: function ( e, dt, node, config ) {
							var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result[0], null, 2));
							var dlAnchorElem = document.getElementById('downloadAnchorElem');
							dlAnchorElem.setAttribute("href",     dataStr     );
							dlAnchorElem.setAttribute("download", selected_data_text+".geojson");
							dlAnchorElem.click();

						},
						className: "export-btn"
					}
				]
			});
			if(features.length === 0){
				$('.dt-buttons').css("display", "none");
			}else{
				$('.dt-buttons').css("display", "block");
			}

		});

	};
	$scope.getData();

	$scope.getDimensionData = function () {
		$scope.showSpinner = true;
		by_gender = 'female';
		var params= {
			area_id: area_id,
			admin_level: admin_level,
			country_id: country_id,
			common_id: common_id,
			gender_type: by_gender,
			start_year: datepicker_start,
			end_year: datepicker_end,
		};
		APIService.downloadDimensionData(params)
		.then(function (result){
			var features = result[0].features;

			$("#dataset_name").text(selected_data_text);
			$scope.showSpinner = false;
			if(selected_data_text === 'Gender Inquality Index'){
				$("#by_gender").css("display","none");
			}else{
				$("#by_gender").css("display","block");

			}
			var data = [];
			for(var i=0; i<features.length; i++){
				var item = {};
				if( admin_level === 'country'){
					item = {
						"admin_level" : features[i]["properties"]["admin_level"],
						"area_id" : features[i]["properties"]["area_id"],
						"name_0" : features[i]["properties"]["name_0"],
						"year" : features[i]["properties"]["year"],
						"female" : features[i]["properties"]["female"],
						"male" : features[i]["properties"]["male"],
						"common_id" : features[i]["properties"]["common_id"],
						"common_des" : features[i]["properties"]["common_des"],
					};
				}else{
					item = {
						"admin_level" : features[i]["properties"]["admin_level"],
						"area_id" : features[i]["properties"]["area_id"],
						"name_0" : features[i]["properties"]["name_0"],
						"name_1" : features[i]["properties"]["name_1"],
						"year" : features[i]["properties"]["year"],
						"female" : features[i]["properties"]["female"],
						"male" : features[i]["properties"]["male"],
						"common_id" : features[i]["properties"]["common_id"],
						"common_des" : features[i]["properties"]["common_des"],
					};
				}

				data.push(item);
			}
			var col = {};
			if(admin_level === 'country'){
				col =  [
					{ data: 'admin_level' , title: 'Admin Level' },
					{ data: 'area_id' , title: 'Country code' },
					{ data: 'name_0' , title: 'Country' },
					{ data: 'year'  , title: 'Year' },
					{ data: 'female' , title: 'Female' },
					{ data: 'male'  , title: 'Male' },
					{ data: 'common_id' , title: 'dimension id' },
					{ data: 'common_des'  , title: 'dimension desc' }
				];
			}else{
				col = [
					{ data: 'admin_level' , title: 'Admin Level' },
					{ data: 'area_id' , title: 'Province code' },
					{ data: 'name_0' , title: 'Country' },
					{ data: 'name_1' , title: 'Province' },
					{ data: 'year'  , title: 'Year' },
					{ data: 'female' , title: 'Female' },
					{ data: 'male'  , title: 'Male' },
					{ data: 'common_id' , title: 'dimension id' },
					{ data: 'common_des'  , title: 'dimension desc' }
				];
			}

			$('#gii_datatable').DataTable({
				searching: false,
				pageLength: 50,
				data: data,
				columns: col,
				dom: 'Bfrtip',
				buttons: [
					{ extend: "copyHtml5", className: "export-btn" },
					{ extend: "excelHtml5", className: "export-btn" },
					{ extend: "csvHtml5", className: "export-btn" },
					{ extend: "pdfHtml5", className: "export-btn" },
					{
						text: 'Geojson',
						action: function ( e, dt, node, config ) {
							var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result[0], null, 2));
							var dlAnchorElem = document.getElementById('downloadAnchorElem');
							dlAnchorElem.setAttribute("href",     dataStr     );
							dlAnchorElem.setAttribute("download", selected_data_text+".geojson");
							dlAnchorElem.click();
						},
						className: "export-btn"
					}
				]
			});
			if(features.length === 0){
				$('.dt-buttons').css("display", "none");
			}else{
				$('.dt-buttons').css("display", "block");
			}

		});
	};


	$scope.getIndicatorData = function () {
		$scope.showSpinner = true;
		by_gender = 'female';
		var params= {
			area_id: area_id,
			admin_level: admin_level,
			country_id: country_id,
			indicator_id: indicator_id,
			gender_type: by_gender,
			start_year: datepicker_start,
			end_year: datepicker_end,
		};
		APIService.downloadIndicatorsData(params)
		.then(function (result){
			var features = result[0].features;
			$scope.showSpinner = false;

			$("#dataset_name").text(selected_data_text);

			if(selected_data_text === 'Gender Inquality Index'){
				$("#by_gender").css("display","none");
			}else{
				$("#by_gender").css("display","block");

			}
			var data = [];

			for(var i=0; i<features.length; i++){
				var item = {};
				if( admin_level === 'country'){
					item = {
						"admin_level" : features[i]["properties"]["admin_level"],
						"area_id" : features[i]["properties"]["area_id"],
						"name_0" : features[i]["properties"]["name_0"],
						"year" : features[i]["properties"]["year"],
						"value" : features[i]["properties"]["value"],
						"common_id" : features[i]["properties"]["common_id"],
						"common_des" : features[i]["properties"]["common_des"],
						"indicator_des" : features[i]["properties"]["indicator_desc"],
						"data" : features[i]["properties"]["data"],
					};
				}else{
					item = {
						"admin_level" : features[i]["properties"]["admin_level"],
						"area_id" : features[i]["properties"]["area_id"],
						"name_0" : features[i]["properties"]["name_0"],
						"name_1" : features[i]["properties"]["name_1"],
						"year" : features[i]["properties"]["year"],
						"value" : features[i]["properties"]["value"],
						"common_id" : features[i]["properties"]["common_id"],
						"common_des" : features[i]["properties"]["common_des"],
						"indicator_des" : features[i]["properties"]["indicator_desc"],
						"data" : features[i]["properties"]["data"],

					};
				}

				data.push(item);
			}
			var col = {};
			if(admin_level === 'country'){
				col =  [
					{ data: 'admin_level' , title: 'Admin Level' },
					{ data: 'area_id' , title: 'Country code' },
					{ data: 'name_0' , title: 'Country' },
					{ data: 'year'  , title: 'Year' },
					{ data: 'common_id' , title: 'dimension id' },
					{ data: 'common_des'  , title: 'dimension desc' },
					{ data: 'indicator_des'  , title: 'indicator desc' },
					{ data: 'data'  , title: 'data' },
					{ data: 'value' , title: 'Value' }
				];
			}else{
				col = [
					{ data: 'admin_level' , title: 'Admin Level' },
					{ data: 'area_id' , title: 'Province code' },
					{ data: 'name_0' , title: 'Country' },
					{ data: 'name_1' , title: 'Province' },
					{ data: 'year'  , title: 'Year' },
					{ data: 'common_id' , title: 'dimension id' },
					{ data: 'common_des'  , title: 'dimension desc' },
					{ data: 'indicator_des'  , title: 'indicator desc' },
					{ data: 'data'  , title: 'data' },
					{ data: 'value' , title: 'Value' }
				];
			}

			$('#gii_datatable').DataTable({
				searching: false,
				pageLength: 50,
				data: data,
				columns: col,
				dom: 'Bfrtip',
				buttons: [
					{ extend: "copyHtml5", className: "export-btn" },
					{ extend: "excelHtml5", className: "export-btn" },
					{ extend: "csvHtml5", className: "export-btn" },
					{ extend: "pdfHtml5", className: "export-btn" },
					{
						text: 'Geojson',
						action: function ( e, dt, node, config ) {
							var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result[0], null, 2));
							var dlAnchorElem = document.getElementById('downloadAnchorElem');
							dlAnchorElem.setAttribute("href",     dataStr     );
							dlAnchorElem.setAttribute("download", selected_data_text+".geojson");
							dlAnchorElem.click();
						},
						className: "export-btn"
					}
				]
			});

			if(features.length === 0){
				$('.dt-buttons').css("display", "none");
			}else{
				$('.dt-buttons').css("display", "block");
			}
		});
	};

	$scope.destroyDatatable = function() {
		//Destroy the old Datatable
		$('#gii_datatable').DataTable().clear().destroy();
		$('#gii_datatable').empty();
	};

	$("#adm0_dropdown").change(function(){
		//Destroy the old Datatable
		$scope.destroyDatatable();

		area_id = "'"+this.value+"'";
		country_id=this.value;
		if(admin_level === 'province'){
			area_id = '9999';
		}
		if(this.value === '9999'){
			country_id = '9999';
			area_id = '9999';
		}

		var selected_dimension = $("#gii_dimension_dropdown").find('option:selected').val();
		if(selected_dimension === 'gii'){
			$scope.getData();
		}else{
			$scope.getDimensionData();
		}

		$("#adm1_dropdown").html("");
		$scope.getAdm1(country_id);

	});

	$scope.updateData = function () {

		var dimension_val = $("#gii_dimension_dropdown").find('option:selected').val();
		var indicator_val = $("#gii_indicators_dropdown").find('option:selected').val();
		if(indicator_val === '9999'){
			if(dimension_val === 'gii'){
				$scope.getData();
			}else{
				$scope.getDimensionData();
			}
		}else{
			$scope.getIndicatorData();
		}
	};



	$("#adm1_dropdown").change(function(){
		//Destroy the old Datatable
		$scope.destroyDatatable();

		area_id = "'"+this.value+"'";
		admin_level = "province";

		if(this.value === '9999'){
			area_id = '9999';
		}

		$scope.updateData();
	});




	$("#gii_dimension_dropdown").change(function(){
		//Destroy the old Datatable
		$scope.destroyDatatable();

		var selected = $(this).find('option:selected').val();
		selected_data_text = $(this).find('option:selected').text();
		common_id = selected;

		if(selected === 'gii'){
			$scope.getGIIIndicators('9999');
			$scope.getData();
		}else{
			$scope.getGIIIndicators(selected);
			$scope.getDimensionData();
		}
	});

	$("#gii_indicators_dropdown").change(function(){
		//Destroy the old Datatable
		$scope.destroyDatatable();

		var selected = $(this).find('option:selected').val();
		selected_data = selected;
		indicator_id = selected;
		selected_data_text = $(this).find('option:selected').text();

		if(selected === '9999'){
			$("#gii_dimension_dropdown").change();
		}else{
			$scope.getIndicatorData();
		}

	});




	$("#data_level_country").click(function(){

		//Destroy the old Datatable
		$scope.destroyDatatable();
		$("#data_level_province").removeClass("active");
		$(this).addClass("active");
		admin_level = 'country';
		//$("#adm1_dropdown").val("9999").change();

		$scope.updateData();

	});

	$("#data_level_province").click(function(){
		//Destroy the old Datatable
		$scope.destroyDatatable();

		if($("#adm1_dropdown").val() === '9999'){
			area_id = '9999';
		}
		$("#data_level_country").removeClass("active");
		$(this).addClass("active");
		admin_level = 'province';

		$scope.updateData();
	});


});
