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

function renderScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (commit) => commit.datetime))
    .range([0, width])
    .nice();
  const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);
  const dots = svg.append('g').attr('class', 'dots');

  dots
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (commit) => xScale(commit.datetime))
    .attr('cy', (commit) => yScale(commit.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue');
}

const data = await loadData();
const commits = processCommits(data);
console.log(commits);
renderCommitInfo(data, commits);
renderScatterPlot(data, commits);