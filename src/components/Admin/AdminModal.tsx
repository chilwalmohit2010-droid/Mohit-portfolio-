import React, { useState, useEffect } from 'react';
import { PortfolioData } from '../../types/portfolio';
import { isAdminAuthenticated, getDraftData } from '../../services/portfolioStorage';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioData: PortfolioData;
  onUpdatePortfolio: (data: PortfolioData) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  portfolioData,
  onUpdatePortfolio,
}) => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [draftData, setDraftData] = useState<PortfolioData>(() => getDraftData());

  useEffect(() => {
    if (isOpen) {
      setAuthenticated(isAdminAuthenticated());
      setDraftData(getDraftData());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {authenticated ? (
        <AdminDashboard
          portfolioData={draftData}
          onUpdate={(updated) => {
            setDraftData(updated);
            onUpdatePortfolio(updated);
          }}
          onClose={onClose}
        />
      ) : (
        <AdminLogin
          onSuccess={() => {
            setAuthenticated(true);
            setDraftData(getDraftData());
          }}
          onCancel={onClose}
        />
      )}
    </div>
  );
};
