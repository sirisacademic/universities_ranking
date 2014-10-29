'use strict';

angular
  .module('arwuApp', [
    'sirislab.siris-tableview',
    'sirislab.siris-stringUtils',
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
            return $http.get('data/the_ranking_2013-2014.csv').then(function(response) {
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

