import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

const projects = await fetchJSON('./lib/projects.json');
const latestProjects = Array.isArray(projects) ? projects.slice(0, 3) : [];
const projectsContainer = document.querySelector('.projects');
const githubData = await fetchGitHubData('paj003-crypto');
const profileStats = document.querySelector('#profile-stats');

renderProjects(latestProjects, projectsContainer, 'h2');

if (profileStats) {
	if (!githubData) {
		profileStats.textContent = 'GitHub profile stats are unavailable.';
	} else {
		const stats = [
			['Public Repos', githubData.public_repos],
			['Public Gists', githubData.public_gists],
			['Followers', githubData.followers],
			['Following', githubData.following],
		];
		const list = document.createElement('dl');

		for (const [label, value] of stats) {
			const term = document.createElement('dt');
			term.textContent = label;
			const description = document.createElement('dd');
			description.textContent = String(value ?? 0);
			list.append(term, description);
		}

		profileStats.replaceChildren(list);
	}
}
