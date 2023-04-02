function generateHrsAndMinsStr(hrs, mins) {
  if (!hrs && !mins) return '0 mins';
  if (!hrs) return `${mins === 1 ? '1 min' : mins + ' mins'}`;
  return `${hrs === 1 ? '1 hr' : hrs + ' hrs'} ${mins === 1 ? '1 min' : mins + ' mins'}`;
}

function addIntervalTime(hour, min, notes) {
  let dateEntry = new Date();

  if (hour && min) {
    dateEntry.setHours(hour);
    dateEntry.setMinutes(min);
  }

  const localStorageKey = dateEntry.toLocaleDateString();
  const rawRowData = localStorage.getItem(localStorageKey);
  let rows = [];

  if (rawRowData) rows = JSON.parse(rawRowData);

  let length = '';

  if (rows.length) {
    const startTime = new Date();
    const s = rows[rows.length - 1].t;

    const endTime = new Date();
    const e = dateEntry.toLocaleTimeString('en-US', { hourCycle: 'h23' });

    startTime.setHours(...s.split(':'), 0);
    endTime.setHours(...e.split(':'), 0);

    const ms = (endTime.getTime() - startTime.getTime());

    const hrs = Math.floor(ms / 3600000);
    const mins = Math.round((ms % 3600000) / 60000);

    length = generateHrsAndMinsStr(hrs, mins);
  }

  rows.push({
    i: (rows[rows.length - 1]?.i || 0) + 1,
    d: dateEntry.toLocaleDateString(),
    t: dateEntry.toLocaleTimeString('en-US', { hourCycle: 'h23' }),
    l: length,
    n: notes
  });

  const avgInterval = calculateAverageIntervalTime(rows);
  localStorage.setItem(localStorageKey + '-avg', JSON.stringify(avgInterval));

  localStorage.setItem(localStorageKey, JSON.stringify(rows));
  location.reload();
}

function deleteMostRecentRow() {
  const localStorageKey = new Date().toLocaleDateString();

  const rawRowData = localStorage.getItem(localStorageKey);

  if (!rawRowData) return;

  const rows = JSON.parse(rawRowData);
  const deleted = rows.pop();

  localStorage.setItem('most-recently-deleted', localStorageKey + '#?!' + JSON.stringify(deleted));

  const avgInterval = calculateAverageIntervalTime(rows);
  localStorage.setItem(localStorageKey + '-avg', JSON.stringify(avgInterval));

  localStorage.setItem(localStorageKey, JSON.stringify(rows));
  location.reload();
}

function recoverLastDeletedRow() {
  const deleted = localStorage.getItem('most-recently-deleted');

  if (!deleted) return;

  const [date, deletedRow] = deleted.split('#?!');

  const rawTableData = localStorage.getItem(date);
  const tableDataJson = JSON.parse(rawTableData);
  tableDataJson.push(JSON.parse(deletedRow));
  localStorage.setItem(date, JSON.stringify(tableDataJson));
  localStorage.removeItem('most-recently-deleted');

  const avgInterval = calculateAverageIntervalTime(tableDataJson);
  localStorage.setItem(date + '-avg', JSON.stringify(avgInterval));

  location.reload();
}

function calculateAverageIntervalTime(rows) {
  // don't include intervals after midnight and before waking up in the average
  const timesAfter6AM = rows.filter(row => {
    const [hours, minutes, seconds] = row.t.split(':');
    const date = new Date();
    date.setHours(hours, minutes, seconds);

    const sixAM = new Date();
    sixAM.setHours(6, 0, 0, 0); // Set to 6 AM

    return date.getTime() > sixAM.getTime();
  });

  if (timesAfter6AM.length < 2) return { hrs: '', mins: '' };

  const firstLog = timesAfter6AM[0].t;
  const lastLog = timesAfter6AM[timesAfter6AM.length - 1].t;

  const startTime = new Date();
  startTime.setHours(...firstLog.split(':'), 0);
  const endTime = new Date();
  endTime.setHours(...lastLog.split(':'), 0);

  const ms = (endTime.getTime() - startTime.getTime()) / (timesAfter6AM.length - 1);

  const hrs = Math.floor(ms / 3600000);
  const mins = Math.round((ms % 3600000) / 60000);

  return { hrs, mins };
}

