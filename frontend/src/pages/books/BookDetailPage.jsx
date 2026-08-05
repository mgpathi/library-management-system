/**
 * Book Detail Page
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useCustom';
import bookService from '../../services/bookService';

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { makeRequest } = useApi();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">Book not found.</p>
        <button
          onClick={() => navigate('/books')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Books
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600"
        >
          ← Back
        </button>
        <button
          onClick={() => navigate(`/books/edit/${book._id}`)}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Edit Book
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <div className="bg-gray-100 rounded-lg overflow-hidden h-full">
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="h-full flex items-center justify-center text-6xl">📚</div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
          <p className="text-gray-600 mt-2">by {book.author}</p>
          <p className="text-sm text-gray-500 mt-1">ISBN: {book.isbn || 'N/A'}</p>
          <p className="text-sm text-gray-500">
            Category: {typeof book.category === 'object' && book.category !== null ? book.category.name : book.category || 'N/A'}
          </p>
          <p className="text-sm text-gray-500">Available copies: {book.availableCopies ?? 'N/A'}</p>

          <div className="mt-6 text-gray-700 space-y-4">
            <p>{book.description || 'No description available.'}</p>
            {book.publisher && <p><strong>Publisher:</strong> {book.publisher}</p>}
            {book.publishedDate && <p><strong>Published:</strong> {new Date(book.publishedDate).toLocaleDateString()}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;
