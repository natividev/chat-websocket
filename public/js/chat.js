const username = localStorage.getItem('name');
if (!username) {
  window.location.replace('index.html');
  throw new Error('A username is required to chat');
}

// Referencias HTML
const lblOnline = document.querySelector('#status-online');
const lblOffline = document.querySelector('#status-offline');

const usersUIElement = document.querySelector('ul');

const form = document.querySelector('form');
const inputMessage = document.querySelector('input');
const chatElement = document.querySelector('#chat');

const renderUsers = (users) => {
  let usersHTML = '';
  users.forEach(({ name, id }) => {
    usersHTML += `
      <li class="user-item">
        <p>
          <span class="user-name text-success">${name}</span>
          <!-- <span class="user-id fs-6 text-muted">${id}</span> -->
        </p>
      </li>
    `;
  });

  usersUIElement.innerHTML = usersHTML;
};

const renderMessage = (payload) => {
  const { userId, message, name } = payload;

  const divElement = document.createElement('div');
  divElement.classList.add('message');

  if (userId !== socket.id) {
    divElement.classList.add('incoming');
  }

  divElement.innerHTML = `
  <small>${name}</small>
  <p>${message}</p>
  `;
  chatElement.append(divElement);

  // Scroll al final de los mensajes
  chatElement.scrollTop = chatElement.scrollHeight;
};

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const message = inputMessage.value;
  inputMessage.value = '';

  socket.emit('send-message', message);
});

const socket = io({
  auth: {
    token: '123',
    name: username,
  },
});

socket.on('connect', () => {
  lblOnline.classList.remove('hidden');
  lblOffline.classList.add('hidden');
});

socket.on('disconnect', () => {
  lblOnline.classList.add('hidden');
  lblOffline.classList.remove('hidden');
});

socket.on('welcome-message', (payload) => {
  console.log(payload);
});

socket.on('on-clients-changed', renderUsers);

socket.on('on-message', renderMessage);
