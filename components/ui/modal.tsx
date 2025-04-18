import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  width?: string | number;
  height?: string | number;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center';
  children: React.ReactNode;
}

const ToastStyleModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  width = 'auto',
  height = 'auto',
  position = 'bottom-left',
  children
}) => {
  if (!isOpen) return null;
  
  // Convert numeric values to pixels
  const widthValue = typeof width === 'number' ? `${width}px` : width;
  const heightValue = typeof height === 'number' ? `${height}px` : height;
  
  // Position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-left':
        return { bottom: '20px', left: '20px' };
      case 'bottom-right':
        return { bottom: '20px', right: '20px' };
      case 'top-left':
        return { top: '20px', left: '20px' };
      case 'top-right':
        return { top: '20px', right: '20px' };
      case 'center':
      default:
        return { 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)' 
        };
    }
  };
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex items-center bg-green rounded-sm p-5 text-green-1 bg-card text-xl rounded-2 min-w-[100px]"
        style={{
          position: 'absolute',
          width: widthValue,
          height: heightValue,
          minWidth: '100px',
          boxSizing: 'border-box',
          border: '5px solid rgba(76, 175, 80, 0.75)',
          padding: '20px',
          borderRadius: '12px',
          fontSize: '20px',
          boxShadow: '0 0 15px rgba(76, 175, 80, 0.5)',
          background: 'rgba(0, 0, 0, 0)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          ...getPositionStyles()
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <h3 className="font-semibold pr-4 text-xl" style={{ 
              margin: 0,
              paddingRight: '16px',
              fontSize: '20px',
              fontWeight: 600
            }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              className="flex items-center justify-center size-10"
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="text-xl" style={{ 
          flex: 1,
          fontSize: '20px'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ToastStyleModal;