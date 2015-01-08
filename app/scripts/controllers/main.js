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
    $scope.dimensions = 
    [	$scope.$root.TABLE_COLUMN_TEACHING,
    	$scope.$root.TABLE_COLUMN_RESEARCH,
	$scope.$root.TABLE_COLUMN_CITATIONS,
	$scope.$root.TABLE_COLUMN_IND_INCOME,
	$scope.$root.TABLE_COLUMN_IND_OUTLOOK,
	$scope.$root.TABLE_COLUMN_OVERALLSCORE
    ];

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
    $scope.country_field_name = $scope.$root.TABLE_COLUMN_COUNTRY;
    $scope.name               = $scope.$root.TABLE_COLUMN_INSTITUTION;
    $scope.tooltip_fields = [$scope.$root.TABLE_COLUMN_RANK20142015, $scope.$root.TABLE_COLUMN_INSTITUTION];
    

    ////////////////////////////////////////////////////////////////////////
    /// FILTERING 
    $scope.$FILTER_BY_COUNTRY = 0;
    $scope.$FILTER_BY_TEXT = 1;
    $scope.$FILTER_BY_BRUSH = 2;
    $scope.filtered;
    $scope.countries = [];
    $scope.$FILTER_COUNTRY_ALL = "All Countries";
    $scope.selectedCountry = $scope.$FILTER_COUNTRY_ALL;
    $scope.filterText = "";

    //get all the countries from the data
    $scope.countries = d3.set(data.map(function(d) 
      { 
        return d[$scope.country_field_name]; 
      })).values();

    //listern for the filtering coming from parallel brushes
    $scope.$on('onParallelBrushEvent', function(event, data)
    {
      updateDataFromFiltersValues($scope.$FILTER_BY_BRUSH, data);      
    });


    function updateDataFromFiltersValues(filterType, filterData)
    {
      data.forEach(function(d) 
      {
        //update filter flags on each datum of data
        //country flag
        if(filterType == $scope.$FILTER_BY_COUNTRY)
          d.filter_country = ($scope.selectedCountry == $scope.$FILTER_COUNTRY_ALL)? 
            true : (d[$scope.country_field_name] == $scope.selectedCountry);
        
        //text filter flag
        else if(filterType == $scope.$FILTER_BY_TEXT)          
          d.filter_name = ($scope.filterText == "")? 
            true : (d[$scope.name].toLowerCase().indexOf($scope.filterText.toLowerCase()) > -1);
        
        //brush filter flag
        else if(filterType == $scope.$FILTER_BY_BRUSH)
        {
          if (filterData.actives.length == 0)
            d.filter_brush = true;
          else
            d.filter_brush = filterData.actives.every(function(p, i) {      
              return filterData.extents[i][0] <= d[p] && d[p] <= filterData.extents[i][1];
            });
        }
      });

      //refresh the table with the filtered data
      $scope.update_table_data(data);

      //update results summary
      var l = data.filter(function(d) 
            { return d.filter_country && d.filter_brush && d.filter_name;
            }).length;
      d3.select("#numResults")
        .text(l + " institutions (" + ((l / data.length)*100).toFixed(1) + "%) match the criteria");
    }

    //set the countries as model for the countriesCombo
    d3.select("#countriesCombo")      
      .selectAll("option")
      .data($scope.countries.sort())
      .enter()
        .append("li")              
        .append("a")
          .attr("value", function(d) { return d;})
          .text(function(d) { return d;});    

    d3.select("#countriesCombo")
      .selectAll("li")
        .on("click", function(d) {
          $scope.selectedCountry = d3.select(this).selectAll("a").text().trim()
          d3.select("#countriesButton").text($scope.selectedCountry);
          $scope.selectedCountry = $scope.selectedCountry;
          updateDataFromFiltersValues($scope.$FILTER_BY_COUNTRY);
        })

    //enable filtering by name
    d3.select("#input_school")
      .on("keyup", function(d) {
        if(this.value == undefined)
          return;
        $scope.filterText = this.value;      
        updateDataFromFiltersValues($scope.$FILTER_BY_TEXT);
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

      $scope.table_data = theData
      .filter(function(d)
      {
        return d.filter_country && d.filter_brush && d.filter_name;
      })
      .map( function(node)
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

    updateDataFromFiltersValues();
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


    d3.select("#clearBrushesBtn")
      .on("click", function(d) {
        try {
          $scope.$emit('clearBrushes');
        } catch(err) {                    
        } 
      });
  });
