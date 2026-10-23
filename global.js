console.log('IT’S ALIVE!');

export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    console.log(response);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!(containerElement instanceof Element)) {
    console.error('A valid container element is required to render projects.');
    return;
  }

  containerElement.replaceChildren();

  if (!Array.isArray(projects) || projects.length === 0) {
    const message = document.createElement('p');
    message.textContent = 'No projects to display.';
    containerElement.append(message);
    return;
  }

  const validHeadingLevel = /^h[1-6]$/.test(headingLevel) ? headingLevel : 'h2';

  for (const project of projects) {
    const article = document.createElement('article');
    const heading = document.createElement(validHeadingLevel);
    heading.textContent = project.title ?? 'Untitled project';
    article.append(heading);

    if (project.image) {
      const image = document.createElement('img');
      image.src = project.image;
      image.alt = project.title ?? '';
      article.append(image);
    }

    const description = document.createElement('p');
    description.textContent = project.description ?? '';
    article.append(description);
    containerElement.append(article);
  }
}

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/paj003-crypto', title: 'GitHub' },
  { url: 'resume/', title: 'Resume' },
];

const BASE_PATH = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  ? '/'
  : '/Portfolio/';

let nav = document.createElement('nav');

for (let p of pages) {
  let url = p.url;
  if (!url.startsWith('http')) {
    url = BASE_PATH + url;
  }

  let a = document.createElement('a');
  a.href = url;
  a.textContent = p.title;

  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }

  if (a.host !== location.host) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }

  nav.append(a);
}

document.body.prepend(nav);
document.body.insertAdjacentHTML(
  'afterbegin',
  `
    <label class="color-scheme">
      Theme:
      <select>
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>`,
);

let colorSchemeSelect = document.querySelector('.color-scheme select');
function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  colorSchemeSelect.value = colorScheme;
}

colorSchemeSelect.addEventListener('input', (event) => {
  console.log('color scheme changed to', event.target.value);
  localStorage.colorScheme = event.target.value;
  setColorScheme(event.target.value);
});

if ('colorScheme' in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

let form = document.querySelector('form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let data = new FormData(form);
    let parameters = [];
    for (let [name, value] of data) {
      parameters.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
    }

    location.href = `${form.action}?${parameters.join('&')}`;
  });
}

