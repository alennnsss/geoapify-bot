import { ref } from "vue";

// Тема сайта. Без сохранённого выбора берётся системная. Атрибут
// data-theme ставит ещё inline-скрипт в index.html, чтобы не было вспышки.
const media = window.matchMedia("(prefers-color-scheme: dark)");

function savedTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // localStorage недоступен
  }
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
  } catch {
    // localStorage недоступен
  }
}

// Пока пользователь сам не выбрал тему, следуем за системной.
media.addEventListener("change", (event) => {
  if (savedTheme()) return;
  theme.value = event.matches ? "dark" : "light";
  applyTheme(theme.value);
});

applyTheme(theme.value);
