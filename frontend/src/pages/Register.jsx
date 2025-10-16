import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { register: registerUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
  // Send role if selected; backend will decide whether to honor it.
  const payload = { name: data.name, email: data.email, password: data.password, mobile: data.mobile, role: data.role };

    const res = await registerUser(payload);
    setIsLoading(false);
    if (res.success) {
      if (isAdmin) {
        // Admin created a user; stay on the page and show a success toast handled by context
        return;
      }
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create your account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="input-field"
              placeholder="John Doe"
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input-field"
              placeholder="you@example.com"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              className="input-field"
              placeholder="+1 555 123 4567"
              {...register('mobile', { required: 'Mobile is required' })}
            />
            {errors.mobile && <p className="text-sm text-red-600 mt-1">{errors.mobile.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input-field"
              placeholder="********"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
            />
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="input-field"
              placeholder="********"
              {...register('confirmPassword', { required: 'Please confirm your password', validate: (v) => v === password || 'Passwords do not match' })}
            />
            {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select id="role" {...register('role')} className="input-field">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Note: creating an admin account may be restricted on this server.</p>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
            {isLoading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link className="text-primary-600 hover:underline" to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;


