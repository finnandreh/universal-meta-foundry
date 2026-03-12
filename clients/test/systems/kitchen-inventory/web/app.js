const itemRows = document.getElementById("itemRows");
const statusFilter = document.getElementById("statusFilter");
const lowOnly = document.getElementById("lowOnly");
const refreshBtn = document.getElementById("refreshBtn");
const itemForm = document.getElementById("itemForm");
const summary = document.getElementById("summary");
const statusMessage = document.getElementById("statusMessage");

function setStatus(message) {
  statusMessage.textContent = message;
}

async function fetchSummary() {
  const response = await fetch("/api/summary");
  if (!response.ok) {
    throw new Error("Failed to fetch summary");
  }
  return response.json();
}

async function fetchItems() {
  const params = new URLSearchParams();
  if (statusFilter.value !== "all") {
    params.set("status", statusFilter.value);
  }
  if (lowOnly.checked) {
    params.set("low_only", "true");
  }

  const url = `/api/items${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch items");
  }
  return response.json();
}

function statusClass(status) {
  return `status-chip status-${status}`;
}

function renderItems(items) {
  itemRows.innerHTML = "";
  for (const item of items) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.quantity}</td>
      <td>${item.unit}</td>
      <td><span class="${statusClass(item.status)}">${item.status}</span></td>
      <td><button data-name="${item.name}" data-action="consume" type="button">Use 1</button></td>
    `;
    itemRows.appendChild(row);
  }

  if (items.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = "<td colspan=\"6\">No items match the current filter.</td>";
    itemRows.appendChild(row);
  }
}

async function refreshView() {
  try {
    const [itemsPayload, summaryPayload] = await Promise.all([fetchItems(), fetchSummary()]);
    renderItems(itemsPayload.items);
    const counts = summaryPayload.status_counts;
    summary.textContent = `Total ${summaryPayload.total} | ok=${counts.ok} | low=${counts.low} | out=${counts.out}`;
    setStatus("Inventory loaded.");
  } catch (error) {
    setStatus(`Error: ${error.message}`);
  }
}

async function addItem(event) {
  event.preventDefault();
  const payload = {
    name: document.getElementById("name").value.trim(),
    category: document.getElementById("category").value.trim(),
    quantity: Number(document.getElementById("quantity").value),
    unit: document.getElementById("unit").value.trim()
  };

  try {
    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorPayload = await response.json();
      throw new Error(errorPayload.detail || "Failed to create item");
    }

    itemForm.reset();
    document.getElementById("quantity").value = 1;
    setStatus(`Added ${payload.name}.`);
    await refreshView();
  } catch (error) {
    setStatus(`Error: ${error.message}`);
  }
}

async function consumeOne(itemName) {
  const current = Array.from(itemRows.querySelectorAll("tr"))
    .map((row) => ({
      name: row.children[0] ? row.children[0].textContent : "",
      quantity: row.children[2] ? Number(row.children[2].textContent) : NaN
    }))
    .find((row) => row.name === itemName);

  if (!current || Number.isNaN(current.quantity)) {
    setStatus("Unable to resolve current quantity.");
    return;
  }

  const nextQuantity = Math.max(0, current.quantity - 1);

  try {
    const response = await fetch(`/api/items/${encodeURIComponent(itemName)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: nextQuantity })
    });

    if (!response.ok) {
      const errorPayload = await response.json();
      throw new Error(errorPayload.detail || "Failed to update item");
    }

    setStatus(`Updated ${itemName} to quantity ${nextQuantity}.`);
    await refreshView();
  } catch (error) {
    setStatus(`Error: ${error.message}`);
  }
}

itemRows.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if (target.dataset.action === "consume") {
    consumeOne(target.dataset.name || "");
  }
});

itemForm.addEventListener("submit", addItem);
refreshBtn.addEventListener("click", refreshView);
statusFilter.addEventListener("change", refreshView);
lowOnly.addEventListener("change", refreshView);

refreshView();
