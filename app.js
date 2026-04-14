"use strict";

function getTimeRemaining(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due - now;
  const abs = Math.abs(diff);

  const mins = Math.floor(abs / 60_000);
  const hrs = Math.floor(abs / 3_600_000);
  const days = Math.floor(abs / 86_400_000);
  const weeks = Math.floor(days / 7);

  if (Math.abs(diff) < 60_000) {
    return { text: "Due now!", cls: "tr-overdue", isOverdue: true };
  }

  if (diff < 0) {
    if (mins < 60)
      return {
        text: `Overdue by ${mins}m`,
        cls: "tr-overdue",
        isOverdue: true,
      };
    if (hrs < 24)
      return {
        text: `Overdue by ${hrs} hour${hrs === 1 ? "" : "s"}`,
        cls: "tr-overdue",
        isOverdue: true,
      };
    if (days < 7)
      return {
        text: `Overdue by ${days} day${days === 1 ? "" : "s"}`,
        cls: "tr-overdue",
        isOverdue: true,
      };

    const od = days % 7;
    let text = weeks === 1 ? "Overdue by 1 week" : `Overdue by ${weeks} wks`;
    if (od > 0) text += `, ${od} day${od === 1 ? "" : "s"}`;
    return { text, cls: "tr-overdue", isOverdue: true };
  }

  if (days === 0 && mins < 60)
    return { text: `Due in ${mins} min`, cls: "tr-soon", isOverdue: false };
  if (days === 0)
    return {
      text: `Due in ${hrs} hour${hrs === 1 ? "" : "s"}`,
      cls: "tr-soon",
      isOverdue: false,
    };
  if (days === 1)
    return { text: "Due tomorrow", cls: "tr-soon", isOverdue: false };
  if (days < 7)
    return { text: `Due in ${days} days`, cls: "", isOverdue: false };

  const rd = days % 7;
  if (weeks === 1) {
    if (rd === 0) return { text: "1 week left", cls: "", isOverdue: false };
    return {
      text: `1 week, ${rd} day${rd === 1 ? "" : "s"} left`,
      cls: "",
      isOverdue: false,
    };
  }

  let text = `${weeks} weeks`;
  if (rd > 0) text += `, ${rd} day${rd === 1 ? "" : "s"}`;
  text += " left";
  return { text, cls: "", isOverdue: false };
}

