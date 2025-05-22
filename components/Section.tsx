import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ title, children, icon, className = '' }) => {
  return (
    <section className={`p-4 md:p-6 bg-white rounded-xl shadow-lg ${className}`}>
      <div className="flex items-center mb-4">
        {icon && <span className="mr-3 text-primary-teal">{icon}</span>}
        <h2 className="text-xl md:text-2xl font-semibold text-gray-700">{title}</h2>
      </div>
      {children}
    </section>
  );
};
