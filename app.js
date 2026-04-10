function getTimeRemaining(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due - now;
  const abs = Math.abs(diff);

  const mins = Math.floor(abs / 60000);
  const hrs = Math.floor(abs / 3600000);
  const days = Math.floor(abs / 86400000);
  const weeks = Math.floor(days / 7);

  if (mins < 1) {
    return { text: "Due now!", cls: "tr-overdue" };
  }

  if (diff < 0) {
    if (mins < 60) return { text: `Overdue by ${mins}m`, cls: "tr-overdue" };
    if (hrs < 24) return { text: `Overdue by ${hrs}h`, cls: "tr-overdue" };
    if (days < 7) {
      return {
        text: `Overdue by ${days} day${days === 1 ? "" : "s"}`,
        cls: "tr-overdue",
      };
    }
    const overdueDays = days % 7;
    let text = weeks === 1 ? "Overdue by 1 week" : `Overdue by ${weeks} wks`;
    if (overdueDays > 0) {
      text += `, ${overdueDays} day${overdueDays === 1 ? "" : "s"}`;
    }
    return { text, cls: "tr-overdue" };
  }

  if (days === 0 && mins < 60)
    return { text: `In ${mins} min`, cls: "tr-soon" };
  if (days === 0) return { text: `Today, ${hrs}h left`, cls: "tr-soon" };
  if (days === 1) return { text: "Due tomorrow", cls: "tr-soon" };
  
  if (days < 7) {
    return { text: `${days} days left`, cls: "" };
  }
  
  const remainingDays = days % 7;
  
  if (weeks === 1) {
    if (remainingDays === 0) return { text: "1 week left", cls: "" };
    return { text: `1 week, ${remainingDays} day${remainingDays === 1 ? "" : "s"} left`, cls: "" };
  }
  
  let text = `${weeks} weeks`;
  if (remainingDays > 0) {
    text += `, ${remainingDays} day${remainingDays === 1 ? "" : "s"}`;
  }
  text += " left";
  return { text, cls: "" };
}

function refreshCard(timeEl) {
  const dueAttr = timeEl.getAttribute("data-due");
  if (!dueAttr) return;

  const card = timeEl.closest('[data-testid="test-todo-card"]');
  if (card && card.classList.contains("done")) return;

  const { text, cls } = getTimeRemaining(dueAttr);
  timeEl.textContent = text;
  timeEl.className = "date-item__remaining " + cls;
}

function initCard(card) {
  const toggle = card.querySelector(
    '[data-testid="test-todo-complete-toggle"]',
  );
  const status = card.querySelector('[data-testid="test-todo-status"]');
  const timeEl = card.querySelector(".time-remaining");

  if (!toggle) return;

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      card.classList.add("done");
      if (status) {
        status.textContent = "Done";
        status.className = "badge badge--done";
        status.setAttribute("aria-label", "Status: Done");
      }
      if (timeEl) {
        timeEl.textContent = "Completed";
        timeEl.className = "date-item__remaining tr-done";
      }
    } else {
      card.classList.remove("done");
      const originalStatus =
        card.getAttribute("data-original-status") || "In Progress";
      const originalClass =
        card.getAttribute("data-original-status-class") ||
        "badge badge--in-progress";
      if (status) {
        status.textContent = originalStatus;
        status.className = originalClass;
        status.setAttribute("aria-label", `Status: ${originalStatus}`);
      }
      if (timeEl) refreshCard(timeEl);
    }
  });
}

function initAllCards() {
  const cards = document.querySelectorAll('[data-testid="test-todo-card"]');

  cards.forEach((card) => {
    const status = card.querySelector('[data-testid="test-todo-status"]');
    if (status) {
      card.setAttribute("data-original-status", status.textContent.trim());
      card.setAttribute("data-original-status-class", status.className);
    }
    initCard(card);
  });

  const timeEls = document.querySelectorAll(".time-remaining");
  timeEls.forEach((el) => refreshCard(el));

  setInterval(() => {
    document
      .querySelectorAll(".time-remaining")
      .forEach((el) => refreshCard(el));
  }, 60000);
}

document.addEventListener("DOMContentLoaded", initAllCards);
