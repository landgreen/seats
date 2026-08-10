const ROWS = 4;
const COLUMNS = 10;
const PREVIOUS_COLUMN_COUNT = 9;
const INSERTED_COLUMN_INDEX = 2;
const PERIOD_COUNT = 6;
const STORAGE_KEY = "attendance-periods";
const CURRENT_PERIOD_STORAGE_KEY = "attendance-current-period";
const PERIOD_ONE_PHOTOS_SEEDED_KEY = "attendance-period-one-photos-seeded";
const SHOW_STUDENT_PICTURES_KEY = "attendance-show-student-pictures";
const VOICE_ENABLED_KEY = "attendance-voice-enabled";
const SHOW_CALLED_ON_COUNT_KEY = "attendance-show-called-on-count";
const CALL_HISTORY_KEY = "attendance-call-history";
const FORMER_NON_SEATS_EMPTIED_KEY = "attendance-former-non-seats-emptied";
const FORMER_NON_SEATS_LOCKED_KEY = "attendance-former-non-seats-locked";

// These positions used to be gray, merged non-seat areas. They are now regular
// cards whose initial state is empty.
const FORMER_NON_SEAT_POSITIONS = new Set([0, 1, 8, 9, 20, 21, 30, 31]);
const BLOCKED_POSITIONS = new Set();

const MERGED_BLOCKS = new Map();
const MERGED_BLOCK_CHILDREN = new Set();
const PERIOD_ONE_PHOTOS = [
  {
    name: "Camilo Garcia",
    image: "output/student-photos/camilo-garcia.jpg",
  },
  {
    name: "Cinthia Garcia Aquino",
    image: "output/student-photos/cinthia-garcia-aquino.jpg",
  },
  {
    name: "Luca Jarjoura",
    image: "output/student-photos/luca-jarjoura.jpg",
  },
  {
    name: "Kirby Lai",
    image: "output/student-photos/kirby-lai.jpg",
  },
  {
    name: "James Theiss",
    image: "output/student-photos/james-theiss.jpg",
  },
];

const speechHandler = {
  voices: [],
  init: function () {
    const load = () => { this.voices = window.speechSynthesis.getVoices(); };
    window.speechSynthesis.onvoiceschanged = load;
    load();
  },
  speech: function (say, type = 'uk') {
    if (!voiceEnabled) {
      return;
    }
    if (this.voices.length === 0) this.voices = window.speechSynthesis.getVoices();
    const utterance = new SpeechSynthesisUtterance(say);
    utterance.rate = 0.95;
    utterance.volume = 0.5;
    const library = {
      'us': { lang: 'en-US', names: ['Jenny', 'Aria', 'Guy', 'Google US English', 'Samantha'] },
      'uk': { lang: 'en-GB', names: ['Sonia', 'Libby', 'Ryan', 'Google UK English', 'Serena'] },
      'au': { lang: 'en-AU', names: ['Natasha', 'William', 'Google Australian English', 'Karen'] },
      'in': { lang: 'en-IN', names: ['Neerja', 'Prabhat', 'Google India English', 'Rishi', 'Veena'] },
      'ca': { lang: 'en-CA', names: ['Clara', 'Liam', 'Google Canada English', 'Linda', 'Moira'] },
    };
    const config = library[type] || library['uk'];

    // It looks for names in order of quality
    let selectedVoice = null;
    for (let name of config.names) {
      selectedVoice = this.voices.find(v => v.name.includes(name));
      if (selectedVoice) break;
    }

    // Fallback: If no premium name is found, take ANY voice matching the language code
    utterance.voice = selectedVoice || this.voices.find(v => v.lang.startsWith(config.lang));
    window.speechSynthesis.speak(utterance);
  }
};
speechHandler.init();

function createStudent(name, image = null) {
  return {
    name,
    image,
    isEmpty: false,
    isLocked: false,
    calledOn: 0,
    tardy: 0,
    eating: 0,
  };
}

