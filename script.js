const ROWS = 4;
const COLUMNS = 10;
const PREVIOUS_COLUMN_COUNT = 9;
const INSERTED_COLUMN_INDEX = 2;
const PERIOD_COUNT = 6;
const STORAGE_KEY = "attendance-periods";
const CURRENT_PERIOD_STORAGE_KEY = "attendance-current-period";
const PERIOD_ONE_PHOTOS_SEEDED_KEY = "attendance-period-one-photos-seeded";
const SHOW_STUDENT_PICTURES_KEY = "attendance-show-student-pictures";

// Zero-based grid positions after inserting a new third column. These are the
// same unavailable seats from the original 4-by-9 arrangement.
const BLOCKED_POSITIONS = new Set([0, 1, 8, 9, 20, 21, 30, 31]);

// Each entry begins at its top-left grid position and spans the specified area.
const MERGED_BLOCKS = new Map([
  [0, { rowSpan: 1, columnSpan: 2 }],
  [8, { rowSpan: 1, columnSpan: 2 }],
  [20, { rowSpan: 2, columnSpan: 2 }],
]);
const MERGED_BLOCK_CHILDREN = new Set([1, 9, 21, 30, 31]);
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

function createStudent(name, image = null) {
  return {
    name,
    image,
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

const periods = loadPeriods();

function seedPeriodOnePhotos() {
  try {
    if (localStorage.getItem(PERIOD_ONE_PHOTOS_SEEDED_KEY) === "true") {
      return;
    }

    const availablePositions = Array.from(
      { length: ROWS * COLUMNS },
      (_, studentIndex) => studentIndex,
    ).filter((studentIndex) => !BLOCKED_POSITIONS.has(studentIndex));

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
const showStudentPicturesCheckbox = document.querySelector(
  "#show-student-pictures",
);

let currentPeriodIndex = loadCurrentPeriod();
let selectedStudentIndex = null;
let randomizedStudentIndex = null;
let showStudentPictures = loadShowStudentPictures();

function renderPeriod() {
  periodLabel.textContent = `Period ${currentPeriodIndex + 1}`;
  showStudentPicturesCheckbox.checked = showStudentPictures;
  studentGrid.classList.toggle("pictures-hidden", !showStudentPictures);
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
    student.style.gridRow = `${rowIndex + 1}${
      mergedBlock ? ` / span ${mergedBlock.rowSpan}` : ""
    }`;
    student.style.gridColumn = `${columnIndex + 1}${
      mergedBlock ? ` / span ${mergedBlock.columnSpan}` : ""
    }`;

    if (BLOCKED_POSITIONS.has(studentIndex)) {
      student.classList.add("blocked");
      student.setAttribute("aria-disabled", "true");
    } else {
      const studentName = document.createElement("div");
      studentName.className = "student-name";
      studentName.textContent = studentData.name;

      const studentOptions = document.createElement("details");
      studentOptions.className = "student-options";
      const optionsLabel = document.createElement("summary");
      optionsLabel.textContent = "Options";
      studentOptions.append(optionsLabel);

      student.append(studentName);

      if (showStudentPictures) {
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
  if (
    BLOCKED_POSITIONS.has(firstIndex) ||
    BLOCKED_POSITIONS.has(secondIndex)
  ) {
    return;
  }

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

  if (!student || student.classList.contains("blocked")) {
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

function getAvailableStudentPositions() {
  return Array.from(
    { length: ROWS * COLUMNS },
    (_, studentIndex) => studentIndex,
  ).filter((studentIndex) => !BLOCKED_POSITIONS.has(studentIndex));
}

function getStudentAtPosition(studentIndex) {
  const row = Math.floor(studentIndex / COLUMNS);
  const column = studentIndex % COLUMNS;
  return periods[currentPeriodIndex][row][column];
}

function chooseWeightedStudentPosition() {
  const availablePositions = getAvailableStudentPositions();
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

  const studentRow = Math.floor(randomizedStudentIndex / COLUMNS);
  const studentColumn = randomizedStudentIndex % COLUMNS;

  periods[currentPeriodIndex][studentRow][studentColumn].calledOn += 1;
  savePeriods();
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
showStudentPicturesCheckbox.addEventListener("change", () => {
  showStudentPictures = showStudentPicturesCheckbox.checked;
  selectedStudentIndex = null;
  saveShowStudentPictures();
  renderPeriod();
});

renderPeriod();
