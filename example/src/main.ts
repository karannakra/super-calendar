import { parseDate } from "super-calendar";

(function () {
  const fallbackValues = ["12pm", "tomorrow", "next week"];
  const locale = navigator.language || "en-US";

  const localeConfig = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  } as const;

  const input = document.querySelector("input");
  const list = document.querySelector("ul")!;

  const dateSuggestions = parseDate({ query: "", fallback: fallbackValues });

  insertSuggestion(dateSuggestions);

  input?.addEventListener("input", onInputChange);

  function insertSuggestion(dateSuggestions: any[]) {
    dateSuggestions.forEach(suggestion => {
      const { label, date } = suggestion;

      const dateString = new Date(date).toLocaleTimeString(
        locale,
        localeConfig
      );

      const li = document.createElement("li");

      li.classList.add("list-item");

      li.innerHTML = `<span>${label}</span><span>${dateString}</span>`;

      list.insertAdjacentElement("afterbegin", li);
    });
  }

  function onInputChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;

    const dateSuggestions = parseDate({
      query: value,
      fallback: fallbackValues,
    });

    list.innerHTML = "";

    insertSuggestion(dateSuggestions);
  }
})();
