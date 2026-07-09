import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const QuickActions = ({ actions }) => (
  <div className="space-y-1.5">
    {actions.map(({ label, description, icon: Icon, to, onClick }) => {
      const content = (
        <>
          <div className="w-9 h-9 rounded-lg bg-neutral-100 group-hover:bg-blue-50 flex items-center justify-center flex-shrink-0 transition-colors">
            <Icon className="w-4 h-4 text-neutral-600 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900">{label}</p>
            {description && <p className="text-xs text-neutral-500 truncate">{description}</p>}
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </>
      );

      const className = 'group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors';

      return to ? (
        <Link key={label} to={to} className={className}>{content}</Link>
      ) : (
        <button key={label} onClick={onClick} className={`w-full text-left ${className}`}>{content}</button>
      );
    })}
  </div>
);

export default QuickActions;
