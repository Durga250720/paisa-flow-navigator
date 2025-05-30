
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { config } from '../config/environment';

const EmploymentInfo = () => {
  const [formData, setFormData] = useState({
    employmentType: '',
    industry: '',
    companyName: '',
    jobRole: '',
    monthlyIncome: '',
    workExperience: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const bankInfoCompleted = localStorage.getItem('bankInfoCompleted');
    
    if (!authToken || !bankInfoCompleted) {
      navigate('/');
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employmentType) newErrors.employmentType = 'Employment type is required';
    if (!formData.industry) newErrors.industry = 'Industry is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.jobRole.trim()) newErrors.jobRole = 'Job role is required';
    if (!formData.monthlyIncome.trim()) newErrors.monthlyIncome = 'Monthly income is required';
    if (!formData.workExperience.trim()) newErrors.workExperience = 'Work experience is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('API call to:', config.baseURL + '/employment-info', formData);
      localStorage.setItem('employmentInfoCompleted', 'true');
      navigate('/loan-application-status');
    } catch (err) {
      setErrors({ submit: 'Failed to save employment information. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen pt-20 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl w-full mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Employment Info</h1>
            <p className="text-gray-600">To deposit your approved amount and enable auto-repayment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) => handleInputChange('employmentType', e.target.value)}
                className="input-field"
              >
                <option value="">Select Employment type</option>
                <option value="salaried">Salaried</option>
                <option value="self-employed">Self Employed</option>
                <option value="business">Business</option>
              </select>
              {errors.employmentType && <p className="error-message">{errors.employmentType}</p>}
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="input-field"
              >
                <option value="">Select Industry type</option>
                <option value="it">Information Technology</option>
                <option value="banking">Banking & Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
              </select>
              {errors.industry && <p className="error-message">{errors.industry}</p>}
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Enter the Company Name"
                className="input-field"
              />
              {errors.companyName && <p className="error-message">{errors.companyName}</p>}
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Role / Designation
              </label>
              <input
                type="text"
                value={formData.jobRole}
                onChange={(e) => handleInputChange('jobRole', e.target.value)}
                placeholder="Enter the Job Role"
                className="input-field"
              />
              {errors.jobRole && <p className="error-message">{errors.jobRole}</p>}
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Income (Take-home) *
              </label>
              <input
                type="text"
                value={formData.monthlyIncome}
                onChange={(e) => handleInputChange('monthlyIncome', e.target.value.replace(/\D/g, ''))}
                placeholder="Enter the Month Income"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">Net monthly salary after tax</p>
              {errors.monthlyIncome && <p className="error-message">{errors.monthlyIncome}</p>}
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Experience *
              </label>
              <input
                type="text"
                value={formData.workExperience}
                onChange={(e) => handleInputChange('workExperience', e.target.value)}
                placeholder="Enter the Work Experience"
                className="input-field"
              />
              {errors.workExperience && <p className="error-message">{errors.workExperience}</p>}
            </div>
          </div>

          {errors.submit && <p className="error-message text-center mt-4">{errors.submit}</p>}

          <button
            onClick={handleContinue}
            disabled={loading}
            className="primary-button w-full mt-8"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmploymentInfo;
