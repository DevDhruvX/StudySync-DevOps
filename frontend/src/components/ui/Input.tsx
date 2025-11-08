import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  name?: string;
  icon?: LucideIcon;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  name,
  icon: Icon,
  error,
  disabled = false,
  required = false,
  readOnly = false,
  className = ''
}) => {
  const [focused, setFocused] = React.useState(false);

  const inputClasses = `
    w-full px-4 py-3 border rounded-lg transition-all duration-200
    ${Icon ? 'pl-12' : 'pl-4'}
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }
    ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    ${className}
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon className={`w-5 h-5 ${focused ? 'text-blue-500' : 'text-gray-400'} transition-colors duration-200`} />
          </div>
        )}
        
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          className={inputClasses}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};