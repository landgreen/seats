const ROWS = 4;
const COLUMNS = 10;
const GRID_SPACER_AFTER_COLUMNS = [2, 6];
const PREVIOUS_COLUMN_COUNT = 9;
const INSERTED_COLUMN_INDEX = 2;
const PERIOD_COUNT = 6;
const STORAGE_KEY = "attendance-periods";
const CURRENT_PERIOD_STORAGE_KEY = "attendance-current-period";
const PERIOD_ONE_ROSTER_SEEDED_KEY =
  "attendance-period-one-front-layout-v2-seeded";
const PERIOD_TWO_ROSTER_SEEDED_KEY =
  "attendance-period-two-front-layout-seeded";
const PERIOD_TWO_FADAVI_ADDED_KEY =
  "attendance-period-two-parmin-fadavi-added";
const PERIOD_THREE_ROSTER_SEEDED_KEY =
  "attendance-period-three-front-layout-seeded";
const PERIOD_FOUR_ROSTER_SEEDED_KEY =
  "attendance-period-four-front-layout-v2-seeded";
const PERIOD_FIVE_ROSTER_SEEDED_KEY =
  "attendance-period-five-front-layout-v1-seeded";
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
const PERIOD_ONE_PHOTO_DIRECTORY =
  "student files/1) COSC A-1 Computer Science A _ Roster _ Infinite Campus_files";
const PERIOD_ONE_STUDENTS = [
  { lastName: "Bendezu", firstName: "Benjamin", photoId: "7292" },
  { lastName: "Benoliel-Bloomfield", firstName: "Orson A", photoId: "7043" },
  { lastName: "Camacho", firstName: "Cesar", photoId: "5706" },
  { lastName: "Gonzalez", firstName: "Leo", photoId: "5738" },
  { lastName: "Gonzalez", firstName: "Sebastian", photoId: "5736" },
  { lastName: "Lui-Carter", firstName: "Kekoa (Koa)", photoId: "8332" },
  { lastName: "Mann", firstName: "Jaydon", photoId: "5766" },
  { lastName: "Silver", firstName: "Amanda", photoId: "10160" },
  { lastName: "Yiu", firstName: "Skylar", photoId: "5848" },
  { lastName: "Garcia", firstName: "Bernardo", photoId: "7614" },
]
  .sort(compareStudentsByLastName);
const PERIOD_TWO_PHOTO_DIRECTORY =
  "student files/2) HPHYS A-2 Honors Physics A _ Roster _ Infinite Campus_files";
const PERIOD_TWO_STUDENTS = [
  { lastName: "Aggen", firstName: "Alexander", photoId: "6430" },
  { lastName: "Austin", firstName: "Eloise", photoId: "6885" },
  { lastName: "Avidon", firstName: "Susanna", photoId: "6504" },
  { lastName: "Babb", firstName: "Nathaniel", photoId: "6515" },
  { lastName: "Buchotte", firstName: "Celeste", photoId: "7471" },
  { lastName: "Calderon", firstName: "Rachel", photoId: "7804" },
  { lastName: "Deutchman", firstName: "Caleb", photoId: "6547" },
  { lastName: "Donenfeld", firstName: "Juliet", photoId: "7362" },
  {
    lastName: "Fadavi",
    firstName: "Parmin",
    image:
      "student files/4) HPHYS A-4 Honors Physics A _ Roster _ Infinite Campus_files/8710.jpg",
  },
  { lastName: "Glynn", firstName: "Clover", photoId: "6595" },
  { lastName: "Golden", firstName: "Katelyn E", photoId: "8293" },
  { lastName: "Hasegawa", firstName: "Dominick", photoId: "7373" },
  { lastName: "Johnson", firstName: "Eloise", photoId: "6629" },
  { lastName: "Kulkarni", firstName: "Akash S", photoId: "6995" },
  { lastName: "Levy", firstName: "Taylor", photoId: "6650" },
  { lastName: "Loncar", firstName: "Chase", photoId: "7382" },
  { lastName: "Mateyko", firstName: "Claire (Oliver)", photoId: "7795" },
  { lastName: "Matthew", firstName: "Olivia L", photoId: "7045" },
  { lastName: "Nayak-Young", firstName: "Jaina", photoId: "8795" },
  { lastName: "Parhami", firstName: "Julian", photoId: "6717" },
  { lastName: "Park", firstName: "Kearney", photoId: "6713" },
  { lastName: "Press", firstName: "Claire", photoId: "6728" },
  { lastName: "Raith", firstName: "Charlotte F", photoId: "8301" },
  { lastName: "Stein", firstName: "Avery L", photoId: "7095" },
  { lastName: "Sung", firstName: "Jayden", photoId: "6622" },
  { lastName: "Tran", firstName: "Mika", photoId: "6772" },
  { lastName: "Vasquez", firstName: "Julian", photoId: "6779" },
  { lastName: "Webster", firstName: "Emjay", photoId: "8768" },
  { lastName: "Weiss", firstName: "Samson", photoId: "6788" },
  { lastName: "Williams", firstName: "Leo", photoId: "6789" },
  { lastName: "Wong", firstName: "Bodhi", photoId: "6794" },
  { lastName: "Yaghtin Mirshekar", firstName: "Arfun", photoId: "8780" },
  { lastName: "Yu", firstName: "Bella", photoId: "6800" },
  { lastName: "Davidovic", firstName: "Iva", photoId: "6888" },
  { lastName: "Fattal", firstName: "Aaron", photoId: "6569" },
  { lastName: "Shepard", firstName: "Emerson", photoId: "6749" },
]
  .sort(compareStudentsByLastName);
