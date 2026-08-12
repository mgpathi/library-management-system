import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useApi } from '../../hooks/useCustom';
import bookService from '../../services/bookService';
import categoryService from '../../services/categoryService';

const emptyForm = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  publisher: '',
  publishedYear: new Date().getFullYear().toString(),
  language: 'English',
  totalCopies: '1',
  replacementCost: '0',
  description: '',
  pages: '',
  weight: '',
  status: 'available',
};

function BookFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { makeRequest, loading } = useApi();

  const [formData, setFormData] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(Boolean(id));

  const canManageBooks = useMemo(() => {
    return user?.role === 'admin' || user?.role === 'librarian';
  }, [user]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data?.categories || []);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    const loadBook = async () => {
      if (!id) return;

      try {
        const response = await makeRequest(() => bookService.getBookById(id), { showError: false });
        const book = response.data?.book || response.data;
        setFormData({
          title: book.title || '',
          author: book.author || '',
          isbn: book.isbn || '',
          category: book.category?._id || book.category || '',
          publisher: book.publisher || '',
          publishedYear: book.publishedYear?.toString() || '',
          language: book.language || 'English',
          totalCopies: book.totalCopies?.toString() || '1',
          replacementCost: book.replacementCost?.toString() || '0',
          description: book.description || '',
          pages: book.pages?.toString() || '',
          weight: book.weight?.toString() || '',
          status: book.status || 'available',
        });
      } catch (error) {
        console.error('Failed to load book:', error);
      }
    };

    loadCategories();
    loadBook();
  }, [id, makeRequest]);

  useEffect(() => {
    setIsEditMode(Boolean(id));
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = (data) => {
    const payload = {
      title: data.title.trim(),
      author: data.author.trim(),
      isbn: data.isbn.trim(),
      category: data.category,
      publisher: data.publisher.trim(),
      publishedYear: Number(data.publishedYear),
      language: data.language,
      totalCopies: Number(data.totalCopies),
      replacementCost: Number(data.replacementCost),
      description: data.description.trim(),
      status: data.status,
    };

    if (data.pages) payload.pages = Number(data.pages);
    if (data.weight) payload.weight = Number(data.weight);

    return payload;
  };

  const validateForm = (data) => {
    if (!data.title || !data.author || !data.isbn || !data.category || !data.publisher) {
      return 'Please complete the required book details.';
    }

    if (!Number(data.publishedYear) || Number(data.publishedYear) < 1000) {
      return 'Please enter a valid published year.';
    }

    if (!Number(data.totalCopies) || Number(data.totalCopies) < 1) {
      return 'Total copies must be at least 1.';
    }

    if (!Number(data.replacementCost) || Number(data.replacementCost) < 0) {
      return 'Replacement cost must be a positive number.';
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canManageBooks) {
      return;
    }

    const validationError = validateForm(formData);
    if (validationError) {
      await makeRequest(() => Promise.reject(new Error(validationError)), { showError: true });
      return;
    }

    try {
      setSubmitting(true);
      const payload = buildPayload(formData);

      if (isEditMode) {
        await makeRequest(() => bookService.updateBook(id, payload), {
          successMessage: 'Book updated successfully',
        });
      } else {
        await makeRequest(() => bookService.createBook(payload), {
          successMessage: 'Book created successfully',
        });
      }

      navigate('/books');
    } catch (error) {
      console.error('Failed to save book:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      await makeRequest(() => Promise.reject(new Error('Paste a JSON array of books to import.')), {
        showError: true,
      });
      return;
    }

    try {
      setImporting(true);
      let parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }

      const categoryLookup = new Map(categories.map((category) => [category.name?.toLowerCase(), category._id]));
      const imported = [];

      for (const item of parsed) {
        const normalizedCategory = item.category && categoryLookup.get(String(item.category).toLowerCase())
          ? categoryLookup.get(String(item.category).toLowerCase())
          : item.category;

        const payload = buildPayload({
          ...emptyForm,
          ...item,
          category: normalizedCategory || '',
          publishedYear: item.publishedYear?.toString() || emptyForm.publishedYear,
          totalCopies: item.totalCopies?.toString() || '1',
          replacementCost: item.replacementCost?.toString() || '0',
        });

        if (!payload.title || !payload.author || !payload.isbn || !payload.category || !payload.publisher) {
          continue;
        }

        await bookService.createBook(payload);
        imported.push(payload.title);
      }

      setImportSummary({ count: imported.length, titles: imported.slice(0, 5) });
      setImportText('');
    } catch (error) {
      console.error('Failed to import books:', error);
      await makeRequest(() => Promise.reject(error), { showError: true });
    } finally {
      setImporting(false);
    }
  };

  if (!canManageBooks) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
        <i className="bi bi-shield-lock"></i>
        You do not have permission to manage books.
      </div>
    );
  }

  return (
    <div className="vstack gap-4">
      <div className="card border-0 shadow bg-dark text-white">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <p className="small text-uppercase text-white-50 mb-2" style={{ letterSpacing: '0.35em' }}>Book Management</p>
              <h1 className="h3 fw-semibold mb-2">
                {isEditMode ? 'Update an existing book' : 'Add or import new books'}
              </h1>
              <p className="small text-white-50 mb-0" style={{ maxWidth: '42rem' }}>
                Manage inventory in one place by creating a single title, updating an existing record, or importing several books at once.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/books')}
              className="btn btn-outline-light rounded-pill d-inline-flex align-items-center gap-2"
            >
              <i className="bi bi-arrow-left"></i> Back to Library
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <form onSubmit={handleSubmit} className="card border shadow-sm">
            <div className="card-body p-4">
              <div className="mb-4">
                <h2 className="h5 fw-semibold mb-1">{isEditMode ? 'Edit Book Details' : 'Create Book Entry'}</h2>
                <p className="small text-secondary mb-0">Fields marked with * are required.</p>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">Title *</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="The Great Gatsby"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Author *</label>
                  <input
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="F. Scott Fitzgerald"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">ISBN *</label>
                  <input
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="9780141182636"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Publisher *</label>
                  <input
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Penguin Books"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Published Year *</label>
                  <input
                    type="number"
                    name="publishedYear"
                    value={formData.publishedYear}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Language</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="available">Available</option>
                    <option value="borrowed">Borrowed</option>
                    <option value="reserved">Reserved</option>
                    <option value="damaged">Damaged</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Total Copies *</label>
                  <input
                    type="number"
                    name="totalCopies"
                    value={formData.totalCopies}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Replacement Cost *</label>
                  <input
                    type="number"
                    name="replacementCost"
                    value={formData.replacementCost}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Pages</label>
                  <input
                    type="number"
                    name="pages"
                    value={formData.pages}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Weight (g)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="form-label fw-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="form-control"
                  placeholder="Short summary of the book"
                />
              </div>

              <div className="d-flex flex-wrap gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-dark d-inline-flex align-items-center gap-2"
                  disabled={submitting || loading}
                >
                  <i className="bi bi-save"></i>
                  {submitting ? 'Saving...' : isEditMode ? 'Update Book' : 'Create Book'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(emptyForm);
                    setIsEditMode(false);
                  }}
                  className="btn btn-outline-secondary"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="col-12 col-xl-5">
          <div className="vstack gap-4">
            <div className="card border shadow-sm">
              <div className="card-body p-4">
                <h2 className="h5 fw-semibold mb-1">Import Books</h2>
                <p className="small text-secondary">Paste a JSON array of book objects to import in bulk.</p>

                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows="10"
                  className="form-control font-monospace small"
                  placeholder='[{"title":"Atomic Habits","author":"James Clear","isbn":"9780735211292","category":"Self Improvement","publisher":"Avery","publishedYear":2018,"totalCopies":5,"replacementCost":25}]'
                />

                <button
                  type="button"
                  onClick={handleImport}
                  className="btn btn-success d-inline-flex align-items-center gap-2 mt-3"
                  disabled={importing}
                >
                  <i className="bi bi-upload"></i>
                  {importing ? 'Importing...' : 'Import Books'}
                </button>

                {importSummary && (
                  <div className="alert alert-success mt-3 mb-0" role="alert">
                    Imported {importSummary.count} book(s).{importSummary.titles.length > 0 && <div className="mt-2">Examples: {importSummary.titles.join(', ')}</div>}
                  </div>
                )}
              </div>
            </div>

            <div className="card border shadow-sm bg-light">
              <div className="card-body p-4">
                <h3 className="h6 fw-semibold mb-3">Import format</h3>
                <ul className="small text-secondary mb-0 ps-3">
                  <li className="mb-2">Use a JSON array of objects.</li>
                  <li className="mb-2">Each item should include title, author, isbn, category, publisher, publishedYear, totalCopies, and replacementCost.</li>
                  <li>Category can be the category name or an existing category ID.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookFormPage;
