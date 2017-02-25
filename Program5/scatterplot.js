//Define Margin
var margin = {top: 50, right: 80, bottom: 50, left: 350}, 
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

//Define Color
var colors = d3.scaleOrdinal(d3.schemeCategory20);

//Define Scales   
var xScale = d3.scaleLinear()
	.domain([0,16]) //Need to redefine this after loading the data
	.range([0, width]);

var yScale = d3.scaleLinear()
	.domain([0,450]) //Need to redfine this after loading the data
	.range([height, 0]);

var zoom = d3.zoom()
//	.x(xScale)
//	.y(yScale)
	.scaleExtent([1,Infinity])
	.on("zoom", zoomed)

//Define SVG
var svg = d3.select("body")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
svg.call(zoom);

// Defined to capture all pan + zoom events
var rect = svg.append("rect")
  .attr("width", width)
  .attr("height", height)
  .style("fill", "none")
  .style("pointer-events", "all");

//Define Tooltip here

//Define Axis
var xAxis = d3.axisBottom(xScale).tickPadding(2);
var yAxis = d3.axisLeft(yScale).tickPadding(2);

//Get Data
d3.csv("scatterdata.csv",function(error, data){
	data.forEach(function(d) {
		d.gdp = +d.gdp;
		d.population = +d.population;
		d.epc = +d.epc;
		d.total = +d.total;	
	});

	// Define domain for xScale and yScale
	xScale.domain(d3.extent(data, function(d) {return d.gdp;}));
	yScale.domain([
		d3.min(data, function(d){
			return d.epc;
		}),
		d3.max(data, function(d){
			return d.epc;
		})
	])
   
    //Draw Scatterplot
    var dots = svg.selectAll(".dot")
    	.data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", function(d) { return Math.sqrt(d.total)/.2; })
        .attr("cx", function(d) {return xScale(d.gdp);})
        .attr("cy", function(d) {return yScale(d.epc);})
        .style("fill", function (d) { return colors(d.country); })
//		.call(zoom)
	
    //Add .on("mouseover", .....
		.on("mouseover", function(d){
			var xPosition = parseFloat(d3.select(this).attr("cx"));
			var yPosition = parseFloat(d3.select(this).attr("cy")) / 2 + height / 2;

			d3.select("#tooltip")
				.style("left", xPosition + "px")
				.style("top", yPosition + "px")
				.html(
        			d.country + "<br>" +
				   "Population: " + d.population + " Million<br>" + 
				   "GDP: $" + d.gdp + " Trillion<br>" +
				   "EPC: " + d.epc + " Million BTUs<br>" +
				   "Total: " + d.total + " Trillion BTUs"
   				);
			d3.select("#tooltip").classed("hidden", false);
		})
    //Add Tooltip.html with transition and style
    //Then Add .on("mouseout", ....
    	.on("mouseout", function(){
			d3.select("#tooltip").classed("hidden", true);
		});
    //Scale Changes as we Zoom
    // Call the function d3.behavior.zoom to Add zoom
	
    //Draw Country Names
    svg.selectAll("text")
        .data(data)
        .enter().append("text")
        .attr("class","text")
        .style("text-anchor", "start")
        .attr("x", function(d) {return xScale(d.gdp);})
        .attr("y", function(d) {return yScale(d.epc);})
        .style("fill", "black")
        .text(function (d) {return d.name; });

 	//x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("y", 50)
        .attr("x", width/2)
        .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("GDP (in Trillion US Dollars) in 2010");

    
    //Y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -50)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .attr("font-size", "12px")
        .text("Energy Consumption per Capita (in Million BTUs per person)");

    
     // draw legend colored rectangles
    svg.append("rect")
        .attr("x", width-250)
        .attr("y", height-190)
        .attr("width", 220)
        .attr("height", 180)
        .attr("fill", "lightgrey")
        .style("stroke-size", "1px");

    svg.append("circle")
        .attr("r", 5)
        .attr("cx", width-100)
        .attr("cy", height-175)
        .style("fill", "white");
    
    svg.append("circle")
        .attr("r", 15.8)
        .attr("cx", width-100)
        .attr("cy", height-150)
        .style("fill", "white");

    svg.append("circle")
        .attr("r", 50)
        .attr("cx", width-100)
        .attr("cy", height-80)
        .style("fill", "white");

    svg.append("text")
        .attr("class", "label")
        .attr("x", width -150)
        .attr("y", height-172)
        .style("text-anchor", "end")
        .text(" 1 Trillion BTUs");

    svg.append("text")
        .attr("class", "label")
        .attr("x", width -150)
        .attr("y", height-147)
        .style("text-anchor", "end")
        .text(" 10 Trillion BTUs");

    svg.append("text")
        .attr("class", "label")
        .attr("x", width -150)
        .attr("y", height-77)
        .style("text-anchor", "end")
        .text(" 100 Trillion BTUs");
    
     svg.append("text")
        .attr("class", "label")
        .attr("x", width -150)
        .attr("y", height-15)
        .style("text-anchor", "middle")
        .style("fill", "Green") 
        .attr("font-size", "16px")
        .text("Total Energy Consumption");
		
});

function zoomed() {
	svg.selectAll(".dot").attr("transform", d3.event.transform);
	svg.select(".x.axis").call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
	svg.select(".y.axis").call(yAxis.scale(d3.event.transform.rescaleY(yScale)));
	
//							   "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

