'use strict';
angular.module('baseApp')
.controller('downloaddatasetcontroller' ,function ($scope, $timeout, APIService) {

	var zoomThreshold = 4;
	// Create a popup, but don't add it to the map yet.

	var filter = null;
	var selected_features = ['in', 'area_id'];
	var area_id = '9999';
	var admin_level = 'province';
	var country_id = '40';  //cambodia
	var selected_data = 'gii'; //defaul
	var selected_data_text = 'Children aged 6-14 never attending school';
	var dataset_id = '';
	var year = 2020;
	var init = true;

	$scope.showSpinner = true;
	var send=true;
	var datepicker_start = $("#start").val();
	var datepicker_end = $("#end").val();
	$scope.showSpinner = true;
	var by_gender = '';
	var data_lvl = '';

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
			$scope.getData();
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
		$("#adm0_dropdown").change();
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
	$scope.getAdm1(9999);

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
		var params= {
			id: id,
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
		APIService.get_dataset_download(params)
		.then(function (result){
			var dataset_l2 = result;
			$("#dataset-dropdown").html("");
			for (var i = 0; i < dataset_l1.length; i++) {
				var optgroup = "<optgroup label='"+dataset_l1[i]["dataset_name_l1"]+"'>";
				for (var j = 0; j < dataset_l2.length; j++) {
					if(dataset_l1[i]["dataset_id_l1"] === dataset_l2[j]["dataset_id_l1"])

					if(dataset_l2[j]["dataset_name_l2"] === 'NA'){

						optgroup += "<option data-content='"+dataset_l1[i]["dataset_name_l1"]+"' data-by_gender='"+dataset_l2[j]["data"]+"' value='" + dataset_l2[j]["dataset_id"] + "'>" + dataset_l1[i]["dataset_name_l1"] +' : '+dataset_l2[j]["data"] + "</option>";
					}else{
						optgroup += "<option data-content='"+dataset_l1[i]["dataset_name_l1"]+"' data-by_gender='"+dataset_l2[j]["data"]+"' value='" + dataset_l2[j]["dataset_id"] + "'>" + dataset_l1[i]["dataset_name_l1"] +" - "+ dataset_l2[j]["dataset_name_l2"]+': '+dataset_l2[j]["data"] + "</option>";

					}
				}
				optgroup += "</optgroup>";
				$('#dataset-dropdown').append(optgroup);
			}
			by_gender = $(this).find('option:selected').attr('data-by_gender');
			$("#dataset-dropdown").trigger("change");
		});
	};


	$scope.getData = function () {
		$scope.showSpinner = true;
		var params= {
			area_id: area_id,
			admin_level: admin_level,
			country_id: country_id,
			start_year: datepicker_start,
			end_year: datepicker_end,
			dataset_id: dataset_id
		};
		APIService.downloadDataset(params)
		.then(function (result){
			var features = result[0].features;
			$scope.showSpinner = false;
			var data = [];
			for(var i=0; i<features.length; i++){
				var item = {
					"area_id": features[i]["properties"]["area_id"],
					"area_name": features[i]["properties"]["area_name"],
					"year": features[i]["properties"]["year"],
					"section_id": features[i]["properties"]["section_id"],
					"dataset_id_l1": features[i]["properties"]["dataset_id_l1"],
					"dataset_id_l2": features[i]["properties"]["dataset_id_l2"],
					"section_name": features[i]["properties"]["section_name"],
					"dataset_name_l1": features[i]["properties"]["dataset_name_l1"],
					"dataset_name_l2": features[i]["properties"]["dataset_name_l2"].replace("NA", ""),
					"value": features[i]["properties"]["value"],
					"data": features[i]["properties"]["data"],
					"unit": features[i]["properties"]["unit"],

				};

				data.push(item);
			}

			var col = [
				{ data: 'area_id' , title: 'Area Code' },
				{ data: 'area_name' , title: 'Province' },
				{ data: 'year' , title: 'year' },
				// { data: 'section_id' , title: 'Section Id' },
				// { data: 'dataset_id_l1'  , title: 'Dataset ID level1' },
				// { data: 'dataset_id_l2' , title: ' Dataset ID level2' },
				{ data: 'section_name' , title: 'Section Name' },
				{ data: 'dataset_name_l1'  , title: 'Dataset Name level1' },
				{ data: 'dataset_name_l2'  , title: 'Dataset Name level2' },
				{ data: 'value' , title: 'value' },
				{ data: 'data'  , title: 'data' },
				{ data: 'unit' , title: ' unit' },
			];

			$('#datatable').DataTable({
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


		});

	};

	$scope.destroyDatatable = function() {
		//Destroy the old Datatable
		if ( $.fn.DataTable.isDataTable('#datatable') ) {
			$('#datatable').DataTable().clear().destroy();
			$('#datatable').empty();
		}
	};

	$("#adm0_dropdown").change(function(){
		$scope.showSpinner = true;
		area_id = '9999';
		country_id=this.value;
		$scope.destroyDatatable();
		$scope.getMainSector();

		$("#adm1_dropdown").html("");
		$scope.getAdm1(country_id);


	});

	$("#adm1_dropdown").change(function(){
		$scope.destroyDatatable();
		$scope.showSpinner = true;
		area_id = "'"+this.value+"'";
		if($("#adm1_dropdown").val() === '9999'){
			area_id = '9999';
		}
		admin_level = "province";
		$scope.getData();

	});

	$("#main-sector-dropdown").change(function(){
		var selected = $(this).find('option:selected').val();
		selected_data = selected;
		selected_data_text = $(this).find('option:selected').text();
		data_lvl ='idx';
		$scope.getDatasetL1(selected_data);
	});

	$("#dataset-dropdown").change(function(){
		//Destroy the old Datatable
		$scope.destroyDatatable();
		$scope.showSpinner = true;
		var selected = $(this).find('option:selected').val();
		var dataset_name_l2 = $(this).find('option:selected').text();
		var dataset_name_l1 = $(this).find('option:selected').attr('data-content');
		by_gender = $(this).find('option:selected').attr('data-by_gender');
		selected_data_text = dataset_name_l1 + ": " + dataset_name_l2 + " " + year;
		$("#dataset_name").text(selected_data_text);
		data_lvl ='idc';
		dataset_id = selected;
		$scope.getData();
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
