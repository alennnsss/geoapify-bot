import { ref } from "vue";

const media = window.matchMedia("(prefers-color-scheme: dark)");

function savedTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return null;
}

export const theme = ref(savedTheme() ?? (media.matches ? "dark" : "light"));

function applyTheme(value) {
  document.documentElement.dataset.theme = value;
}

export function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
  applyTheme(theme.value);
  try {
    localStorage.setItem("theme", theme.value);
  } catch {}
}

media.addEventListener("change", (event) => {
  if (savedTheme()) return;
  theme.value = event.matches ? "dark" : "light";
  applyTheme(theme.value);
});

applyTheme(theme.value);
