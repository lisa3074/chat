const chatForm = document.querySelector("#chat-form");
const socket = io();
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.querySelector("#room-name");
const userList = document.querySelector("#users");

// Get username and room from url via the qs.js library
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
console.log(username, room);

//Join chatroom
socket.emit("joinRoom", { username, room });

//get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//message is the key we ask for at then we get whatever message holds.
//Message from server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);
  //scroll down to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message submit to chat
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  //emitting message to the server
  socket.emit("chatMessage", msg);

  //Clear form
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});
//output message to dom
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

//add room name to DOM
function outputRoomName(room) {
  roomName.textContent = room;
}
//add users to DOM
function outputUsers(users) {
  //sets the list of online users to the current entries og the array. It wraps the usernames in <li> tags, because its a list that is "appended to an ul (userList)
  userList.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join("")}
  `;
}
