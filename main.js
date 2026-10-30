const DOMAIN_APP = "https://mindx-mockup-server.vercel.app";
const API_KEY = "6ae0b9dd1f31d6fb61127c16";
const RESOURCE_NAME = "MindX Mockup Server";

// Dữ liệu sau khi tải về sẽ nằm trong biến này
let db = null;

// Tìm object có chứa users/tasks dù dữ liệu bị bọc trong mảng hoặc root
function findDb(data) {
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findDb(item);
      if (found) return found;
    }
    return null;
  }
  if (data && typeof data === "object") {
    if (data.users && data.tasks) return data;
    if (data.root) return findDb(data.root);
    if (data.data) return findDb(data.data);
  }
  return null;
}

// Tải dữ liệu từ API (chạy 1 lần đầu)
async function loadData() {
  const url = `${DOMAIN_APP}/api/resources/${encodeURIComponent(RESOURCE_NAME)}?apiKey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Lỗi ${res.status}`);
  const json = await res.json();
  console.log("json:", json); // xem cấu trúc thật nếu còn lỗi

  db = findDb(json.data) || findDb(json);
  if (!db) throw new Error("Không tìm thấy users/tasks trong dữ liệu, xem console.log ở trên");
}

// ===== 1. Lấy danh sách =====
function getUsers() {
  return db.users;
}
function getTaskStatus() {
  return db.taskStatus;
}
function getFlags() {
  return db.flags;
}
function getTasks() {
  return db.tasks;
}

// Lọc tasks theo flagId, statusId, assignedTo
function filterTasks({ flagId, statusId, assignedTo } = {}) {
  return db.tasks.filter(
    (t) =>
      (flagId === undefined || t.flagId === flagId) &&
      (statusId === undefined || t.statusId === statusId) &&
      (assignedTo === undefined || t.assignedTo === assignedTo)
  );
}

// ===== 2. Thêm =====
function addUser(user) {
  db.users.push(user);
}
function addTask(task) {
  db.tasks.push(task);
}

// ===== 3. Cập nhật =====
function updateUser(userId, newData) {
  const i = db.users.findIndex((u) => u.userId === userId);
  if (i === -1) return console.log("Không tìm thấy user");
  db.users[i] = { ...db.users[i], ...newData };
}
function updateTask(taskId, newData) {
  const i = db.tasks.findIndex((t) => t.taskId === taskId);
  if (i === -1) return console.log("Không tìm thấy task");
  db.tasks[i] = { ...db.tasks[i], ...newData };
}

// ===== 4. Xóa task =====
function deleteTask(taskId) {
  db.tasks = db.tasks.filter((t) => t.taskId !== taskId);
}

// ===== Chạy thử =====
async function main() {
  try {
    await loadData();

    console.log("users:", getUsers());
    console.log("taskStatus:", getTaskStatus());
    console.log("flags:", getFlags());
    console.log("tasks:", getTasks());
    console.log("lọc statusId = 1:", filterTasks({ statusId: 1 }));

    addUser({ userId: 99, name: "Test" });
    updateUser(99, { name: "Test đổi tên" });
    console.log("users sau khi thêm + sửa:", getUsers());

    addTask({ taskId: 99, title: "Task thử", flagId: 1, statusId: 1, assignedTo: 99 });
    updateTask(99, { title: "Task đã sửa" });
    deleteTask(99);
    console.log("tasks sau khi thêm + sửa + xóa:", getTasks());
  } catch (e) {
    console.error("Có lỗi:", e.message);
  }
}

main();