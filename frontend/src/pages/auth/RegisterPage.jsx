/**
 * Register Page
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
  firstName: yup.string().required('First name is required').min(2, 'Minimum 2 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Minimum 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required').matches(/^[0-9]{10}$/, 'Invalid phone number'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);

      dispatch(loginSuccess({
        user: response.data.user,
        token: response.data.token,
        refreshToken: response.data.refreshToken,
      }));

      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-primary bg-gradient p-4">
      <div className="card shadow-lg border-0 w-100" style={{ maxWidth: '32rem' }}>
        <div className="card-body p-4 p-md-5">
          <h1 className="h3 fw-bold text-center mb-4 d-flex align-items-center justify-content-center gap-2">
            <i className="bi bi-person-plus text-primary"></i>
            Create Account
          </h1>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label fw-medium">First Name</label>
                <input
                  type="text"
                  {...register('firstName')}
                  className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                />
                {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
              </div>
              <div className="col-6">
                <label className="form-label fw-medium">Last Name</label>
                <input
                  type="text"
                  {...register('lastName')}
                  className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                />
                {errors.lastName && <div className="invalid-feedback">{errors.lastName.message}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium">Email</label>
              <input
                type="email"
                {...register('email')}
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              />
              {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium">Phone</label>
              <input
                type="tel"
                {...register('phone')}
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium">Password</label>
              <input
                type="password"
                {...register('password')}
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              />
              {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Confirm Password</label>
              <input
                type="password"
                {...register('confirmPassword')}
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              />
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-100 fw-semibold"
            >
              {isLoading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-secondary mt-4 mb-0">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn btn-link p-0 fw-semibold align-baseline"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
