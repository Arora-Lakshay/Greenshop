import moment from 'moment';
import Noty from 'noty';

// Updates the Order Status Track...
const updateStatus = (order) => {
  status.forEach(current => {
    current.classList.remove('completed');
    current.classList.remove('current');
  });
  let stepCompleted = true;
  status.forEach(current => {
    let statusProp = current.dataset.status;
    if (stepCompleted) {
      current.classList.add('completed');
    }
    if (order.status === statusProp) {
      stepCompleted = false;
      time.innerHTML = moment(order.updatedAt).format('DD/MM/YY hh:mm A');
      current.appendChild(time);
      if (current.nextElementSibling) {
        current.nextElementSibling.classList.add('current');
      }
    }
  });
}

const order = JSON.parse(document.getElementById('order-provider').value);
const status = document.querySelectorAll('.status-line');
let time = document.createElement('small');
updateStatus(order);

// Client-Side Socket Configurations...
let socket = io();
socket.emit('join', `order_${order._id}`);
socket.on('orderUpdated', data => {
  const updatedOrder = { ...order };
  updatedOrder.updatedAt = moment().format();
  updatedOrder.status = data.status;
  updateStatus(updatedOrder);
  new Noty({
    type: 'success',
    text: `Your Order is ${data.status} `,
    timeout: 1000,
    progressBar: false,
  }).show();
});