function generateTestData() {
  localStorage.clear();

  let dates = [];

  // set the start date to 2 days ago
  let startDate = new Date();
  startDate.setDate(startDate.getDate() - 2);
  startDate.setHours(0, 0, 0, 0);

  // iterate over each hour for the past 2 days
  for (let i = 0; i < 48; i++) {
    // create a new date object for each hour
    let date = new Date(startDate.getTime() + (i * 60 * 60 * 1000));
    dates.push(date);
  }

  dates.forEach(date => {
    const localStorageKey = date.toLocaleDateString();
    const rawRowData = localStorage.getItem(localStorageKey);
    let rows = [];

    if (rawRowData) rows = JSON.parse(rawRowData);

    rows.push({
      i: (rows[rows.length - 1]?.i || 0) + 1,
      d: date.toLocaleDateString(),
      t: date.toLocaleTimeString('en-US', { hourCycle: 'h23' })
    });

    const avgInterval = calculateAverageIntervalTime(rows);
    localStorage.setItem(localStorageKey + '-avg', JSON.stringify(avgInterval));

    localStorage.setItem(localStorageKey, JSON.stringify(rows));
  });
}
// generateTestData();

function generateTables() {

  function generateTable(date, rawTableDate) {
    if (!rawTableDate || rawTableDate === '[]') return;
    const tableWrapper = document.createElement('div');
    tableWrapper.classList.add('table-wrapper');
    const dateLabel = document.createElement('div');
    dateLabel.classList.add('date-label');
    tableWrapper.appendChild(dateLabel);
    dateLabel.innerText = date;

    const avg = document.createElement('div');
    avg.id = date + '-avg';
    const avgLabel = document.createElement('span');
    avg.appendChild(avgLabel)
    avgLabel.innerText = 'Average Interval Length: ';
    const avgValue = document.createElement('span');
    avgValue.id = date + '-avg-value';
    avg.appendChild(avgValue);
    avgLabel.classList.add('avg')
    avgValue.classList.add('avg')

    tableWrapper.appendChild(avg);
    const table = document.createElement('table');
    tableWrapper.appendChild(table);
    table.id = date + '-table';
    const tableParent = document.getElementById('table-parent');
    const headers = ['', 'Date', 'Time', 'Interval Length', 'Notes'];
    const headerRow = document.createElement('tr');
    for (const header of headers) {
      const headerCell = document.createElement('th');
      const headerText = document.createTextNode(header);
      headerCell.appendChild(headerText);
      headerRow.appendChild(headerCell);
    }
    table.appendChild(headerRow);
    tableParent.appendChild(tableWrapper);
  }

  function populateTableForDate(date, rawTableData) {
    if (!rawTableData) return;

    const currDateTable = document.getElementById(date + '-table');
    const rows = JSON.parse(rawTableData);

    // set the data in cells of the table
    rows.forEach((row) => {
      const rowEl = currDateTable.insertRow(1);

      const interval = rowEl.insertCell(0);
      const date = rowEl.insertCell(1);
      const time = rowEl.insertCell(2);
      const length = rowEl.insertCell(3);
      const notes = rowEl.insertCell(4);

      interval.innerHTML = row.i || '';
      date.innerHTML = row.d || '';
      time.innerHTML = row.t || '';
      length.innerHTML = row.l || '';
      notes.innerHTML = row.n || '';
    });

    const avgData = localStorage.getItem(date + '-avg');
    if (avgData) {
      const { hrs, mins } = JSON.parse(avgData);
      const avgValue = document.getElementById(date + '-avg-value')

      avgValue.innerHTML = generateHrsAndMinsStr(hrs, mins);
    }
  }

  const past90Dates = (() => {
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 90; i++) {
      const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      dates.push(date.toLocaleDateString().slice(0, 10));
    }
    return dates;
  })();

  past90Dates.forEach(date => {
    const rawData = localStorage.getItem(date);
    if (rawData) {
      generateTable(date, rawData);
      populateTableForDate(date, rawData);
    }
  });
}

const addButton = document.getElementById('add');
const deleteButton = document.getElementById('delete');
const recoverButton = document.getElementById('recover');
const customTimeInput = document.getElementById('custom-time-input');
const notesInput = document.getElementById('notes-input');


addButton.addEventListener('click', () => {
  const customTime = customTimeInput.value;
  const notes = notesInput.value;

  let hour;
  let min;

  if (customTime) {
    const [h, m] = customTime.split(':');

    hour = h;
    min = m;
  }

  addIntervalTime(hour, min, notes);
});

deleteButton.addEventListener('click', () => {
  deleteMostRecentRow();
});

recoverButton.addEventListener('click', () => {
  recoverLastDeletedRow();
});

generateTables();
