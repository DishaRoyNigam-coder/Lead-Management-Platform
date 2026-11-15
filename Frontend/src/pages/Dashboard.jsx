import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', description: '' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLeads = async () => {
    const { data } = await API.get('/leads', {
      params: { search, status: statusFilter, page, limit: 5 },
    });
    setLeads(data.leads);
    setTotalPages(data.pages);
  };

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter, page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await API.post('/leads', form);
    setForm({ name: '', email: '', phone: '', description: '' });
    fetchLeads();
  };

  const handleStatusUpdate = async (id, newStatus) => {
    await API.put(`/leads/${id}`, { status: newStatus });
    fetchLeads();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this lead?')) {
      await API.delete(`/leads/${id}`);
      fetchLeads();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Welcome, {user.name} ({user.role})</h2>
        <button onClick={logout}>Logout</button>
      </div>

      {/* Add Lead Form */}
      <form onSubmit={handleCreate} style={{ margin: '20px 0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input placeholder="Requirement" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button type="submit">Add Lead</button>
      </form>

      {/* Search & Filter */}
      <div style={{ marginBottom: '10px' }}>
        <input placeholder="Search by name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="In Discussion">In Discussion</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Leads Table */}
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Created By</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead._id}>
              <td>{lead.name}</td>
              <td>{lead.email}</td>
              <td>{lead.phone}</td>
              <td>
                <select value={lead.status} onChange={(e) => handleStatusUpdate(lead._id, e.target.value)}>
                  <option>New</option>
                  <option>In Discussion</option>
                  <option>Closed</option>
                </select>
              </td>
              <td>{lead.createdBy?.name}</td>
              <td><button onClick={() => handleDelete(lead._id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ marginTop: '10px' }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span> Page {page} of {totalPages} </span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
};

export default Dashboard;