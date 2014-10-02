'use strict';

angular.module('arwuApp')
  .directive('parallel', function () {
    return {
      //We restrict its use to an element
      //as usually  <bars-chart> is semantically
      //more understandable
      restrict: 'E',
      //this is important,
      //we don't want to overwrite our directive declaration
      //in the HTML mark-up
      replace: false, 
      // scope: { chartdata: '=' },
      // controller: 'KeywordsCtrl',
      link: function (scope, element, attrs) {
        var filterText = "";
        var data = [];
        scope.$watch('data', function() {
          data = scope.data;
          draw();
        })

        var name = "Institution"

        // highlighted the corresponding element given a datum
        scope.highlightParallel = function(hoveredElelemnt) {          
          // console.log(scope.name_field_name)
          // console.log(hoveredElelemnt[scope.name_field_name])
          var selectedElement = foreground.filter(function(d) {
            return d[name] == hoveredElelemnt[name];
          })
          
          highlightLine(selectedElement.node());
        }

        scope.unHighlightParallel = function() {
          foreground.style("stroke", "steelblue");
          d3.selectAll(".circleText")
                .attr("display", "none");
        }

        scope.clearBrushes = function() {
          // console.log("Clear brushes")
          var actives = getActiveDimensions();
          // console.log("Active brushes: " + actives.length)

          d3.selectAll(".brush").each(function(d) { d3.select(this).call(y[d].brush.clear()); });
          brush();
        }

        // Given a data object and a year (column) retrieves its value according to one metric (default is Current rank)
        // function getValue(d, year) {
        //   return (!(year in d.data)) ? 101 : d.data[year][scope.rankingMetric];
        // }        

        var x = d3.scale.ordinal().rangePoints([0, scope.width], 1),
            y = {},
            dragging = {};        

        var line = d3.svg.line(),
                  // .interpolate("monotone"),
            axisLeft = d3.svg.axis()
                    .orient("left")
                    .ticks(8),
            axisRight = d3.svg.axis()
                    .orient("right")
                    .ticks(8),
            axis = d3.svg.axis()
                    .orient("left")
                    .ticks(0),
            background,
            foreground,
            strokeWidth = 1.5;

        var svg = d3.select(element[0]).append("svg")
            .attr('width', scope.width + scope.margin.left + scope.margin.right)
            .attr('height', scope.height + scope.margin.top + scope.margin.bottom)
          .append('g')
            .attr('transform', 'translate(' + scope.margin.left + ',' + scope.margin.top + ')')          

        var filtered, 
            countries = [],
            selectedCountry = "All Countries";

        d3.select("#input_school")
          .on("keyup", function(d) {
            filterText = this.value.toLowerCase();
            filterByName();
          })

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
          countries = d3.set(data.map(function(d) { return d[scope.country_field_name]; })).values();
          // countries = d3.keys(set);


          d3.select("#countriesCombo")      
            .selectAll("option")
            .data(countries.sort())
            .enter()
              .append("li")              
              .append("a")
                // .attr("href", function() { return ''; })
                .attr("value", function(d) { return d;})
                .text(function(d) { return d;});

          d3.select("#countriesCombo")
            .selectAll("li")
              .on("click", function(d) {
                // selectedCountry = $("#countriesCombo").find('option:selected').val();
                selectedCountry = d3.select(this).selectAll("a").text().trim()
                d3.select("#countriesButton").text(selectedCountry);
                selectedCountry = selectedCountry;
                filterByCountry(selectedCountry);
              })
              
          x.domain(scope.dimensions);
          scope.dimensions.forEach(function(d) {
            y[d] = d3.scale.linear()        
                .domain([0, 100])
                .range([scope.height, 0]);
          })     

          var nElements = data.length,
              // strokeWidth = (scope.height / nElements) * 0.8;
              color = d3.scale.category20();

          // Add grey background lines for context.
          background = svg.append("svg:g")
              .attr("class", "background")
            .selectAll("path")
              .data(data)
            .enter().append("svg:path")
              .attr("d", path);

          // Add blue foreground lines for focus.
          foreground = svg.append("svg:g")
              .attr("class", "foreground")
            .selectAll("path")
              .data(data, function(d) { return d[name]; })
            .enter().append("svg:path")
              .attr("d", path)
              .attr("stroke-width", strokeWidth + 'px')
              .attr("stroke", function(d) {
                return color(d);
              })
            .on("mouseover", function(d) {
                  scope.tooltip
                      .html("<font size='2'>" + d["Rank 2013-14"] + ". " + d["Institution"] + "</font>")
                      .style("visibility", "visible");

                  // // retrieve values from last year
                  // var old_values = scope.old_data.filter(function(p) {
                  //   return p.Institution == d.Institution;
                  // })
                  // console.log(old_values)

                  // // show last year's line
                  // svg.selectAll(".compareground")
                  //   .data(old_values)
                  //   .append("svg:path")
                  //     .attr("d", path)
                  //     .attr('stroke-dasharray', '2,3')
                  //     .style('visibility', 'visible');
                

                  highlightLine(this);
              })
              .on("mousemove", function(){
                // d3.event must be used to retrieve pageY and pageX. While this is not needed in Chrome, it is needed in Firefox
                scope.tooltip.style("top", (d3.event.pageY - 20)+"px").style("left",(d3.event.pageX + 5)+"px");        
              })
              .on("mouseout", function(){
                scope.tooltip.style("visibility", "hidden");
                d3.select(this)
                    .style("stroke", "steelblue")
                    .style('stroke-width', strokeWidth);
                d3.selectAll(".circleText")
                      .attr("display", "none");

                svg.selectAll(".compareground")
                  .selectAll("path")
                  .style('visibility', 'hidden'); 
              });

          // Add a group element for each dimension.
          var g = svg.selectAll(".dimension")
              .data(scope.dimensions)
            .enter().append("svg:g")
              .attr("class", "dimension")
              .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
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
            'Citations': "65.9",
            'Country': "Fake",
            'Ind. Income': "30",
            'Institution': "Fake!!!",
            'Int. Outlook': "36",
            'Overall Score': "44.8",
            'Research': "26.3",
            'Teaching': "45.6"
          }];

          var compareline = svg.append("svg:g")
              .attr("class", "compareground")
              .append("svg:path");
          //   .selectAll("path")
          //   .data(fakeData)
          //   .enter().append("svg:path")
          //     .attr("d", path)
          //     .attr('stroke-dasharray', '10,10');


          // Add an axis and title.
          g.append("svg:g")
              .attr("class", "axis")
              .each(function(d, i) {
                if (i == (scope.dimensions.length - 1))
                  return d3.select(this).call(axisRight.scale(y[d]));
                else if (i == 0) 
                  d3.select(this).call(axisLeft.scale(y[d])); 
                else
                  d3.select(this).call(axis.scale(y[d])); 
              })
            .append("svg:text")
              .attr("text-anchor", "middle")
              .attr("y", -9)
              .text(String);

          // Add and store a brush for each axis.
          g.append("svg:g")
              .attr("class", "brush")
              .each(function(d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); })
            .selectAll("rect")
              .attr("x", -8)
              .attr("width", 16);

          var circleElements = svg.selectAll("g circleText")
              .data(scope.dimensions)
              .enter()
              .append("g")
                .attr("class", "circleText")
                .attr("display", "none")
                .attr("transform", function(d){return "translate("+x(d)+",80)"})

          circleElements    
              .append("circle")
                // .style("shape-rendering", "crispEdges")
                .attr("r", 11)
                .attr("stroke","red")
                .attr("fill", "white");        
              
          circleElements.append("text")
                .attr("text-anchor", "middle")
                .attr("font-size", "9px")
                .style("dominant-baseline", "central")
                .text("89")

            manageFilteredElements();
        };

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
          return line(scope.dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));          
        }

        function filterByCountry() {
          foreground.style("display", function(d) {
            d.filter_country = (selectedCountry == "All Countries") ? true : d[scope.country_field_name] == selectedCountry;
            return (d.filter_country && d.filter_brush  && d.filter_name) ? null : "none";
          });

          manageFilteredElements();
        }

        function checkMultiCountryBS(d) {
          var cs = d[$scope.country_field_name].split('/');
          for (var i = 0; i<cs.length; i++)
            cs[i] = cs[i].trim();

          return $.inArray(selectedCountry, cs) > -1
        }

        function filterByName() {  
          foreground.style("display", function(d) {
            d.filter_name = d[name].toLowerCase().indexOf(filterText) > -1;

            return (d.filter_country && d.filter_brush  && d.filter_name) ? null : "none";
          });

          manageFilteredElements();
        }

        function getActiveDimensions() {
          return scope.dimensions.filter(function(p) { return !y[p].brush.empty(); })
        }

        // Handles a brush event, toggling the display of foreground lines.
        function brush() {
          var actives = getActiveDimensions(),
              extents = actives.map(function(p) { return y[p].brush.extent(); });

          if (actives.length == 0) {
            foreground.style("display", function(d) {    
                d.filter_brush = true;
                return (d.filter_country && d.filter_brush  && d.filter_name) ? null : "none";
            });
          } else {
            foreground.style("display", function(d) {    
              d.filter_brush = actives.every(function(p, i) {      
                return extents[i][0] <= d[p] && d[p] <= extents[i][1];
              });
              return (d.filter_country && d.filter_brush  && d.filter_name) ? null : "none";
            });
          } 

          d3.select("#clearBrushesBtn").attr("disabled", function() {
            return (actives.length > 0) ? null : "";
          })

          manageFilteredElements();
        }

        function manageFilteredElements() {
          // console.log("manageFilteredElements")
          // Get filtered elements
          scope.activeRows = foreground.filter(function() {
            return d3.select(this).style("display") != "none";
          }).data();         

          if(!scope.$$phase) scope.$apply();

          d3.select("#numResults")
              .text(scope.activeRows.length + " (" + (scope.activeRows.length / scope.data.length * 100).toFixed(1) + "%) institutions match the criteria");

        }

        function highlightLine(svgContainer) {
          var d = d3.select(svgContainer).data()[0];
          d3.select(svgContainer)
              .style("stroke", "red")
              .style('stroke-width', strokeWidth + 1);
          var sel = d3.select(svgContainer);
          sel.moveToFront();

          var circles = d3.selectAll(".circleText")
            .attr("display", true)
            .attr("transform", function(p) {
              return "translate("+x(p)+"," + y[p](d[p]) + ")"
            })

          circles.selectAll("text")
            .text(function(p) {
              return (d[p] == 0) ? '-' : d[p];
            })
        }
      }
    };
  });
