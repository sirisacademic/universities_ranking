'use strict';

angular.module('arwuApp')
  .directive('tableview', function () {
    return {
      templateUrl: 'views/tabletemplate.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        // console.log("tableview created")
        var activeRows = [];

        scope.$watch('activeRows', function() {
          activeRows = scope.activeRows;          
          
          if (activeRows.length > 0) {                                  
            draw();            
          } else {
            d3.select("tbody").selectAll("tr").remove();
            d3.select("#numResults").text("");
          }
          // data = [data[0], data[1], data[2]]          
        })

        var width = scope.width - scope.margin.left - scope.margin.right - 57;
        var keys = d3.keys(scope.data[0]);
        keys = keys.slice(0, keys.length - 3);  // remove   filter_country  filter_brush  filter_name
        d3.select("#tablewrapper")
          // .attr("height", 300 + "px")
          // .style("width", scope.width - scope.margin.left - scope.margin.right  + "px");
          .style("width",  width + "px")
          .style("margin-left", scope.margin.left + 28 + "px"); 

        d3.selectAll("thead tr").selectAll("th")
            .data(keys)
            .enter()
            .append("th")
              .style("width", function(d, i) {
                return calculateCellWidth(d, i);
                // console.log("Setting style " + i)
                // if (i == 0)
                //   return "290px"
                // else 
                //   if (i == 1)
                //     return "145px"

                // return "30px"                
                // return (scope.width - scope.margin.left - scope.margin.right - 57)/17 + "px"
              })
              .style("border", "1")
              .style("text-align", "center")
              .style("background-color", "#eeeeee")
              .text(function(d) { return d; })

        d3.select("#tablewrapper table")
              .style("width", width - 15 + "px")

        d3.select("#tablediv table")
              .style("width", width - 15 + "px")

        var color = d3.scale.linear()
            .domain([0, 100])
            .range(["white", "#7BBF6A"]);

        function draw() {
          d3.select("tbody").selectAll("tr").remove();

          var rows = d3.select("tbody").selectAll("tr")
            .data(activeRows)
            .enter()
            .append("tr")
              .on("mouseover", function(d) { 
                scope.highlightParallel(d); 
                d3.select(this)
                  // .select("td")
                  //   .style("font-weight", "bold")
                  // .selectAll("td")
                    // .style("border", "1px solid black")
                    .style('outline', 'thin solid #888')
              })
              .on("mouseout", function(d) { 
                scope.unHighlightParallel(); 
                d3.select(this)
                  // .select("td")
                  //   .style("font-weight", "normal")
                  // .selectAll("td")
                  //   .style("border", null)
                  .style('outline', null)
              });
            // .style("background-color", function(d,i) {
            //   return (i%2 == 0) ? "white" : "#F0F0F0";
            // });

          // console.log(rows)

          rows.selectAll("td")
            .data(function(d, i) { 
              var array = [];
              keys.forEach(function(p) {
                array.push(d[p])
              })
              
              return array; 
            })
            .enter()            
            .append("td")                                                   
              .attr("class", function(d, i) {
                return (i != 1) ? "centeredTd" : null;
              })
              // .style("font", function(d, i) {
              //   if (i == scope.dimensions.length)
              //     return "italic bold";
              // })
              .style("background-color", function(d, i) {  
                return (i > 3) ? color(d) : "white"; 
              })
              .style("width", function(d, i) {
                return calculateCellWidth(d, i);
              })
              .style("text-align", function(d, i) {
                if (i < 2)
                  return null;
                
                return "center";
              })
              .text(function(d, i) {
                return (d == 0) ? "-" : d;
              })         

        }

       function calculateCellWidth(d, i) {
          return (i == 1) ? 200 + 'px' : (width - 200) / d3.keys(scope.data[0]).length + 'px';
        }
      }
    };
  });
