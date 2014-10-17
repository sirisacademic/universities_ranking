'use strict';

angular.module('arwuApp')
  .controller('MainCtrl', function ($scope, $compile, $http, data) {    
    // Extract the list of scope.dimensions and create a scale for each.
    // $scope.dimensions = ['Alumni', 'Award', 'HiCi', 'N&S', 'PUB', 'PCP', 'Total Score'];
    $scope.dimensions = ['Attrattività','Sostenibilità','Stage','Mobilità','Borse di studio','Dispersione','Efficacia','Soddisfatti','Ricerca','Fondi Esterni','Alta Formazione','Occupazione'];
    // $http.get('data/the_ranking_2013-2014.csv').then(function(response) {
    //   $scope.old_data = d3.csv.parse(response.data);
    // });

    console.dir(data);

        // Set proper margins, width and height
    $scope.margin             = { top: 30, right: 0, bottom: 10, left: 0 };
    $scope.width              = 1200 - $scope.margin.left - $scope.margin.right;
    $scope.height             = 420 - $scope.margin.top - $scope.margin.bottom;
    $scope.country_field_name = "Country",
    $scope.name               = "name"

    data.forEach(function(d) {
      d.filter_country = true;
      d.filter_brush = true;
      d.filter_name = true;

      // adding spaces to names 
      // d.Institution = d.Institution.replace(/([a-z])([A-Z])/g, '$1 $2');
      // d.Country = d.Country.replace(/([a-z])([A-Z])/g, '$1 $2');
      // d[$scope.country_field_name] = 'Italia';

      // console.dir(d)
      // $scope.dimensions.forEach(function(p) {
      //   if (p in d.data) {
      //     yearData = d.data[p];
      //     // research_doctorate_criteria (20) = FT research rank (10) + Faculty with doctorates (5) + FT doctoral rank (5)
      //     yearData['research_doctorate_criteria'] = yearData['FT research rank'] + yearData['Faculty with doctorates (%)'] + yearData['FT doctoral rank'];
      //     // international_criteria (20) = International mobility (6) + International faculty (4) + International students (4) + International experience index (3) + International board (2) + Languages (1)
      //     yearData['international_criteria'] = yearData['International mobility index'] + yearData['International faculty (%)'] + yearData['International students (%)'] + yearData['International experience index'] + yearData['International board (%)'] + yearData['Languages'];
      //   }
      // })
    })


    function getMaxValueFromMetric(metric) {
      return d3.max(data, function(d) {
          return d3.max(d3.values(d.data).map(function(p) {    
            return (p[metric] == undefined) ? 0 : p[metric];
          }));
        });
    }

           

    // elements are sorted according their position in the ranking in 2014. If they are not on 2014's ranking, they are sorted according their sum of ranks along the rest of the years
    // data.sort(function(a, b) {
    //   var aValue, bValue;
    //   if (a.data['2014'] == undefined && b.data['2014'] == undefined) {
    //     aValue = bValue = 0;
    //     $scope.dimensions.forEach(function(d) {
    //       aValue += (a.data[d] == undefined) ? 1000 : a.data[d][$scope.rankingMetric];
    //       bValue += (b.data[d] == undefined) ? 1000 : b.data[d][$scope.rankingMetric];
    //     })
    //   } else {
    //     aValue = (a.data['2014'] == undefined) ? 101 : a.data['2014'][$scope.rankingMetric];
    //     bValue = (b.data['2014'] == undefined) ? 101 : b.data['2014'][$scope.rankingMetric];
    //   }
    //   return aValue - bValue;
    // })    
    
    // saving the loaded data into the scope so the directives can draw it
    $scope.data = data;    

    // extending selections with the ability to be moved in front of the rest
    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };
        

    $scope.tooltip = d3.select("#tooltip")
            .style("visibility", "hidden")
            .style("background-color", "#ffffff");
      
    // d3.select('#tabbedpane')
    //   .style("width", $scope.width - $scope.margin.left - $scope.margin.right - 30 + "px")
    //   .style("margin-left", $scope.margin.left + 10 + "px");

    d3.select("#clearBrushesBtn")
      .on("click", function(d) {
        // console.log("Click!!!")
        try {
          $scope.clearBrushes();
        } catch(err) {                    
        } 
      });
  });
