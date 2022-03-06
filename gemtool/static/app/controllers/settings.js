(function () {
	'use strict';
	angular.module('baseApp')
	.controller('settingsCtrl', function ($scope, $translate, $rootScope) {
		$scope.changeLanguage = function (key) {
			$rootScope.lang = key;
			$translate.use(key);
			localStorage.setItem('selectedLanguage', key);
		};
	});
})();
