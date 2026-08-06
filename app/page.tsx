const studentNames = [
  "Maya Chen",
  "Eli Brooks",
  "Sofia Patel",
  "Noah Williams",
  "Avery Johnson",
  "Mateo Garcia",
  "Chloe Nguyen",
  "Lucas Kim",
  "Zoe Martinez",
  "Owen Davis",
  "Nina Thompson",
  "Caleb Rivera",
  "Leah Wilson",
  "Miles Anderson",
  "Amara Singh",
  "Jack Foster",
  "Ivy Robinson",
  "Theo Baker",
  "Lena Park",
  "Henry Moore",
  "Jada Lewis",
  "Sam Carter",
  "Ruby Wright",
  "Leo Hernandez",
  "Mia Scott",
  "Finn Cooper",
  "Aria Turner",
  "Ben Collins",
  "Emma Reed",
  "Kai Morgan",
  "Layla Evans",
  "Cole Murphy",
  "Grace Bell",
  "Jasper Young",
  "Aisha Green",
  "Max Hall",
  "Cora Adams",
  "Nico King",
  "Sadie Hill",
  "Adam Lopez",
];

export default function Home() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">High School Physics</p>
          <h1>Seating Chart</h1>
        </div>
        <p className="room-label">Room 214</p>
      </header>

      <section className="classroom" aria-labelledby="chart-title">
        <h2 id="chart-title" className="visually-hidden">
          Four-column, ten-row classroom seating chart
        </h2>

        <div className="front-of-room">
          <span>Front of room</span>
        </div>

        <div className="chart-scroll">
          <div className="chart-inner">
            <div className="column-labels" aria-hidden="true">
              <span>Column A</span>
              <span>Column B</span>
              <span>Column C</span>
              <span>Column D</span>
            </div>

            <div className="seating-grid">
              {studentNames.map((name, index) => {
                const row = Math.floor(index / 4) + 1;
                const column = String.fromCharCode(65 + (index % 4));

                return (
                  <article className="student-seat" key={name}>
                    <span className="seat-number">{column}{row}</span>
                    <span className="student-name">{name}</span>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <div className="back-of-room">Back of room</div>
      </section>
    </main>
  );
}
