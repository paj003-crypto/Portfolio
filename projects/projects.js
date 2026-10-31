import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

let query = '';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');

projectsTitle.textContent = `Projects (${Array.isArray(projects) ? projects.length : 0})`;

function renderPieChart(projectsGiven) {
	const newRolledData = d3.rollups(
		projectsGiven,
		(values) => values.length,
		(project) => project.year,
	);
	const newData = newRolledData.map(([year, count]) => {
		return { value: count, label: year };
	});
	const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
	const newSliceGenerator = d3.pie().value((item) => item.value);
	const newArcData = newSliceGenerator(newData);
	const newArcs = newArcData.map((slice) => arcGenerator(slice));
	const colors = d3.scaleOrdinal(d3.schemeTableau10);
	const svg = d3.select('#projects-pie-plot');
	const legend = d3.select('.legend');

	svg.selectAll('path').remove();
	legend.selectAll('li').remove();

	newArcs.forEach((arc, index) => {
		svg.append('path').attr('d', arc).attr('fill', colors(index));
	});

	newData.forEach((item, index) => {
		legend
			.append('li')
			.attr('class', 'legend-item')
			.attr('style', `--color:${colors(index)}`)
			.html(`<span class="swatch"></span>${item.label} <em>(${item.value})</em>`);
	});
}

renderProjects(projects, projectsContainer, 'h2');
renderPieChart(projects);

const searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
	query = event.target.value;
	const filteredProjects = projects.filter((project) => {
		const values = Object.values(project).join('\n').toLowerCase();
		return values.includes(query.toLowerCase());
	});
	renderProjects(filteredProjects, projectsContainer, 'h2');
	renderPieChart(filteredProjects);
});
