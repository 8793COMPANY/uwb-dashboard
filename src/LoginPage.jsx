import { useState } from "react";
import companyLogo from "./assets/web_company.svg";
import systemLogo from "./assets/web_logo.svg";

function LoginPage({ onLogin }) {
  const [memberId, setMemberId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: 여기에 실제 로그인 API 호출 넣으면 됨
    // 예시: axios.post("/login", { memberId, password }).then(...)
    onLogin(); // 지금은 그냥 바로 로그인 처리
  };

  return (
    <div className="app-root">
      {/* 상단 검정 바 (로고만) */}
      <header className="top-bar">
        <div className="logo-box">
          <img src={companyLogo} alt="company" />
        </div>
      </header>

      {/* 가운데 로그인 카드 */}
      <main className="login-page">
        <div className="login-card">
          <div className="login-logo-wrap">
            <img src={systemLogo} alt="logo" className="system-logo" />
          </div>
          <h1 className="login-title">UWB 센서 관제 시스템 로그인</h1>
          <p className="login-subtitle">회원번호(시리얼)로 로그인하세요.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label">회원번호(시리얼)</label>
              <input
                type="text"
                placeholder="예: ABC-1001"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
              />
            </div>

            <div className="login-field">
              <label className="login-label">비밀번호</label>
              <input
                type="password"
                placeholder="비밀번호를 입력해 주세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="login-submit-btn">
              로그인 하기
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;