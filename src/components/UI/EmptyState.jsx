
const EmptyState = ({
  title,
  description,
  icon: Icon,
  action,
  actionText
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    {Icon && (
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-neutral-400" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
    {description && (
      <p className="text-neutral-500 text-center max-w-sm mb-6">{description}</p>
    )}
    {action && actionText && (
      <button
        onClick={action}
        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        {actionText}
      </button>
    )}
  </div>
);

export default EmptyState;
