var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var label = "Poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(stateHealthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateHealthData, d => d[chosenXAxis]) * 0.9,
      d3.max(stateHealthData, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(stateHealthData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(stateHealthData, d => d[chosenYAxis]) * 0.9,
      d3.max(stateHealthData, d => d[chosenYAxis]) * 1.1
    ])
    .range([height, 0]);

  return yLinearScale;

}
// function used for updating xAxis var upon click on axis label
function renderXaxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYaxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup, chosenYAxis) {

  if (chosenXAxis === "healthcare") {
    var label = "Healthcare:";
  }
  else {
    var label = "Poverty:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.abbr}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data/data.csv").then(function(stateHealthData, err) {
  if (err) throw err;

  // parse data
  stateHealthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(stateHealthData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(stateHealthData, chosenYAxis);
    // d3.scaleLinear().domain([0, d3.max(stateHealthData, d => d.healthcare)])
    // .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(stateHealthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", ".5");

  // Create group for 2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("data-axis", "x")
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Percent of Populace in Poverty");

  var healthcareLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("data-axis", "x")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Healthcare (Percent Uninsured)");

  // append y axis
  // chartGroup.append("text")
  // Create group for 2 y-axis labels
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${60}, ${(height + 100) / 2 - 100})rotate(-90)`);

  var obesityLabel = yLabelsGroup.append("text")
    // .attr("transform", "rotate(-90)")
    .attr("y", -120)
    .attr("x", -26)
    .attr("data-axis", "y")
    .attr("dy", "1em")
    .classed("axis-text active", true)
    .attr("value", "obesity") // value to grab for event listener
    // .classed("active", true)
    .text("Obesity");

    var incomeLabel = yLabelsGroup.append("text")
    // .attr("transform", "rotate(-90)")
    .attr("y", -120)
    .attr("x", -24)
    .attr("data-axis", "y")
    // .attr("dy", "1em")
    // .classed("axis-text", true)
    .attr("value", "income") // value to grab for event listener
    .classed("axis-text inactive", true)
    .text("Income");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  d3.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      var axis = d3.select(this).attr("data-axis");

      if (value !== chosenXAxis && value !== chosenYAxis) {
        if (axis === "x") {
        // replaces chosenXAxis with value
        chosenXAxis = value;
        } else {
          chosenYAxis = value;
        }
        // console.log(chosenYAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateHealthData, chosenXAxis);
        yLinearScale = yScale(stateHealthData, chosenYAxis);
        // updates x axis with transition
        xAxis = renderXaxis(xLinearScale, xAxis);
        yAxis = renderYaxis(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);

        // changes classes to change bold text
        if (chosenXAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      
        if (chosenYAxis === "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});

// create a scatter plot between two of the data variables such as `Healthcare vs. Poverty` or `Smokers vs. Age`.
// create a scatter plot that represents each state with circle elements using d3.csv
// * Include state abbreviations in the circles.
// * Create and situate your axes and labels to the left and bottom of the chart.
// id,state,abbr,poverty,povertyMoe,age,ageMoe,income,incomeMoe,healthcare,healthcareLow,
// healthcareHigh,obesity,obesityLow,obesityHigh,smokes,smokesLow,smokesHigh,
// Place additional labels in your scatter plot and give them click events so that your users can decide which data to display. 
// Animate the transitions for your circles' locations as well as the range of your axes. 
// Do this for two risk factors for each axis. 
// Or, for an extreme challenge, create three for each axis.
// * Hint: Try binding all of the CSV data to your circles. 
// This will let you easily determine their x or y values when you click the labels.
// Use the `d3-tip.js` plugin developed by [Justin Palmer](https://github.com/Caged)
// —we've already included this plugin in your assignment directory. (Images/8-tooltip.gif)
// Check out [David Gotz's example](https://bl.ocks.org/davegotz/bd54b56723c154d25eedde6504d30ad7) 
// to see how you should implement tooltips with d3-tip.