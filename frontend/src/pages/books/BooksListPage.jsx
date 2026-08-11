/**
 * Books List Page
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useCustom';
import bookService from '../../services/bookService';
import { useSelector } from 'react-redux';

function BooksListPage() {
  const navigate = useNavigate();
  const { makeRequest } = useApi();
  const { user } = useSelector((state) => state.auth);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await makeRequest(
          () => bookService.getAllBooks(page, 10, { search }),
          { showError: false }
        );
        setBooks(response.data.books);
        setTotalPages(response.pagination.pages);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [page, search]);

  const canManage = user?.role === 'admin' || user?.role === 'librarian';

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 fw-bold mb-0">Books</h1>
        {canManage && (
          <button
            type="button"
            onClick={() => navigate('/books/new')}
            className="btn btn-primary d-inline-flex align-items-center gap-2"
          >
            <i className="bi bi-plus-lg"></i>
            Add Book
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="input-group mb-4">
        <span className="input-group-text"><i className="bi bi-search"></i></span>
        <input
          type="text"
          placeholder="Search books..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="form-control"
        />
      </div>

      {/* Books Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary me-2" role="status" aria-hidden="true"></div>
          <span className="fs-5 text-secondary">Loading books...</span>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <i className="bi bi-inbox fs-1 d-block mb-2"></i>
          <p className="fs-5 mb-0">No books found</p>
        </div>
      ) : (
        <>
          <div className="card border shadow-sm mb-4">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="text-uppercase small text-secondary" style={{ width: '40%' }}>Title</th>
                    <th className="text-uppercase small text-secondary" style={{ width: '20%' }}>Author</th>
                    <th className="text-uppercase small text-secondary">Status</th>
                    <th className="text-uppercase small text-secondary">Copies</th>
                    {canManage && (
                      <th className="text-uppercase small text-secondary text-end">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr
                      key={book._id}
                      role="button"
                      onClick={() => navigate(`/books/${book._id}`)}
                    >
                      <td>
                        <div className="fw-medium text-truncate">{book.title}</div>
                        <div className="small text-secondary text-truncate">{book.isbn}</div>
                      </td>
                      <td className="text-secondary text-truncate">{book.author}</td>
                      <td>
                        <span className={`badge rounded-pill ${book.availableCopies > 0 ? 'text-bg-success' : 'text-bg-danger'}`}>
                          {book.availableCopies > 0 ? 'Available' : 'Out'}
                        </span>
                      </td>
                      <td className="text-secondary text-nowrap">
                        {book.availableCopies} / {book.totalCopies ?? book.availableCopies}
                      </td>
                      {canManage && (
                        <td className="text-end">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(`/books/edit/${book._id}`);
                            }}
                            className="btn btn-sm btn-outline-primary rounded-circle"
                            aria-label={`Edit ${book.title}`}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="d-flex justify-content-center">
              <ul className="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                    <button type="button" className="page-link" onClick={() => setPage(p)}>
                      {p}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

export default BooksListPage;