const PERIOD_THREE_PHOTO_DIRECTORY =
  "student files/3) PHYS A-3 Physics A _ Roster _ Infinite Campus_files";
const PERIOD_THREE_STUDENTS = [
  { lastName: "Beck", firstName: "Benjamin (Benji)", photoId: "6517" },
  { lastName: "Beck", firstName: "Maxwell (Maxi)", photoId: "6516" },
  { lastName: "Beltran", firstName: "Carolina (Nick)", photoId: "8690" },
  { lastName: "Betterton Gage", firstName: "Sissy", photoId: "8693" },
  { lastName: "Cain", firstName: "Millie", photoId: "8697" },
  { lastName: "Cordova", firstName: "Lisseth", photoId: "8705" },
  { lastName: "Diem", firstName: "Albert", photoId: "8707" },
  { lastName: "Eshel", firstName: "Guy", photoId: "6562" },
  { lastName: "Goldsmith", firstName: "Maxwell", photoId: "8640" },
  { lastName: "Gooch", firstName: "Siena", photoId: "6598" },
  { lastName: "Hovsepyan", firstName: "Ava", photoId: "6615" },
  { lastName: "Johnson", firstName: "Harlym", photoId: "7376" },
  { lastName: "LeMond", firstName: "Kahlo H", photoId: "12711" },
  { lastName: "Murphy", firstName: "Cassidy", photoId: "6696" },
  { lastName: "Murphy", firstName: "Declan", photoId: "6938" },
  { lastName: "Pelman", firstName: "Gabriel", photoId: "8744" },
  { lastName: "Schulte-Wayser", firstName: "Joseph R", photoId: "8304" },
  { lastName: "Sernas Herrera", firstName: "Caleb", photoId: "8756" },
  { lastName: "Velazquez", firstName: "Ian", photoId: "9411" },
]
  .sort(compareStudentsByLastName);
const PERIOD_FOUR_PHOTO_DIRECTORY =
  "student files/4) HPHYS A-4 Honors Physics A _ Roster _ Infinite Campus_files";
