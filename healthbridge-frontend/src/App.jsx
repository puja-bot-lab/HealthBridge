import React, { useEffect, useMemo, useState } from "react";
import { MapPin, Search, Clock3, Phone, Ambulance, CalendarCheck, HeartPulse, Navigation, X } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function App() {
  const [hospitals, setHospitals] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API}/hospitals`)
      .then(r => r.json())
      .then(data => setHospitals(data))
      .catch(() => setMessage("Backend is not running. Start the backend on port 5000."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => hospitals.filter(h => {
    const q = query.toLowerCase();
    const matchesText = !q || h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) || h.specialties.some(s => s.toLowerCase().includes(q));
    const matchesFilter =
      filter === "all" ||
      (filter === "open" && h.openNow) ||
      (filter === "emergency" && h.emergency) ||
      (filter === "24x7" && h.open24x7);
    return matchesText && matchesFilter;
  }), [hospitals, query, filter]);

  async function bookToken(hospital) {
    const name = window.prompt("Enter patient name:");
    if (!name) return;
    const phone = window.prompt("Enter phone number:");
    if (!phone) return;

    try {
      const res = await fetch(`${API}/tokens`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ hospitalId: hospital.id, patientName: name, phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");
      setMessage(`Token booked successfully. Your token number is ${data.tokenNumber}.`);
    } catch (e) {
      setMessage(e.message);
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo"><HeartPulse size={24}/></div>
          <div><strong>HealthBridge</strong><span>Finder</span></div>
        </div>
        <nav>
          <a href="#hospitals">Hospitals</a>
          <a href="#how">How it works</a>
          <button className="emergency" onClick={() => alert("Emergency: call your local emergency service or hospital.")}>
            <Ambulance size={17}/> Emergency
          </button>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <div className="badge"><MapPin size={15}/> Healthcare access made easier</div>
          <h1>Find the right <span>care,</span><br/>right when you need it.</h1>
          <p>Discover nearby hospitals, check availability, and book a token before you travel.</p>
          <div className="searchbox">
            <Search size={20}/>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search hospital, city or specialty..." />
            <button onClick={() => setFilter("all")}>Search</button>
          </div>
          <div className="quick">
            <button onClick={() => setFilter("open")}>Open now</button>
            <button onClick={() => setFilter("emergency")}>Emergency care</button>
            <button onClick={() => setFilter("24x7")}>24/7 hospitals</button>
          </div>
        </div>
      </section>

      <main id="hospitals" className="content">
        <div className="section-head">
          <div><h2>Nearby healthcare</h2><p>{filtered.length} hospitals available</p></div>
          <button className="location" onClick={() => alert("Location access can be connected to browser GPS later.")}>
            <Navigation size={17}/> Use my location
          </button>
        </div>

        {message && <div className="notice">{message}<button onClick={() => setMessage("")}>×</button></div>}
        {loading ? <div className="empty">Loading hospitals...</div> :
          filtered.length === 0 ? <div className="empty">No hospitals match your search.</div> :
          <div className="cards">
            {filtered.map(h => (
              <article className="card" key={h.id}>
                <div className="card-top">
                  <div className="hospital-icon"><HeartPulse/></div>
                  <div className="status">{h.openNow ? "Open now" : "Closed"}</div>
                </div>
                <h3>{h.name}</h3>
                <p className="address"><MapPin size={15}/> {h.address}, {h.city}</p>
                <div className="tags">
                  {h.emergency && <span>Emergency</span>}
                  {h.open24x7 && <span>24/7</span>}
                  <span>{h.distance} km</span>
                </div>
                <div className="meta"><Clock3 size={15}/> {h.hours}</div>
                <div className="specialties">{h.specialties.slice(0,3).join(" • ")}</div>
                <div className="actions">
                  <button className="secondary" onClick={() => setSelected(h)}>View details</button>
                  <button className="primary" onClick={() => bookToken(h)}><CalendarCheck size={16}/> Book token</button>
                </div>
              </article>
            ))}
          </div>
        }
      </main>

      <section id="how" className="how">
        <h2>How HealthBridge works</h2>
        <div className="steps">
          <div><b>1</b><h3>Find care</h3><p>Search hospitals by location, specialty or emergency service.</p></div>
          <div><b>2</b><h3>Check availability</h3><p>See opening hours and available services before travelling.</p></div>
          <div><b>3</b><h3>Book your token</h3><p>Reserve a token through the app and reduce waiting time.</p></div>
        </div>
      </section>

      {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <button className="close" onClick={() => setSelected(null)}><X/></button>
          <div className="hospital-icon large"><HeartPulse/></div>
          <h2>{selected.name}</h2>
          <p><MapPin size={16}/> {selected.address}, {selected.city}</p>
          <p><Phone size={16}/> {selected.phone}</p>
          <p><Clock3 size={16}/> {selected.hours}</p>
          <h4>Specialties</h4>
          <p>{selected.specialties.join(", ")}</p>
          <button className="primary full" onClick={() => {setSelected(null); bookToken(selected)}}><CalendarCheck size={17}/> Book token</button>
        </div>
      </div>}

      <footer>© 2026 HealthBridge Finder · Healthcare information should be verified with the hospital.</footer>
    </div>
  );
}