// Each period contains a 4-by-10 array. These names can be changed independently
// later without changing the grid-rendering code.
function createDefaultPeriods() {
  return Array.from({ length: PERIOD_COUNT }, () =>
    Array.from({ length: ROWS }, (_, rowIndex) => {
      const row = Array.from(
        { length: PREVIOUS_COLUMN_COUNT },
        (_, columnIndex) => {
          const studentNumber =
            rowIndex * PREVIOUS_COLUMN_COUNT + columnIndex + 1;
          return createStudent(`student${studentNumber}`);
        },
      );

      row.splice(
        INSERTED_COLUMN_INDEX,
        0,
        createStudent(
          `student${PREVIOUS_COLUMN_COUNT * ROWS + rowIndex + 1}`,
        ),
      );
      return row;
    }),
  );
}

function isStudentRecord(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.name === "string" &&
    Number.isFinite(value.calledOn) &&
    Number.isFinite(value.tardy) &&
    Number.isFinite(value.eating)
  );
}

function hasValidPeriodStructure(
  value,
  columnCount = COLUMNS,
  studentValidator = isStudentRecord,
) {
  return (
    Array.isArray(value) &&
    value.length === PERIOD_COUNT &&
    value.every(
      (period) =>
        Array.isArray(period) &&
        period.length === ROWS &&
        period.every(
          (row) =>
            Array.isArray(row) &&
            row.length === columnCount &&
            row.every(studentValidator),
        ),
    )
  );
}

function convertStudentNamesToRecords(storedPeriods) {
  return storedPeriods.map((period) =>
    period.map((row) => row.map((studentName) => createStudent(studentName))),
  );
}

function normalizeStudentRecords(storedPeriods) {
  return storedPeriods.map((period) =>
    period.map((row) =>
      row.map((student) => ({
        ...student,
        image: typeof student.image === "string" ? student.image : null,
        isEmpty:
          typeof student.isEmpty === "boolean" ? student.isEmpty : false,
        isLocked:
          typeof student.isLocked === "boolean" ? student.isLocked : false,
      })),
    ),
  );
}

function migratePeriodsToTenColumns(storedPeriods) {
  return storedPeriods.map((period) =>
    period.map((row, rowIndex) => {
      const migratedRow = [...row];
      migratedRow.splice(
        INSERTED_COLUMN_INDEX,
        0,
        createStudent(
          `student${PREVIOUS_COLUMN_COUNT * ROWS + rowIndex + 1}`,
        ),
      );
      return migratedRow;
    }),
  );
}

function loadPeriods() {
  try {
    const storedPeriods = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (hasValidPeriodStructure(storedPeriods)) {
      return normalizeStudentRecords(storedPeriods);
    }

    const containsStudentNames = (student) => typeof student === "string";
    let migratedPeriods = null;

    if (
      hasValidPeriodStructure(storedPeriods, COLUMNS, containsStudentNames)
    ) {
      migratedPeriods = convertStudentNamesToRecords(storedPeriods);
    } else if (
      hasValidPeriodStructure(storedPeriods, PREVIOUS_COLUMN_COUNT)
    ) {
      migratedPeriods = migratePeriodsToTenColumns(storedPeriods);
    } else if (
      hasValidPeriodStructure(
        storedPeriods,
        PREVIOUS_COLUMN_COUNT,
        containsStudentNames,
      )
    ) {
      migratedPeriods = migratePeriodsToTenColumns(
        convertStudentNamesToRecords(storedPeriods),
      );
    }

    if (migratedPeriods) {
      migratedPeriods = normalizeStudentRecords(migratedPeriods);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedPeriods));
      return migratedPeriods;
    }
  } catch (error) {
    console.warn("The saved period data could not be loaded.", error);
  }

  return createDefaultPeriods();
}

function savePeriods() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(periods));
  } catch (error) {
    console.warn("The period data could not be saved.", error);
  }
}

function loadCurrentPeriod() {
  try {
    const storedPeriodIndex = Number(
      localStorage.getItem(CURRENT_PERIOD_STORAGE_KEY),
    );

    if (
      Number.isInteger(storedPeriodIndex) &&
      storedPeriodIndex >= 0 &&
      storedPeriodIndex < PERIOD_COUNT
    ) {
      return storedPeriodIndex;
    }
  } catch (error) {
    console.warn("The saved current period could not be loaded.", error);
  }

  return 0;
}

function saveCurrentPeriod() {
  try {
    localStorage.setItem(CURRENT_PERIOD_STORAGE_KEY, currentPeriodIndex);
  } catch (error) {
    console.warn("The current period could not be saved.", error);
  }
}

