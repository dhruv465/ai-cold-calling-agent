// src/components/dashboard/analytics/GeographicalHeatmap.tsx
import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import * as d3 from 'd3';
import { geoMercator, geoPath } from 'd3-geo';
import indiaTopoJson from '../../../assets/india-topo.json';

interface LeadDistributionData {
  state: string;
  count: number;
}

interface GeographicalHeatmapProps {
  data: LeadDistributionData[];
  isLoading: boolean;
}

const GeographicalHeatmap: React.FC<GeographicalHeatmapProps> = ({ data, isLoading }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const dimensions = { width: 600, height: 600 };

  useEffect(() => {
    if (isLoading || !data.length || !svgRef.current) return;

    // Clear previous rendering
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    // Create color scale
    const maxCount = Math.max(...data.map(d => d.count));
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, maxCount]);

    // Create tooltip
    const tooltip = d3.select(tooltipRef.current)
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('box-shadow', '0 2px 5px rgba(0,0,0,0.1)')
      .style('pointer-events', 'none')
      .style('font-size', '12px');

    // Create projection
    const projection = geoMercator()
      .scale(800)
      .center([82, 23]) // Center on India
      .translate([dimensions.width / 2, dimensions.height / 2]);

    const pathGenerator = geoPath().projection(projection);

    // Create map
    const states = svg.selectAll('.state')
      .data(indiaTopoJson.features)
      .enter()
      .append('path')
      .attr('class', 'state')
      .attr('d', pathGenerator)
      .attr('fill', d => {
        const stateData = data.find(item => item.state === d.properties.name);
        return stateData ? colorScale(stateData.count) : '#eee';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke-width', 2);
        
        const stateData = data.find(item => item.state === d.properties.name);
        const count = stateData ? stateData.count : 0;
        
        tooltip
          .style('visibility', 'visible')
          .html(`<strong>${d.properties.name}</strong><br/>Leads: ${count}`);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke-width', 0.5);
        tooltip.style('visibility', 'hidden');
      });

    // Add legend
    const legendWidth = 20;
    const legendHeight = 200;
    
    const legend = svg.append('g')
      .attr('transform', `translate(${dimensions.width - 50}, ${dimensions.height / 2 - legendHeight / 2})`);
    
    const legendScale = d3.scaleLinear()
      .domain([0, maxCount])
      .range([legendHeight, 0]);
    
    const legendAxis = d3.axisRight(legendScale)
      .ticks(5)
      .tickSize(0);
    
    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#gradient)');
    
    const linearGradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    
    linearGradient.selectAll('stop')
      .data(d3.range(0, 1.01, 0.1))
      .enter()
      .append('stop')
      .attr('offset', d => d * 100 + '%')
      .attr('stop-color', d => colorScale(d * maxCount));
    
    legend.append('g')
      .attr('transform', `translate(${legendWidth}, 0)`)
      .call(legendAxis)
      .select('.domain').remove();
    
    legend.append('text')
      .attr('transform', `translate(${legendWidth / 2}, ${-10})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Leads');

  }, [data, isLoading, dimensions]);

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Geographical Distribution of Leads</Typography>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, position: 'relative' }}>
          <svg ref={svgRef}></svg>
          <div ref={tooltipRef}></div>
        </Box>
      )}
    </Paper>
  );
};

export default GeographicalHeatmap;
