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
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
        You do not have permission to manage books.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-300">Book Management</p>
            <h1 className="mt-2 text-3xl font-semibold">
              {isEditMode ? 'Update an existing book' : 'Add or import new books'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Manage inventory in one place by creating a single title, updating an existing record, or importing several books at once.
            </p>
          </div>
          <button
            onClick={() => navigate('/books')}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
          >
            Back to Library
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{isEditMode ? 'Edit Book Details' : 'Create Book Entry'}</h2>
              <p className="mt-1 text-sm text-slate-500">Fields marked with * are required.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Title *</span>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                placeholder="The Great Gatsby"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Author *</span>
              <input
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                placeholder="F. Scott Fitzgerald"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">ISBN *</span>
              <input
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                placeholder="9780141182636"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Category *</span>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Publisher *</span>
              <input
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                placeholder="Penguin Books"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Published Year *</span>
              <input
                type="number"
                name="publishedYear"
                value={formData.publishedYear}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Language</span>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
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
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              >
                <option value="available">Available</option>
                <option value="borrowed">Borrowed</option>
                <option value="reserved">Reserved</option>
                <option value="damaged">Damaged</option>
                <option value="lost">Lost</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Total Copies *</span>
              <input
                type="number"
                name="totalCopies"
                value={formData.totalCopies}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Replacement Cost *</span>
              <input
                type="number"
                name="replacementCost"
                value={formData.replacementCost}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Pages</span>
              <input
                type="number"
                name="pages"
                value={formData.pages}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Weight (g)</span>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </label>
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              placeholder="Short summary of the book"
            />
          </label>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              disabled={submitting || loading}
            >
              {submitting ? 'Saving...' : isEditMode ? 'Update Book' : 'Create Book'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData(emptyForm);
                setIsEditMode(false);
              }}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Import Books</h2>
                <p className="mt-1 text-sm text-slate-500">Paste a JSON array of book objects to import in bulk.</p>
              </div>
            </div>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows="10"
              className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-mono text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              placeholder='[{"title":"Atomic Habits","author":"James Clear","isbn":"9780735211292","category":"Self Improvement","publisher":"Avery","publishedYear":2018,"totalCopies":5,"replacementCost":25}]'
            />

            <button
              type="button"
              onClick={handleImport}
              className="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              disabled={importing}
            >
              {importing ? 'Importing...' : 'Import Books'}
            </button>

            {importSummary && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                Imported {importSummary.count} book(s).{importSummary.titles.length > 0 && <div className="mt-2">Examples: {importSummary.titles.join(', ')}</div>}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Import format</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Use a JSON array of objects.</li>
              <li>• Each item should include title, author, isbn, category, publisher, publishedYear, totalCopies, and replacementCost.</li>
              <li>• Category can be the category name or an existing category ID.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookFormPage;
