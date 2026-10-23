import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');

projectsTitle.textContent = `Projects (${Array.isArray(projects) ? projects.length : 0})`;

renderProjects(projects, projectsContainer, 'h2');
