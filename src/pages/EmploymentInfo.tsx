
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { config } from '../config/environment';
import styles from '../pages-styles/EmployemntInfo.module.css';
import { toast } from "sonner";

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

    if (!authToken) {
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

    const authToken = localStorage.getItem('authToken');
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const payload = {
        employmentType: formData.employmentType,
        industry: formData.industry,
        companyName: formData.companyName,
        designation: formData.jobRole,
        takeHomeSalary: parseInt(formData.monthlyIncome, 10) || 0,
        totalExperienceInMonths: parseInt(formData.workExperience, 10) || 0
      };

      const response = await fetch(config.baseURL + `borrower/${authToken}/update-employment`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to save employment information. Please try again.';
        throw new Error(errorMessage);
      }

      toast.success("Employment information saved successfully!");
      localStorage.setItem('employmentInfoCompleted', 'true');
      navigate('/bank-info');
    } catch (err) {
      setErrors({ submit: 'Failed to save employment information. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.navbarWrapper}>
        <Navbar />
      </div>

      <div className={styles.mainContainer}>
        {/* Left Panel - Image */}
        <div className={styles.leftPanel}>
          <div className={styles.imageContainer}>
            <img
              src="/lovable-uploads/8f598013-7362-496b-96a6-8a285565f544.png"
              alt="Happy customer with phone"
              className={styles.heroImage}
            />
          </div>
        </div>

        {/* Right Panel - Employment Form */}
        <div className={styles.rightPanel}>
          <div className={styles.employmentFormContainer}>
            <div className="text-center mb-2">
              <div className={styles.heading}>Employment Info</div>
              <p className={styles.description}>To deposit your approved amount and enable auto-repayment</p>
            </div>

            <div className={`space-y-6 ${styles.formContainer}`}>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type
                </label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  className="inputField1"
                >
                  <option value="">Select Employment Type</option>
                  <option value="SALARIED">Salaried</option>
                  <option value="SELF_EMPLOYED">Self Employed</option>
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
                  className="inputField1"
                >
                  <option value="">Select Industry Type</option>
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
                  Company Name <sup className="text-red-500">*</sup>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter the Company Name"
                  className="inputField1"
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
                  className="inputField1"
                />
                {errors.jobRole && <p className="error-message">{errors.jobRole}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Income (Take-Home) <sup className="text-red-500">*</sup>
                </label>
                <input
                  id="monthlyIncome"
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  placeholder="Enter the monthly income"
                  className="inputField1"
                />
                {errors.monthlyIncome && <p className="error-message">{errors.monthlyIncome}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="workExperience" className="block text-sm font-medium text-gray-700 mb-2">
                  Work Experience (Yrs) <sup className="text-red-500">*</sup>
                </label>
                <input
                  id="workExperience"
                  type="number"
                  value={formData.workExperience}
                  onChange={(e) => handleInputChange('workExperience', e.target.value)}
                  placeholder="Enter the work experience"
                  className="inputField1"
                />
                {errors.workExperience && <p className="error-message">{errors.workExperience}</p>}
              </div>
            </div>

            {errors.submit && <p className="error-message text-center mt-4">{errors.submit}</p>}

            <div className={`${styles.bottomContainer} text-center mt-2`}>
              <button
                onClick={handleContinue}
                disabled={loading}
                className="primary-button px-20"
              >
                {loading ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmploymentInfo;
