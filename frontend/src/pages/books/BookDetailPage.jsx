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
      <div className="text-center py-5">
        <div className="spinner-border text-primary me-2" role="status" aria-hidden="true"></div>
        <span className="fs-5 text-secondary">Loading book details...</span>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-5">
        <p className="fs-5 text-secondary">Book not found.</p>
        <button
          type="button"
          onClick={() => navigate('/books')}
          className="btn btn-primary mt-2"
        >
          Back to Books
        </button>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-link p-0 d-inline-flex align-items-center gap-1 text-decoration-none"
          >
            <i className="bi bi-arrow-left"></i> Back
          </button>
          <button
            type="button"
            onClick={() => navigate(`/books/edit/${book._id}`)}
            className="btn btn-dark d-inline-flex align-items-center gap-2"
          >
            <i className="bi bi-pencil"></i> Edit Book
          </button>
        </div>

        <div className="row g-4">
          <div className="col-12 col-md-4 col-lg-3">
            <div className="bg-light rounded overflow-hidden d-flex align-items-center justify-content-center" style={{ minHeight: '18rem' }}>
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} className="img-fluid w-100 h-100 object-fit-cover" />
              ) : (
                <i className="bi bi-book display-1 text-secondary"></i>
              )}
            </div>
          </div>

          <div className="col-12 col-md-8 col-lg-9">
            <h1 className="h2 fw-bold mb-1">{book.title}</h1>
            <p className="text-secondary mb-2">by {book.author}</p>
            <p className="small text-secondary mb-1">ISBN: {book.isbn || 'N/A'}</p>
            <p className="small text-secondary mb-1">
              Category: {typeof book.category === 'object' && book.category !== null ? book.category.name : book.category || 'N/A'}
            </p>
            <p className="small text-secondary mb-0">Available copies: {book.availableCopies ?? 'N/A'}</p>

            <div className="mt-4 vstack gap-3">
              <p className="mb-0">{book.description || 'No description available.'}</p>
              {book.publisher && <p className="mb-0"><strong>Publisher:</strong> {book.publisher}</p>}
              {book.publishedDate && <p className="mb-0"><strong>Published:</strong> {new Date(book.publishedDate).toLocaleDateString()}</p>}
            </div>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-12 d-flex justify-content-start gap-3">
            <button
              type="button"
              className="btn btn-success"
              onClick={async () =>  navigate(`/books/borrow/${book._id}`)}   
            >
              Borrow
            </button>
            <button
              type="button"
              className="btn btn-warning"
              onClick={async () =>  navigate(`/books/return/${book._id}`)}
            >
              Return
            </button>
          </div>
          </div>
      </div>
    </div>
  );
}

export default BookDetailPage;
