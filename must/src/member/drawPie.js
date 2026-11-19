// 由 ee/Statistics/StatisticsSvg.js 改寫：繪圖參數與流程不變，只是從全域變數改為函式參數
export function drawPie(d3, container, dataset, itemName) {
  container.innerHTML = '';
  const pie = d3.layout.pie();
  const piedata = pie(dataset);

  const svgWidth = 600;
  const svgHeight = 600;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

  const outerRadius = 200;
  const innerRadius = 1;

  const arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius);
  const arc2 = d3.svg.arc().innerRadius(300).outerRadius(150);

  const arcs = svg.selectAll('g')
    .data(piedata)
    .enter()
    .append('g')
    .attr('transform', 'translate(' + (svgWidth / 2) + ',' + (svgWidth / 2) + ')');

  const color = d3.scale.category20();

  const arcPath = arcs.append('path')
    .attr('fill', function (d, i) { return color(i); })
    .attr('d', function (d) { return arc(d); });

  arcPath.transition()
    .duration(2500)
    .ease('bounce')
    .attr('d', function (d) { return arc2(d); });

  arcs.append('text')
    .attr('transform', function (d) { return 'translate(' + arc.centroid(d) + ')'; })
    .attr('text-anchor', 'middle')
    .text(function (d, i) { return itemName[i]; });
}