const PERIOD_FOUR_STUDENTS = [
  { lastName: "Behrstock", firstName: "Julia", photoId: "6523" },
  { lastName: "Cheng Caplan", firstName: "Henry", photoId: "6532" },
  { lastName: "Cohen", firstName: "Saul", photoId: "6538" },
  { lastName: "Fadavi", firstName: "Parmin", photoId: "8710" },
  { lastName: "Faynberg", firstName: "Michelle", photoId: "6570" },
  { lastName: "Fong", firstName: "Aaden", photoId: "6576" },
  { lastName: "Fraser", firstName: "Lucy", photoId: "6577" },
  { lastName: "Harawitz", firstName: "Nate", photoId: "6605" },
  { lastName: "Jarjoura", firstName: "Luca", photoId: "10148" },
  { lastName: "Jones", firstName: "George", photoId: "6632" },
  { lastName: "Liszt", firstName: "Drew", photoId: "5759" },
  { lastName: "Lucking", firstName: "Jenson", photoId: "6658" },
  { lastName: "Mahalingam", firstName: "Jaya", photoId: "6282" },
  { lastName: "Martinez", firstName: "Eric", photoId: "6672" },
  { lastName: "Oliva", firstName: "Angelo", photoId: "6712" },
  { lastName: "Robinette", firstName: "Simon", photoId: "6738" },
  { lastName: "Ross", firstName: "Nola", photoId: "6740" },
  { lastName: "Siripopungul", firstName: "Thanathad", photoId: "6753" },
  { lastName: "Thompson", firstName: "Dylan", photoId: "8763" },
  { lastName: "Walters", firstName: "Helena", photoId: "6783" },
]
  .sort(compareStudentsByLastName);
const PERIOD_FIVE_PHOTO_DIRECTORY =
  "student files/5) PHYS A-5 Physics A _ Roster _ Infinite Campus_files";
const PERIOD_FIVE_STUDENTS = [
  { lastName: "Arbing", firstName: "Zoe (GREY)", photoId: "6500" },
  { lastName: "Brotherton", firstName: "Alexandra (Allie)", photoId: "6524" },
  { lastName: "Burke", firstName: "Jacob B", photoId: "8289" },
  { lastName: "Davidoff", firstName: "Edo", photoId: "7354" },
  { lastName: "Derse", firstName: "Fionna Mae", photoId: "6546" },
  { lastName: "Kimmel", firstName: "Gaëlle", photoId: "5754" },
  { lastName: "Krieger", firstName: "Stella", photoId: "6646" },
  { lastName: "Lewin", firstName: "Kahea", photoId: "8729" },
  { lastName: "Luckyr", firstName: "Polina", photoId: "6661" },
  { lastName: "Muddassir", firstName: "Ayden", photoId: "5787" },
  { lastName: "Revis-Juson", firstName: "Rio", photoId: "6734" },
  { lastName: "Shad", firstName: "Arie", photoId: "6742" },
  { lastName: "Shadi", firstName: "Noah", photoId: "6743" },
  { lastName: "Shahar", firstName: "Ethan (Sorel Shahar)", photoId: "8758" },
  { lastName: "Tennent", firstName: "Cooper", photoId: "6762" },
  { lastName: "Thompson", firstName: "Ryland", photoId: "8764" },
  { lastName: "Ward", firstName: "Ella", photoId: "7419" },
  { lastName: "Yasharpour-Cantor", firstName: "Gabriel", photoId: "8782" },
  { lastName: "Yee", firstName: "Logan", photoId: "8785" },
]
  .sort(compareStudentsByLastName);

function compareStudentsByLastName(firstStudent, secondStudent) {
  return (
    firstStudent.lastName.localeCompare(secondStudent.lastName, undefined, {
      sensitivity: "base",
    }) ||
    firstStudent.firstName.localeCompare(secondStudent.firstName, undefined, {
      sensitivity: "base",
    })
  );
}

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
    offTask: 0,
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
    Number.isFinite(value.eating) &&
    (value.offTask === undefined || Number.isFinite(value.offTask))
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
        offTask: Number.isFinite(student.offTask) ? student.offTask : 0,
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
        `  Off task: ${student.offTask}`,
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

function seedPeriodOneRoster() {
  try {
    if (localStorage.getItem(PERIOD_ONE_ROSTER_SEEDED_KEY) === "true") {
      return;
    }

    const periodThreeLockedPositions = getLockedSeatPositions(periods[2]);
    arrangeRoster(
      periods[0],
      PERIOD_ONE_STUDENTS,
      PERIOD_ONE_PHOTO_DIRECTORY,
      periodThreeLockedPositions,
      false,
    );

    savePeriods();
    localStorage.setItem(PERIOD_ONE_ROSTER_SEEDED_KEY, "true");
  } catch (error) {
    console.warn("The period 1 roster could not be initialized.", error);
  }
}

