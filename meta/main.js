import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  return await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
}

function processCommits(data) {
  return d3.groups(data, (row) => row.commit).map(([commit, lines]) => {
    const first = lines[0];
    const { author, date, time, timezone, datetime } = first;
    const processedCommit = {
      id: commit,
      url: `https://github.com/paj003-crypto/Portfolio/commit/${commit}`,
      author,
      date,
      time,
      timezone,
      datetime,
      hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
      totalLines: lines.length,
    };

    Object.defineProperty(processedCommit, 'lines', {
      value: lines,
      enumerable: false,
      writable: false,
      configurable: false,
    });

    return processedCommit;
  });
}

function renderCommitInfo(data, commits) {
  const fileLengths = d3.rollups(
    data,
    (lines) => d3.max(lines, (line) => line.line),
    (line) => line.file,
  );
  const averageLineLength = d3.mean(data, (line) => line.length) ?? 0;
  const averageFileLength = d3.mean(fileLengths, ([, length]) => length) ?? 0;
  const stats = [
    ['Total <abbr title="Lines of code">LOC</abbr>', d3.format(',')(data.length)],
    ['Total commits', d3.format(',')(commits.length)],
    ['Files', d3.format(',')(fileLengths.length)],
    ['Average file length', `${d3.format(',.1f')(averageFileLength)} lines`],
    ['Average line length', `${d3.format(',.1f')(averageLineLength)} characters`],
  ];
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  for (const [label, value] of stats) {
    const entry = dl.append('div');
    entry.append('dt').html(label);
    entry.append('dd').text(value);
  }
}

function renderTooltipContent(commit) {
  if (!commit || Object.keys(commit).length === 0) return;

  document.getElementById('commit-link').href = commit.url;
  document.getElementById('commit-link').textContent = commit.id;
  document.getElementById('commit-date').textContent = commit.datetime?.toLocaleString(
    'en',
    { dateStyle: 'full' },
  );
  document.getElementById('commit-time').textContent = `${commit.time} ${commit.timezone}`;
  document.getElementById('commit-author').textContent = commit.author;
  document.getElementById('commit-lines').textContent = d3.format(',')(commit.totalLines);
}

function updateTooltipVisibility(isVisible) {
  document.getElementById('commit-tooltip').hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

function renderScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 40, left: 55 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (commit) => commit.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();
  const yScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);
  const [minLines, maxLines] = d3.extent(commits, (commit) => commit.totalLines);
  const rScale = d3
    .scaleSqrt()
    .domain([minLines, maxLines])
    .range([2, 30]);
  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  gridlines.call(
    d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width),
  );

  const dots = svg.append('g').attr('class', 'dots');
  const sortedCommits = d3.sort(commits, (commit) => -commit.totalLines);

  dots
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', (commit) => xScale(commit.datetime))
    .attr('cy', (commit) => yScale(commit.hourFrac))
    .attr('r', (commit) => rScale(commit.totalLines))
    .style('fill-opacity', 0.7)
    .attr('fill', (commit) =>
      commit.hourFrac < 6 || commit.hourFrac >= 18 ? '#5d8fba' : '#d27b42',
    )
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });

  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(d3.axisBottom(xScale).ticks(d3.timeWeek.every(1)));

  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat((hour) => `${String(hour % 24).padStart(2, '0')}:00`),
    );
}

const data = await loadData();
const commits = processCommits(data);
console.log(commits);
renderCommitInfo(data, commits);
renderScatterPlot(data, commits);