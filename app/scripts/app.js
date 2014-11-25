'use strict';

angular
  .module('arwuApp', [
    'sirislab.siris-tableview',
    'sirislab.siris-stringUtils',
    'sirislab.siris-parallel',
    'ngResource',
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          data: ['$http', function($http) {
            return $http.get('data/arwu_2013_top-100.csv').then(function(response) {
              // console.log(response.data)
              return d3.csv.parse(response.data);
            })
          }
          ]
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  });

