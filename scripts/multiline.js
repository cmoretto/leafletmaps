var init_multiline = (function ($) {

    'use strict';
    var _self = {};
    _self.init = function (data) {
        // Set the dimensions of the canvas / graph
        var margin = {top: 30, right: 20, bottom: 70, left: 50},
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

        // Parse the date / time
        // Set the ranges
        var x = d3.scaleTime().range([0, width]);  
        var y = d3.scaleLinear().range([height, 0]);

        // Define the line
        var densityline = d3.line()	
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.density); });

        // Adds the svg canvas
        d3.select("#multiline").select("*").remove();

        var svg = d3.select("#multiline")
            .append("g")
            .attr("transform", 
                "translate(" + margin.left + "," + margin.top + ")");

        // Get the data
        data.forEach(function(d) {
            d.year = d.year;
            d.density = +d.density;
        });


        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d.year; }));
        y.domain([0, d3.max(data, function(d) { return d.density; })]);

        // Nest the entries by symbol
        var dataNest = d3.nest()
            .key(function(d) {return d.country;})
            .entries(data);

        // set the colour scale
        var color = d3.scaleOrdinal(d3.schemeCategory10);
        var legendSpace = width/Math.min( Math.max(dataNest.length, 7), 7); // spacing for the legend

        // Loop through each symbol / key
        dataNest.forEach(function(d,i) { 
            svg.append("path")
                .attr("class", "line")
                .style("stroke", function() { // Add the colours dynamically
                    return d.color = color(d.key); })
                .attr("d", densityline(d.values));


            if (dataNest.length < 7){
                // Add the Legend
                svg.append("text")
                    .attr("x", (legendSpace/2)+i*legendSpace)  // space legend
                    .attr("y", height + (margin.bottom/2)+ 5)
                    .attr("class", "legend")    // style the legend
                    .style("fill", function() { // Add the colours dynamically
                        return d.color = color(d.key); })
                    .text(d.key); 
                }
        });

        // Add the X Axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add the Y Axis
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));

    }

    return {
        init: _self.init
    };

})(d3);