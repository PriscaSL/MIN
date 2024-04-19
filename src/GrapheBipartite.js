import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const GrapheBipartite = ({ data, columns }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        // Clear previous content
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Calculate graph data
        const rowNodes = data.map(row => ({ id: row.letter }));
        const colNodes = columns
            .filter(col => col.title !== '0') // Exclude the "letter" column
            .map(col => ({ id: col.title }));

        const links = [];
        data.forEach(row => {
            columns
                .filter(col => col.title !== '0') // Exclude the "letter" column
                .forEach(col => {
                    if (row[col.dataIndex]) {
                        links.push({
                            source: row.letter,
                            target: col.title,
                        });
                    }
                });
        });

        // Combine nodes
        const nodes = [...rowNodes, ...colNodes];

        // Set up D3 force simulation
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(svg.node().clientWidth / 2, svg.node().clientHeight / 2))
            .on('tick', ticked);

        // Add links
        const link = svg
            .append('g')
            .selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6);

        // Add nodes
        const node = svg
            .append('g')
            .selectAll('circle')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('r', 10)
            .attr('fill', d => (d.id.match(/^[A-Z]$/) ? 'blue' : 'red')) // Row nodes in blue, column nodes in red
            .call(d3.drag()
                .on('start', dragStart)
                .on('drag', dragged)
                .on('end', dragEnd));

        // Add labels for nodes
        node.append('title').text(d => d.id);

        function ticked() {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        }

        function dragStart(event, d) {
            if (!event.active) {
                simulation.alphaTarget(0.3).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragEnd(event, d) {
            if (!event.active) {
                simulation.alphaTarget(0);
            }
            d.fx = null;
            d.fy = null;
        }

        // Clean up on unmount
        return () => {
            simulation.stop();
        };
    }, [data, columns]);

    return (
        <svg ref={svgRef} width="800" height="600"  />
    );
};

export default GrapheBipartite;
