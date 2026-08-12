/**
 * Users List Page
 * Lists all users with due/overdue highlighting and row actions.
 */

import { Fragment, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useApi } from '../../hooks/useCustom';
import userService from '../../services/userService';
import borrowService from '../../services/borrowService';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const getFullName = (u) =>
  `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || u._id;

/**
 * Determine a user's alert level from their membership expiry and active borrows.
 * Returns { level: 'overdue' | 'dueSoon' | 'ok', reasons: string[] }.
 */
const computeAlert = (user, borrows) => {
  const now = Date.now();
  let overdue = false;
  let dueSoon = false;
  const reasons = [];

  // Membership
  if (user.membershipExpiryDate) {
    const diff = new Date(user.membershipExpiryDate).getTime() - now;
    if (diff < 0) {
      overdue = true;
      reasons.push('Membership overdue');
    } else if (diff < SEVEN_DAYS_MS) {
      dueSoon = true;
      reasons.push('Membership due soon');
    }
  }

  // Active borrows
  let bookOverdue = false;
  let bookDueSoon = false;
  borrows.forEach((b) => {
    if (!b.dueDate) return;
    const diff = new Date(b.dueDate).getTime() - now;
    if (diff < 0) bookOverdue = true;
    else if (diff < SEVEN_DAYS_MS) bookDueSoon = true;
  });
  if (bookOverdue) {
    overdue = true;
    reasons.push('Book overdue');
  } else if (bookDueSoon) {
    dueSoon = true;
    reasons.push('Book due soon');
  }

  return {
    level: overdue ? 'overdue' : dueSoon ? 'dueSoon' : 'ok',
    reasons,
  };
};

function UsersListPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { makeRequest } = useApi();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [busyBorrowId, setBusyBorrowId] = useState(null);

  const canManage = useMemo(
    () => user?.role === 'admin' || user?.role === 'librarian',
    [user]
  );
  const isAdmin = user?.role === 'admin';

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(({ user: u }) => getFullName(u).toLowerCase().includes(q));
  }, [rows, search]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Fetch all users (limit is capped at 100 per request).
      const first = await makeRequest(() => userService.getAllUsers(1, 100), { showError: false });
      let users = first.data.users || [];
      const pages = first.pagination?.pages || 1;
      for (let p = 2; p <= pages; p += 1) {
        const next = await makeRequest(() => userService.getAllUsers(p, 100), { showError: false });
        users = users.concat(next.data.users || []);
      }

      // Fetch each user's active borrows to compute due/overdue state.
      const enriched = await Promise.all(
        users.map(async (u) => {
          let borrows = [];
          try {
            const res = await borrowService.getUserActiveBorrows(u._id, 1, 100);
            borrows = res.data?.borrows || [];
          } catch (error) {
            console.error(`Failed to load borrows for ${u._id}:`, error);
          }
          return { user: u, borrows, alert: computeAlert(u, borrows) };
        })
      );

      setRows(enriched);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user "${getFullName(u)}"? This cannot be undone.`)) {
      return;
    }
    try {
      setDeletingId(u._id);
      await makeRequest(() => userService.deleteUser(u._id), {
        successMessage: 'User deleted successfully',
      });
      setRows((prev) => prev.filter((r) => r.user._id !== u._id));
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleReturn = async (userId, borrow) => {
    try {
      setBusyBorrowId(borrow._id);
      await makeRequest(() => borrowService.returnBook(borrow._id), {
        successMessage: 'Book returned successfully',
      });
      // Drop the returned borrow and recompute the user's alert level.
      setRows((prev) =>
        prev.map((r) => {
          if (r.user._id !== userId) return r;
          const borrows = r.borrows.filter((x) => x._id !== borrow._id);
          return { ...r, borrows, alert: computeAlert(r.user, borrows) };
        })
      );
    } catch (error) {
      console.error('Failed to return book:', error);
    } finally {
      setBusyBorrowId(null);
    }
  };

  const handleRenew = async (userId, borrow) => {
    try {
      setBusyBorrowId(borrow._id);
      const res = await makeRequest(() => borrowService.renewBook(borrow._id), {
        successMessage: 'Book renewed successfully',
      });
      const updated = res?.data?.borrowRecord;
      // Update the due date / renewal count and recompute the alert level.
      setRows((prev) =>
        prev.map((r) => {
          if (r.user._id !== userId) return r;
          const borrows = r.borrows.map((x) =>
            x._id === borrow._id
              ? {
                  ...x,
                  dueDate: updated?.dueDate ?? x.dueDate,
                  renewalCount: updated?.renewalCount ?? x.renewalCount,
                }
              : x
          );
          return { ...r, borrows, alert: computeAlert(r.user, borrows) };
        })
      );
    } catch (error) {
      console.error('Failed to renew book:', error);
    } finally {
      setBusyBorrowId(null);
    }
  };

  const rowClass = (level) => {
    if (level === 'overdue') return 'table-danger';
    if (level === 'dueSoon') return 'table-warning';
    return '';
  };

  if (!canManage) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
        <i className="bi bi-shield-lock"></i>
        You do not have permission to view users.
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 className="h2 fw-bold mb-0">Users</h1>
        <div className="d-flex align-items-center gap-3 small">
          <span className="d-inline-flex align-items-center gap-1">
            <span className="badge text-bg-warning">&nbsp;</span> Due within 7 days
          </span>
          <span className="d-inline-flex align-items-center gap-1">
            <span className="badge text-bg-danger">&nbsp;</span> Overdue
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="input-group mb-3">
        <span className="input-group-text"><i className="bi bi-search"></i></span>
        <input
          type="text"
          className="form-control"
          placeholder="Search by full name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading}
        />
        {search && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setSearch('')}
            aria-label="Clear search"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary me-2" role="status" aria-hidden="true"></div>
          <span className="fs-5 text-secondary">Loading users...</span>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <i className="bi bi-people fs-1 d-block mb-2"></i>
          <p className="fs-5 mb-0">No users found</p>
        </div>
      ) : (
        <div className="card border shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="text-uppercase small text-secondary">Full Name</th>
                  <th className="text-uppercase small text-secondary">Email</th>
                  <th className="text-uppercase small text-secondary">Alerts</th>
                  <th className="text-uppercase small text-secondary text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-secondary py-4">
                      No users match &ldquo;{search}&rdquo;
                    </td>
                  </tr>
                )}
                {filteredRows.map(({ user: u, borrows, alert }) => (
                  <Fragment key={u._id}>
                    <tr className={rowClass(alert.level)}>
                      <td>
                        <div className="fw-medium">{getFullName(u)}</div>
                        <div className="small text-secondary text-capitalize">{u.role}</div>
                      </td>
                      <td className="text-break">{u.email}</td>
                      <td>
                        {alert.reasons.length === 0 ? (
                          <span className="badge text-bg-success">OK</span>
                        ) : (
                          <div className="d-flex flex-wrap gap-1">
                            {alert.reasons.map((r) => (
                              <span
                                key={r}
                                className={`badge ${r.includes('overdue') ? 'text-bg-danger' : 'text-bg-warning'}`}
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="text-end text-nowrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary me-1"
                          onClick={() => setExpandedId(expandedId === u._id ? null : u._id)}
                          aria-label={`View books for ${getFullName(u)}`}
                          title="View books"
                        >
                          <i className={`bi ${expandedId === u._id ? 'bi-chevron-up' : 'bi-journal-text'}`}></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => navigate(`/users/edit/${u._id}`)}
                          aria-label={`Edit ${getFullName(u)}`}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(u)}
                            disabled={deletingId === u._id}
                            aria-label={`Delete ${getFullName(u)}`}
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedId === u._id && (
                      <tr key={`${u._id}-books`}>
                        <td colSpan={4} className="bg-light">
                          <div className="p-2">
                            <div className="fw-medium mb-2">
                              <i className="bi bi-journal-text me-1"></i>
                              Active borrows ({borrows.length})
                            </div>
                            {borrows.length === 0 ? (
                              <p className="text-secondary small mb-0">No active borrows.</p>
                            ) : (
                              <ul className="list-group list-group-flush">
                                {borrows.map((b) => {
                                  const overdue = b.dueDate && new Date(b.dueDate).getTime() < Date.now();
                                  const busy = busyBorrowId === b._id;
                                  const maxRenewalsReached = (b.renewalCount ?? 0) >= 3;
                                  return (
                                    <li
                                      key={b._id}
                                      className="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2 bg-transparent px-0"
                                    >
                                      <span className="me-auto">{b.book?.title || 'Unknown book'}</span>
                                      <span className={`badge ${overdue ? 'text-bg-danger' : 'text-bg-secondary'}`}>
                                        Due {b.dueDate ? new Date(b.dueDate).toLocaleDateString() : 'N/A'}
                                      </span>
                                      <div className="btn-group btn-group-sm" role="group">
                                        <button
                                          type="button"
                                          className="btn btn-outline-success d-inline-flex align-items-center gap-1"
                                          onClick={() => handleReturn(u._id, b)}
                                          disabled={busy}
                                        >
                                          <i className="bi bi-box-arrow-in-left"></i> Return
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
                                          onClick={() => handleRenew(u._id, b)}
                                          disabled={busy || maxRenewalsReached}
                                          title={maxRenewalsReached ? 'Maximum renewals reached' : 'Renew for 14 days'}
                                        >
                                          <i className="bi bi-arrow-repeat"></i> Renew
                                        </button>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersListPage;
