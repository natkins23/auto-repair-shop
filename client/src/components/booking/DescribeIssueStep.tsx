import { useState } from 'react';

interface DescribeIssueStepProps {
  issueDescription: string;
  onIssueChange: (description: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const COMMON_ISSUES = [
  'Oil change needed',
  'Check engine light is on',
  'Brake pads need replacement',
  'Strange noise when braking',
  'Car is overheating',
  'Battery issues / won\'t start',
  'Tire rotation or replacement',
  'Transmission problems',
  'Suspension feels rough',
  'Air conditioning not working',
];

const DescribeIssueStep = ({
  issueDescription,
  onIssueChange,
  onNext,
  onBack,
}: DescribeIssueStepProps) => {
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (issueDescription.trim().length < 10) {
      setError('Please provide a more detailed description (at least 10 characters)');
      return;
    }
    setError('');
    onNext();
  };

  const handleIssueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onIssueChange(e.target.value);
    if (error && e.target.value.trim().length >= 10) {
      setError('');
    }
  };

  const handleQuickIssueClick = (issue: string) => {
    onIssueChange(issueDescription ? `${issueDescription}\n${issue}` : issue);
    if (error && issue.length >= 10) {
      setError('');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Describe Your Issue</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="issue" className="block text-sm font-medium text-gray-700 mb-1">
            What's wrong with your vehicle?
          </label>
          <textarea
            id="issue"
            name="issue"
            rows={5}
            value={issueDescription}
            onChange={handleIssueChange}
            className={`block w-full rounded-md shadow-sm ${
              error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'
            } sm:text-sm`}
            placeholder="Please describe the issue with your vehicle in detail. The more information you provide, the better we can prepare for your service."
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <p className="mt-2 text-sm text-gray-500">
            Include any symptoms, when they started, and any relevant details.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Common Issues (Click to add)</h3>
          <div className="flex flex-wrap gap-2">
            {COMMON_ISSUES.map((issue) => (
              <button
                key={issue}
                type="button"
                onClick={() => handleQuickIssueClick(issue)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {issue}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default DescribeIssueStep;
