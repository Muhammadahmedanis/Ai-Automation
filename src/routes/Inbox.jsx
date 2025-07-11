import React, { useState } from 'react';

const emailTypes = ['Lead', 'General', 'Notification'];

const mockInboxItems = [
  { id: 1, type: 'message', priority: 'high', sender: 'John Doe', content: 'Please call me back ASAP', time: '2m ago', isNew: true },
  { id: 2, type: 'email', priority: 'normal', sender: 'jane@company.com', content: 'Proposal attached', time: '10m ago', subject: 'Proposal', isNew: false },
  { id: 3, type: 'call', priority: 'normal', sender: 'Mike', content: 'Missed Call', time: '15m ago', isNew: true },
  { id: 4, type: 'sms', priority: 'normal', sender: 'Sarah', content: 'Meeting at 3pm?', time: '20m ago', isNew: false },
  { id: 5, type: 'task', priority: 'normal', sender: 'System', content: 'Send contract to client', time: 'Today', isNew: true },
];

const typeLabels = {
  all: 'All',
  message: 'Messages',
  email: 'Email',
  call: 'Call',
  sms: 'SMS',
  task: 'Tasks',
  new: 'New',
  old: 'Old',
};

const Inbox = () => {
  const [filter, setFilter] = useState('all');
  const [reply, setReply] = useState({});
  const [items, setItems] = useState(mockInboxItems);
  const [showCompose, setShowCompose] = useState(false);
  const [composeFields, setComposeFields] = useState({ to: '', subject: '', body: '', emailType: emailTypes[0] });

  const filteredItems = filter === 'all' ? items :
    filter === 'new' ? items.filter(item => item.isNew) :
    filter === 'old' ? items.filter(item => !item.isNew) :
    items.filter(item => item.type === filter);

  const handleReplyChange = (id, value) => {
    setReply(r => ({ ...r, [id]: value }));
  };

  const handleSendReply = (id) => {
    setReply(r => ({ ...r, [id]: '' }));
    alert('Reply sent!');
  };

  const handleMarkDone = (id) => {
    setItems(items => items.filter(item => item.id !== id));
  };

  const handleComposeChange = (e) => {
    setComposeFields(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSendMail = (e) => {
    e.preventDefault();
    setShowCompose(false);
    setComposeFields({ to: '', subject: '', body: '', emailType: emailTypes[0] });
    alert('Mail sent!');
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Inbox</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {Object.entries(typeLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: filter === key ? '2px solid #10b981' : '1px solid #ccc',
              background: filter === key ? '#e6fff5' : '#fff',
              fontWeight: filter === key ? 700 : 400,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setShowCompose(v => !v)}
          style={{ marginLeft: 'auto', padding: '6px 16px', borderRadius: 6, background: '#3b82f6', color: '#fff', border: 'none', fontWeight: 600 }}
        >
          {showCompose ? 'Cancel' : 'Compose Mail'}
        </button>
      </div>
      {showCompose && (
        <form onSubmit={handleSendMail} style={{ background: '#f9fafb', borderRadius: 8, padding: 18, marginBottom: 24, boxShadow: '0 1px 4px #0001' }}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontWeight: 600 }}>To:</label>
            <input
              type="email"
              name="to"
              value={composeFields.to}
              onChange={handleComposeChange}
              required
              style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontWeight: 600 }}>Subject:</label>
            <input
              type="text"
              name="subject"
              value={composeFields.subject}
              onChange={handleComposeChange}
              required
              style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontWeight: 600 }}>Type:</label>
            <select
              name="emailType"
              value={composeFields.emailType}
              onChange={handleComposeChange}
              style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }}
            >
              {emailTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontWeight: 600 }}>Body:</label>
            <textarea
              name="body"
              value={composeFields.body}
              onChange={handleComposeChange}
              required
              rows={5}
              style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }}
            />
          </div>
          <button type="submit" style={{ padding: '6px 16px', borderRadius: 4, background: '#10b981', color: '#fff', border: 'none', fontWeight: 600 }}>
            Send Mail
          </button>
        </form>
      )}
      <div>
        {filteredItems.length === 0 && <div style={{ color: '#888', marginTop: 40 }}>No items found.</div>}
        {filteredItems.map(item => (
          <div key={item.id} style={{
            border: '1px solid #eee',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            background: item.priority === 'high' ? '#fff6f6' : '#fff',
            boxShadow: item.priority === 'high' ? '0 0 0 2px #f87171' : 'none',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 600 }}>
                {item.type === 'message' && '💬'}
                {item.type === 'email' && '✉️'}
                {item.type === 'call' && '📞'}
                {item.type === 'sms' && '📱'}
                {item.type === 'task' && '✅'}
                <span style={{ marginLeft: 8 }}>{item.sender}</span>
                {item.subject && <span style={{ marginLeft: 8, color: '#888' }}>({item.subject})</span>}
                {item.isNew && <span style={{ marginLeft: 8, color: '#10b981', fontSize: 12 }}>(New)</span>}
              </div>
              <div style={{ color: '#888', fontSize: 13 }}>{item.time}</div>
            </div>
            <div style={{ margin: '8px 0 12px 0' }}>{item.content}</div>
            {/* Inline actions */}
            {['message', 'email', 'sms'].includes(item.type) && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Type your reply..."
                  value={reply[item.id] || ''}
                  onChange={e => handleReplyChange(item.id, e.target.value)}
                  style={{ flex: 1, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                />
                <button
                  onClick={() => handleSendReply(item.id)}
                  style={{ padding: '6px 16px', borderRadius: 4, background: '#10b981', color: '#fff', border: 'none', fontWeight: 600 }}
                  disabled={!reply[item.id]}
                >
                  Send
                </button>
              </div>
            )}
            {item.type === 'call' && (
              <button
                onClick={() => alert('Calling back...')}
                style={{ padding: '6px 16px', borderRadius: 4, background: '#3b82f6', color: '#fff', border: 'none', fontWeight: 600 }}
              >
                Call Back
              </button>
            )}
            {item.type === 'task' && (
              <button
                onClick={() => handleMarkDone(item.id)}
                style={{ padding: '6px 16px', borderRadius: 4, background: '#10b981', color: '#fff', border: 'none', fontWeight: 600 }}
              >
                Mark Done
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inbox; 