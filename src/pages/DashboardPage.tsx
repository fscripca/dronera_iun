import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Shield,
  Zap,
  Network,
  Download,
  Eye,
  X,
  Menu,
  LayoutDashboard,
  Home
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import DashboardSidebar from '../components/DashboardSidebar';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import KYCVerification from '../components/KYCVerification';
import StripePaymentForm from '../components/StripePaymentForm';
import CryptoPaymentForm from '../components/CryptoPaymentForm';

interface JVAgreement {
  id: string;
  title: string;
  partnerName: string;
  agreementType: string;
  status: string;
  startDate: string;
  endDate: string;
  value: number;
  documentUrl: string;
  publishedDate: string;
  version: number;
}

const DashboardPage: React.FC = () => {
  const { user, loading, signIn, signUp, signOut, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [jvAgreements, setJvAgreements] = useState<JVAgreement[]>([]);
  const [selectedAgreement, setSelectedAgreement] = useState<JVAgreement | null>(null);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'crypto'>('card');

  // Check authentication status
  useEffect(() => {
    if (user && !loading) {
      setIsAuthenticated(true);
      setEmail(user.email || '');
      
      // Load JV agreements
      loadJVAgreements();
    }
  }, [user, loading]);

  const loadJVAgreements = async () => {
    // Mock data for demonstration
    setJvAgreements([
      {
        id: '1',
        title: 'Strategic Partnership Agreement',
        partnerName: 'TechCorp Industries',
        agreementType: 'Joint Venture',
        status: 'Active',
        startDate: '2024-01-15',
        endDate: '2025-01-15',
        value: 2500000,
        documentUrl: '/documents/jv-agreement-1.pdf',
        publishedDate: '2024-01-10',
        version: 1
      },
      {
        id: '2',
        title: 'Innovation Collaboration',
        partnerName: 'Future Systems Ltd',
        agreementType: 'Research Partnership',
        status: 'Pending',
        startDate: '2024-03-01',
        endDate: '2025-03-01',
        value: 1800000,
        documentUrl: '/documents/jv-agreement-2.pdf',
        publishedDate: '2024-02-20',
        version: 2
      }
    ]);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('email_address_not_authorized')) {
            setAuthError('This email address is not authorized. Please contact support.');
          } else {
            setAuthError(error.message);
          }
        } else {
          setShowEmailConfirmation(true);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setAuthError(error.message);
        }
      }
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setIsResendingConfirmation(true);
    try {
      await resendConfirmation(email);
    } catch (error) {
      console.error('Error resending confirmation:', error);
    } finally {
      setIsResendingConfirmation(false);
    }
  };

  // Function to generate a Stripe checkout URL
  // In a real implementation, this would call your backend to create a Stripe checkout session
  const generateStripeCheckoutUrl = (amount: string): string => {
    // Return the new Stripe link provided by the user
    return "https://buy.stripe.com/5kQbJ1dd16iD4YfagpeME01?locale=en";
  };

  const handlePaymentMethodSelection = (method: 'card' | 'crypto') => {
    if (method === 'card') {
      // For Stripe, generate a checkout URL and redirect
      const stripeCheckoutUrl = generateStripeCheckoutUrl(investmentAmount);
      window.open(stripeCheckoutUrl, '_blank');
    } else {
      // For crypto, show the payment modal
      setSelectedPaymentMethod(method);
      setShowPaymentModal(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'expired':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <HudPanel title={isSignUp ? "Create Account" : "Access Terminal"}>
            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label className="block text-cyan-400 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-cyan-400 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {authError && (
                <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                  {authError}
                </div>
              )}

              <CyberButton
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Access System')}
              </CyberButton>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-cyan-400 hover:text-cyan-300 text-sm underline"
                >
                  {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                </button>
              </div>
            </form>
          </HudPanel>

          {showEmailConfirmation && (
            <div className="mt-6">
              <HudPanel title="Email Confirmation Required">
                <div className="text-center space-y-4">
                  <p className="text-gray-300">
                    Please check your email and click the confirmation link to activate your account.
                  </p>
                  <CyberButton
                    onClick={handleResendConfirmation}
                    disabled={isResendingConfirmation}
                    variant="secondary"
                  >
                    {isResendingConfirmation ? 'Sending...' : 'Resend Confirmation'}
                  </CyberButton>
                </div>
              </HudPanel>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4"> 
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-3xl font-bold text-cyan-400">Investor Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.email}</span>
              <CyberButton onClick={signOut} variant="secondary" size="sm">
                Logout
              </CyberButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <HudPanel title="Portfolio Value" icon={<TrendingUp className="w-5 h-5" />}>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-cyan-400">$0.00</div>
                <div className="text-sm text-gray-400">No active investments</div>
              </div>
            </HudPanel>

            <HudPanel title="Quick Actions" icon={<Zap className="w-5 h-5" />}>
              <div className="space-y-3">
                <div className="space-y-2">
                  <CyberButton
                    onClick={() => handlePaymentMethodSelection('card')}
                    size="sm"
                    className="w-full"
                    external={true}
                  >
                    <span className="mr-2">€</span>
                    Checkout with Stripe
                  </CyberButton>
                  
                  <CyberButton
                    onClick={() => handlePaymentMethodSelection('crypto')}
                    size="sm"
                    className="w-full"
                  >
                    <span className="mr-2">€</span>
                    Pay with Crypto
                  </CyberButton>
                </div>
                
                <CyberButton
                  onClick={() => navigate('/documents')}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Documents
                </CyberButton>
              </div>
            </HudPanel>
          </div>

          <HudPanel title="Joint Venture Agreements" icon={<Network className="w-5 h-5" />}>
            {jvAgreements.length > 0 ? (
              <div className="space-y-4">
                {jvAgreements.map((agreement) => (
                  <div
                    key={agreement.id}
                    className="bg-gray-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {agreement.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Partner: {agreement.partnerName}
                        </p>
                      </div>
                      <div className={`flex items-center space-x-2 ${getStatusColor(agreement.status)}`}>
                        {getStatusIcon(agreement.status)}
                        <span className="text-sm font-medium">{agreement.status}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-400">Type:</span>
                        <div className="text-white">{agreement.agreementType}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Value:</span>
                        <div className="text-white">${agreement.value.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Start Date:</span>
                        <div className="text-white">{new Date(agreement.startDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">End Date:</span>
                        <div className="text-white">{new Date(agreement.endDate).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Published: {new Date(agreement.publishedDate).toLocaleDateString()} | Version: {agreement.version}
                      </div>
                      <div className="flex space-x-2">
                        <CyberButton
                          onClick={() => {
                            setSelectedAgreement(agreement);
                            setShowAgreementModal(true);
                          }}
                          size="sm"
                          variant="secondary"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </CyberButton>
                        <CyberButton
                          onClick={() => window.open(agreement.documentUrl, '_blank')}
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </CyberButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No joint venture agreements available</p>
              </div>
            )}
          </HudPanel>
        </div>
      </div>
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-cyan-500/30 rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-cyan-500/30">
              <h2 className="text-xl font-bold text-cyan-400">
                Complete Your Investment
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Investment Amount:</span>
                  <span className="font-bold">€{parseInt(investmentAmount) || 75000}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-400">DRONE Tokens:</span>
                  <span className="font-bold text-plasma">
                    {Math.floor((parseInt(investmentAmount) || 75000) / 1.5).toLocaleString()}
                  </span>
                </div>
                <div className="h-px bg-gray-800 my-4"></div>
              </div>
              
              {selectedPaymentMethod === 'crypto' ? (
                <CryptoPaymentForm 
                  amount={parseInt(investmentAmount) || 75000} 
                  onSuccess={() => {
                    setShowPaymentModal(false);
                    // Show success message or redirect
                  }}
                  onError={(error) => {
                    console.error('Payment error:', error);
                    // Show error message
                  }}
                />
              ) : (
                <StripePaymentForm
                  amount={parseInt(investmentAmount) || 75000}
                  onSuccess={() => {
                    setShowPaymentModal(false);
                    // Show success message or redirect
                  }}
                  onError={(error) => {
                    console.error('Payment error:', error);
                    // Show error message
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showAgreementModal && selectedAgreement && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-cyan-500/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-cyan-500/30">
              <h2 className="text-xl font-bold text-cyan-400">
                {selectedAgreement.title}
              </h2>
              <button
                onClick={() => setShowAgreementModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Agreement Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Partner:</span>
                        <span className="text-white">{selectedAgreement.partnerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white">{selectedAgreement.agreementType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={getStatusColor(selectedAgreement.status)}>
                          {selectedAgreement.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Value:</span>
                        <span className="text-white">${selectedAgreement.value.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Timeline</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Published:</span>
                        <span className="text-white">{new Date(selectedAgreement.publishedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Start Date:</span>
                        <span className="text-white">{new Date(selectedAgreement.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">End Date:</span>
                        <span className="text-white">{new Date(selectedAgreement.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Version:</span>
                        <span className="text-white">{selectedAgreement.version}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Document Preview</h3>
                  <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-sm text-gray-300">
                    <p className="mb-4">
                      This is a preview of the {selectedAgreement.title} between our organization and {selectedAgreement.partnerName}.
                    </p>
                    <p className="mb-4">
                      Agreement Type: {selectedAgreement.agreementType}<br/>
                      Total Value: ${selectedAgreement.value.toLocaleString()}<br/>
                      Duration: {new Date(selectedAgreement.startDate).toLocaleDateString()} - {new Date(selectedAgreement.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-400 text-xs">
                      For the complete document, please download the PDF version.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-cyan-500/30">
              <CyberButton
                onClick={() => setShowAgreementModal(false)}
                variant="secondary"
              >
                Close
              </CyberButton>
              <CyberButton
                onClick={() => window.open(selectedAgreement.documentUrl, '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </CyberButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;