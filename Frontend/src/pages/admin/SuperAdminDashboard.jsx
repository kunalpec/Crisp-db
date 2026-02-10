import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { loginActions } from "../../store/loginSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./SuperAdminDashboard.css";


const AdminDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ==========================
  // Fetch Companies
  // ==========================
  const fetchCompanies = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/superadmin/companies",
        { withCredentials: true }
      );

      const data = res.data.data;

      setCompanies(data);

      setStats({
        total: data.length,
        active: data.filter((c) => !c.isBlocked).length,
        blocked: data.filter((c) => c.isBlocked).length,
      });

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ==========================
  // Block / Unblock Company
  // ==========================
  const handleBlockToggle = async (id) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/superadmin/company/${id}/block`,
        {},
        { withCredentials: true }
      );

      fetchCompanies();
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================
  // Delete Company
  // ==========================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this company?")) return;

    try {
      await axios.delete(
        `http://localhost:8000/api/superadmin/company/${id}`,
        { withCredentials: true }
      );

      fetchCompanies();
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================
  // Logout
  // ==========================
  const handleLogout = () => {
    dispatch(loginActions.adminLogout());
    navigate("/admin/login");
  };

  return (
    <div className="admin-container">

      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Super Admin</h2>
        <ul>
          <li>Dashboard</li>
          <li>Companies</li>
          <li onClick={handleLogout} className="logout">
            Logout
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">

        <h1>Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="stats">
          <div className="card">
            <h3>Total Companies</h3>
            <p>{stats.total}</p>
          </div>

          <div className="card">
            <h3>Active</h3>
            <p>{stats.active}</p>
          </div>

          <div className="card">
            <h3>Blocked</h3>
            <p>{stats.blocked}</p>
          </div>
        </div>

        {/* Company Table */}
        <div className="table-container">
          <h2>All Companies</h2>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Domain</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {companies.map((company) => (
                <tr key={company._id}>
                  <td>{company.name}</td>
                  <td>{company.domain}</td>
                  <td>{company.plan?.name || "Free"}</td>
                  <td>
                    {company.isBlocked ? (
                      <span className="blocked">Blocked</span>
                    ) : (
                      <span className="active">Active</span>
                    )}
                  </td>

                  <td>
                    <button
                      onClick={() => handleBlockToggle(company._id)}
                    >
                      {company.isBlocked ? "Unblock" : "Block"}
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(company._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
