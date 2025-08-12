import React from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';

// MOCK DATA: Replace this with data fetched from Firebase
const orders = [
  { id: 'JERSEY-1024', date: 'August 10, 2025', total: '₹2,599', status: 'Shipped' },
  { id: 'JERSEY-1021', date: 'July 28, 2025', total: '₹4,199', status: 'Delivered' },
];

export default function MyOrders() {
  return (
    <div className="account-content-wrapper">
      <h1 className="account-content__title">My Orders</h1>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card__details">
                <p className="order-card__id">Order ID: {order.id}</p>
                <p className="order-card__date">Date: {order.date}</p>
                <p className="order-card__total">Total: {order.total}</p>
              </div>
              <div className="order-card__status">
                <span className={`status-badge status--${order.status.toLowerCase()}`}>{order.status}</span>
                <Link to={`/account/orders/${order.id}`} className="button button--small button--secondary">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
