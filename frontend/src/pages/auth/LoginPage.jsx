/**
 * Login Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { loginSuccess } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

const validationSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await authService.login(data.email, data.password);
      
      dispatch(loginSuccess({
        user: response.data.user,
        token: response.data.token,
        refreshToken: response.data.refreshToken,
      }));

      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-primary bg-gradient p-4">
      <div className="card shadow-lg border-0 w-100" style={{ maxWidth: '28rem' }}>
        <div className="card-body p-4 p-md-5">
          <h1 className="h3 fw-bold text-center mb-4 d-flex align-items-center justify-content-center gap-2">
            <i className="bi bi-book-half text-primary"></i>
            Library Management
          </h1>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label fw-medium">Email</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                <input
                  type="email"
                  {...register('email')}
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="your@email.com"
                />
                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Password</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                <input
                  type="password"
                  {...register('password')}
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                />
                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-100 fw-semibold"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-secondary mt-4 mb-0">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="btn btn-link p-0 fw-semibold align-baseline"
            >
              Register here
            </button>
          </p>
          <p className="text-center text-secondary mt-4 mb-0">
            App Version: <span className="fw-semibold">{appVersion}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