seedPeriodOneRoster();

function getFrontToBackSeatPositions() {
  const positions = [];

  for (let row = ROWS - 1; row >= 0; row -= 1) {
    for (let column = 0; column < COLUMNS; column += 1) {
      positions.push(row * COLUMNS + column);
    }
  }

  return positions;
}

function getLockedSeatPositions(period) {
  return new Set(
    period
      .flat()
      .map((student, studentIndex) => ({ student, studentIndex }))
      .filter(({ student }) => student.isLocked)
      .map(({ studentIndex }) => studentIndex),
  );
}

function arrangeRoster(
  period,
  students,
  photoDirectory,
  lockedPositions,
  allowLockedOverflow,
) {
  const existingStudentsByName = new Map(
    period
      .flat()
      .filter((student) => !student.isEmpty && !student.isLocked)
      .map((student) => [student.name, student]),
  );
  const frontToBackPositions = getFrontToBackSeatPositions();
  const preferredPositions = frontToBackPositions.filter(
    (studentIndex) => !lockedPositions.has(studentIndex),
  );
  const overflowCount = Math.max(0, students.length - preferredPositions.length);
  const lockedPositionsFrontToBack = frontToBackPositions.filter(
    (studentIndex) => lockedPositions.has(studentIndex),
  );
  const overflowPositions = allowLockedOverflow && overflowCount > 0
    ? lockedPositionsFrontToBack.slice(-overflowCount)
    : [];
  const usablePositions = new Set([
    ...preferredPositions,
    ...overflowPositions,
  ]);
  const studentPositions = frontToBackPositions.filter((studentIndex) =>
    usablePositions.has(studentIndex),
  );

  if (students.length > studentPositions.length) {
    throw new Error("There are not enough seats for this roster.");
  }

  frontToBackPositions.forEach((studentIndex) => {
    const row = Math.floor(studentIndex / COLUMNS);
    const column = studentIndex % COLUMNS;
    const emptySeat = createStudent("");

    if (lockedPositions.has(studentIndex)) {
      emptySeat.isLocked = true;
    } else {
      emptySeat.isEmpty = true;
    }

    period[row][column] = emptySeat;
  });

  students.forEach((studentData, rosterIndex) => {
    const studentIndex = studentPositions[rosterIndex];
    const row = Math.floor(studentIndex / COLUMNS);
    const column = studentIndex % COLUMNS;
    const studentName = `${studentData.firstName} ${studentData.lastName}`;
    const studentImage =
      studentData.image ?? `${photoDirectory}/${studentData.photoId}.jpg`;
    const existingStudent = existingStudentsByName.get(studentName);

    period[row][column] = existingStudent
      ? {
          ...existingStudent,
          name: studentName,
          image: studentImage,
          isEmpty: false,
          isLocked: false,
        }
      : createStudent(studentName, studentImage);
  });
}

function seedPeriodTwoRoster() {
  try {
    if (localStorage.getItem(PERIOD_TWO_ROSTER_SEEDED_KEY) === "true") {
      return;
    }

    const periodThreeLockedPositions = getLockedSeatPositions(periods[2]);
    arrangeRoster(
      periods[1],
      PERIOD_TWO_STUDENTS,
      PERIOD_TWO_PHOTO_DIRECTORY,
      periodThreeLockedPositions,
      true,
    );

    savePeriods();
    localStorage.setItem(PERIOD_TWO_ROSTER_SEEDED_KEY, "true");
  } catch (error) {
    console.warn("The period 2 roster could not be initialized.", error);
  }
}

seedPeriodTwoRoster();

