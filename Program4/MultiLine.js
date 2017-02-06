var svg = d3.select("svg"),
    margin = {top: 20, right: 80, bottom: 100, left: 275},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%Y");

var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.temperature); });

function gridXAxis(){
	return d3.axisBottom(x)
}

function gridYAxis(){
	return d3.axisLeft(y)
}

d3.tsv("EPC_2000_2010_new.tsv", type, function(error, data) {
    if (error) throw error;

    var cities = data.columns.slice(1).map(function(id) {
        return {
            id: id,
            values: data.map(function(d) {
                return {date: d.date, temperature: d[id]};
            })
        };
    });

    x.domain(d3.extent(data, function(d) { return d.date; }));

    y.domain([
        d3.min(cities, function(c) { return d3.min(c.values, function(d) { return d.temperature; }); }),
        d3.max(cities, function(c) { return d3.max(c.values, function(d) { return d.temperature; }); })
    ]);

    z.domain(cities.map(function(c) { return c.id; }));
	
    g.append("g")
        .attr("class", "axis x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
	    .append("text")
		.attr("dx", "65em")
		.attr("dy", "1.6em")
        .attr("fill", "#000")
        .text("Year");;

    g.append("g")
        .attr("class", "axis y")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
		.attr("dx", "-15em")
        .attr("dy", "-5em")
        .attr("fill", "#000")
        .text("Million BTUs Per Person");

	g.append("g")
		.attr("class", "grid")
		.attr("transform", "translate(0," + height + ")")
		.call(gridXAxis()
			  .tickSize(-height, 0,0)
			  .tickFormat("")
		)
	
	g.append("g")
		.attr("class", "grid")
		.call(gridYAxis()
			 .tickSize(-width, 0, 0)
			 .tickFormat("")
		)
	
    var city = g.selectAll(".city").data(cities)
        .enter().append("g")
        .attr("class", "city");

    city.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return z(d.id); });

    city.append("text")
        .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text(function(d) { return d.id; });
});

function type(d, _, columns) {
    d.date = parseTime(d.Year);
    for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
    return d;
}

