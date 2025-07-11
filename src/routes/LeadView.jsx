import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../api/axios';

const emailTypes = ['Lead', 'General', 'Notification'];
const mockSequences = [
  { id: 1, name: 'Welcome Drip' },
  { id: 2, name: 'Re-engagement' },
  { id: 3, name: 'Demo Follow-up' },
];

const mockLead = {
  id: 1,
  Name: 'John Doe',
  Email: 'john@acme.com',
  Company: 'Acme Corp',
  Title: 'CEO',
  Phone: '123-456-7890',
  Status: 'Verified',
  name: 'Acme Corp',
  type: 'Organization',
  qualified: true,
  contacts: [
    { name: 'John Doe', role: 'CEO', email: 'john@acme.com', phone: '123-456-7890' },
    { name: 'Jane Smith', role: 'CTO', email: 'jane@acme.com', phone: '987-654-3210' },
  ],
  customFields: {
    Industry: 'Software',
    Location: 'San Francisco',
    'Account Size': 'Large',
  },
  tasks: [
    { id: 1, title: 'Send contract', status: 'Open' },
    { id: 2, title: 'Schedule demo', status: 'Completed' },
  ],
  opportunities: [
    { id: 1, title: 'Enterprise Deal', value: '$50,000', stage: 'Negotiation' },
  ],
  activities: [
    { id: 1, type: 'email', content: 'Sent proposal to John', time: '2h ago' },
    { id: 2, type: 'call', content: 'Call with Jane', time: '1d ago' },
    { id: 3, type: 'sms', content: 'Texted John about meeting', time: '3d ago' },
    { id: 4, type: 'note', content: 'Interested in AI features', time: '4d ago' },
    { id: 5, type: 'mail', content: 'Sent welcome package', time: '5d ago' },
  ],
};

const activityTypes = [
  { key: 'all', label: 'All' },
  { key: 'mail', label: 'Mail' },
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
  { key: 'call', label: 'Call' },
  { key: 'note', label: 'Note' },
];

