'use strict';

angular.module('arwuApp')
  .controller('MainCtrl', function ($scope, $compile, $http, data, $StringUtils) {    

     //setup some global constants
    $scope.$root.TABLE_COLUMN_RANK20142015 = "Rank 2014-15";
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

    // Set proper margins, width and height and parallel coordinate
    $scope.margin = { top: 30, right: 0, bottom: 10, left: 0 };
    $scope.width = 960 - $scope.margin.left - $scope.margin.right;
    $scope.height = 420 - $scope.margin.top - $scope.margin.bottom;
    $scope.country_field_name = "Country";
    $scope.name               = "Institution";
    $scope.tooltip_fields = [$scope.name, $scope.country_field_name];
    $scope.parallelproperties = {
      lineProperties:
      {
        curvedPath: false,
        fgColor: 'steelblue'  //color for the foreground lines
      },
      draggableAxis:false,
      axisDirection: 'desc', //direction of the color scale: asc (0, bottom - 100, top), desc (100, bottom - 0, top)
      yDomain:[0, 100]    //[bottom, top] (cartesian axis)
    }

    // Extract the list of scope.dimensions and create a scale for each.
    // $scope.dimensions = ['Alumni', 'Award', 'HiCi', 'N&S', 'PUB', 'PCP', 'Total Score'];
    $scope.dimensions = ['Teaching', 'Research', 'Citations', 'Ind. Income', 'Int. Outlook', 'Overall Score'];

   
    
$scope.filtered;
    $scope.countries = [];
    $scope.selectedCountry = "All Countries";

    //get all the countries from the data
    $scope.countries = d3.set(data.map(function(d) 
      { 
        return d[$scope.country_field_name]; 
      })).values();

    //set the countries as model for the countriesCombo
    d3.select("#countriesCombo")      
      .selectAll("option")
      .data($scope.countries.sort())
      .enter()
        .append("li")              
        .append("a")
          // .attr("href", function() { return ''; })
          .attr("value", function(d) { return d;})
          .text(function(d) { return d;});    

    d3.select("#countriesCombo")
      .selectAll("li")
        .on("click", function(d) {
          $scope.selectedCountry = d3.select(this).selectAll("a").text().trim()
          d3.select("#countriesButton").text($scope.selectedCountry);
          $scope.selectedCountry = $scope.selectedCountry;

          //send event of filterByCountry
          $scope.$root.$broadcast('filterByCountry', $scope.selectedCountry);

          //refresh the table with the filtered data
          $scope.update_table_data(
              ($scope.selectedCountry == "All Countries")? data : data.filter(function(d)
              {
                return d[$scope.country_field_name] == $scope.selectedCountry;
              })
            );
        })

    //enable filtering by name
    d3.select("#input_school")
      .on("keyup", function(d) {
        if(this.value == undefined)
          return;

        var filterText = this.value;
        
        //send event of filterByName
        $scope.$root.$broadcast('filterByName', filterText.toLowerCase());

        //refresh the table with the filtered data
          $scope.update_table_data(
              (filterText.length == 0)? data : data.filter(function(d)
              {
                return (d[$scope.name].toLowerCase().indexOf(filterText.toLowerCase()) > -1);
              })
            );
      })


    /////////////
    // function that prepares the data to be consumed by the table
    // called everytime the data is updated (p.ex, filtered)
    $scope.update_table_data = function(theData)
    {
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

      $scope.table_data = theData.map( function(node)
      {
        //the headers used for the table will be the properties to extract from the objects in the data
        return cloneWithProps(node, $scope.$root.COLUMN_PROPERTIES.columns.map(
            function(columnProperty)
            {
              return columnProperty.header;
            }
          ));
      });  

      if(!$scope.$$phase) 
        $scope.$apply();
    }

    $scope.update_table_data(data);





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
