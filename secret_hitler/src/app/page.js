"use client"; // Ensure the component is marked as a Client Component

import { useState } from "react";
import Link from "next/link"; // Import Link for internal navigation
import styles from "./page.module.css";

export default function Home() {
  const [username, setUsername] = useState(""); // State to store the username
  const [submitted, setSubmitted] = useState(false); // State to track if username is submitted

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    if (username.trim() !== "") {
      setSubmitted(true); // Mark username as submitted if not empty
    }
  };

  return (
    <div className={styles.page}>
      {!submitted ? (
        <div className={styles.usernamePrompt}>
          <h2>Enter Your Username</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
            />
            <button type="submit" className={styles.button}>
              Submit
            </button>
          </form>
        </div>
      ) : (
        <>
          <header className={styles.header}>
            <h1>Welcome, {username}! Secret Hitler</h1>
            <nav>
              <ul className={styles.nav}>
                {/* Use Link for internal navigation to the /play page */}
                <li>
                  <Link href="/play">Play</Link>
                </li>
                {/* External link to the Secret Hitler rules PDF */}
                <li>
                  <a
                    href="https://www.secrethitler.com/assets/Secret_Hitler_Rules.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Rules
                  </a>
                </li>
              </ul>
            </nav>
          </header>

          <footer className={styles.footer}>
            <p>&copy; 2024 Secret Hitler</p>
          </footer>
        </>
      )}
    </div>
  );
}
