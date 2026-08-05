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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Books</h1>
        {(user?.role === 'admin' || user?.role === 'librarian') && (
          <button
            onClick={() => navigate('/books/new')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Add Book
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search books..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">Loading books...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">No books found</p>
        </div>
      ) : (
        <>
          <div className="mb-8 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Copies</th>
                  {(user?.role === 'admin' || user?.role === 'librarian') && (
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {books.map((book) => (
                  <tr
                    key={book._id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/books/${book._id}`)}
                  >
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="font-medium text-gray-900">{book.title}</div>
                      <div className="text-sm text-gray-500">{book.isbn}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">{book.author}</td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium text-white ${book.availableCopies > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                        {book.availableCopies > 0 ? 'Available' : 'Out'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                      {book.availableCopies} / {book.totalCopies ?? book.availableCopies}
                    </td>
                    {(user?.role === 'admin' || user?.role === 'librarian') && (
                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/books/edit/${book._id}`);
                          }}
                          className="rounded-full p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                          aria-label={`Edit ${book.title}`}
                        >
                          ✏️
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center gap-3">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[42px] rounded-lg px-4 py-2 text-sm font-medium transition ${
                    page === p
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BooksListPage;