function loadShowStudentPictures() {
  try {
    return localStorage.getItem(SHOW_STUDENT_PICTURES_KEY) !== "false";
  } catch (error) {
    console.warn("The student picture setting could not be loaded.", error);
    return true;
  }
}

function saveShowStudentPictures() {
  try {
    localStorage.setItem(SHOW_STUDENT_PICTURES_KEY, showStudentPictures);
  } catch (error) {
    console.warn("The student picture setting could not be saved.", error);
  }
}

function loadVoiceEnabled() {
  try {
    return localStorage.getItem(VOICE_ENABLED_KEY) !== "false";
  } catch (error) {
    console.warn("The voice setting could not be loaded.", error);
    return true;
  }
}

function saveVoiceEnabled() {
  try {
    localStorage.setItem(VOICE_ENABLED_KEY, voiceEnabled);
  } catch (error) {
    console.warn("The voice setting could not be saved.", error);
  }
}

function loadShowCalledOnCount() {
  try {
    return localStorage.getItem(SHOW_CALLED_ON_COUNT_KEY) === "true";
  } catch (error) {
    console.warn("The called-on count setting could not be loaded.", error);
    return false;
  }
}

function saveShowCalledOnCount() {
  try {
    localStorage.setItem(SHOW_CALLED_ON_COUNT_KEY, showCalledOnCount);
  } catch (error) {
    console.warn("The called-on count setting could not be saved.", error);
  }
}

function createEmptyCallHistory() {
  return Array.from({ length: PERIOD_COUNT }, () => []);
}

function loadCallHistory() {
  try {
    const storedHistory = JSON.parse(localStorage.getItem(CALL_HISTORY_KEY));
    const isValidHistory =
      Array.isArray(storedHistory) &&
      storedHistory.length === PERIOD_COUNT &&
      storedHistory.every(
        (periodHistory) =>
          Array.isArray(periodHistory) &&
          periodHistory.every(
            (entry) =>
              entry !== null &&
              typeof entry === "object" &&
              typeof entry.studentName === "string" &&
              typeof entry.calledAt === "string" &&
              Number.isFinite(entry.calledOnCount),
          ),
      );

    if (isValidHistory) {
      return storedHistory;
    }
  } catch (error) {
    console.warn("The call history could not be loaded.", error);
  }

  return createEmptyCallHistory();
}

function saveCallHistory() {
  try {
    localStorage.setItem(CALL_HISTORY_KEY, JSON.stringify(callHistory));
  } catch (error) {
    console.warn("The call history could not be saved.", error);
  }
}