function toDatetimeLocal(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

function formatDueDate(date) {
  return (
    "Due " +
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  );
}

function refreshTimeEl(timeEl, card) {
  if (card.classList.contains("done")) return;

  const dueAttr = timeEl.getAttribute("data-due");
  if (!dueAttr) return;

  const { text, cls, isOverdue } = getTimeRemaining(dueAttr);

  timeEl.textContent = text;
  timeEl.className =
    "date-item__remaining time-remaining" + (cls ? " " + cls : "");

  const overdueEl = card.querySelector(
    '[data-testid="test-todo-overdue-indicator"]',
  );
  if (overdueEl) {
    overdueEl.hidden = !isOverdue;
  }
  card.classList.toggle("is-overdue", isOverdue);
}

function refreshAllTimeEls() {
  document
    .querySelectorAll('[data-testid="test-todo-card"]')
    .forEach((card) => {
      const timeEl = card.querySelector(".time-remaining");
      if (timeEl) refreshTimeEl(timeEl, card);
    });
}

const STATUS_CONFIG = {
  Pending: { badgeClass: "badge badge--pending", label: "Status: Pending" },
  "In Progress": {
    badgeClass: "badge badge--in-progress",
    label: "Status: In Progress",
  },
  Done: { badgeClass: "badge badge--done", label: "Status: Done" },
};

function applyStatus(card, newStatus, source) {
  const badge = card.querySelector('[data-testid="test-todo-status"]');
  const dropdown = card.querySelector(
    '[data-testid="test-todo-status-control"]',
  );
  const toggle = card.querySelector(
    '[data-testid="test-todo-complete-toggle"]',
  );
  const timeEl = card.querySelector(".time-remaining");
  const isDone = newStatus === "Done";
  const cfg = STATUS_CONFIG[newStatus] || STATUS_CONFIG["Pending"];

  // Badge
  if (badge) {
    badge.textContent = newStatus;
    badge.className = cfg.badgeClass;
    badge.setAttribute("aria-label", cfg.label);
  }

  if (dropdown && source !== "dropdown") {
    dropdown.value = newStatus;
    syncSelectAppearance(dropdown);
  }

  if (toggle && source !== "checkbox") {
    toggle.checked = isDone;
  }

  card.classList.toggle("done", isDone);

  if (isDone) {
    if (timeEl) {
      timeEl.textContent = "Completed";
      timeEl.className = "date-item__remaining tr-done";
    }
    card.classList.remove("is-overdue");
    const overdueEl = card.querySelector(
      '[data-testid="test-todo-overdue-indicator"]',
    );
    if (overdueEl) overdueEl.hidden = true;
  } else {
    if (timeEl) refreshTimeEl(timeEl, card);
  }

  card.dataset.status = newStatus;
}

const PRIORITY_CONFIG = {
  Low: {
    barClass: "todo-card__top-bar--low",
    badgeClass: "badge badge--low",
    label: "Priority: Low",
  },
  Medium: {
    barClass: "todo-card__top-bar--medium",
    badgeClass: "badge badge--medium",
    label: "Priority: Medium",
  },
  High: {
    barClass: "todo-card__top-bar--high",
    badgeClass: "badge badge--high",
    label: "Priority: High",
  },
};

function applyPriority(card, newPriority) {
  const bar = card.querySelector(
    '[data-testid="test-todo-priority-indicator"]',
  );
  const badge = card.querySelector('[data-testid="test-todo-priority"]');
  const cfg = PRIORITY_CONFIG[newPriority] || PRIORITY_CONFIG["Medium"];

  if (bar) {
    bar.className = "todo-card__top-bar " + cfg.barClass;
  }

  if (badge) {
    badge.textContent = newPriority;
    badge.className = cfg.badgeClass;
    badge.setAttribute("aria-label", cfg.label);
  }

  card.dataset.priority = newPriority;
}

function syncSelectAppearance(select) {
  select.dataset.status = select.value;
}

const COLLAPSE_THRESHOLD = 120;

function initExpandCollapse(card) {
  const collapsible = card.querySelector(
    '[data-testid="test-todo-collapsible-section"]',
  );
  const toggle = card.querySelector('[data-testid="test-todo-expand-toggle"]');
  const desc = card.querySelector('[data-testid="test-todo-description"]');

  if (!collapsible || !toggle || !desc) return;

  const fullText = desc.textContent.trim();
  if (fullText.length <= COLLAPSE_THRESHOLD) return;

  const lineHeight = parseFloat(getComputedStyle(desc).lineHeight) || 21;
  const collapsedPx = Math.round(lineHeight * 3);

  collapsible.style.maxHeight = collapsedPx + "px";
  collapsible.style.overflow = "hidden";
  collapsible.classList.add("is-collapsed");

  toggle.hidden = false;

  toggle.addEventListener("click", () => {
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";

    if (isExpanded) {
      collapsible.style.maxHeight = collapsedPx + "px";
      toggle.setAttribute("aria-expanded", "false");
      toggle.querySelector(".expand-toggle__label").textContent = "Show more";
      collapsible.classList.add("is-collapsed");
    } else {
      collapsible.style.maxHeight = collapsible.scrollHeight + "px";
      toggle.setAttribute("aria-expanded", "true");
      toggle.querySelector(".expand-toggle__label").textContent = "Show less";
      collapsible.classList.remove("is-collapsed");
    }
  });
}

function enterEditMode(card) {
  const viewEl = card.querySelector(".todo-card__view");
  const editEl = card.querySelector(".todo-card__edit");

  if (!viewEl || !editEl) return;

  const titleEl = card.querySelector('[data-testid="test-todo-title"]');
  const descEl = card.querySelector('[data-testid="test-todo-description"]');
  
  const dueDateEl = card.querySelector('[data-testid="test-todo-due-date"]');

  const titleInput = editEl.querySelector(
    '[data-testid="test-todo-edit-title-input"]',
  );
  const descInput = editEl.querySelector(
    '[data-testid="test-todo-edit-description-input"]',
  );
  const prioritySel = editEl.querySelector(
    '[data-testid="test-todo-edit-priority-select"]',
  );
  const dueDateInput = editEl.querySelector(
    '[data-testid="test-todo-edit-due-date-input"]',
  );

  if (titleInput && titleEl) titleInput.value = titleEl.textContent.trim();
  if (descInput && descEl) descInput.value = descEl.textContent.trim();
  if (prioritySel) prioritySel.value = card.dataset.priority || "Medium";
  if (dueDateInput && dueDateEl) {
    const datetime = dueDateEl.getAttribute("datetime");
    if (datetime) dueDateInput.value = toDatetimeLocal(new Date(datetime));
  }

  editEl.dataset.editBtnRef = "";

  viewEl.hidden = true;
  editEl.hidden = false;

  if (titleInput) titleInput.focus();
}

function exitEditMode(card, save) {
  const viewEl = card.querySelector(".todo-card__view");
  const editEl = card.querySelector(".todo-card__edit");
  const editBtn = card.querySelector('[data-testid="test-todo-edit-button"]');

  if (!viewEl || !editEl) return;

  if (save) {
    const titleInput = editEl.querySelector(
      '[data-testid="test-todo-edit-title-input"]',
    );
    const descInput = editEl.querySelector(
      '[data-testid="test-todo-edit-description-input"]',
    );
    const prioritySel = editEl.querySelector(
      '[data-testid="test-todo-edit-priority-select"]',
    );
    const dueDateInput = editEl.querySelector(
      '[data-testid="test-todo-edit-due-date-input"]',
    );

    const titleEl = card.querySelector('[data-testid="test-todo-title"]');
    if (titleEl && titleInput.value.trim()) {
      titleEl.textContent = titleInput.value.trim();
    }

    const descEl = card.querySelector('[data-testid="test-todo-description"]');
    if (descEl && descInput) {
      descEl.textContent = descInput.value.trim();
    }

    if (prioritySel) {
      applyPriority(card, prioritySel.value);
    }

    if (dueDateInput && dueDateInput.value) {
      const newDate = new Date(dueDateInput.value);
      const isoString = newDate.toISOString();
      const dueDateEl = card.querySelector(
        '[data-testid="test-todo-due-date"]',
      );
      if (dueDateEl) {
        dueDateEl.setAttribute("datetime", isoString);
        dueDateEl.textContent = formatDueDate(newDate);
      }
      const timeEl = card.querySelector(".time-remaining");
      if (timeEl) {
        timeEl.setAttribute("data-due", isoString);
        if (!card.classList.contains("done")) refreshTimeEl(timeEl, card);
      }
    }

    reinitExpandCollapse(card);
  }

  editEl.hidden = true;
  viewEl.hidden = false;

  if (editBtn) editBtn.focus();
}

function reinitExpandCollapse(card) {
  const collapsible = card.querySelector(
    '[data-testid="test-todo-collapsible-section"]',
  );
  const toggle = card.querySelector('[data-testid="test-todo-expand-toggle"]');

  if (!collapsible || !toggle) return;

  collapsible.style.maxHeight = "";
  collapsible.style.overflow = "";
  collapsible.classList.remove("is-collapsed");
  toggle.hidden = true;
  toggle.setAttribute("aria-expanded", "false");
  if (toggle.querySelector(".expand-toggle__label")) {
    toggle.querySelector(".expand-toggle__label").textContent = "Show more";
  }
  const newToggle = toggle.cloneNode(true);
  toggle.parentNode.replaceChild(newToggle, toggle);

  initExpandCollapse(card);
}

function initCard(card) {
  const toggle = card.querySelector(
    '[data-testid="test-todo-complete-toggle"]',
  );
  const dropdown = card.querySelector(
    '[data-testid="test-todo-status-control"]',
  );
  const editBtn = card.querySelector('[data-testid="test-todo-edit-button"]');
  const editEl = card.querySelector(".todo-card__edit");

  const initialStatus = card.dataset.status || "Pending";
  card.dataset.originalStatus = initialStatus;

  if (dropdown) syncSelectAppearance(dropdown);

  if (toggle) {
    toggle.addEventListener("change", () => {
      const newStatus = toggle.checked
        ? "Done"
        : card.dataset.originalStatus || "Pending";
      applyStatus(card, newStatus, "checkbox");
      if (!toggle.checked) {
        card.dataset.originalStatus = newStatus;
      }
    });
  }

  if (dropdown) {
    dropdown.addEventListener("change", () => {
      const newStatus = dropdown.value;
      if (card.dataset.status === "Done" && newStatus !== "Done") {
        card.dataset.originalStatus = newStatus;
      }
      applyStatus(card, newStatus, "dropdown");
      syncSelectAppearance(dropdown);
    });
  }

  if (editBtn) {
    editBtn.addEventListener("click", () => enterEditMode(card));
  }

  if (editEl) {
    const form = editEl.querySelector('[data-testid="test-todo-edit-form"]');
    const cancelBtn = editEl.querySelector(
      '[data-testid="test-todo-cancel-button"]',
    );

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        exitEditMode(card, true);
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => exitEditMode(card, false));
    }

    editEl.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        editEl.querySelectorAll(
          "input, textarea, select, button:not([disabled])",
        ),
      ).filter((el) => !el.hidden && el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  initExpandCollapse(card);

  const timeEl = card.querySelector(".time-remaining");
  if (timeEl && !card.classList.contains("done")) {
    refreshTimeEl(timeEl, card);
  }
}

function initAllCards() {
  document.querySelectorAll('[data-testid="test-todo-card"]').forEach(initCard);

  setInterval(refreshAllTimeEls, 30_000);
}

document.addEventListener("DOMContentLoaded", initAllCards);