const LeadView = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState('all');
  const [showCompose, setShowCompose] = useState(false);
  const [composeFields, setComposeFields] = useState({ to: '', subject: '', body: '', emailType: emailTypes[0], sendLater: false, sendAt: '' });
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [showSequence, setShowSequence] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState(mockSequences[0].id);
  const [scheduledFollowUps, setScheduledFollowUps] = useState([]);
  const [enrolledSequences, setEnrolledSequences] = useState([]);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/lead/GetLeadById/${leadId}`);
        const leadData = response.data.lead || response.data;
        
        // Transform API data to match our expected structure
        const transformedLead = {
          ...leadData,
          name: leadData.Company || leadData.Name || 'Unknown Company',
          type: 'Organization',
          qualified: leadData.Status === 'Verified',
          contacts: [
            { 
              name: leadData.Name || 'Unknown', 
              role: leadData.Title || 'Unknown', 
              email: leadData.Email || '', 
              phone: leadData.Phone || '' 
            }
          ],
          customFields: {
            Industry: leadData.Industry || 'Unknown',
            Location: leadData.Location || 'Unknown',
            'Account Size': leadData.AccountSize || 'Unknown',
          },
          tasks: leadData.tasks || mockLead.tasks,
          opportunities: leadData.opportunities || mockLead.opportunities,
          activities: leadData.activities || mockLead.activities,
        };
        
        setLead(transformedLead);
      } catch (error) {
        console.error('Error fetching lead:', error);
        // Fallback to mock data if API fails
        setLead(mockLead);
      } finally {
        setLoading(false);
      }
    };

    if (leadId) {
      fetchLead();
    } else {
      setLead(mockLead);
      setLoading(false);
    }
  }, [leadId]);

  const filteredActivities =
    activityFilter === 'all'
      ? (lead?.activities || mockLead.activities)
      : (lead?.activities || mockLead.activities).filter(a => a.type === activityFilter);

  const handleComposeChange = (e) => {
    setComposeFields(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  };

  const handleSendMail = (e) => {
    e.preventDefault();
    setShowCompose(false);
    setComposeFields({ to: '', subject: '', body: '', emailType: emailTypes[0], sendLater: false, sendAt: '' });
    alert(composeFields.sendLater ? `Mail scheduled for ${composeFields.sendAt}!` : 'Mail sent!');
  };

  const handleScheduleFollowUp = (e) => {
    e.preventDefault();
    setScheduledFollowUps(fus => [...fus, followUpDate]);
    setShowFollowUp(false);
    setFollowUpDate('');
    alert('Follow-up scheduled!');
  };

  const handleEnrollSequence = (e) => {
    e.preventDefault();
    const seq = mockSequences.find(s => s.id === Number(selectedSequence));
    setEnrolledSequences(seqs => [...seqs, seq.name]);
    setShowSequence(false);
    setSelectedSequence(mockSequences[0].id);
    alert(`Enrolled in sequence: ${seq.name}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div>Loading lead details...</div>
      </div>
    );
  }

  const currentLead = lead || mockLead;

  return (
    <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', padding: 24, gap: 32 }}>
      {/* Back Button */}
      <div style={{ position: 'absolute', top: 24, left: 24 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            background: '#f3f4f6',
            color: '#374151',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          ← Back
        </button>
      </div>

      {/* Sidebar */}
      <div style={{ width: 320, background: '#f9fafb', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px #0001', marginTop: 60 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{currentLead.name}</h2>
        <div style={{ color: '#888', marginBottom: 16 }}>{currentLead.type}</div>
        {currentLead.qualified && (
          <div style={{ marginBottom: 12, color: '#10b981', fontWeight: 600 }}>
            Qualified Lead <span title="A qualified lead is a vetted lead ready for the next sales stage. Not a student.">🛈</span>
          </div>
        )}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 6 }}>Contacts</h3>
          {currentLead.contacts.map((c, i) => (
            <div key={i} style={{ marginBottom: 8, padding: 8, background: '#fff', borderRadius: 6, boxShadow: '0 1px 2px #0001' }}>
              <div style={{ fontWeight: 500 }}>{c.name} <span style={{ color: '#aaa', fontSize: 13 }}>({c.role})</span></div>
              <div style={{ fontSize: 13 }}>{c.email} | {c.phone}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 6 }}>Tasks</h3>
          {currentLead.tasks.map(t => (
            <div key={t.id} style={{ marginBottom: 6, fontSize: 15 }}>
              <span style={{ color: t.status === 'Completed' ? '#10b981' : '#f59e42', fontWeight: 600 }}>{t.status === 'Completed' ? '✔' : '⏳'}</span> {t.title}
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 6 }}>Opportunities</h3>
          {currentLead.opportunities.map(o => (
            <div key={o.id} style={{ marginBottom: 6, fontSize: 15 }}>
              <span style={{ fontWeight: 600 }}>{o.title}</span> <span style={{ color: '#888' }}>({o.value}, {o.stage})</span>
            </div>
          ))}
        </div>
        <div>
          <h3 style={{ fontWeight: 600, marginBottom: 6 }}>Custom Fields</h3>
          {Object.entries(currentLead.customFields).map(([k, v]) => (
            <div key={k} style={{ fontSize: 15, marginBottom: 4 }}><span style={{ color: '#888' }}>{k}:</span> {v}</div>
          ))}
        </div>
        {/* Scheduled Follow-ups */}
        {scheduledFollowUps.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 6 }}>Scheduled Follow-ups</h3>
            {scheduledFollowUps.map((date, i) => (
              <div key={i} style={{ fontSize: 15, marginBottom: 4 }}>{date}</div>
            ))}
          </div>
        )}
        {/* Enrolled Sequences */}
        {enrolledSequences.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 6 }}>Enrolled Sequences</h3>
            {enrolledSequences.map((seq, i) => (
              <div key={i} style={{ fontSize: 15, marginBottom: 4 }}>{seq}</div>
            ))}
          </div>
        )}
      </div>
      {/* Main Content */}
      <div style={{ flex: 1, marginTop: 60 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          {activityTypes.map(type => (
            <button
              key={type.key}
              onClick={() => setActivityFilter(type.key)}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                border: activityFilter === type.key ? '2px solid #10b981' : '1px solid #ccc',
                background: activityFilter === type.key ? '#e6fff5' : '#fff',
                fontWeight: activityFilter === type.key ? 700 : 400,
                cursor: 'pointer',
              }}
            >
              {type.label}
            </button>
          ))}
          <button
            onClick={() => setShowCompose(v => !v)}
            style={{ marginLeft: 'auto', padding: '6px 16px', borderRadius: 6, background: '#3b82f6', color: '#fff', border: 'none', fontWeight: 600 }}
          >
            {showCompose ? 'Cancel' : 'Compose Mail'}
          </button>
          <button
            onClick={() => setShowFollowUp(true)}
            style={{ padding: '6px 16px', borderRadius: 6, background: '#f59e42', color: '#fff', border: 'none', fontWeight: 600 }}
          >
            Schedule Follow Up
          </button>
          <button
            onClick={() => setShowSequence(true)}
            style={{ padding: '6px 16px', borderRadius: 6, background: '#6366f1', color: '#fff', border: 'none', fontWeight: 600 }}
          >
            Enroll in Sequence
          </button>
        </div>
        {/* Compose Mail Form */}
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
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontWeight: 600 }}>
                <input
                  type="checkbox"
                  name="sendLater"
                  checked={composeFields.sendLater}
                  onChange={handleComposeChange}
                  style={{ marginRight: 8 }}
                />
                Send Later
              </label>
              {composeFields.sendLater && (
                <input
                  type="datetime-local"
                  name="sendAt"
                  value={composeFields.sendAt}
                  onChange={handleComposeChange}
                  style={{ marginLeft: 12, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                  required
                />
              )}
            </div>
            <button type="submit" style={{ padding: '6px 16px', borderRadius: 4, background: '#10b981', color: '#fff', border: 'none', fontWeight: 600 }}>
              {composeFields.sendLater ? 'Schedule Mail' : 'Send Mail'}
            </button>
          </form>
        )}
        {/* Schedule Follow Up Modal */}
        {showFollowUp && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={handleScheduleFollowUp} style={{ background: '#fff', borderRadius: 8, padding: 24, minWidth: 320 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Schedule Follow Up</h3>
              <input
                type="datetime-local"
                value={followUpDate}
                onChange={e => setFollowUpDate(e.target.value)}
                required
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 16 }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={{ padding: '6px 16px', borderRadius: 4, background: '#10b981', color: '#fff', border: 'none', fontWeight: 600 }}>Schedule</button>
                <button type="button" onClick={() => setShowFollowUp(false)} style={{ padding: '6px 16px', borderRadius: 4, background: '#eee', color: '#333', border: 'none', fontWeight: 600 }}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        {/* Enroll in Sequence Modal */}
        {showSequence && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={handleEnrollSequence} style={{ background: '#fff', borderRadius: 8, padding: 24, minWidth: 320 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Enroll in Sequence</h3>
              <select
                value={selectedSequence}
                onChange={e => setSelectedSequence(e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 16 }}
              >
                {mockSequences.map(seq => <option key={seq.id} value={seq.id}>{seq.name}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={{ padding: '6px 16px', borderRadius: 4, background: '#6366f1', color: '#fff', border: 'none', fontWeight: 600 }}>Enroll</button>
                <button type="button" onClick={() => setShowSequence(false)} style={{ padding: '6px 16px', borderRadius: 4, background: '#eee', color: '#333', border: 'none', fontWeight: 600 }}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        <div>
          {filteredActivities.length === 0 && <div style={{ color: '#888', marginTop: 40 }}>No activities found.</div>}
          {filteredActivities.map(a => (
            <div key={a.id} style={{
              border: '1px solid #eee',
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              <span style={{ fontSize: 22 }}>
                {a.type === 'mail' && '📬'}
                {a.type === 'email' && '✉️'}
                {a.type === 'sms' && '📱'}
                {a.type === 'call' && '📞'}
                {a.type === 'note' && '📝'}
              </span>
              <div>
                <div style={{ fontWeight: 500 }}>{a.content}</div>
                <div style={{ color: '#888', fontSize: 13 }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadView; 