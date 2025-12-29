"use strict";

const elementListSongs = document.querySelector(".songsList");

const loginBtn = document.querySelector("#loginBtn");
const registerBtn = document.querySelector("#registerBtn");

const loginPanel = document.querySelector("#loginPanel");
const registerPanel = document.querySelector("#registerPanel");

const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");

const statusElement = document.querySelector(".status");

function showPanel(panelToShow) {
  loginPanel.hidden = true;
  registerPanel.hidden = true;
  if (panelToShow) panelToShow.hidden = false;
  setStatus("");
}

function setStatus(message) {
  if (!statusElement) return;
  const text =
    typeof message === "string"
      ? message
      : message?.message
        ? String(message.message)
        : message != null
          ? String(message)
          : "";
  statusElement.textContent = text;
}

function renderSongs(songs) {
  elementListSongs.innerHTML = "";

  for (const song of songs) {
    const li = document.createElement("li");
    const year = song.release_year ?? "—";
    li.textContent = `${song.title} (${year})`;
    li.classList.add("songsList_song");
    elementListSongs.appendChild(li);
  }
}

async function loadSongs() {
  try {
    const response = await fetch("/api/songs");

    if (!response.ok) {
      setStatus("Error al obtener canciones");
    }

    const songs = await response.json();
    renderSongs(songs);
  } catch (error) {
    console.log(error);
    setStatus("Error al obtener canciones");
  }
}

loginBtn.addEventListener("click", () => showPanel(loginPanel));
registerBtn.addEventListener("click", () => showPanel(registerPanel));

loginForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();

  const formData = new FormData(loginForm);
  const payload = {
    email: formData.get("email"),
    pass: formData.get("pass"),
  };

  try {
    const res = await fetch("/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message = data?.error || `Login incorrecto (${res.status})`;
      setStatus(message);
      return;
    }

    if (data?.token) {
      localStorage.setItem("token", data.token);
    }

    showPanel(null);
    setStatus("");
  } catch (error) {
    setStatus(error);
  }
});

registerForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();

  const formData = new FormData(registerForm);
  const payload = {
    name: formData.get("name") || null,
    lastname: formData.get("lastname") || null,
    email: formData.get("email"),
    pass: formData.get("pass"),
  };

  try {
    const res = await fetch("/api/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message = data?.error || `Error en registro (${res.status})`;
      setStatus(message);
      return;
    }

    if (data?.success) {
      registerForm.reset();
      showPanel(null);
      setStatus("");
      return;
    }
  } catch (error) {
    setStatus(error);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  showPanel(null);
  loadSongs();
});
