// @TODO: YOUR CODE HERE!
const svgWidth = 960;
const svgHeight = 500;

const margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;


const svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);



// Append group
const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);



// Initial Parameters
let chosenXAxis = "poverty";



function xScale(newsData, chosenXAxis) {
  // create scales
  const xLinearScale = d3.scaleLinear()
    .domain([d3.min(newsData, d => d[chosenXAxis]) * 0.8,
      d3.max(newsData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function for updating xAxis const upon click on axis label
function renderAxes(newXScale, xAxis) {
  const bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}


// function for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function to update the state labels for the circles
function renderXLabels(circlesText, newXScale, chosenXAxis) {
  circlesText.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))

  return circlesText
}


// function for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
    let label  = "";
    if (chosenXAxis === "poverty") {
        label = "Poverty Rate (%):";
    }
    else {
        label = "Income:";
    }

    const toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([0, 0])
      .html(function(d) {
        return (`<strong>${d.state}</strong>
        <br>
        <br> ${label} ${d[chosenXAxis]}`);
      });

    // add tooltip to circlesGroup
    circlesGroup.call(toolTip);

    // on mouseon event
    circlesGroup.on("mouseover", function(d) {
        toolTip.show(d, this);
    })
    // on mouseout event
    .on("mouseout", function(d, index) {
        toolTip.hide(d, this);
    });

  return circlesGroup;
}

// read csv data and store on a variable
(async function(){
  const newsData = await d3.csv("/assets/data/data.csv");
    
  newsData.forEach(function(data) {
    data.obesity = +data.obesity;
    data.income = +data.income;
    data.poverty = +data.poverty;
  });


  // xscale function
  let xLinearScale = xScale(newsData, chosenXAxis);

  // yscale function
  let yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(newsData, d => d.obesity)*1.2])
      .range([height, 0]);

  // axes
  let bottomAxis = d3.axisBottom(xLinearScale);
  let leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  let xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .style("font-size", "18px")
      .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
      .style("font-size", "18px")
      .call(leftAxis);

  // append circles to svg
  let circlesGroup = chartGroup.selectAll("circle")
      .data(newsData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.obesity))
      .attr("r", 12)
      .attr("fill", "blue")
      .attr("opacity", ".2");

  // add abbr to circles
  let circlesText = chartGroup.selectAll("text.text-circles")
      .data(newsData)
      .enter()
      .append("text")
      .classed("text-circles",true)
      .text(d => d.abbr)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d.obesity))
      .attr("dy",5)
      .attr("text-anchor","middle")
      .attr("font-size","10px");


  // Create group for  2 x- axis labels
  let labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

  let povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 30)
      .attr("value","poverty") // value to grab for event listener
      .classed("active", true)
      .text("Poverty Rate (%)");

  let incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 50)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Income");



    // y axis text
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 5 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("aText", true)
      .text("Obesity Rate (%)");

    
      // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);


   // x axis labels event listener
   labelsGroup.selectAll("text")
   .on("click", function() {
   // get value of selection
   const value = d3.select(this).attr("value");
   if (value !== chosenXAxis) {

       // replaces chosenXAxis with value
       chosenXAxis = value;

      //  console.log(chosenXAxis)

       // functions here found above csv import
       // updates x scale for new data
       xLinearScale = xScale(newsData, chosenXAxis);

       // updates x axis with transition
       xAxis = renderAxes(xLinearScale, xAxis);

       // updates circles with new x values
       circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);


      // update lables with new x values
      circlesText = renderXLabels(circlesText, xLinearScale, chosenXAxis)

       // updates tooltips with new info
       circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

       // changes classes to change bold text
       if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
       }
       else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
       }
   }
});

})()