'use strict';
angular.module('arwuApp', [
  'sirislab.siris-tableview',
  'sirislab.siris-stringUtils',
  'ngResource',
  'ngRoute'
]).config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl',
      resolve: {
        data: [
          '$http',
          function ($http) {
            return $http.get('data/the_ranking_2014-2015.csv').then(function (response) {
              // console.log(response.data)
              return d3.csv.parse(response.data);
            });
          }
        ]
      }
    }).otherwise({ redirectTo: '/' });
  }
]);
'use strict';
angular.module('arwuApp').controller('MainCtrl', [
  '$scope',
  '$compile',
  '$http',
  'data',
  '$StringUtils',
  function ($scope, $compile, $http, data, $StringUtils) {
    //setup some global constants
    $scope.$root.TABLE_COLUMN_RANK20142015 = 'Rank 2014-15';
    $scope.$root.TABLE_COLUMN_INSTITUTION = 'Institution';
    $scope.$root.TABLE_COLUMN_COUNTRY = 'Country';
    $scope.$root.TABLE_COLUMN_TEACHING = 'Teaching';
    $scope.$root.TABLE_COLUMN_RESEARCH = 'Research';
    $scope.$root.TABLE_COLUMN_CITATIONS = 'Citations';
    $scope.$root.TABLE_COLUMN_IND_INCOME = 'Ind. Income';
    $scope.$root.TABLE_COLUMN_IND_OUTLOOK = 'Int. Outlook';
    $scope.$root.TABLE_COLUMN_OVERALLSCORE = 'Overall Score';
    $scope.$root.COLUMN_PROPERTIES = new ColumnsProperties();
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_RANK20142015, 0, undefined, 'center'));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_INSTITUTION, 0, 22, 'left'));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_COUNTRY, 0, undefined, 'center'));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_TEACHING, 1, undefined, 'center'));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_RESEARCH, 1, undefined, 'center'));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_CITATIONS, 1, undefined, 'center'));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_IND_OUTLOOK, 1, undefined, 'center'));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_OVERALLSCORE, 1, undefined, 'center'));
    // Extract the list of scope.dimensions and create a scale for each.
    // $scope.dimensions = ['Alumni', 'Award', 'HiCi', 'N&S', 'PUB', 'PCP', 'Total Score'];
    $scope.dimensions = [
      'Teaching',
      'Research',
      'Citations',
      'Ind. Income',
      'Int. Outlook',
      'Overall Score'
    ];
    $http.get('data/the_ranking_2013-2014.csv').then(function (response) {
      $scope.old_data = d3.csv.parse(response.data);
    });
    data.forEach(function (d) {
      d.filter_country = true;
      d.filter_brush = true;
      d.filter_name = true;
      // adding spaces to names 
      d.Institution = d.Institution.replace(/([a-z])([A-Z])/g, '$1 $2');
      d.Country = d.Country.replace(/([a-z])([A-Z])/g, '$1 $2');  // console.dir(d)
                                                                  // $scope.dimensions.forEach(function(p) {
                                                                  //   if (p in d.data) {
                                                                  //     yearData = d.data[p];
                                                                  //     // research_doctorate_criteria (20) = FT research rank (10) + Faculty with doctorates (5) + FT doctoral rank (5)
                                                                  //     yearData['research_doctorate_criteria'] = yearData['FT research rank'] + yearData['Faculty with doctorates (%)'] + yearData['FT doctoral rank'];
                                                                  //     // international_criteria (20) = International mobility (6) + International faculty (4) + International students (4) + International experience index (3) + International board (2) + Languages (1)
                                                                  //     yearData['international_criteria'] = yearData['International mobility index'] + yearData['International faculty (%)'] + yearData['International students (%)'] + yearData['International experience index'] + yearData['International board (%)'] + yearData['Languages'];
                                                                  //   }
                                                                  // })
    });
    function getMaxValueFromMetric(metric) {
      return d3.max(data, function (d) {
        return d3.max(d3.values(d.data).map(function (p) {
          return p[metric] == undefined ? 0 : p[metric];
        }));
      });
    }
    // Set proper margins, width and height
    $scope.margin = {
      top: 30,
      right: 0,
      bottom: 10,
      left: 0
    };
    $scope.width = 960 - $scope.margin.left - $scope.margin.right;
    $scope.height = 420 - $scope.margin.top - $scope.margin.bottom;
    $scope.country_field_name = 'Country', $scope.name = 'Institution';
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
    //filter data for the table, just the necessary columns
    var cloneWithProps = function (object, keys) {
      var newObject = {};
      keys.forEach(function (key) {
        newObject[key] = object[key];
      });
      return newObject;
    };
    $scope.table_data = data.map(function (node) {
      //the headers used for the table will be the properties to extract from the objects in the data
      return cloneWithProps(node, $scope.$root.COLUMN_PROPERTIES.columns.map(function (columnProperty) {
        return columnProperty.header;
      }));
    });
    // saving the loaded data into the scope so the directives can draw it
    $scope.data = data;
    // extending selections with the ability to be moved in front of the rest
    d3.selection.prototype.moveToFront = function () {
      return this.each(function () {
        this.parentNode.appendChild(this);
      });
    };
    $scope.tooltip = d3.select('#tooltip').style('visibility', 'hidden').style('background-color', '#ffffff');
    // d3.select('#tabbedpane')
    //   .style("width", $scope.width - $scope.margin.left - $scope.margin.right - 30 + "px")
    //   .style("margin-left", $scope.margin.left + 10 + "px");
    d3.select('#clearBrushesBtn').on('click', function (d) {
      // console.log("Click!!!")
      try {
        $scope.clearBrushes();
      } catch (err) {
      }
    });
  }
]);
'use strict';
angular.module('arwuApp').directive('parallel', function () {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {
      var filterText = '';
      var data = [];
      scope.$watch('data', function () {
        data = scope.data;
        draw();
      });
      //listen for outside events to highligh/unhighlight nodes
      scope.$root.$on('modifyNode', function (event, data) {
        console.log('modify node', data.action);
        // highlighted the corresponding element given a datum
        if (data.action == 'highlight') {
          var selectedElement = foreground.filter(function (d) {
              return d[scope.name] == data.node[scope.name];
            });
          highlightLine(selectedElement.node());
        } else {
          foreground.style('stroke', 'steelblue');
          d3.selectAll('.circleText').attr('display', 'none');
          svg.selectAll('.compareground').selectAll('path').style('visibility', 'hidden');
        }
      });
      /*
        // highlighted the corresponding element given a datum
        scope.highlightParallel = function(hoveredElelemnt) {          
          // console.log(scope.name_field_name)
          // console.log(hoveredElelemnt[scope.name_field_name])
          var selectedElement = foreground.filter(function(d) {
            return d[scope.name] == hoveredElelemnt[name];
          })
          
          highlightLine(selectedElement.node());
        }

        scope.unHighlightParallel = function() {
          foreground.style("stroke", "steelblue");
          d3.selectAll(".circleText")
                .attr("display", "none");

          svg.selectAll(".compareground")
                  .selectAll("path")
                  .style('visibility', 'hidden'); 
        }
*/
      scope.clearBrushes = function () {
        // console.log("Clear brushes")
        var actives = getActiveDimensions();
        // console.log("Active brushes: " + actives.length)
        d3.selectAll('.brush').each(function (d) {
          d3.select(this).call(y[d].brush.clear());
        });
        brush();
      };
      // Given a data object and a year (column) retrieves its value according to one metric (default is Current rank)
      // function getValue(d, year) {
      //   return (!(year in d.data)) ? 101 : d.data[year][scope.rankingMetric];
      // }        
      var x = d3.scale.ordinal().rangePoints([
          0,
          scope.width
        ], 1), y = {}, dragging = {};
      var line = d3.svg.line(),
        // .interpolate("monotone"),
        axisLeft = d3.svg.axis().orient('left').ticks(8), axisRight = d3.svg.axis().orient('right').ticks(8), axis = d3.svg.axis().orient('left').ticks(0), background, foreground, strokeWidth = 1.5;
      var svg = d3.select(element[0]).append('svg').attr('width', scope.width + scope.margin.left + scope.margin.right).attr('height', scope.height + scope.margin.top + scope.margin.bottom).append('g').attr('transform', 'translate(' + scope.margin.left + ',' + scope.margin.top + ')');
      var filtered, countries = [], selectedCountry = 'All Countries';
      d3.select('#input_school').on('keyup', function (d) {
        filterText = this.value.toLowerCase();
        filterByName();
      });
      // d3.csv("shanghai_ranking.csv", function(data) {
      function draw() {
        // create a country list that splits those BS that belong to more than one country
        // var countryList = d3.keys(d3.set(data.map(function(d) {
        //   return d[country_field_name];
        // })));
        // var set = d3.set(countryList);
        // // console.log(set)
        // set.forEach(function(d) {
        //   countries.push(d);
        //   printBytes(d)
        // })
        countries = d3.set(data.map(function (d) {
          return d[scope.country_field_name];
        })).values();
        // countries = d3.keys(set);
        d3.select('#countriesCombo').selectAll('option').data(countries.sort()).enter().append('li').append('a').attr('value', function (d) {
          return d;
        }).text(function (d) {
          return d;
        });
        d3.select('#countriesCombo').selectAll('li').on('click', function (d) {
          // selectedCountry = $("#countriesCombo").find('option:selected').val();
          selectedCountry = d3.select(this).selectAll('a').text().trim();
          d3.select('#countriesButton').text(selectedCountry);
          selectedCountry = selectedCountry;
          filterByCountry(selectedCountry);
        });
        x.domain(scope.dimensions);
        scope.dimensions.forEach(function (d) {
          y[d] = d3.scale.linear().domain([
            0,
            100
          ]).range([
            scope.height,
            0
          ]);
        });
        var nElements = data.length,
          // strokeWidth = (scope.height / nElements) * 0.8;
          color = d3.scale.category20();
        // Add grey background lines for context.
        background = svg.append('svg:g').attr('class', 'background').selectAll('path').data(data).enter().append('svg:path').attr('d', path);
        // Add blue foreground lines for focus.
        foreground = svg.append('svg:g').attr('class', 'foreground').selectAll('path').data(data, function (d) {
          return d[scope.name];
        }).enter().append('svg:path').attr('d', path).attr('stroke-width', strokeWidth + 'px').attr('stroke', function (d) {
          return color(d);
        }).on('mouseover', function (d) {
          scope.tooltip.html('<font size=\'2\'>' + d['Rank 2014-15'] + '. ' + d['Institution'] + '</font>').style('visibility', 'visible');
          highlightLine(this);
        }).on('mousemove', function () {
          // d3.event must be used to retrieve pageY and pageX. While this is not needed in Chrome, it is needed in Firefox
          scope.tooltip.style('top', d3.event.pageY - 20 + 'px').style('left', d3.event.pageX + 5 + 'px');
        }).on('mouseout', function () {
          scope.tooltip.style('visibility', 'hidden');
          d3.select(this).style('stroke', 'steelblue').style('stroke-width', strokeWidth);
          d3.selectAll('.circleText').attr('display', 'none');
          svg.selectAll('.compareground').selectAll('path').style('visibility', 'hidden');
        });
        // Add a group element for each dimension.
        var g = svg.selectAll('.dimension').data(scope.dimensions).enter().append('svg:g').attr('class', 'dimension').attr('transform', function (d) {
            return 'translate(' + x(d) + ')';
          });
        // .call(d3.behavior.drag()
        //   .on("dragstart", function(d) {
        //     dragging[d] = this.__origin__ = x(d);
        //     background.attr("visibility", "hidden");
        //   })
        //   .on("drag", function(d) {
        //     dragging[d] = Math.min(scope.width, Math.max(0, this.__origin__ += d3.event.dx));
        //     foreground.attr("d", path)
        //               .attr("stroke-width", strokeWidth);
        //     scope.dimensions.sort(function(a, b) { return position(a) - position(b); });
        //     x.domain(scope.dimensions);
        //     g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        //   })
        //   .on("dragend", function(d) {
        //     delete this.__origin__;
        //     delete dragging[d];
        //     transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
        //     transition(foreground)
        //         .attr("d", path)
        //         .attr("stroke-width", strokeWidth);
        //     background
        //         .attr("d", path)
        //         .attr("stroke-width", strokeWidth)
        //         .transition()
        //         .delay(500)
        //         .duration(0)
        //         .attr("visibility", null);
        //   }));
        var fakeData = [{
              'Citations': '65.9',
              'Country': 'Fake',
              'Ind. Income': '30',
              'Institution': 'Fake!!!',
              'Int. Outlook': '36',
              'Overall Score': '44.8',
              'Research': '26.3',
              'Teaching': '45.6'
            }];
        var compareline = svg.append('svg:g').attr('class', 'compareground').append('svg:path');
        //   .selectAll("path")
        //   .data(fakeData)
        //   .enter().append("svg:path")
        //     .attr("d", path)
        //     .attr('stroke-dasharray', '10,10');
        // Add an axis and title.
        g.append('svg:g').attr('class', 'axis').each(function (d, i) {
          if (i == scope.dimensions.length - 1)
            return d3.select(this).call(axisRight.scale(y[d]));
          else if (i == 0)
            d3.select(this).call(axisLeft.scale(y[d]));
          else
            d3.select(this).call(axis.scale(y[d]));
        }).append('svg:text').attr('text-anchor', 'middle').attr('y', -9).text(String);
        // Add and store a brush for each axis.
        g.append('svg:g').attr('class', 'brush').each(function (d) {
          d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on('brush', brush));
        }).selectAll('rect').attr('x', -8).attr('width', 16);
        var circleElements = svg.selectAll('g circleText').data(scope.dimensions).enter().append('g').attr('class', 'circleText').attr('display', 'none').attr('transform', function (d) {
            return 'translate(' + x(d) + ',80)';
          });
        circleElements.append('circle').attr('r', 11).attr('stroke', 'red').attr('fill', 'white');
        circleElements.append('text').attr('text-anchor', 'middle').attr('font-size', '9px').style('dominant-baseline', 'central').text('89');
        manageFilteredElements();
      }
      ;
      function position(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
      }
      function transition(g) {
        return g.transition().duration(500);
      }
      // Returns the path for a given data point.
      function path(d) {
        // return line(scope.dimensions.map(function(p) { return [position(p), y[p](getValue(d, p))]; }));          
        return line(scope.dimensions.map(function (p) {
          return [
            position(p),
            y[p](d[p])
          ];
        }));
      }
      function filterByCountry() {
        foreground.style('display', function (d) {
          d.filter_country = selectedCountry == 'All Countries' ? true : d[scope.country_field_name] == selectedCountry;
          return d.filter_country && d.filter_brush && d.filter_name ? null : 'none';
        });
        manageFilteredElements();
      }
      function checkMultiCountryBS(d) {
        var cs = d[$scope.country_field_name].split('/');
        for (var i = 0; i < cs.length; i++)
          cs[i] = cs[i].trim();
        return $.inArray(selectedCountry, cs) > -1;
      }
      function filterByName() {
        foreground.style('display', function (d) {
          d.filter_name = d[scope.name].toLowerCase().indexOf(filterText) > -1;
          return d.filter_country && d.filter_brush && d.filter_name ? null : 'none';
        });
        manageFilteredElements();
      }
      function getActiveDimensions() {
        return scope.dimensions.filter(function (p) {
          return !y[p].brush.empty();
        });
      }
      // Handles a brush event, toggling the display of foreground lines.
      function brush() {
        var actives = getActiveDimensions(), extents = actives.map(function (p) {
            return y[p].brush.extent();
          });
        if (actives.length == 0) {
          foreground.style('display', function (d) {
            d.filter_brush = true;
            return d.filter_country && d.filter_brush && d.filter_name ? null : 'none';
          });
        } else {
          foreground.style('display', function (d) {
            d.filter_brush = actives.every(function (p, i) {
              return extents[i][0] <= d[p] && d[p] <= extents[i][1];
            });
            return d.filter_country && d.filter_brush && d.filter_name ? null : 'none';
          });
        }
        d3.select('#clearBrushesBtn').attr('disabled', function () {
          return actives.length > 0 ? null : '';
        });
        manageFilteredElements();
      }
      function manageFilteredElements() {
        // console.log("manageFilteredElements")
        // Get filtered elements
        scope.activeRows = foreground.filter(function () {
          return d3.select(this).style('display') != 'none';
        }).data();
        if (!scope.$$phase)
          scope.$apply();
        d3.select('#numResults').text(scope.activeRows.length + ' (' + (scope.activeRows.length / scope.data.length * 100).toFixed(1) + '%) institutions match the criteria');
      }
      function highlightLine(svgContainer) {
        var d = d3.select(svgContainer).data()[0];
        d3.select(svgContainer).style('stroke', 'red').style('stroke-width', strokeWidth + 1);
        var sel = d3.select(svgContainer);
        sel.moveToFront();
        var circles = d3.selectAll('.circleText').attr('display', true).attr('transform', function (p) {
            return 'translate(' + x(p) + ',' + y[p](d[p]) + ')';
          });
        circles.selectAll('text').text(function (p) {
          return d[p] == 0 ? '-' : d[p];
        });
        // retrieve values from last year
        var old_values = scope.old_data.filter(function (p) {
            return p.Institution == d.Institution;
          });
        console.log(old_values);
        // show last year's line
        svg.selectAll('.compareground').data(old_values).append('svg:path').attr('d', path).attr('stroke-dasharray', '2,3').style('visibility', 'visible');
      }
    }
  };
});
//configuration objects used for this directive
//ColumProperty
function ColumnProperties(header, isSortable, widthPercentage, textAlign) {
  this.header = header;
  this.isSortable = isSortable;
  this.widthPercentage = widthPercentage;
  this.textAlign = textAlign;
}
//ColumProperties
function ColumnsProperties() {
  this.columns = [];
}
;
ColumnsProperties.prototype.addColumnProperties = function (columnProperties) {
  this.columns.push(columnProperties);
};
ColumnsProperties.prototype.getIndexOfColumnWithPercentage = function () {
  for (var i = 0; i < this.columns.length; i++) {
    if (this.columns[i].widthPercentage != undefined)
      return i;
  }
  return -1;
};
'use strict';
angular.module('sirislab.siris-tableview', ['sirislab.siris-browserService']).directive('tableview', [
  '$browserService',
  function ($browserService) {
    return {
      template: '<div id="directive-tableview">' + '  <div id="tablewrapper">' + '    <table class="table" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:0">' + '      <thead>' + '        <tr></tr>' + '      </thead>' + '    </table>' + '    <div id="tablediv">' + '      <table class="table-condensed">' + '        <tbody>' + '        </tbody>' + '      </table>' + '    <div>' + '  </div>' + '</div>',
      restrict: 'E',
      scope: {
        'tableData': '=',
        'margin': '=',
        'width': '=?',
        'firstColumnSize': '=?',
        'columnsProperties': '='
      },
      link: function postLink(scope, element, attrs) {
        //set of color domain, one for each column
        var colorScales = [];
        //index of the current sorted column
        var indexSortableColumn = NaN;
        //check if there is a column with a fix width percentage. If there isn't any, set the first
        //column with a default width percentage of 50%
        var indexColumnWithPercentage = scope.columnsProperties.getIndexOfColumnWithPercentage();
        if (indexColumnWithPercentage == -1) {
          indexColumnWithPercentage = 0;
          scope.columnsProperties.columns[indexColumnWithPercentage].widthPercentage = 50;
        }
        //watch for changes on the data to be displayed
        scope.$watch('tableData', function () {
          if (scope.tableData && scope.tableData.length > 0) {
            d3.select('#tablediv').style('visibility', 'visible');
            //generate a color scale and domain for each column
            scope.columnsProperties.columns.forEach(function (columnProperty) {
              colorScales.push(d3.scale.linear().range([
                'white',
                '#7BBF6A'
              ]));
              colorScales[colorScales.length - 1].domain(d3.extent(scope.tableData, function (d, i) {
                return +d[columnProperty.header];
              }));
            });
            draw();
          }
        }, true);
        //set size
        d3.select('#tablewrapper').style('width', scope.width == undefined ? '100%' : scope.width + 'px');
        //generate header and interactivity for sorting
        var headers = scope.columnsProperties.columns.map(function (columnProperty) {
            return columnProperty.header;
          });
        //once the #tablewrapper has a width, now we can set a scope.width value
        scope.width = d3.select('#tablewrapper')[0][0].offsetWidth;
        //now we can checkwidth for the column with the width percentage
        var sizeColumnWithPercentage = Math.round(scope.width * scope.columnsProperties.columns[indexColumnWithPercentage].widthPercentage / 100);
        d3.selectAll('thead tr').selectAll('th').data(headers).enter().append('th').style('width', function (d, i) {
          //variable column sizes to % if needed, others size proportionally
          return i == indexColumnWithPercentage ? sizeColumnWithPercentage + 'px' : (scope.width - sizeColumnWithPercentage) / (scope.columnsProperties.columns.length - 1) + 'px';
        }).style('border', '1').style('text-align', 'center').style('background-color', '#eeeeee').classed('tableview-sortable', function (d, i) {
          return scope.columnsProperties.columns[i].isSortable != 0;
        }).text(function (d) {
          return d;
        }).on('mouseover', function (d, i) {
          d3.select(this).style('cursor', 'hand');
        }).on('click', function (d, i) {
          if (scope.columnsProperties.columns[i].isSortable == 0)
            return;
          //check if we already have a sortable column, if so remove classes for the previous and update state for the new one 
          if (!isNaN(indexSortableColumn)) {
            d3.selectAll('thead tr').selectAll('th').classed('tablesort-asc tablesort-desc', false);
          }
          indexSortableColumn = i;
          scope.columnsProperties.columns[i].isSortable = scope.columnsProperties.columns[i].isSortable * -1;
          d3.select(this).classed('tablesort-asc', function (d, j) {
            return scope.columnsProperties.columns[i].isSortable == 1;
          });
          d3.select(this).classed('tablesort-desc', function (d, j) {
            return scope.columnsProperties.columns[i].isSortable == -1;
          });
          scope.tableData.sort(function (a, b) {
            if (i == 0)
              return a[d] < b[d] ? -1 * scope.columnsProperties.columns[i].isSortable : 1 * scope.columnsProperties.columns[i].isSortable;
            return (a[d] - b[d]) * scope.columnsProperties.columns[i].isSortable;
          });
          draw();
        });
        d3.selectAll('#tablewrapper table').style('width', scope.width + 'px');
        function draw() {
          d3.select('tbody').selectAll('tr').remove();
          var rows = d3.select('tbody').selectAll('tr').data(scope.tableData).enter().append('tr').style('background-color', function (d, i) {
              if (i % 2 == 1)
                return '#F0F0F0';
            }).on('mouseover', function (d) {
              this.__rowBgColor = d3.select(this).style('background-color');
              d3.select(this).style('background-color', '#E0E0E0').style('outline', 'rgb(136, 136, 136) solid thin');
              //emit event in case anyone is listening outside there
              scope.$root.$emit('modifyNode', {
                'node': d,
                'action': 'highlight'
              });
            }).on('mouseout', function (d) {
              d3.select(this).style('background-color', this.__rowBgColor).style('outline', '');
              //emit event in case anyone is listening outside there
              scope.$root.$emit('modifyNode', {
                'node': d,
                'action': 'unhighlight'
              });
            });
          rows.selectAll('td').data(function (d, i) {
            var array = [];
            scope.columnsProperties.columns.forEach(function (p) {
              array.push(d[p.header]);
            });
            return array;
          }).enter().append('td').style('background-color', function (d, i) {
            //set color scales if the column is sortable and sorting is active (a column has been sorted)
            if (scope.columnsProperties.columns[i].isSortable != 0 && !isNaN(indexSortableColumn))
              return colorScales[i](d);
          }).style('width', calcColumnWidth).style('text-align', function (d, i) {
            return scope.columnsProperties.columns[i].textAlign;
          }).text(function (d, i) {
            return d;
          });
          function calcColumnWidth(d, i) {
            var offset = $browserService.isFirefox() ? 16 : 0;
            //variable column sizes to % if needed, others size proportionally
            return i == indexColumnWithPercentage ? sizeColumnWithPercentage + 'px' : i == scope.columnsProperties.columns.length - 1 ? (scope.width - sizeColumnWithPercentage) / (scope.columnsProperties.columns.length - 1) - offset + 'px' : (scope.width - sizeColumnWithPercentage) / (scope.columnsProperties.columns.length - 1) + 'px';
          }
        }
      }
    };
  }
]);
angular.module('sirislab.siris-browserService', []).service('$browserService', [
  '$window',
  function ($window) {
    var userAgent = $window.navigator.userAgent;
    var browsers = {
        chrome: /chrome/i,
        safari: /safari/i,
        firefox: /firefox/i,
        ie: /internet explorer/i
      };
    this.getBrowserName = function () {
      for (var key in browsers) {
        if (browsers[key].test(userAgent))
          return key;
        return 'unkown';
      }
    };
    this.isFirefox = function () {
      return browsers['firefox'].test(userAgent);
    };
    this.isChrome = function () {
      return browsers['chrome'].test(userAgent);
    };
    this.isSafari = function () {
      return browsers['safari'].test(userAgent);
    };
    this.isInternetExplorer = function () {
      return browsers['ie'].test(userAgent);
    };
  }
]);
angular.module('sirislab.siris-stringUtils', []).factory('$StringUtils', function () {
  var factory = {};
  factory.toProperCase = function (myString) {
    return myString.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };
  return factory;
});