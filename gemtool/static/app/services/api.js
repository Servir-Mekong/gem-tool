(function () {
	'use strict';
	angular.module('baseApp')
	.service('APIService', function ($http, $q) {
		var service = this;

		service.getGII = function (options) {
			var config = {
				params: {
					action: 'get-gii',
					admin_level: options.admin_level,
					area_id: options.area_id,
					country_id: options.country_id,
					year: options.year
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};


		service.getLineChartData = function (options) {
			var config = {
				params: {
					action: 'get-line-chart-data',
					admin_level: options.admin_level,
					area_id: options.area_id,
					country_id: options.country_id,
					start_year: options.start_year,
					end_year: options.end_year
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.getDimensionLineChartData = function (options) {
			var config = {
				params: {
					action: 'get-dimension-line-chart-data',
					admin_level: options.admin_level,
					area_id: options.area_id,
					common_id: options.common_id,
					gender_type: options.gender_type,
					country_id: options.country_id,
					start_year: options.start_year,
					end_year: options.end_year
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.downloadDataset = function (options) {
			var config = {
				params: {
					action: 'download-dataset',
					admin_level: options.admin_level,
					area_id: options.area_id,
					country_id: options.country_id,
					start_year: options.start_year,
					end_year: options.end_year,
					dataset_id: options.dataset_id
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};


		service.downloadGII = function (options) {
			var config = {
				params: {
					action: 'download-gii',
					admin_level: options.admin_level,
					area_id: options.area_id,
					country_id: options.country_id,
					start_year: options.start_year,
					end_year: options.end_year
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};



		service.getDimensionGroup = function (options) {
			var config = {
				params: {
					action: 'get-dimension-group',
					area_id: options.area_id,
					year: options.year,
					admin_level: options.admin_level,
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.getDimensionData = function (options) {
			var config = {
				params: {
					action: 'get-dimension-data',
					area_id: options.area_id,
					year: options.year,
					admin_level: options.admin_level,
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.getDimensionMap = function (options) {
			var config = {
				params: {
					action: 'get-dimension-map',
					area_id: options.area_id,
					year: options.year,
					admin_level: options.admin_level,
					common_id: options.common_id,
					gender_type: options.gender_type,
					country_id: options.country_id
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.getIndicatorMap = function (options) {
			var config = {
				params: {
					action: 'get-gii-indicator-map',
					area_id: options.area_id,
					year: options.year,
					admin_level: options.admin_level,
					indicator_id: options.indicator_id,
					gender_type: options.gender_type,
					country_id: options.country_id
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.getIndicatorGraphData = function (options) {
			var config = {
				params: {
					action: 'get-indicator-graph-data',
					area_id: options.area_id,
					year: options.year,
					admin_level: options.admin_level,
					indicator_id: options.indicator_id
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};


		service.getDimensionGraphData = function (options) {
			var config = {
				params: {
					action: 'get-dimension-graph-data',
					area_id: options.area_id,
					year: options.year,
					admin_level: options.admin_level,
					common_id: options.common_id
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};



		service.downloadDimensionData = function (options) {
			var config = {
				params: {
					action: 'download-dimension-data',
					area_id: options.area_id,
					admin_level: options.admin_level,
					common_id: options.common_id,
					start_year: options.start_year,
					end_year: options.end_year,
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.downloadIndicatorsData = function (options) {
			var config = {
				params: {
					action: 'download-indicator-data',
					area_id: options.area_id,
					admin_level: options.admin_level,
					start_year: options.start_year,
					end_year: options.end_year,
					indicator_id: options.indicator_id,
					country_id: options.country_id

				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.getIndicatorData = function (options) {
			var config = {
				params: {
					action: 'get-indicator-data',
					area_id: options.area_id,
					year: options.year,
					admin_level: options.admin_level,
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.getIndicatorGroup = function (options) {
			var config = {
				params: {
					action: 'get-indicator-group',
					area_id: options.area_id,
					year: options.year,
					admin_level: options.admin_level,
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.getAdm0 = function () {
			var config = {
				params: {
					action: 'get-adm0'
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.getCountryMap = function (options) {
			var config = {
				params: {
					country_id: options.country_id,
					action: 'get-country'
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.getAdm1 = function (options) {
			var config = {
				params: {
					action: 'get-adm1',
					adm1_id: options.adm1_id
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.getMainGIISector = function (options) {
			var config = {
				params: {
					action: 'get-gii-sector',
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.getGIIIndicators = function (options) {
			var config = {
				params: {
					action: 'get-gii-indicators',
					indicator_id: options.id
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.getMainSector = function (options) {
			var config = {
				params: {
					action: 'get-main-sector-option',
					country_id: options.country_id
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.getDatasetL1 = function (options) {
			var config = {
				params: {
					action: 'get-datasetl1-option',
					sector_id: options.id,
					country_id: options.country_id
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.getDataset = function (options) {
			var config = {
				params: {
					action: 'get-dataset-option',
					sector_id: options.id,
					country_id: options.country_id
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.get_dataset_download = function (options) {
			var config = {
				params: {
					action: 'get_dataset_download',
					sector_id: options.id,
					country_id: options.country_id
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.getDatesetMap = function (options) {
			var config = {
				params: {
					action: 'get-dataset-map',
					area_id: options.area_id,
					admin_level: options.admin_level,
					dataset_id: options.dataset_id,
					gender_type: options.gender_type,
					year:options.year,
					country_id:options.country_id,
					dataset_id_l1:options.dataset_id_l1,
					dataset_name_l2:options.dataset_name_l2,
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.getGenderGapMap = function (options) {
			var config = {
				params: {
					action: 'get-gandergap-map',
					area_id: options.area_id,
					admin_level: options.admin_level,
					dataset_id: options.dataset_id,
					gender_type: options.gender_type,
					year:options.year,
					country_id:options.country_id,
					dataset_id_l1:options.dataset_id_l1,
					dataset_name_l2:options.dataset_name_l2,
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.check_data = function (options) {
			var config = {
				params: {
					action: 'check_data',
					dataset_id_l1:options.dataset_id_l1,
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.check_indicator_data = function (options) {
			var config = {
				params: {
					action: 'check_indicator_data',
					data_id:options.data_id,
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.check_dimension_data = function (options) {
			var config = {
				params: {
					action: 'check_dimension_data',
					data_id:options.data_id,
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.find_dataset_id_l2 = function (options) {
			var config = {
				params: {
					action: 'find_dataset_id_l2',
					dataset_id_l1:options.dataset_id_l1,
					gender_type: options.gender_type,
					dataset_name_l2:options.dataset_name_l2,
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.find_unique_indicator_id = function (options) {
			var config = {
				params: {
					action: 'find_unique_indicator_id',
					indicator_id:options.indicator_id,
					gender_type: options.gender_type,
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};


		service.check_available_year = function (options) {
			var config = {
				params: {
					action: 'check_available_year',
					dataset_id_l1:options.dataset_id_l1,
					sector_id: options.id,
					country_id: options.country_id,
					gender_type: options.gender_type,
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};

		service.check_gii_available_year = function (options) {
			var config = {
				params: {
					action: 'check_gii_available_year',
					check_data_level:options.check_data_level,
					admin_level: options.admin_level,
					data_id: options.data_id,
					gender_type: options.gender_type,
					area_id: options.area_id
				}
			};
			var promise = $http.get('/api/mapclient/', config)
			.then(function (response) {
				return response.data;
			});
			return promise;
		};



	});

})();