function parseStoredValue(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function exportLocalStorage() {
  savePeriods();
  saveCallHistory();
  saveCurrentPeriod();
  saveShowStudentPictures();
  saveVoiceEnabled();
  saveShowCalledOnCount();

  const savedData = {};

  for (
    let storageIndex = 0;
    storageIndex < localStorage.length;
    storageIndex += 1
  ) {
    const key = localStorage.key(storageIndex);

    if (key?.startsWith("attendance-")) {
      savedData[key] = parseStoredValue(localStorage.getItem(key));
    }
  }

  const exportData = {
    application: "attendance-seating-chart",
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    data: savedData,
  };
  const file = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const downloadUrl = URL.createObjectURL(file);
  const downloadLink = document.createElement("a");
  const timestamp = exportData.exportedAt.replace(/[:.]/g, "-");

  downloadLink.href = downloadUrl;
  downloadLink.download = `attendance-backup-${timestamp}.json`;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
}

function downloadStudentReport() {
  const reportLines = [
    "Student Report",
    `Generated: ${new Date().toLocaleString()}`,
    "",
  ];

  periods.forEach((period, periodIndex) => {
    const students = period
      .flat()
      .filter((student) => !student.isEmpty && !student.isLocked)
      .sort((firstStudent, secondStudent) =>
        firstStudent.name.localeCompare(secondStudent.name, undefined, {
          sensitivity: "base",
          numeric: true,
        }),
      );

    reportLines.push(`Period ${periodIndex + 1}`, "--------");

    if (students.length === 0) {
      reportLines.push("(No students)", "");
      return;
    }

    students.forEach((student) => {
      reportLines.push(
        student.name,
        `  Called on: ${student.calledOn}`,
        `  Tardies: ${student.tardy}`,
        `  Eating: ${student.eating}`,
        "",
      );
    });
  });

  const file = new Blob([reportLines.join("\n")], {
    type: "text/plain;charset=utf-8",
  });
  const downloadUrl = URL.createObjectURL(file);
  const downloadLink = document.createElement("a");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  downloadLink.href = downloadUrl;
  downloadLink.download = `student-report-${timestamp}.txt`;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
}

function getAttendanceStorageEntries() {
  const entries = [];

  for (
    let storageIndex = 0;
    storageIndex < localStorage.length;
    storageIndex += 1
  ) {
    const key = localStorage.key(storageIndex);

    if (key?.startsWith("attendance-")) {
      entries.push([key, localStorage.getItem(key)]);
    }
  }

  return entries;
}

function writeImportedValue(key, value) {
  const storedValue =
    typeof value === "string" ? value : JSON.stringify(value);
  localStorage.setItem(key, storedValue);
}

async function importLocalStorage(file) {
  const importedData = JSON.parse(await file.text());

  if (
    importedData?.application !== "attendance-seating-chart" ||
    importedData?.formatVersion !== 1 ||
    importedData.data === null ||
    typeof importedData.data !== "object" ||
    Array.isArray(importedData.data)
  ) {
    throw new Error("This is not a compatible attendance backup file.");
  }

  let importedEntries = Object.entries(importedData.data);

  if (
    importedEntries.length === 0 ||
    importedEntries.some(([key]) => !key.startsWith("attendance-")) ||
    !hasValidPeriodStructure(importedData.data[STORAGE_KEY])
  ) {
    throw new Error("The attendance backup data is missing or invalid.");
  }

  importedData.data[STORAGE_KEY] = normalizeStudentRecords(
    importedData.data[STORAGE_KEY],
  );
  importedEntries = Object.entries(importedData.data);

  const confirmed = window.confirm(
    "Import this backup? It will replace the attendance data currently saved in this browser.",
  );

  if (!confirmed) {
    return false;
  }

  const previousEntries = getAttendanceStorageEntries();

  try {
    previousEntries.forEach(([key]) => localStorage.removeItem(key));
    importedEntries.forEach(([key, value]) => writeImportedValue(key, value));
  } catch (error) {
    getAttendanceStorageEntries().forEach(([key]) =>
      localStorage.removeItem(key),
    );
    previousEntries.forEach(([key, value]) =>
      localStorage.setItem(key, value),
    );
    throw error;
  }

  return true;
}

const periods = loadPeriods();
const callHistory = loadCallHistory();

function emptyFormerNonSeatsOnce() {
  try {
    if (localStorage.getItem(FORMER_NON_SEATS_EMPTIED_KEY) === "true") {
      return;
    }

    periods.forEach((period) => {
      FORMER_NON_SEAT_POSITIONS.forEach((studentIndex) => {
        const row = Math.floor(studentIndex / COLUMNS);
        const column = studentIndex % COLUMNS;
        period[row][column].isEmpty = true;
      });
    });

    savePeriods();
    localStorage.setItem(FORMER_NON_SEATS_EMPTIED_KEY, "true");
  } catch (error) {
    console.warn("The former non-seat positions could not be emptied.", error);
  }
}

emptyFormerNonSeatsOnce();

function lockFormerNonSeatsOnce() {
  try {
    if (localStorage.getItem(FORMER_NON_SEATS_LOCKED_KEY) === "true") {
      return;
    }

    periods.forEach((period) => {
      FORMER_NON_SEAT_POSITIONS.forEach((studentIndex) => {
        const row = Math.floor(studentIndex / COLUMNS);
        const column = studentIndex % COLUMNS;
        period[row][column].isEmpty = false;
        period[row][column].isLocked = true;
      });
    });

    savePeriods();
    localStorage.setItem(FORMER_NON_SEATS_LOCKED_KEY, "true");
  } catch (error) {
    console.warn("The former non-seat positions could not be locked.", error);
  }
}

lockFormerNonSeatsOnce();

function seedPeriodOnePhotos() {
  try {
    if (localStorage.getItem(PERIOD_ONE_PHOTOS_SEEDED_KEY) === "true") {
      return;
    }

    const availablePositions = Array.from(
      { length: ROWS * COLUMNS },
      (_, studentIndex) => studentIndex,
    ).filter((studentIndex) => {
      const row = Math.floor(studentIndex / COLUMNS);
      const column = studentIndex % COLUMNS;
      return (
        !periods[0][row][column].isEmpty &&
        !periods[0][row][column].isLocked
      );
    });

    PERIOD_ONE_PHOTOS.forEach((studentData, photoIndex) => {
      const studentIndex = availablePositions[photoIndex];
      const row = Math.floor(studentIndex / COLUMNS);
      const column = studentIndex % COLUMNS;

      periods[0][row][column] = createStudent(
        studentData.name,
        studentData.image,
      );
    });

    savePeriods();
    localStorage.setItem(PERIOD_ONE_PHOTOS_SEEDED_KEY, "true");
  } catch (error) {
    console.warn("The period 1 student photos could not be initialized.", error);
  }
}

seedPeriodOnePhotos();

const studentGrid = document.querySelector("#student-grid");
const periodLabel = document.querySelector("#period-label");
const previousButton = document.querySelector("#previous-period");
const nextButton = document.querySelector("#next-period");
const randomizedButton = document.querySelector("#randomized-student");
const undoStudentChangeButton = document.querySelector(
  "#undo-student-change",
);
const showStudentPicturesCheckbox = document.querySelector(
  "#show-student-pictures",
);
const voiceEnabledCheckbox = document.querySelector("#voice-enabled");
const showCalledOnCountCheckbox = document.querySelector(
  "#show-called-on-count",
);
const exportLocalStorageButton = document.querySelector(
  "#export-local-storage",
);
const importLocalStorageButton = document.querySelector(
  "#import-local-storage",
);
const importLocalStorageFile = document.querySelector(
  "#import-local-storage-file",
);
const downloadStudentReportButton = document.querySelector(
  "#download-student-report",
);

let currentPeriodIndex = loadCurrentPeriod();
let selectedStudentIndex = null;
let randomizedStudentIndex = null;
let showStudentPictures = loadShowStudentPictures();
let voiceEnabled = loadVoiceEnabled();
let showCalledOnCount = loadShowCalledOnCount();
let previousPeriodsState = null;
let previousCallHistoryState = null;

function clonePeriodsState(periodState) {
  return JSON.parse(JSON.stringify(periodState));
}

function updateUndoButton() {
  undoStudentChangeButton.disabled = previousPeriodsState === null;
}

function captureUndoState() {
  previousPeriodsState = clonePeriodsState(periods);
  previousCallHistoryState = clonePeriodsState(callHistory);
  updateUndoButton();
}

function undoLastStudentChange() {
  if (previousPeriodsState === null) {
    return;
  }

  const restoredPeriods = clonePeriodsState(previousPeriodsState);
  const restoredCallHistory = clonePeriodsState(previousCallHistoryState);
  periods.splice(0, periods.length, ...restoredPeriods);
  callHistory.splice(0, callHistory.length, ...restoredCallHistory);
  previousPeriodsState = null;
  previousCallHistoryState = null;
  selectedStudentIndex = null;
  randomizedStudentIndex = null;
  savePeriods();
  saveCallHistory();
  updateUndoButton();
  renderPeriod();
}

function getStudentDisplayName(studentData) {
  return showCalledOnCount
    ? `${studentData.calledOn} - ${studentData.name}`
    : studentData.name;
}

function renderPeriod() {
  periodLabel.textContent = `Period ${currentPeriodIndex + 1}`;
  showStudentPicturesCheckbox.checked = showStudentPictures;
  voiceEnabledCheckbox.checked = voiceEnabled;
  showCalledOnCountCheckbox.checked = showCalledOnCount;
  studentGrid.classList.toggle("pictures-hidden", !showStudentPictures);
  randomizedButton.disabled = getAvailableStudentPositions().length === 0;
  studentGrid.replaceChildren();

  periods[currentPeriodIndex].flat().forEach((studentData, studentIndex) => {
    if (MERGED_BLOCK_CHILDREN.has(studentIndex)) {
      return;
    }

    const rowIndex = Math.floor(studentIndex / COLUMNS);
    const columnIndex = studentIndex % COLUMNS;
    const mergedBlock = MERGED_BLOCKS.get(studentIndex);
    const student = document.createElement("div");
    student.className = "student";
    student.dataset.index = studentIndex;
    student.style.gridRow = `${rowIndex + 1}${mergedBlock ? ` / span ${mergedBlock.rowSpan}` : ""
      }`;
    student.style.gridColumn = `${columnIndex + 1}${mergedBlock ? ` / span ${mergedBlock.columnSpan}` : ""
      }`;

    if (BLOCKED_POSITIONS.has(studentIndex)) {
      student.classList.add("blocked");
      student.setAttribute("aria-disabled", "true");
    } else {
      if (studentData.isLocked) {
        student.classList.add("locked-seat");
      } else if (studentData.isEmpty) {
        student.classList.add("empty-seat");
      } else {
        const studentName = document.createElement("div");
        studentName.className = "student-name";
        studentName.textContent = getStudentDisplayName(studentData);
        student.append(studentName);
      }

      const studentOptions = document.createElement("details");
      studentOptions.className = "student-options";
      const optionsLabel = document.createElement("summary");
      optionsLabel.textContent = "options";
      studentOptions.append(optionsLabel);

      const optionFields = document.createElement("div");
      optionFields.className = "student-option-fields";

      if (!studentData.isEmpty && !studentData.isLocked) {
        const nameFieldLabel = document.createElement("label");
        nameFieldLabel.className = "student-option-field";

        const nameFieldName = document.createElement("span");
        nameFieldName.textContent = "Name";

        const nameFieldInput = document.createElement("input");
        nameFieldInput.type = "text";
        nameFieldInput.value = studentData.name;
        nameFieldInput.dataset.studentProperty = "name";
        nameFieldInput.setAttribute("aria-label", `${studentData.name} name`);

        nameFieldLabel.append(nameFieldName, nameFieldInput);
        optionFields.append(nameFieldLabel);

        [
          ["Called On", "calledOn"],
          ["Tardy", "tardy"],
          ["Eating", "eating"],
        ].forEach(([labelText, propertyName]) => {
          const fieldLabel = document.createElement("label");
          fieldLabel.className = "student-option-field";

          const fieldName = document.createElement("span");
          fieldName.textContent = labelText;

          const fieldInput = document.createElement("input");
          fieldInput.type = "number";
          fieldInput.step = "1";
          fieldInput.min = "0";
          fieldInput.value = studentData[propertyName];
          fieldInput.dataset.studentProperty = propertyName;
          fieldInput.setAttribute(
            "aria-label",
            `${studentData.name} ${labelText}`,
          );

          fieldLabel.append(fieldName, fieldInput);
          optionFields.append(fieldLabel);
        });
      }

      const emptyFieldLabel = document.createElement("label");
      emptyFieldLabel.className = "student-option-field";

      const emptyFieldName = document.createElement("span");
      emptyFieldName.textContent = "Empty";

      const emptyFieldInput = document.createElement("input");
      emptyFieldInput.type = "checkbox";
      emptyFieldInput.checked = studentData.isEmpty;
      emptyFieldInput.dataset.studentProperty = "isEmpty";
      emptyFieldInput.setAttribute(
        "aria-label",
        `${studentData.name} seat is empty`,
      );

      emptyFieldLabel.append(emptyFieldName, emptyFieldInput);
      optionFields.append(emptyFieldLabel);

      const lockedFieldLabel = document.createElement("label");
      lockedFieldLabel.className = "student-option-field";

      const lockedFieldName = document.createElement("span");
      lockedFieldName.textContent = "Locked";

      const lockedFieldInput = document.createElement("input");
      lockedFieldInput.type = "checkbox";
      lockedFieldInput.checked = studentData.isLocked;
      lockedFieldInput.dataset.studentProperty = "isLocked";
      lockedFieldInput.setAttribute(
        "aria-label",
        `${studentData.name} chair is locked`,
      );

      lockedFieldLabel.append(lockedFieldName, lockedFieldInput);
      optionFields.append(lockedFieldLabel);

      studentOptions.append(optionFields);

      if (
        showStudentPictures &&
        !studentData.isEmpty &&
        !studentData.isLocked
      ) {
        const photoFrame = document.createElement("div");
        photoFrame.className = "student-photo-frame";

        if (studentData.image) {
          const studentPhoto = document.createElement("img");
          studentPhoto.className = "student-photo";
          studentPhoto.src = studentData.image;
          studentPhoto.alt = `${studentData.name} portrait`;
          studentPhoto.loading = "lazy";
          photoFrame.append(studentPhoto);
        } else {
          photoFrame.setAttribute("aria-hidden", "true");
        }

        student.append(photoFrame);
      }

      student.append(studentOptions);

      if (studentIndex === randomizedStudentIndex) {
        student.classList.add("randomly-selected");
      }
    }

    studentGrid.append(student);
  });
}

function swapStudents(firstIndex, secondIndex) {
  const firstStudent = getStudentAtPosition(firstIndex);
  const secondStudent = getStudentAtPosition(secondIndex);

  if (
    BLOCKED_POSITIONS.has(firstIndex) ||
    BLOCKED_POSITIONS.has(secondIndex) ||
    firstStudent.isLocked ||
    secondStudent.isLocked ||
    firstIndex === secondIndex
  ) {
    return;
  }

  captureUndoState();
  const period = periods[currentPeriodIndex];
  const firstRow = Math.floor(firstIndex / COLUMNS);
  const firstColumn = firstIndex % COLUMNS;
  const secondRow = Math.floor(secondIndex / COLUMNS);
  const secondColumn = secondIndex % COLUMNS;

  [period[firstRow][firstColumn], period[secondRow][secondColumn]] = [
    period[secondRow][secondColumn],
    period[firstRow][firstColumn],
  ];

  savePeriods();
}

studentGrid.addEventListener("click", (event) => {
  if (event.target.closest(".student-options")) {
    return;
  }

  const student = event.target.closest(".student");

  if (
    !student ||
    student.classList.contains("blocked") ||
    student.classList.contains("locked-seat")
  ) {
    return;
  }

  const clickedStudentIndex = Number(student.dataset.index);

  if (randomizedStudentIndex !== null) {
    randomizedStudentIndex = null;
    studentGrid
      .querySelector(".randomly-selected")
      ?.classList.remove("randomly-selected");
  }

  if (selectedStudentIndex === null) {
    selectedStudentIndex = clickedStudentIndex;
    student.classList.add("selected");
    return;
  }

  swapStudents(selectedStudentIndex, clickedStudentIndex);
  selectedStudentIndex = null;
  randomizedStudentIndex = null;
  renderPeriod();
});

studentGrid.addEventListener("change", (event) => {
  const input = event.target.closest("[data-student-property]");

  if (!input) {
    return;
  }

  const studentCard = input.closest(".student");
  const studentIndex = Number(studentCard.dataset.index);
  const propertyName = input.dataset.studentProperty;
  const studentData = getStudentAtPosition(studentIndex);

  if (propertyName === "name") {
    const enteredValue = input.value.trim();

    if (enteredValue.length === 0) {
      input.value = studentData.name;
      return;
    }

    if (studentData[propertyName] === enteredValue) {
      return;
    }

    captureUndoState();
    studentData[propertyName] = enteredValue;
    savePeriods();
    renderPeriod();
    return;
  }

  if (input.type === "checkbox") {
    if (studentData[propertyName] === input.checked) {
      return;
    }

    captureUndoState();
    studentData[propertyName] = input.checked;

    if (input.checked && propertyName === "isEmpty") {
      studentData.isLocked = false;
    } else if (input.checked && propertyName === "isLocked") {
      studentData.isEmpty = false;
    }

    savePeriods();
    renderPeriod();
    return;
  }

  const enteredValue = Number.parseInt(input.value, 10);
  const normalizedValue = Number.isFinite(enteredValue)
    ? Math.max(0, enteredValue)
    : 0;

  if (studentData[propertyName] === normalizedValue) {
    input.value = normalizedValue;
    return;
  }

  captureUndoState();
  studentData[propertyName] = normalizedValue;
  input.value = normalizedValue;
  studentCard.querySelector(".student-name").textContent =
    getStudentDisplayName(studentData);
  savePeriods();
});

function getAvailableStudentPositions() {
  return Array.from(
    { length: ROWS * COLUMNS },
    (_, studentIndex) => studentIndex,
  ).filter(
    (studentIndex) =>
      !BLOCKED_POSITIONS.has(studentIndex) &&
      !getStudentAtPosition(studentIndex).isEmpty &&
      !getStudentAtPosition(studentIndex).isLocked,
  );
}

function getStudentAtPosition(studentIndex) {
  const row = Math.floor(studentIndex / COLUMNS);
  const column = studentIndex % COLUMNS;
  return periods[currentPeriodIndex][row][column];
}

function chooseWeightedStudentPosition() {
  const availablePositions = getAvailableStudentPositions();

  if (availablePositions.length === 0) {
    return null;
  }

  const averageCalledOn =
    availablePositions.reduce(
      (total, studentIndex) =>
        total + getStudentAtPosition(studentIndex).calledOn,
      0,
    ) / availablePositions.length;

  const weightedStudents = availablePositions.map((studentIndex) => {
    const calledOn = getStudentAtPosition(studentIndex).calledOn;
    let weight = 2;

    if (calledOn >= averageCalledOn + 5) {
      weight = 1;
    } else if (calledOn <= averageCalledOn - 5) {
      weight = 3;
    }

    return { studentIndex, weight };
  });

  const totalWeight = weightedStudents.reduce(
    (total, student) => total + student.weight,
    0,
  );
  let randomWeight = Math.random() * totalWeight;

  for (const student of weightedStudents) {
    randomWeight -= student.weight;

    if (randomWeight < 0) {
      return student.studentIndex;
    }
  }

  return weightedStudents.at(-1).studentIndex;
}

function chooseRandomStudent() {
  randomizedStudentIndex = chooseWeightedStudentPosition();

  if (randomizedStudentIndex === null) {
    return;
  }

  const studentRow = Math.floor(randomizedStudentIndex / COLUMNS);
  const studentColumn = randomizedStudentIndex % COLUMNS;
  const selectedStudent =
    periods[currentPeriodIndex][studentRow][studentColumn];

  captureUndoState();
  selectedStudent.calledOn += 1;
  callHistory[currentPeriodIndex].push({
    studentName: selectedStudent.name,
    calledAt: new Date().toISOString(),
    calledOnCount: selectedStudent.calledOn,
  });
  speechHandler.speech(selectedStudent.name);
  savePeriods();
  saveCallHistory();
  selectedStudentIndex = null;
  renderPeriod();
}

function changePeriod(direction) {
  selectedStudentIndex = null;
  randomizedStudentIndex = null;
  currentPeriodIndex =
    (currentPeriodIndex + direction + periods.length) % periods.length;
  saveCurrentPeriod();
  renderPeriod();
}

previousButton.addEventListener("click", () => changePeriod(-1));
nextButton.addEventListener("click", () => changePeriod(1));
randomizedButton.addEventListener("click", chooseRandomStudent);
undoStudentChangeButton.addEventListener("click", undoLastStudentChange);
showStudentPicturesCheckbox.addEventListener("change", () => {
  showStudentPictures = showStudentPicturesCheckbox.checked;
  selectedStudentIndex = null;
  saveShowStudentPictures();
  renderPeriod();
});
voiceEnabledCheckbox.addEventListener("change", () => {
  voiceEnabled = voiceEnabledCheckbox.checked;
  saveVoiceEnabled();

  if (!voiceEnabled && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
});
showCalledOnCountCheckbox.addEventListener("change", () => {
  showCalledOnCount = showCalledOnCountCheckbox.checked;
  selectedStudentIndex = null;
  saveShowCalledOnCount();
  renderPeriod();
});
exportLocalStorageButton.addEventListener("click", exportLocalStorage);
downloadStudentReportButton.addEventListener("click", downloadStudentReport);
importLocalStorageButton.addEventListener("click", () => {
  importLocalStorageFile.click();
});
importLocalStorageFile.addEventListener("change", async () => {
  const [file] = importLocalStorageFile.files;

  if (!file) {
    return;
  }

  try {
    const imported = await importLocalStorage(file);

    if (imported) {
      window.location.reload();
    }
  } catch (error) {
    console.error("Attendance import failed.", error);
    window.alert(`Import failed: ${error.message}`);
  } finally {
    importLocalStorageFile.value = "";
  }
});

renderPeriod();