function addParminFadaviToPeriodTwoOnce() {
  try {
    if (localStorage.getItem(PERIOD_TWO_FADAVI_ADDED_KEY) === "true") {
      return;
    }

    const periodTwo = periods[1];
    const studentName = "Parmin Fadavi";
    const studentImage =
      "student files/4) HPHYS A-4 Honors Physics A _ Roster _ Infinite Campus_files/8710.jpg";
    const existingStudent = periodTwo
      .flat()
      .find((student) => student.name === studentName);

    if (existingStudent) {
      existingStudent.image = studentImage;
      existingStudent.isEmpty = false;
      existingStudent.isLocked = false;
    } else {
      const frontToBackPositions = getFrontToBackSeatPositions();
      const emptyPosition = frontToBackPositions.find((studentIndex) => {
        const row = Math.floor(studentIndex / COLUMNS);
        const column = studentIndex % COLUMNS;
        const student = periodTwo[row][column];
        return student.isEmpty && !student.isLocked;
      });
      const availablePosition =
        emptyPosition ??
        [...frontToBackPositions].reverse().find((studentIndex) => {
          const row = Math.floor(studentIndex / COLUMNS);
          const column = studentIndex % COLUMNS;
          return periodTwo[row][column].isLocked;
        });

      if (availablePosition === undefined) {
        throw new Error("There is no empty seat in period 2.");
      }

      const row = Math.floor(availablePosition / COLUMNS);
      const column = availablePosition % COLUMNS;
      periodTwo[row][column] = createStudent(studentName, studentImage);
    }

    savePeriods();
    localStorage.setItem(PERIOD_TWO_FADAVI_ADDED_KEY, "true");
  } catch (error) {
    console.warn("Parmin Fadavi could not be added to period 2.", error);
  }
}

addParminFadaviToPeriodTwoOnce();

function seedPeriodThreeRoster() {
  try {
    if (localStorage.getItem(PERIOD_THREE_ROSTER_SEEDED_KEY) === "true") {
      return;
    }

    const periodThreeLockedPositions = getLockedSeatPositions(periods[2]);
    arrangeRoster(
      periods[2],
      PERIOD_THREE_STUDENTS,
      PERIOD_THREE_PHOTO_DIRECTORY,
      periodThreeLockedPositions,
      false,
    );

    savePeriods();
    localStorage.setItem(PERIOD_THREE_ROSTER_SEEDED_KEY, "true");
  } catch (error) {
    console.warn("The period 3 roster could not be initialized.", error);
  }
}

seedPeriodThreeRoster();

function seedPeriodFourRoster() {
  try {
    if (localStorage.getItem(PERIOD_FOUR_ROSTER_SEEDED_KEY) === "true") {
      return;
    }

    const periodThreeLockedPositions = getLockedSeatPositions(periods[2]);
    arrangeRoster(
      periods[3],
      PERIOD_FOUR_STUDENTS,
      PERIOD_FOUR_PHOTO_DIRECTORY,
      periodThreeLockedPositions,
      false,
    );

    savePeriods();
    localStorage.setItem(PERIOD_FOUR_ROSTER_SEEDED_KEY, "true");
  } catch (error) {
    console.warn("The period 4 roster could not be initialized.", error);
  }
}

seedPeriodFourRoster();

function seedPeriodFiveRoster() {
  try {
    if (localStorage.getItem(PERIOD_FIVE_ROSTER_SEEDED_KEY) === "true") {
      return;
    }

    const periodThreeLockedPositions = getLockedSeatPositions(periods[2]);
    arrangeRoster(
      periods[4],
      PERIOD_FIVE_STUDENTS,
      PERIOD_FIVE_PHOTO_DIRECTORY,
      periodThreeLockedPositions,
      false,
    );

    savePeriods();
    localStorage.setItem(PERIOD_FIVE_ROSTER_SEEDED_KEY, "true");
  } catch (error) {
    console.warn("The period 5 roster could not be initialized.", error);
  }
}

seedPeriodFiveRoster();

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
  const activeStudentCount = periods[currentPeriodIndex]
    .flat()
    .filter((student) => !student.isEmpty && !student.isLocked).length;
  periodLabel.textContent = `P${currentPeriodIndex + 1} (${activeStudentCount})`;
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
    const spacerCount = GRID_SPACER_AFTER_COLUMNS.filter(
      (column) => columnIndex >= column,
    ).length;
    const gridColumn = columnIndex + 1 + spacerCount;
    student.style.gridColumn = `${gridColumn}${mergedBlock ? ` / span ${mergedBlock.columnSpan}` : ""
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
          ["Off Task", "offTask"],
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
