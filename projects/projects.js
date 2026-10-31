import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
const data = [
	{ value: 1, label: 'apples' },
	{ value: 2, label: 'oranges' },
	{ value: 3, label: 'mangos' },
	{ value: 4, label: 'pears' },
	{ value: 5, label: 'limes' },
	{ value: 5, label: 'cherries' },
];
const sliceGenerator = d3.pie().value((d) => d.value);
const arcData = sliceGenerator(data);
const arcs = arcData.map((slice) => arcGenerator(slice));
const colors = d3.scaleOrdinal(d3.schemeTableau10);

projectsTitle.textContent = `Projects (${Array.isArray(projects) ? projects.length : 0})`;

arcs.forEach((arc, index) => {
	d3.select('#projects-pie-plot')
		.append('path')
		.attr('d', arc)
		.attr('fill', colors(index));
});

const legend = d3.select('.legend');
data.forEach((item, index) => {
	legend
		.append('li')
		.attr('class', 'legend-item')
		.attr('style', `--color:${colors(index)}`)
		.html(`<span class="swatch"></span>${item.label} <em>(${item.value})</em>`);
});

renderProjects(projects, projectsContainer, 'h2');
