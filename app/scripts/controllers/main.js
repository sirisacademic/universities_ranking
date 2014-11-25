'use strict';

angular.module('arwuApp')
  .controller('MainCtrl', function ($scope, $compile, $http, data, $StringUtils) {    

     //setup some global constants
    $scope.$root.TABLE_COLUMN_RANK20142015 = "Rank 2013-14";
    $scope.$root.TABLE_COLUMN_INSTITUTION = "Institution";
    $scope.$root.TABLE_COLUMN_COUNTRY = "Country";
    $scope.$root.TABLE_COLUMN_TEACHING = "Teaching";
    $scope.$root.TABLE_COLUMN_RESEARCH = "Research";
    $scope.$root.TABLE_COLUMN_CITATIONS = "Citations";
    $scope.$root.TABLE_COLUMN_IND_INCOME = "Ind. Income";
    $scope.$root.TABLE_COLUMN_IND_OUTLOOK = "Int. Outlook";
    $scope.$root.TABLE_COLUMN_OVERALLSCORE = "Overall Score";


    $scope.$root.COLUMN_PROPERTIES = new ColumnsProperties();    
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_RANK20142015,0, undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_INSTITUTION,0, 22, "left"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_COUNTRY,0, undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_TEACHING,1, undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_RESEARCH,1, undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_CITATIONS,1, undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_IND_OUTLOOK,1, undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_OVERALLSCORE,1, undefined, "center"));
    
    $scope.parallelproperties = {
      axisDirection: 'desc' //direction of the color scale: asc (0, bottom - 100, top), desc (100, bottom - 0, top)
    }
    // Extract the list of scope.dimensions and create a scale for each.
    // $scope.dimensions = ['Alumni', 'Award', 'HiCi', 'N&S', 'PUB', 'PCP', 'Total Score'];
    $scope.dimensions = ['Teaching', 'Research', 'Citations', 'Ind. Income', 'Int. Outlook', 'Overall Score'];

    $http.get('data/the_ranking_2013-2014.csv').then(function(response) {
      $scope.old_data = d3.csv.parse(response.data);
    });

    data.forEach(function(d) {
      d.filter_country = true;
      d.filter_brush = true;
      d.filter_name = true;

      // adding spaces to names 
      d.Institution = d.Institution.replace(/([a-z])([A-Z])/g, '$1 $2');
      d.Country = d.Country.replace(/([a-z])([A-Z])/g, '$1 $2');
    })


    function getMaxValueFromMetric(metric) {
      return d3.max(data, function(d) {
          return d3.max(d3.values(d.data).map(function(p) {    
            return (p[metric] == undefined) ? 0 : p[metric];
          }));
        });
    }

    // Set proper margins, width and height
    $scope.margin = { top: 30, right: 0, bottom: 10, left: 0 };
    $scope.width = 960 - $scope.margin.left - $scope.margin.right;
    $scope.height = 420 - $scope.margin.top - $scope.margin.bottom;
    $scope.country_field_name = "Country",
    $scope.name               = "Institution"
    $scope.tooltip_fields = [$scope.$root.TABLE_COLUMN_RANK20142015, $scope.$root.TABLE_COLUMN_INSTITUTION];
    


    //filter data for the table, just the necessary columns
      var cloneWithProps = function(object, keys)
      {
        var newObject = {};
        keys.forEach(function(key)
        {
          newObject[key] = object[key];
        });
        return newObject;
      }

      $scope.table_data = data.map( function(node)
        {
          //the headers used for the table will be the properties to extract from the objects in the data
          return cloneWithProps(node, $scope.$root.COLUMN_PROPERTIES.columns.map(
              function(columnProperty)
              {
                return columnProperty.header;
              }
            ));
        });



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
