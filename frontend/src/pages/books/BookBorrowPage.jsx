/**
 * Book Borrow Page
 * Issue a book to a member (librarian / admin)
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useApi } from '../../hooks/useCustom';
import bookService from '../../services/bookService';
import borrowService from '../../services/borrowService';
import userService from '../../services/userService';

const getUserLabel = (u) =>
  u ? `${u.firstName} ${u.lastName}`.trim() || u.email || u._id : '';

function BookBorrowPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { makeRequest } = useApi();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // User selection (searchable dropdown)
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const canManageBooks = useMemo(
    () => user?.role === 'admin' || user?.role === 'librarian',
    [user]
  );

  // issuedBy is the currently logged-in librarian / admin
  const issuedBy = user?._id || '';
  const issuedByName = user ? `${user.firstName} ${user.lastName}` : '';

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const response = await makeRequest(() => bookService.getBookById(id), { showError: false });
        setBook(response.data.book || response.data);
      } catch (error) {
        console.error('Failed to fetch book details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBook();
    }
  }, [id, makeRequest]);

  // Fetch all available users (paginated, limit is capped at 100 per request)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const first = await makeRequest(() => userService.getAllUsers(1, 100), { showError: false });
        let all = first.data.users || [];
        const pages = first.pagination?.pages || 1;

        for (let p = 2; p <= pages; p += 1) {
          const next = await makeRequest(() => userService.getAllUsers(p, 100), { showError: false });
          all = all.concat(next.data.users || []);
        }

        setUsers(all);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [makeRequest]);

  // Close the dropdown when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? users.filter((u) => {
          const name = `${u.firstName} ${u.lastName}`.toLowerCase();
          return name.includes(q) || (u.email || '').toLowerCase().includes(q);
        })
      : users;
    return list.slice(0, 50);
  }, [users, query]);

  const selectUser = (u) => {
    setUserId(u._id);
    setQuery(getUserLabel(u));
    setOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canManageBooks) {
      return;
    }

    if (!id) {
      await makeRequest(() => Promise.reject(new Error('Book ID is missing.')), { showError: true });
      return;
    }

    if (!userId) {
      await makeRequest(() => Promise.reject(new Error('Please select a user.')), { showError: true });
      return;
    }

    try {
      setSubmitting(true);
      // book_id, user_id and issuedby
      await makeRequest(() => borrowService.borrowBook(id, userId, issuedBy), {
        successMessage: 'Book borrowed successfully',
      });
      navigate('/books');
    } catch (error) {
      console.error('Failed to borrow book:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!canManageBooks) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
        <i className="bi bi-shield-lock"></i>
        You do not have permission to issue books.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary me-2" role="status" aria-hidden="true"></div>
        <span className="fs-5 text-secondary">Loading book...</span>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-5">
        <p className="fs-5 text-secondary">Book not found.</p>
        <button type="button" onClick={() => navigate('/books')} className="btn btn-primary mt-2">
          Back to Books
        </button>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-8 col-xl-6">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="h2 fw-bold mb-0">Borrow Book</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-link p-0 d-inline-flex align-items-center gap-1 text-decoration-none"
          >
            <i className="bi bi-arrow-left"></i> Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card border shadow-sm">
          <div className="card-body p-4">
            {/* Book summary */}
            <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded">
              <i className="bi bi-book display-6 text-primary mb-0"></i>
              <div>
                <div className="fw-semibold">{book.title}</div>
                <div className="small text-secondary">by {book.author}</div>
                <div className="small text-secondary">
                  Available copies: {book.availableCopies ?? 'N/A'}
                </div>
              </div>
            </div>

            {/* Book ID */}
            <div className="mb-3">
              <label className="form-label fw-medium">Book ID</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-upc-scan"></i></span>
                <input type="text" className="form-control" value={book.isbn} readOnly />
              </div>
            </div>

            {/* User (borrower) - searchable dropdown */}
            <div className="mb-3" ref={dropdownRef}>
              <label className="form-label fw-medium">User *</label>
              <div className="dropdown">
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-person"></i></span>
                  <input
                    type="text"
                    className="form-control"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setUserId('');
                      setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder={usersLoading ? 'Loading users...' : 'Search by user name...'}
                    disabled={usersLoading}
                    autoComplete="off"
                  />
                  {usersLoading && (
                    <span className="input-group-text">
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    </span>
                  )}
                </div>

                {open && !usersLoading && (
                  <ul
                    className="dropdown-menu show w-100 overflow-auto shadow-sm mt-1"
                    style={{ maxHeight: '16rem' }}
                  >
                    {filteredUsers.length === 0 ? (
                      <li><span className="dropdown-item-text text-secondary">No users found</span></li>
                    ) : (
                      filteredUsers.map((u) => (
                        <li key={u._id}>
                          <button
                            type="button"
                            className={`dropdown-item d-flex justify-content-between align-items-center ${u._id === userId ? 'active' : ''}`}
                            onClick={() => selectUser(u)}
                          >
                            <span>
                              <span className="d-block">{getUserLabel(u)}</span>
                              {/* <small className={u._id === userId ? 'text-white-50' : 'text-secondary'}>{u.email}</small> */}
                            </span>
                            {/* {u.role && (
                              <span className="badge text-bg-light text-capitalize ms-2">{u.role}</span>
                            )} */}
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
              <div className="form-text">The member who is borrowing this book.</div>
            </div>

            {/* Issued By */}
            <div className="mb-4">
              <label className="form-label fw-medium">Issued By</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person-badge"></i></span>
                <input
                  type="text"
                  className="form-control"
                  value={issuedByName ? `${issuedByName} (${issuedBy})` : issuedBy}
                  readOnly
                />
              </div>
              <div className="form-text">The librarian / admin issuing the book.</div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button
                type="submit"
                className="btn btn-success d-inline-flex align-items-center gap-2"
                disabled={submitting || usersLoading}
              >
                <i className="bi bi-journal-arrow-down"></i>
                {submitting ? 'Borrowing...' : 'Borrow Book'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/books')}
                className="btn btn-outline-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookBorrowPage;
