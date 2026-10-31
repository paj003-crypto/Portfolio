import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

let query = '';
let selectedYear = null;

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');

projectsTitle.textContent = `Projects (${Array.isArray(projects) ? projects.length : 0})`;

function toggleSelectedYear(year) {
	selectedYear = selectedYear === year ? null : year;
	updateProjects();
}

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
		const year = newData[index].label;
		svg
			.append('path')
			.attr('d', arc)
			.attr('fill', colors(index))
			.attr('class', selectedYear === year ? 'selected' : null)
			.on('click', () => toggleSelectedYear(year));
	});

	newData.forEach((item, index) => {
		legend
			.append('li')
			.attr(
				'class',
				selectedYear === item.label ? 'legend-item selected' : 'legend-item',
			)
			.attr('style', `--color:${colors(index)}`)
			.html(`<span class="swatch"></span>${item.label} <em>(${item.value})</em>`)
			.on('click', () => toggleSelectedYear(item.label));
	});
}

function updateProjects() {
	const projectsMatchingQuery = projects.filter((project) => {
		const values = Object.values(project).join('\n').toLowerCase();
		return values.includes(query.toLowerCase());
	});
	const visibleProjects = selectedYear === null
		? projectsMatchingQuery
		: projectsMatchingQuery.filter((project) => project.year === selectedYear);

	renderProjects(visibleProjects, projectsContainer, 'h2');
	renderPieChart(projectsMatchingQuery);
}

const searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
	query = event.target.value;
	updateProjects();
});

updateProjects();
