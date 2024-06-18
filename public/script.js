document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const login = document.getElementById("login").value;
  const password = document.getElementById("password").value;

  const response = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });
  const data = await response.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    loadClients();
  } else {
    alert("Login failed");
  }
});

async function loadClients() {
  const token = localStorage.getItem("token");
  const response = await fetch("/clients", {
    headers: { Authorization: token },
  });
  const clients = await response.json();
  document.getElementById("auth-container").style.display = "none";
  document.getElementById("client-container").style.display = "block";

  const tableBody = document.getElementById("client-table-body");
  tableBody.innerHTML = "";

  if (clients.message) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 7;
    cell.innerText = clients.message;
    row.appendChild(cell);
    tableBody.appendChild(row);
  } else {
    clients.forEach((client) => {
      const row = document.createElement("tr");
      const formattedDate = new Date(client.birthDate).toLocaleDateString(
        "ru-RU",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      );
      row.innerHTML = `
        <td>${client.accountNumber}</td>
        <td>${client.lastName}</td>
        <td>${client.firstName}</td>
        <td>${client.middleName}</td>
        <td>${formattedDate}</td>
        <td>${client.inn}</td>       
        <td>
            <select onchange="updateStatus('${client._id}', this.value)">
                <option value="Не в работе" ${
                  client.status === "Не в работе" ? "selected" : ""
                }>Не в работе</option>
                <option value="В работе" ${
                  client.status === "В работе" ? "selected" : ""
                }>В работе</option>
                <option value="Отказ" ${
                  client.status === "Отказ" ? "selected" : ""
                }>Отказ</option>
                <option value="Сделка закрыта" ${
                  client.status === "Сделка закрыта" ? "selected" : ""
                }>Сделка закрыта</option>
            </select>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token) {
    loadClients();
  }
});

document.getElementById("logout-button").addEventListener("click", () => {
  localStorage.removeItem("token");
  document.getElementById("client-container").style.display = "none";
  document.getElementById("auth-container").style.display = "flex";
});

async function updateStatus(clientId, status) {
  const token = localStorage.getItem("token");
  await fetch(`/clients/${clientId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ status }),
  });
}
