import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";
import LoginPage from "./LoginPage";

function App() {
  const [events, setEvents] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState("ALL");
  const [selectedPerson, setSelectedPerson] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState(() => {
    // 오늘 날짜 YYYY-MM-DD
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 🔹 로그인 상태

  const API_BASE_URL = "http://13.125.251.195:5000";

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/uwb/events?limit=200`);
      setEvents(res.data || []);
    } catch (e) {
      console.error("failed to fetch events", e);
    }
  };

  // 로그인했을 때만 조회/폴링
  useEffect(() => {
    if (!isLoggedIn) return;

    fetchEvents();
    const t = setInterval(fetchEvents, 2000); // 2초마다 새로고침
    return () => clearInterval(t);
  }, [isLoggedIn]);

  // 층 목록 / 인원 목록 (이벤트에서 유도)
  const floors = useMemo(() => {
    const s = new Set(events.map((e) => e.floor));
    return Array.from(s).filter(Boolean);
  }, [events]);

  const persons = useMemo(() => {
    const s = new Set(events.map((e) => e.person));
    return Array.from(s).filter(Boolean);
  }, [events]);

  // 선택된 조건으로 필터링
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const dateStr = new Date(e.timestampMs).toISOString().slice(0, 10);
      if (dateStr !== selectedDate) return false;
      if (selectedFloor !== "ALL" && e.floor !== selectedFloor) return false;
      if (selectedPerson !== "ALL" && e.person !== selectedPerson) return false;
      return true;
    });
  }, [events, selectedDate, selectedFloor, selectedPerson]);

  const formatTime = (ms) => {
    const d = new Date(ms);
    return d.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const levelLabel = (level) => {
    const lv = (level || "").toString().trim().toLowerCase();

    if (lv === "danger") return "위험";
    if (lv === "warning") return "주의";
    return "안전";
  };

  // 🔹 아직 로그인 안했으면 로그인 화면만 보여주기
  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  // 🔹 로그인 후 메인 화면
  return (
    <div className="app-root">
      {/* 상단 검정 바 */}
      <header className="top-bar">
        <div className="logo-box">
          <img src="/web_company.svg" alt="company" />
        </div>

        <button
          className="login-button"
          style={{ fontWeight: 700 }}
          onClick={() => setIsLoggedIn(false)} // 🔹 로그아웃
        >
          로그아웃
        </button>
      </header>

      {/* 본문 */}
      <main className="page-container">
        <div className="system-title-row">
          <img src="/web_logo.svg" alt="logo" className="system-logo" />
          <span className="system-title-text" style={{ fontWeight: 700 }}>UWB 센서 관제 시스템</span>
        </div>

        {/* 상단: 층 선택 */}
        <div className="page-toolbar">
          <div className="floor-select">
            {/* <span className="label">1 Floor</span> */}
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
            >
              <option value="ALL">전체</option>
              {floors.map((f) => {
                const displayName = f.replace("F", "") + " Floor";
                return (
                  <option key={f} value={f}>
                    {displayName}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* 좌우 레이아웃 */}
        <div className="main-layout">
          {/* 인원 목록 패널 */}
          <section className="panel panel-left">
            <div className="panel-header">인원 목록</div>
            <div className="person-list">
              <div
                className={
                  "person-item" + (selectedPerson === "ALL" ? " active" : "")
                }
                onClick={() => setSelectedPerson("ALL")}
              >
                전체 보기
              </div>

              {persons.map((p) => {
                // "김철수 (ABC-1234567)" 형태
                const match = p.match(/^(.+?)\s*\((.+)\)$/);
                const name = match ? match[1] : p;
                const serial = match ? match[2] : "";

                return (
                  <div
                    key={p}
                    className={
                      "person-item" + (selectedPerson === p ? " active" : "")
                    }
                    onClick={() => setSelectedPerson(p)}
                  >
                    <span className="person-name">{name}</span>
                    {serial && <span className="person-serial"> ({serial})</span>}
                  </div>
                );
              })}

              {persons.length === 0 && (
                <div className="person-empty">데이터가 없습니다.</div>
              )}
            </div>
          </section>

          {/* 기록 목록 패널 */}
          <section className="panel panel-right">
            <div className="panel-header row-between">
              <span>날짜별 기록 목록</span>

              <div className="date-picker">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            <div className="table-wrapper">
              <table className="events-table">
                <thead>
                  <tr>
                    <th className="col-time">시간</th>
                    <th className="col-name">이름(시리얼)</th>
                    <th className="col-anchor">앵커 ID</th>
                    <th className="col-distance">거리(m)</th>
                    <th className="col-level">레벨</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="empty-row">
                        선택된 조건에 해당하는 기록이 없습니다.
                      </td>
                    </tr>
                  )}

                  {filteredEvents.map((e, idx) => {
                    const rowClass =
                      e.level === "danger"
                        ? "row-danger"
                        : e.level === "warning"
                          ? "row-warning"
                          : "row-safe";

                    const lv = (e.level || "").toString().trim().toLowerCase();

                    return (
                      <tr key={idx} className={rowClass}>
                        <td>{formatTime(e.timestampMs)}</td>
                        <td>{e.person}</td>
                        <td>{e.anchorId}</td>
                        <td>{e.distance.toFixed(2)}m</td>
                        <td>
                          <span className={"status-badge status-" + (lv || "safe")}>
                            {levelLabel(lv)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
