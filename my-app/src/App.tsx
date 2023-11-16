import React, { useState, useEffect } from "react";
import ApiConnection from "./apiConnection";
import GoogleMapsApi from "./googlemapsApi";
import "./App.css";

// Define the User type
interface User {
  username: string;
  password: string;
}
interface LoginProps {
  onLogin: (user: User) => void;
}

function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // You can add authentication logic here
    // Check if the user is one of the test users
    const testUsers: User[] = [
      {
        username: "Odai",
        password: "odai123",
      },
      {
        username: "Mehdi",
        password: "mehdi123",
      },
      {
        username: "Marcel",
        password: "marcel123",
      },
      {
        username: "Theo",
        password: "theo123",
      },
      {
        username: "Francesco",
        password: "francesco123",
      },
      {
        username: "Benhur",
        password: "benhur123",
      },
      {
        username: "Baseer",
        password: "baseer123",
      },
      {
        username: "Naweed",
        password: "naweed123",
      },
    ];

    const foundUser = testUsers.find(
      (user) => user.username === username && user.password === password
    );

    if (foundUser) {
      const user = { username, password };
      onLogin(user);
    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="login-container">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

function App() {
  const [searchInput, setSearchInput] = useState<string>("");
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Load user data from localStorage when the component mounts
  useEffect(() => {
    const userJSON = localStorage.getItem("user");

    if (userJSON) {
      const parsedUser: User = JSON.parse(userJSON);
      setUser(parsedUser);
    }
  }, []);

  const handleLogout = () => {
    // Clear the user data from state and localStorage
    setUser(null);
    localStorage.removeItem("user");
  };

  const handleLogin = (newUser: User) => {
    // Save user data to state and localStorage
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  return (
    <div className="App">
      <header className="header">
        <h1>RoadSafe Sweden</h1>
        {user ? (
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </header>
      <main className="content">
        {/* Update the setSearchInput prop to be of the correct type */}
        <div className="data-container">
          <ApiConnection
            setSearchInput={(input) => setSearchInput(input)}
            searchInput={searchInput}
            mapInstance={mapInstance}
          />
        </div>
        <div className="map-container">
          <GoogleMapsApi
            setSearchInput={(input) => setSearchInput(input)}
            searchInput={searchInput}
            setMapInstance={setMapInstance}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
